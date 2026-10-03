import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import {
  User,
  UserRole,
  DeviceStatus,
  VitalsData,
  FallDetectionData,
  FallIncident,
  EmergencyAlert,
  EmergencyContact,
  LocationData,
  HardwareSimEvent,
} from '../types/safeband';
import { isFirebaseConfigured } from '../services/firebase';
import {
  signInWithFirebase,
  registerWithFirebase,
  signOutFromFirebase,
  subscribeToAuthChanges,
} from '../services/authService';
import {
  subscribeToFirebaseConnectionState,
  subscribeToDeviceData,
  seedInitialDeviceInRtdb,
  syncVitalsToRtdb,
  syncFallStateToRtdb,
  syncEmergencyToRtdb,
  syncGpsToRtdb,
  syncStatusToRtdb,
  testFirebaseRtdbConnection,
  FirebaseDevicePayload,
  sendEsp32SimulatedPacket,
  ESP32_TEST_PACKET,
} from '../services/databaseService';

interface SafeBandContextType {
  // Auth state
  currentUser: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (role: 'caregiver' | 'wearer', email?: string, pass?: string) => Promise<void>;
  register: (name: string, email: string, role: 'caregiver' | 'wearer', phone: string, pass?: string) => Promise<void>;
  logout: () => void;
  switchRole: () => void;

  // Active View Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Telemetry & Hardware State
  device: DeviceStatus;
  vitals: VitalsData;
  fallData: FallDetectionData;
  emergencyAlert: EmergencyAlert | null;
  contacts: EmergencyContact[];
  location: LocationData;
  simEvents: HardwareSimEvent[];

  // Action handlers
  triggerSos: (source?: 'sos_button' | 'manual_test') => void;
  cancelEmergencyAlert: () => void;
  resolveEmergencyAlert: () => void;
  triggerSimulatedFall: () => void;
  cancelFallCountdown: () => void;
  confirmFallEmergency: () => void;
  pingDevice: () => Promise<string>;
  updateHeartRateSim: (bpm: number) => void;
  updateBatterySim: (level: number) => void;
  toggleGeofenceBreachSim: () => void;
  toggleWristDetachedSim: () => void;
  toggleLowSpo2Sim: () => void;
  resetAllSimulations: () => void;

  // Simulation drawer
  isSimulationOpen: boolean;
  setIsSimulationOpen: (open: boolean) => void;

  // Firebase Phase 2 state & helpers
  isFirebaseConfigured: boolean;
  isFirebaseConnected: boolean;
  hasPermissionError: boolean;
  dismissPermissionNotice: () => void;
  testFirebaseConnection: () => Promise<{ success: boolean; message: string; latencyMs?: number }>;
  simulateEsp32Packet: () => Promise<{
    success: boolean;
    message: string;
    error?: string;
    data?: unknown;
  }>;
}

const DEFAULT_CAREGIVER: User = {
  id: 'usr_caregiver_01',
  name: 'Elena Vance, RN',
  email: 'elena.vance@safeband.care',
  role: 'caregiver',
  phone: '+1 (415) 555-0198',
  avatarUrl: '/src/assets/images/avatar_caregiver_1791004233349.jpg',
  wearerName: 'Robert Vance',
  wearerAge: 74,
  emergencyNotes: 'Type 2 Diabetes, Mild Hypertension. Pacemaker installed 2023.',
};

const DEFAULT_WEARER: User = {
  id: 'usr_wearer_01',
  name: 'Robert Vance',
  email: 'robert.vance@mail.com',
  role: 'wearer',
  phone: '+1 (415) 555-0144',
  avatarUrl: '/src/assets/images/avatar_wearer_1791004244538.jpg',
  wearerName: 'Robert Vance',
  wearerAge: 74,
  emergencyNotes: 'Penicillin allergy. Primary caregiver: Elena Vance (Daughter).',
};

const INITIAL_DEVICE: DeviceStatus = {
  deviceId: 'SB-PRO-9412',
  model: 'SafeBand Sentinel Pro LTE',
  serialNumber: 'SN-2026-98842-XF',
  batteryLevel: 86,
  isCharging: false,
  bleConnected: true,
  bleRssi: -62,
  cellularActive: true,
  wornOnWrist: true,
  skinContact: true,
  firmwareVersion: 'v2.4.12-prod',
  lastSyncTime: 'Just now',
  sensors: {
    ppgOptical: true,
    imu6Axis: true,
    tempProbe: true,
    gpsModule: true,
    batteryGauge: true,
  },
};

const INITIAL_VITALS: VitalsData = {
  heartRate: 72,
  heartRateMin: 64,
  heartRateMax: 88,
  heartRateHistory: [
    { time: '18:00', value: 70 },
    { time: '19:00', value: 74 },
    { time: '20:00', value: 71 },
    { time: '21:00', value: 68 },
    { time: '22:00', value: 72 },
  ],
  spo2: 98,
  spo2History: [
    { time: '18:00', value: 98 },
    { time: '19:00', value: 97 },
    { time: '20:00', value: 99 },
    { time: '21:00', value: 98 },
    { time: '22:00', value: 98 },
  ],
  bodyTemp: 36.6,
  tempHistory: [
    { time: '18:00', value: 36.5 },
    { time: '19:00', value: 36.6 },
    { time: '20:00', value: 36.6 },
    { time: '21:00', value: 36.7 },
    { time: '22:00', value: 36.6 },
  ],
  stepsCount: 4210,
  stepsGoal: 6000,
  activeMinutes: 38,
  caloriesBurned: 320,
  ecgStatus: 'Normal Sinus Rhythm',
  respirationRate: 15,
};

const INITIAL_CONTACTS: EmergencyContact[] = [
  {
    id: 'c1',
    name: 'Elena Vance (Daughter / Primary Caregiver)',
    relationship: 'Daughter / Primary',
    phone: '+1 (415) 555-0198',
    priority: 1,
    notifySms: true,
    notifyCall: true,
    status: 'idle',
  },
  {
    id: 'c2',
    name: 'San Francisco EMS Dispatch (Local 911)',
    relationship: 'Emergency Medical Service',
    phone: '911 / EMS Direct',
    priority: 2,
    notifySms: true,
    notifyCall: true,
    status: 'idle',
  },
  {
    id: 'c3',
    name: 'Dr. Michael Chen, MD (Cardiologist)',
    relationship: 'Attending Physician',
    phone: '+1 (415) 555-3211',
    priority: 3,
    notifySms: true,
    notifyCall: false,
    status: 'idle',
  },
];

const INITIAL_LOCATION: LocationData = {
  latitude: 37.7749,
  longitude: -122.4194,
  address: '742 Evergreen Terrace, San Francisco, CA 94110',
  accuracyMeters: 3.2,
  altitudeMeters: 42,
  speedKmh: 0,
  isInsideSafeZone: true,
  safeZoneCenter: { lat: 37.7749, lng: -122.4194, radiusMeters: 250 },
  safeZoneName: 'Home Residence (San Francisco)',
  lastPingTime: '2 seconds ago',
  breadcrumbs: [
    { lat: 37.7742, lng: -122.4198, timestamp: '21:30', label: 'Living Room' },
    { lat: 37.7745, lng: -122.4196, timestamp: '21:45', label: 'Patio Walk' },
    { lat: 37.7749, lng: -122.4194, timestamp: '22:00', label: 'Resting in Bedroom' },
  ],
};

const INITIAL_FALL_DATA: FallDetectionData = {
  state: 'normal',
  currentGForce: 1.02,
  peakGForce: 1.02,
  vector: { x: 0.04, y: 0.12, z: 0.99 },
  countdownSeconds: 30,
  incidentHistory: [
    {
      id: 'inc-902',
      timestamp: 'Yesterday at 14:22',
      peakGForce: 2.8,
      location: 'Living room',
      status: 'cancelled_by_user',
      notes: 'Wearer accidentally dropped device onto rug. Cancelled via wristband touchscreen in 8 seconds.',
      speedOfDescent: 1.2,
    },
    {
      id: 'inc-781',
      timestamp: 'Sep 24, 2026 at 10:15',
      peakGForce: 3.9,
      location: 'Garden walkway',
      status: 'resolved',
      notes: 'Wearer stumbled on step. EMS and Caregiver dispatched. No fractures, vitals monitored.',
      speedOfDescent: 2.4,
    },
  ],
};

const SafeBandContext = createContext<SafeBandContextType | undefined>(undefined);

export const SafeBandProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [device, setDevice] = useState<DeviceStatus>(INITIAL_DEVICE);
  const [vitals, setVitals] = useState<VitalsData>(INITIAL_VITALS);
  const [fallData, setFallData] = useState<FallDetectionData>(INITIAL_FALL_DATA);
  const [emergencyAlert, setEmergencyAlert] = useState<EmergencyAlert | null>(null);
  const [contacts, setContacts] = useState<EmergencyContact[]>(INITIAL_CONTACTS);
  const [location, setLocation] = useState<LocationData>(INITIAL_LOCATION);
  const [isSimulationOpen, setIsSimulationOpen] = useState<boolean>(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);
  const isUpdatingFromFirebaseRef = useRef<boolean>(false);

  const dismissPermissionNotice = () => setHasPermissionError(false);

  const [simEvents, setSimEvents] = useState<HardwareSimEvent[]>([
    {
      id: 'evt-01',
      timestamp: '22:00:15',
      category: 'system',
      description: 'SafeBand Sentinel initialized. Firebase Authentication & RTDB ready.',
      status: 'nominal',
    },
    {
      id: 'evt-02',
      timestamp: '22:05:40',
      category: 'sensor',
      description: 'PPG & 6-Axis IMU calibrated. Normal Sinus Rhythm confirmed.',
      status: 'nominal',
    },
  ]);

  const addEvent = useCallback(
    (category: HardwareSimEvent['category'], description: string, status: HardwareSimEvent['status']) => {
      const newEvt: HardwareSimEvent = {
        id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        category,
        description,
        status,
      };
      setSimEvents((prev) => [newEvt, ...prev.slice(0, 40)]);
    },
    []
  );

  // 1. Firebase Authentication Listener (onAuthStateChanged)
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsAuthLoading(false);
      return;
    }

    const unsubscribeAuth = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
      if (user) {
        addEvent('system', `Firebase Auth: Verified session for ${user.email}`, 'nominal');
      } else {
        addEvent('system', 'Firebase Auth: No active session. Please log in.', 'nominal');
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [addEvent]);

  // 2. Firebase Realtime Database: Connection State & Real-time Listeners
  // Only connect/listen/seed when a Firebase user is authenticated
  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser) {
      setIsFirebaseConnected(false);
      return;
    }

    // Monitor .info/connected
    const unsubscribeConn = subscribeToFirebaseConnectionState((connected) => {
      setIsFirebaseConnected(connected);
      if (connected) {
        addEvent('system', 'Firebase Realtime Database: Connected with active auth session.', 'nominal');
      } else {
        addEvent('system', 'Firebase Realtime Database: Connection standby or reconnecting.', 'warning');
      }
    });

    // Seed initial device data if empty
    const initialPayload: FirebaseDevicePayload = {
      status: {
        online: true,
        battery: INITIAL_DEVICE.batteryLevel,
        charging: INITIAL_DEVICE.isCharging,
        bleRssi: INITIAL_DEVICE.bleRssi,
        wornOnWrist: INITIAL_DEVICE.wornOnWrist,
        firmware: INITIAL_DEVICE.firmwareVersion,
        lastSync: Date.now(),
        sensors: INITIAL_DEVICE.sensors,
      },
      vitals: {
        heartRate: INITIAL_VITALS.heartRate,
        spo2: INITIAL_VITALS.spo2,
        bodyTemp: INITIAL_VITALS.bodyTemp,
        steps: INITIAL_VITALS.stepsCount,
        activeMinutes: INITIAL_VITALS.activeMinutes,
        calories: INITIAL_VITALS.caloriesBurned,
        ecgStatus: INITIAL_VITALS.ecgStatus,
        respiration: INITIAL_VITALS.respirationRate,
        timestamp: Date.now(),
      },
      fall: {
        state: INITIAL_FALL_DATA.state,
        currentG: INITIAL_FALL_DATA.currentGForce,
        peakG: INITIAL_FALL_DATA.peakGForce,
        vector: INITIAL_FALL_DATA.vector,
        countdown: INITIAL_FALL_DATA.countdownSeconds,
        timestamp: Date.now(),
      },
      emergency: {
        active: false,
        source: null,
        title: '',
        message: '',
        status: 'standby',
        timestamp: Date.now(),
      },
      gps: {
        lat: INITIAL_LOCATION.latitude,
        lng: INITIAL_LOCATION.longitude,
        address: INITIAL_LOCATION.address,
        accuracy: INITIAL_LOCATION.accuracyMeters,
        altitude: INITIAL_LOCATION.altitudeMeters,
        speed: INITIAL_LOCATION.speedKmh,
        isInsideSafeZone: INITIAL_LOCATION.isInsideSafeZone,
        safeZoneRadius: INITIAL_LOCATION.safeZoneCenter.radiusMeters,
        timestamp: Date.now(),
      },
    };

    seedInitialDeviceInRtdb(INITIAL_DEVICE.deviceId, initialPayload);

    // Attach real-time listener for ESP32 & Remote updates
    const unsubscribeDevice = subscribeToDeviceData(
      INITIAL_DEVICE.deviceId,
      (remoteData) => {
        setHasPermissionError(false);
        isUpdatingFromFirebaseRef.current = true;

        if (remoteData.vitals) {
          setVitals((prev) => ({
            ...prev,
            heartRate: remoteData.vitals.heartRate ?? prev.heartRate,
            spo2: remoteData.vitals.spo2 ?? prev.spo2,
            bodyTemp: remoteData.vitals.bodyTemp ?? prev.bodyTemp,
            stepsCount: remoteData.vitals.steps ?? prev.stepsCount,
            ecgStatus: (remoteData.vitals.ecgStatus as VitalsData['ecgStatus']) ?? prev.ecgStatus,
          }));
        }

        if (remoteData.fall) {
          setFallData((prev) => ({
            ...prev,
            state: (remoteData.fall.state as FallDetectionData['state']) ?? prev.state,
            currentGForce: remoteData.fall.currentG ?? prev.currentGForce,
            peakGForce: remoteData.fall.peakG ?? prev.peakGForce,
            vector: remoteData.fall.vector ?? prev.vector,
            countdownSeconds: remoteData.fall.countdown ?? prev.countdownSeconds,
          }));
        }

        if (remoteData.emergency) {
          if (remoteData.emergency.active) {
            setEmergencyAlert({
              id: `alert-remote-${remoteData.emergency.timestamp}`,
              active: true,
              source: (remoteData.emergency.source as EmergencyAlert['source']) || 'sos_button',
              severity: 'critical',
              title: remoteData.emergency.title || 'Emergency Alert',
              message: remoteData.emergency.message || 'Alert received via Firebase RTDB.',
              timestamp: new Date(remoteData.emergency.timestamp).toLocaleTimeString(),
              status: 'dispatching',
              respondersContacted: ['San Francisco EMS (911)', 'Elena Vance (Primary Caregiver)'],
            });
          } else {
            setEmergencyAlert(null);
          }
        }

        if (remoteData.gps) {
          setLocation((prev) => ({
            ...prev,
            latitude: remoteData.gps.lat ?? prev.latitude,
            longitude: remoteData.gps.lng ?? prev.longitude,
            address: remoteData.gps.address ?? prev.address,
            isInsideSafeZone: remoteData.gps.isInsideSafeZone ?? prev.isInsideSafeZone,
            lastPingTime: 'Received from Firebase',
          }));
        }

        if (remoteData.status) {
          setDevice((prev) => ({
            ...prev,
            batteryLevel: remoteData.status.battery ?? prev.batteryLevel,
            isCharging: remoteData.status.charging ?? prev.isCharging,
            wornOnWrist: remoteData.status.wornOnWrist ?? prev.wornOnWrist,
            skinContact: remoteData.status.wornOnWrist ?? prev.skinContact,
            lastSyncTime: 'Live from Firebase RTDB',
          }));
        }

        setTimeout(() => {
          isUpdatingFromFirebaseRef.current = false;
        }, 100);
      },
      (err) => {
        const isPerm =
          err.message.toLowerCase().includes('permission_denied') ||
          err.message.toLowerCase().includes('permission denied');
        if (isPerm) {
          setHasPermissionError(true);
        }
      }
    );

    return () => {
      unsubscribeConn();
      unsubscribeDevice();
    };
  }, [currentUser, addEvent]);

  // Subtle real-time heart rate variation
  useEffect(() => {
    const interval = setInterval(() => {
      setVitals((prev) => {
        if (prev.heartRate > 120) {
          const jitter = (Math.random() - 0.5) * 4;
          return { ...prev, heartRate: Math.round(prev.heartRate + jitter) };
        }
        const base = 72;
        const delta = Math.floor((Math.random() - 0.5) * 4);
        const newHr = Math.max(65, Math.min(80, base + delta));
        return {
          ...prev,
          heartRate: newHr,
        };
      });

      // Subtle IMU jitter
      setFallData((prev) => {
        if (prev.state === 'countdown_active') return prev;
        const jX = +(0.04 + (Math.random() - 0.5) * 0.04).toFixed(3);
        const jY = +(0.12 + (Math.random() - 0.5) * 0.04).toFixed(3);
        const jZ = +(0.98 + (Math.random() - 0.5) * 0.03).toFixed(3);
        const totalG = +Math.sqrt(jX * jX + jY * jY + jZ * jZ).toFixed(2);
        return {
          ...prev,
          vector: { x: jX, y: jY, z: jZ },
          currentGForce: totalG,
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Fall countdown timer (30s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (fallData.state === 'countdown_active') {
      if (fallData.countdownSeconds > 0) {
        timer = setTimeout(() => {
          setFallData((prev) => {
            const nextSec = prev.countdownSeconds - 1;
            // Sync tick to Firebase RTDB
            syncFallStateToRtdb(device.deviceId, { ...prev, countdownSeconds: nextSec });
            return {
              ...prev,
              countdownSeconds: nextSec,
            };
          });
        }, 1000);
      } else {
        // Countdown reached 0 -> Auto dispatch emergency!
        setFallData((prev) => ({
          ...prev,
          state: 'alert_confirmed',
        }));
        const alertObj: EmergencyAlert = {
          id: `alert-${Date.now()}`,
          active: true,
          source: 'fall_sensor',
          severity: 'critical',
          title: 'Confirmed Impact Fall Detected',
          message: 'Wearer did not cancel the 30-second wristband alarm. Emergency dispatch protocol triggered automatically.',
          timestamp: new Date().toLocaleTimeString(),
          status: 'dispatching',
          respondersContacted: ['San Francisco EMS (911)', 'Elena Vance (Primary Caregiver)'],
        };
        setEmergencyAlert(alertObj);
        syncEmergencyToRtdb(device.deviceId, alertObj);
        setContacts((prev) => prev.map((c) => ({ ...c, status: 'notified' })));
        addEvent('fall', 'Fall countdown expired (30s). Emergency dispatched automatically to 911 & Caregiver.', 'alert');
      }
    }
    return () => clearTimeout(timer);
  }, [fallData.state, fallData.countdownSeconds, device.deviceId, addEvent]);

  // Auth actions
  const login = async (role: 'caregiver' | 'wearer', email?: string, pass?: string) => {
    if (!email || !pass) {
      throw new Error('Please provide both email and password.');
    }

    const res = await signInWithFirebase(email, pass, role);
    if (!res.success || !res.user) {
      throw new Error(res.error || 'Authentication failed. Please verify your email and password.');
    }

    setCurrentUser(res.user);
    addEvent('system', `Firebase Auth: Logged in as ${res.user.email} (${res.user.role})`, 'nominal');
  };

  const register = async (name: string, email: string, role: 'caregiver' | 'wearer', phone: string, pass?: string) => {
    if (!name || !email || !pass) {
      throw new Error('Please fill in all required registration fields (Name, Email, Password).');
    }

    const res = await registerWithFirebase(name, email, pass, role, phone);
    if (!res.success || !res.user) {
      throw new Error(res.error || 'Registration failed.');
    }

    setCurrentUser(res.user);
    addEvent('system', `Firebase Auth: Account registered for ${res.user.email}`, 'nominal');
  };

  const logout = async () => {
    await signOutFromFirebase();
    setCurrentUser(null);
    setIsFirebaseConnected(false);
    addEvent('system', 'Firebase Auth: Logged out of session', 'nominal');
  };

  const switchRole = () => {
    if (!currentUser) return;
    const nextRole = currentUser.role === 'caregiver' ? 'wearer' : 'caregiver';
    setCurrentUser((prev) => (prev ? { ...prev, role: nextRole } : null));
    addEvent('system', `Perspective switched to ${nextRole.toUpperCase()}`, 'nominal');
  };

  // Emergency SOS trigger
  const triggerSos = (source: 'sos_button' | 'manual_test' = 'sos_button') => {
    const newAlert: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      active: true,
      source,
      severity: 'critical',
      title: source === 'sos_button' ? 'Emergency SOS Button Activated' : 'Manual Emergency Dispatch Test',
      message: 'Wearer pressed the physical tactile SOS button on the SafeBand wristband.',
      timestamp: new Date().toLocaleTimeString(),
      status: 'dispatching',
      respondersContacted: ['San Francisco EMS (911)', 'Elena Vance (Primary Caregiver)', 'Dr. Michael Chen'],
    };

    setEmergencyAlert(newAlert);
    syncEmergencyToRtdb(device.deviceId, newAlert);

    setContacts((prev) => prev.map((c) => ({ ...c, status: 'notified' })));
    addEvent('sos', 'Physical tactile SOS button triggered. Broadcast sent to Firebase RTDB & emergency contacts.', 'alert');
  };

  const cancelEmergencyAlert = () => {
    setEmergencyAlert(null);
    syncEmergencyToRtdb(device.deviceId, null);
    setContacts((prev) => prev.map((c) => ({ ...c, status: 'idle' })));
    addEvent('sos', 'Emergency alert cancelled by caregiver/operator. Firebase state cleared.', 'warning');
  };

  const resolveEmergencyAlert = () => {
    if (emergencyAlert) {
      setEmergencyAlert((prev) => (prev ? { ...prev, status: 'resolved', active: false } : null));
      syncEmergencyToRtdb(device.deviceId, null);
    }
    setContacts((prev) => prev.map((c) => ({ ...c, status: 'acknowledged' })));
    addEvent('sos', 'Emergency incident marked as resolved in Firebase RTDB.', 'nominal');
  };

  // Fall simulation actions
  const triggerSimulatedFall = () => {
    const updatedFall: FallDetectionData = {
      ...fallData,
      state: 'countdown_active',
      currentGForce: 4.25,
      peakGForce: 4.25,
      vector: { x: 1.84, y: 2.91, z: 2.45 },
      countdownSeconds: 30,
    };
    setFallData(updatedFall);
    syncFallStateToRtdb(device.deviceId, updatedFall);
    addEvent('fall', 'IMU Spike: Rapid deceleration threshold breached (4.25G). 30s countdown synced to Firebase RTDB.', 'warning');
  };

  const cancelFallCountdown = () => {
    const cancelledIncident: FallIncident = {
      id: `inc-${Date.now()}`,
      timestamp: 'Just now',
      peakGForce: fallData.peakGForce,
      location: location.address,
      status: 'cancelled_by_user',
      notes: 'Wearer clicked "I\'m OK / False Alarm". Dispatch cancelled within safety grace period.',
      speedOfDescent: 1.8,
    };

    const nextFall: FallDetectionData = {
      ...fallData,
      state: 'cancelled',
      currentGForce: 1.01,
      countdownSeconds: 30,
      incidentHistory: [cancelledIncident, ...fallData.incidentHistory],
    };

    setFallData(nextFall);
    syncFallStateToRtdb(device.deviceId, nextFall);

    setTimeout(() => {
      setFallData((prev) => {
        const norm = { ...prev, state: 'normal' as const };
        syncFallStateToRtdb(device.deviceId, norm);
        return norm;
      });
    }, 2000);

    addEvent('fall', 'False alarm confirmed. User pressed "I\'m OK". Cancellation synced to Firebase.', 'nominal');
  };

  const confirmFallEmergency = () => {
    const nextFall: FallDetectionData = {
      ...fallData,
      state: 'alert_confirmed',
      countdownSeconds: 0,
    };
    setFallData(nextFall);
    syncFallStateToRtdb(device.deviceId, nextFall);

    const alertObj: EmergencyAlert = {
      id: `alert-${Date.now()}`,
      active: true,
      source: 'fall_sensor',
      severity: 'critical',
      title: 'Fall Confirmed - Wearer Needs Assistance',
      message: 'Wearer requested immediate dispatch following high-impact fall detection (4.25G).',
      timestamp: new Date().toLocaleTimeString(),
      status: 'dispatching',
      respondersContacted: ['San Francisco EMS (911)', 'Elena Vance (Primary Caregiver)'],
    };
    setEmergencyAlert(alertObj);
    syncEmergencyToRtdb(device.deviceId, alertObj);

    addEvent('fall', 'Wearer bypassed countdown and confirmed emergency assistance. Synced to Firebase RTDB.', 'alert');
  };

  const pingDevice = async (): Promise<string> => {
    addEvent('system', 'Sending BLE/LTE telemetry ping to SafeBand #SB-PRO-9412 via Firebase...', 'nominal');
    await new Promise((resolve) => setTimeout(resolve, 600));
    setDevice((prev) => {
      const next = {
        ...prev,
        lastSyncTime: 'Just now',
        bleRssi: -60 - Math.floor(Math.random() * 8),
      };
      syncStatusToRtdb(device.deviceId, next);
      return next;
    });
    addEvent('system', 'SafeBand ACK received in 42ms. All hardware sensors nominal in RTDB.', 'nominal');
    return 'Pong received from SafeBand (42ms latency). Battery: ' + device.batteryLevel + '%';
  };

  const updateHeartRateSim = (bpm: number) => {
    const nextVitals: VitalsData = {
      ...vitals,
      heartRate: bpm,
      ecgStatus: bpm > 130 ? 'Elevated Heart Rate' : bpm < 50 ? 'Arrhythmia Detected' : 'Normal Sinus Rhythm',
    };
    setVitals(nextVitals);
    syncVitalsToRtdb(device.deviceId, nextVitals);

    if (bpm > 130) {
      addEvent('sensor', `Tachycardia threshold exceeded: ${bpm} BPM. Synced to Firebase.`, 'warning');
    } else {
      addEvent('sensor', `Heart rate adjusted to ${bpm} BPM in Firebase RTDB`, 'nominal');
    }
  };

  const updateBatterySim = (level: number) => {
    const nextDevice: DeviceStatus = {
      ...device,
      batteryLevel: level,
      isCharging: level === 100,
    };
    setDevice(nextDevice);
    syncStatusToRtdb(device.deviceId, nextDevice);

    if (level < 15) {
      addEvent('battery', `Low battery warning triggered: ${level}% remaining. Synced to Firebase.`, 'warning');
    } else {
      addEvent('battery', `Battery level set to ${level}% in Firebase RTDB`, 'nominal');
    }
  };

  const toggleGeofenceBreachSim = () => {
    setLocation((prev) => {
      const nextInside = !prev.isInsideSafeZone;
      let nextLoc: LocationData;
      if (!nextInside) {
        addEvent('gps', 'GEOFENCE ALERT: SafeBand exited designated safe zone (680m). Synced to Firebase.', 'warning');
        nextLoc = {
          ...prev,
          isInsideSafeZone: false,
          latitude: 37.7812,
          longitude: -122.4289,
          address: '420 Oak Park Ave (680m from Home Residence)',
          speedKmh: 4.8,
        };
      } else {
        addEvent('gps', 'Safe zone restored: SafeBand returned to Home Residence. Synced to Firebase.', 'nominal');
        nextLoc = {
          ...prev,
          isInsideSafeZone: true,
          latitude: 37.7749,
          longitude: -122.4194,
          address: '742 Evergreen Terrace, San Francisco, CA 94110',
          speedKmh: 0,
        };
      }
      syncGpsToRtdb(device.deviceId, nextLoc);
      return nextLoc;
    });
  };

  const toggleWristDetachedSim = () => {
    setDevice((prev) => {
      const nextWorn = !prev.wornOnWrist;
      const nextDev = {
        ...prev,
        wornOnWrist: nextWorn,
        skinContact: nextWorn,
      };
      syncStatusToRtdb(device.deviceId, nextDev);
      if (!nextWorn) {
        addEvent('sensor', 'Impedance sensor: SafeBand detached from wrist. Synced to Firebase.', 'warning');
      } else {
        addEvent('sensor', 'Impedance sensor: Skin contact re-established in Firebase RTDB.', 'nominal');
      }
      return nextDev;
    });
  };

  const toggleLowSpo2Sim = () => {
    setVitals((prev) => {
      const isLow = prev.spo2 < 92;
      const nextSpo2 = isLow ? 98 : 88;
      const nextVitals: VitalsData = {
        ...prev,
        spo2: nextSpo2,
        ecgStatus: nextSpo2 < 90 ? 'Low SpO2 Alert' : 'Normal Sinus Rhythm',
      };
      syncVitalsToRtdb(device.deviceId, nextVitals);
      if (!isLow) {
        addEvent('sensor', 'CRITICAL HYPOXIA ALERT: Blood oxygen dipped below 90% (88% SpO2). Synced to Firebase.', 'alert');
      } else {
        addEvent('sensor', 'Blood oxygen normalized to 98% SpO2 in Firebase RTDB.', 'nominal');
      }
      return nextVitals;
    });
  };

  const resetAllSimulations = () => {
    setVitals(INITIAL_VITALS);
    setDevice(INITIAL_DEVICE);
    setFallData(INITIAL_FALL_DATA);
    setLocation(INITIAL_LOCATION);
    setEmergencyAlert(null);
    setContacts(INITIAL_CONTACTS);

    // Sync baseline to Firebase RTDB
    syncVitalsToRtdb(INITIAL_DEVICE.deviceId, INITIAL_VITALS);
    syncFallStateToRtdb(INITIAL_DEVICE.deviceId, INITIAL_FALL_DATA);
    syncEmergencyToRtdb(INITIAL_DEVICE.deviceId, null);
    syncGpsToRtdb(INITIAL_DEVICE.deviceId, INITIAL_LOCATION);
    syncStatusToRtdb(INITIAL_DEVICE.deviceId, INITIAL_DEVICE);

    addEvent('system', 'Simulator state reset. All hardware telemetry restored in Firebase RTDB.', 'nominal');
  };

  // Test Firebase RTDB connection helper
  const testFirebaseConnection = async () => {
    const res = await testFirebaseRtdbConnection();
    addEvent(
      'system',
      `Firebase Test: ${res.message}`,
      res.success ? 'nominal' : 'warning'
    );
    return res;
  };

  // Simulate an ESP32 publishing over Wi-Fi
  const simulateEsp32Packet = async (): Promise<{
    success: boolean;
    message: string;
    error?: string;
    data?: unknown;
  }> => {
    addEvent('system', 'ESP32 Wi-Fi Client: Publishing telemetry packet to /devices/SB-PRO-9412/...', 'nominal');

    // Send the requested test data to Firebase Realtime Database and read it back
    const result = await sendEsp32SimulatedPacket(device.deviceId, ESP32_TEST_PACKET);

    if (result.success) {
      // Update local state to reflect the verified packet
      setVitals((prev) => ({
        ...prev,
        heartRate: ESP32_TEST_PACKET.vitals.heartRate,
        spo2: ESP32_TEST_PACKET.vitals.spo2,
        bodyTemp: ESP32_TEST_PACKET.vitals.bodyTemp,
      }));
      setDevice((prev) => ({
        ...prev,
        batteryLevel: ESP32_TEST_PACKET.status.battery,
        isCharging: ESP32_TEST_PACKET.status.charging,
        lastSyncTime: 'Received from ESP32 via Firebase',
      }));
      setFallData((prev) => ({
        ...prev,
        state: 'normal',
      }));
      setEmergencyAlert(null);
      setLocation((prev) => ({
        ...prev,
        latitude: ESP32_TEST_PACKET.gps.lat,
        longitude: ESP32_TEST_PACKET.gps.lng,
        address: 'Visakhapatnam, AP (17.6868° N, 83.2185° E)',
        lastPingTime: 'Just now from ESP32',
      }));

      addEvent(
        'sensor',
        `ESP32 -> Wi-Fi -> Firebase: Packet ACK (HR: ${ESP32_TEST_PACKET.vitals.heartRate} BPM, SpO2: ${ESP32_TEST_PACKET.vitals.spo2}%, Temp: ${ESP32_TEST_PACKET.vitals.bodyTemp}°C, GPS: ${ESP32_TEST_PACKET.gps.lat}, ${ESP32_TEST_PACKET.gps.lng})`,
        'nominal'
      );
    } else {
      addEvent(
        'system',
        `ESP32 Simulation Failed: ${result.error || result.message}`,
        'warning'
      );
    }

    return result;
  };

  return (
    <SafeBandContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        isAuthLoading,
        login,
        register,
        logout,
        switchRole,
        activeTab,
        setActiveTab,
        device,
        vitals,
        fallData,
        emergencyAlert,
        contacts,
        location,
        simEvents,
        triggerSos,
        cancelEmergencyAlert,
        resolveEmergencyAlert,
        triggerSimulatedFall,
        cancelFallCountdown,
        confirmFallEmergency,
        pingDevice,
        updateHeartRateSim,
        updateBatterySim,
        toggleGeofenceBreachSim,
        toggleWristDetachedSim,
        toggleLowSpo2Sim,
        resetAllSimulations,
        isSimulationOpen,
        setIsSimulationOpen,
        isFirebaseConfigured,
        isFirebaseConnected,
        hasPermissionError,
        dismissPermissionNotice,
        testFirebaseConnection,
        simulateEsp32Packet,
      }}
    >
      {children}
    </SafeBandContext.Provider>
  );
};

export const useSafeBand = (): SafeBandContextType => {
  const context = useContext(SafeBandContext);
  if (!context) {
    throw new Error('useSafeBand must be used within a SafeBandProvider');
  }
  return context;
};
