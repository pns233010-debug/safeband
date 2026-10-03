import {
  ref,
  onValue,
  set,
  update,
  get,
  DatabaseReference,
  Unsubscribe,
} from 'firebase/database';
import { rtdb, auth, isFirebaseConfigured } from './firebase';
import {
  DeviceStatus,
  VitalsData,
  FallDetectionData,
  EmergencyAlert,
  LocationData,
} from '../types/safeband';

export interface FirebaseDevicePayload {
  status: {
    online: boolean;
    battery: number;
    charging: boolean;
    bleRssi: number;
    wornOnWrist: boolean;
    firmware: string;
    lastSync: number;
    sensors?: {
      ppgOptical: boolean;
      imu6Axis: boolean;
      tempProbe: boolean;
      gpsModule: boolean;
      batteryGauge: boolean;
    };
  };
  vitals: {
    heartRate: number;
    spo2: number;
    bodyTemp: number;
    steps: number;
    activeMinutes: number;
    calories: number;
    ecgStatus: string;
    respiration: number;
    timestamp: number;
  };
  fall: {
    state: string;
    currentG: number;
    peakG: number;
    vector: { x: number; y: number; z: number };
    countdown: number;
    timestamp: number;
  };
  emergency: {
    active: boolean;
    source: string | null;
    title: string;
    message: string;
    status: string;
    timestamp: number;
  };
  gps: {
    lat: number;
    lng: number;
    address: string;
    accuracy: number;
    altitude: number;
    speed: number;
    isInsideSafeZone: boolean;
    safeZoneRadius: number;
    timestamp: number;
  };
}

/**
 * Monitor the Firebase Realtime Database connection state.
 * Returns an unsubscribe callback.
 */
export const subscribeToFirebaseConnectionState = (
  onStateChanged: (connected: boolean) => void
): Unsubscribe => {
  if (!rtdb || !isFirebaseConfigured) {
    onStateChanged(false);
    return () => {};
  }

  const connectedRef = ref(rtdb, '.info/connected');
  return onValue(
    connectedRef,
    (snapshot) => {
      const isConnected = snapshot.val() === true;
      onStateChanged(isConnected);
    },
    (err) => {
      console.warn('[SafeBand RTDB] Connection state error:', err);
      onStateChanged(false);
    }
  );
};

/**
 * Real-time listener for the complete device tree at `/devices/{deviceId}`.
 * An ESP32 publishing to any sub-path (e.g. `devices/SB-PRO-9412/vitals`) will
 * immediately trigger this listener.
 */
export const subscribeToDeviceData = (
  deviceId: string,
  onData: (data: FirebaseDevicePayload) => void,
  onError?: (err: Error) => void
): Unsubscribe => {
  // Requirement 9: Verify Firebase user is authenticated before attaching RTDB listener
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) {
    return () => {};
  }

  const deviceRef = ref(rtdb, `devices/${deviceId}`);
  return onValue(
    deviceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val() as FirebaseDevicePayload;
        onData(val);
      }
    },
    (err) => {
      const isPermissionDenied =
        err.message.toLowerCase().includes('permission_denied') ||
        err.message.toLowerCase().includes('permission denied');

      if (isPermissionDenied) {
        console.warn(
          `[SafeBand RTDB] Permission notice on /devices/${deviceId}: Authenticated user required by database rules.`
        );
      } else {
        console.warn(`[SafeBand RTDB] Notice reading device ${deviceId}:`, err.message);
      }

      if (onError) onError(err);
    }
  );
};

/**
 * Seed initial device structure in Firebase Realtime Database if missing.
 */
export const seedInitialDeviceInRtdb = async (
  deviceId: string,
  initialPayload: FirebaseDevicePayload
): Promise<boolean> => {
  // Requirement 9: Verify user is authenticated
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) {
    return false;
  }

  try {
    const deviceRef = ref(rtdb, `devices/${deviceId}`);
    const snapshot = await get(deviceRef);
    if (!snapshot.exists()) {
      await set(deviceRef, initialPayload);
      console.info(`[SafeBand RTDB] Initialized device tree for ${deviceId}`);
    }
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(
      `[SafeBand RTDB] Failed to seed device in Firebase: ${msg}`
    );
    return false;
  }
};

/**
 * Update live vitals in RTDB at `/devices/{deviceId}/vitals`
 * Compatible with ESP32 REST / WebSocket publish
 */
export const syncVitalsToRtdb = async (
  deviceId: string,
  vitals: VitalsData
): Promise<void> => {
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) return;

  try {
    const vitalsRef = ref(rtdb, `devices/${deviceId}/vitals`);
    await update(vitalsRef, {
      heartRate: vitals.heartRate,
      spo2: vitals.spo2,
      bodyTemp: vitals.bodyTemp,
      steps: vitals.stepsCount,
      activeMinutes: vitals.activeMinutes,
      calories: vitals.caloriesBurned,
      ecgStatus: vitals.ecgStatus,
      respiration: vitals.respirationRate,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[SafeBand RTDB] Failed to sync vitals:', err);
  }
};

/**
 * Update fall state in RTDB at `/devices/{deviceId}/fall`
 */
export const syncFallStateToRtdb = async (
  deviceId: string,
  fallData: FallDetectionData
): Promise<void> => {
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) return;

  try {
    const fallRef = ref(rtdb, `devices/${deviceId}/fall`);
    await update(fallRef, {
      state: fallData.state,
      currentG: fallData.currentGForce,
      peakG: fallData.peakGForce,
      vector: fallData.vector,
      countdown: fallData.countdownSeconds,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[SafeBand RTDB] Failed to sync fall state:', err);
  }
};

/**
 * Update emergency alert state in RTDB at `/devices/{deviceId}/emergency`
 */
export const syncEmergencyToRtdb = async (
  deviceId: string,
  alert: EmergencyAlert | null
): Promise<void> => {
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) return;

  try {
    const emergencyRef = ref(rtdb, `devices/${deviceId}/emergency`);
    if (alert && alert.active) {
      await set(emergencyRef, {
        active: true,
        source: alert.source,
        title: alert.title,
        message: alert.message,
        status: alert.status,
        timestamp: Date.now(),
      });
    } else {
      await update(emergencyRef, {
        active: false,
        status: 'standby',
        timestamp: Date.now(),
      });
    }
  } catch (err) {
    console.warn('[SafeBand RTDB] Failed to sync emergency state:', err);
  }
};

/**
 * Update GPS position in RTDB at `/devices/{deviceId}/gps`
 */
export const syncGpsToRtdb = async (
  deviceId: string,
  loc: LocationData
): Promise<void> => {
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) return;

  try {
    const gpsRef = ref(rtdb, `devices/${deviceId}/gps`);
    await update(gpsRef, {
      lat: loc.latitude,
      lng: loc.longitude,
      address: loc.address,
      accuracy: loc.accuracyMeters,
      altitude: loc.altitudeMeters,
      speed: loc.speedKmh,
      isInsideSafeZone: loc.isInsideSafeZone,
      safeZoneRadius: loc.safeZoneCenter.radiusMeters,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.warn('[SafeBand RTDB] Failed to sync GPS coordinates:', err);
  }
};

/**
 * Update hardware status in RTDB at `/devices/{deviceId}/status`
 */
export const syncStatusToRtdb = async (
  deviceId: string,
  status: DeviceStatus
): Promise<void> => {
  if (!rtdb || !isFirebaseConfigured || !auth?.currentUser) return;

  try {
    const statusRef = ref(rtdb, `devices/${deviceId}/status`);
    await update(statusRef, {
      online: true,
      battery: status.batteryLevel,
      charging: status.isCharging,
      bleRssi: status.bleRssi,
      wornOnWrist: status.wornOnWrist,
      firmware: status.firmwareVersion,
      sensors: status.sensors,
      lastSync: Date.now(),
    });
  } catch (err) {
    console.warn('[SafeBand RTDB] Failed to sync device status:', err);
  }
};

/**
 * Test Firebase Realtime Database connectivity by reading / writing a heartbeat.
 * Requires authenticated Firebase session.
 */
export const testFirebaseRtdbConnection = async (): Promise<{
  success: boolean;
  message: string;
  latencyMs?: number;
}> => {
  if (!isFirebaseConfigured || !rtdb) {
    return {
      success: false,
      message:
        'Firebase is not yet configured with your project credentials. Add your VITE_FIREBASE_* variables to .env to connect to live Firebase RTDB.',
    };
  }

  // Requirement 9, 10, 12: Verify authenticated user
  if (!auth?.currentUser) {
    return {
      success: false,
      message: 'Please log in to access Firebase.',
    };
  }

  const start = Date.now();
  try {
    const testRef = ref(rtdb, 'connection_test/heartbeat');
    await set(testRef, {
      timestamp: Date.now(),
      client: 'SafeBand-Web-Console',
      status: 'active',
      user: auth.currentUser.email || auth.currentUser.uid,
    });
    const snapshot = await get(testRef);
    const latencyMs = Date.now() - start;

    if (snapshot.exists()) {
      return {
        success: true,
        message: `Successfully connected to Firebase Realtime Database! Ping round-trip: ${latencyMs}ms. (Auth: ${auth.currentUser.email || auth.currentUser.uid})`,
        latencyMs,
      };
    } else {
      return {
        success: false,
        message: 'Could not verify test payload in Firebase Realtime Database.',
      };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Firebase RTDB test failed: ${msg}`,
    };
  }
};

export interface Esp32SimPayload {
  status: {
    online: boolean;
    battery: number;
    charging: boolean;
  };
  vitals: {
    heartRate: number;
    spo2: number;
    bodyTemp: number;
  };
  fall: {
    state: string;
  };
  emergency: {
    active: boolean;
  };
  gps: {
    lat: number;
    lng: number;
  };
}

export const ESP32_TEST_PACKET: Esp32SimPayload = {
  status: {
    online: true,
    battery: 86,
    charging: false,
  },
  vitals: {
    heartRate: 72,
    spo2: 98,
    bodyTemp: 36.6,
  },
  fall: {
    state: 'normal',
  },
  emergency: {
    active: false,
  },
  gps: {
    lat: 17.6868,
    lng: 83.2185,
  },
};

/**
 * Sends a simulated ESP32 Wi-Fi telemetry packet to /devices/{deviceId}/
 * Writes the payload, then reads it back to verify success.
 */
export const sendEsp32SimulatedPacket = async (
  deviceId: string = 'SB-PRO-9412',
  customPacket?: Partial<Esp32SimPayload>
): Promise<{
  success: boolean;
  message: string;
  error?: string;
  data?: unknown;
}> => {
  if (!rtdb || !isFirebaseConfigured) {
    return {
      success: false,
      message: 'Firebase Realtime Database is not configured.',
      error: 'Firebase is not initialized. Please verify VITE_FIREBASE_DATABASE_URL in .env.',
    };
  }

  // Requirement 9, 11, 12: Verify authenticated Firebase session
  if (!auth?.currentUser) {
    return {
      success: false,
      message: 'Please log in to access Firebase.',
      error: 'Please log in to access Firebase.',
    };
  }

  const payload: Esp32SimPayload = {
    ...ESP32_TEST_PACKET,
    ...customPacket,
  };

  try {
    const targetRef = ref(rtdb, `devices/${deviceId}`);

    // 1. Write the test telemetry packet to /devices/SB-PRO-9412/
    await update(targetRef, payload);

    // 2. Read the data back from Firebase to verify write
    const snapshot = await get(targetRef);

    if (snapshot.exists()) {
      const readData = snapshot.val();
      return {
        success: true,
        message: 'ESP32 simulation packet sent successfully',
        data: readData,
      };
    } else {
      return {
        success: false,
        message: 'Write completed but could not verify data from Firebase.',
        error: 'Data node not found on read-back.',
      };
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const isPermission =
      errMsg.toLowerCase().includes('permission_denied') ||
      errMsg.toLowerCase().includes('permission denied');

    return {
      success: false,
      message: isPermission
        ? 'Firebase rejected write: Permission denied. Please publish the database rules in Firebase Console.'
        : `Firebase write rejected: ${errMsg}`,
      error: errMsg,
    };
  }
};

