export type UserRole = 'caregiver' | 'wearer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  wearerName?: string;
  wearerAge?: number;
  emergencyNotes?: string;
}

export interface SensorHealth {
  ppgOptical: boolean;
  imu6Axis: boolean;
  tempProbe: boolean;
  gpsModule: boolean;
  batteryGauge: boolean;
}

export interface DeviceStatus {
  deviceId: string;
  model: string;
  serialNumber: string;
  batteryLevel: number;
  isCharging: boolean;
  bleConnected: boolean;
  bleRssi: number; // in dBm e.g. -65
  cellularActive: boolean;
  wornOnWrist: boolean;
  skinContact: boolean;
  firmwareVersion: string;
  lastSyncTime: string;
  sensors: SensorHealth;
}

export interface VitalsData {
  heartRate: number; // BPM
  heartRateMin: number;
  heartRateMax: number;
  heartRateHistory: { time: string; value: number }[];
  spo2: number; // %
  spo2History: { time: string; value: number }[];
  bodyTemp: number; // Celsius
  tempHistory: { time: string; value: number }[];
  stepsCount: number;
  stepsGoal: number;
  activeMinutes: number;
  caloriesBurned: number;
  ecgStatus: 'Normal Sinus Rhythm' | 'Elevated Heart Rate' | 'Low SpO2 Alert' | 'Arrhythmia Detected';
  respirationRate: number; // breaths/min
}

export type FallState = 'normal' | 'impact_detected' | 'countdown_active' | 'alert_confirmed' | 'cancelled';

export interface FallIncident {
  id: string;
  timestamp: string;
  peakGForce: number;
  location: string;
  status: 'dispatched' | 'cancelled_by_user' | 'resolved';
  notes: string;
  speedOfDescent: number; // m/s
}

export interface FallDetectionData {
  state: FallState;
  currentGForce: number;
  peakGForce: number;
  vector: { x: number; y: number; z: number };
  countdownSeconds: number; // 30s countdown
  lastIncident?: FallIncident;
  incidentHistory: FallIncident[];
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  priority: number;
  notifySms: boolean;
  notifyCall: boolean;
  status: 'idle' | 'notified' | 'acknowledged';
}

export interface EmergencyAlert {
  id: string;
  active: boolean;
  source: 'sos_button' | 'fall_sensor' | 'geofence_breach' | 'high_hr' | 'manual_test' | null;
  severity: AlertSeverity;
  title: string;
  message: string;
  timestamp: string;
  status: 'alerting' | 'dispatching' | 'acknowledged' | 'resolved';
  respondersContacted: string[];
}

export interface LocationBreadcrumb {
  lat: number;
  lng: number;
  timestamp: string;
  label: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  accuracyMeters: number;
  altitudeMeters: number;
  speedKmh: number;
  isInsideSafeZone: boolean;
  safeZoneCenter: { lat: number; lng: number; radiusMeters: number };
  safeZoneName: string;
  lastPingTime: string;
  breadcrumbs: LocationBreadcrumb[];
}

export interface HardwareSimEvent {
  id: string;
  timestamp: string;
  category: 'sensor' | 'fall' | 'sos' | 'gps' | 'battery' | 'system';
  description: string;
  status: 'nominal' | 'warning' | 'alert';
}
