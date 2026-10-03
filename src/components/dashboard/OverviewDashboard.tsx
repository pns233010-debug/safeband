import React from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Heart,
  Activity,
  Thermometer,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  PhoneCall,
  Clock,
  ArrowUpRight,
  BatteryMedium,
  Wifi,
  Sparkles,
  AlertTriangle,
  Play,
  RotateCcw,
  Database,
  X,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const {
    currentUser,
    vitals,
    device,
    fallData,
    location,
    contacts,
    triggerSimulatedFall,
    triggerSos,
    setActiveTab,
    setIsSimulationOpen,
    hasPermissionError,
    dismissPermissionNotice,
  } = useSafeBand();

  const isFallActive = fallData.state === 'countdown_active';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Realtime Database Security Rule Notice (If database is locked in console) */}
      {hasPermissionError && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-800/80 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-900/60 border border-amber-700/60 text-amber-300 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold text-white flex items-center gap-2">
                <span>Firebase Realtime Database: Rules Need Publishing</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/80 text-amber-300 font-mono">
                  LOCKED MODE
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Your database currently blocks reads/writes. To enable live sync from your ESP32 and website, copy the rules in <span className="font-mono text-amber-300 font-bold">database.rules.json</span> and publish them in your Firebase Console (<span className="text-slate-400">Realtime Database → Rules</span>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('simulation')}
              className="px-3 py-1.5 rounded-lg bg-amber-900/70 hover:bg-amber-800 text-amber-200 font-medium transition-colors cursor-pointer"
            >
              View Instructions
            </button>
            <button
              type="button"
              onClick={dismissPermissionNotice}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-amber-900/40 cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Wearer Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="/src/assets/images/avatar_wearer_1791004244538.jpg"
                alt="Robert Vance"
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900" title="SafeBand Active" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Robert Vance
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                  Age 74
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Telemetry Online
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  {location.address}
                </span>
                <span>•</span>
                <span>SafeBand Sentinel Pro LTE</span>
                <span>•</span>
                <span>Caregiver: Elena Vance, RN</span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsSimulationOpen(true)}
              className="px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 text-cyan-300 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Simulate Scenarios</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('health')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Vitals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Health Monitoring Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Heart Rate Card */}
        <div
          onClick={() => setActiveTab('health')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Heart Rate (PPG)
            </span>
            <div className={`p-2 rounded-xl ${vitals.heartRate > 100 ? 'bg-rose-950/80 text-rose-400' : 'bg-rose-950/50 text-rose-400'}`}>
              <Heart className={`w-4 h-4 ${vitals.heartRate > 100 ? 'animate-bounce' : 'animate-pulse'}`} />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {vitals.heartRate}
            </span>
            <span className="text-xs text-slate-400 font-mono">BPM</span>
          </div>

          {/* Mini pulse wave SVG */}
          <div className="h-8 w-full flex items-center">
            <svg className="w-full h-8 stroke-rose-500 fill-none" viewBox="0 0 100 24">
              <path
                d="M 0,12 L 20,12 L 25,6 L 30,18 L 35,2 L 40,22 L 45,12 L 65,12 L 70,7 L 75,17 L 80,4 L 85,20 L 90,12 L 100,12"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className={`font-medium ${vitals.heartRate > 100 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {vitals.ecgStatus}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Range: 64-88</span>
          </div>
        </div>

        {/* SpO2 Blood Oxygen Card */}
        <div
          onClick={() => setActiveTab('health')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Blood Oxygen (SpO2)
            </span>
            <div className="p-2 rounded-xl bg-cyan-950/50 text-cyan-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {vitals.spo2}
            </span>
            <span className="text-xs text-slate-400 font-mono">%</span>
          </div>

          {/* SpO2 Bar levels */}
          <div className="flex items-end gap-1.5 h-8 w-full pt-1">
            {[98, 97, 98, 99, 98, 98, vitals.spo2].map((val, idx) => (
              <div
                key={idx}
                className="flex-1 bg-slate-800 rounded-sm overflow-hidden flex flex-col justify-end"
                style={{ height: '100%' }}
              >
                <div
                  className={`w-full rounded-sm ${val < 90 ? 'bg-rose-500' : 'bg-cyan-400'}`}
                  style={{ height: `${(val / 100) * 100}%` }}
                />
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className={`font-medium ${vitals.spo2 < 90 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {vitals.spo2 < 90 ? 'Hypoxia Warning' : 'Optimal Saturation'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">24h avg: 98%</span>
          </div>
        </div>

        {/* Skin & Core Temperature Card */}
        <div
          onClick={() => setActiveTab('health')}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-lg transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Skin Temperature
            </span>
            <div className="p-2 rounded-xl bg-amber-950/50 text-amber-400">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {vitals.bodyTemp.toFixed(1)}
            </span>
            <span className="text-xs text-slate-400 font-mono">°C / {(vitals.bodyTemp * 1.8 + 32).toFixed(1)}°F</span>
          </div>

          <div className="h-8 flex items-center">
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden relative">
              <div
                className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-500 h-full rounded-full"
                style={{ width: `${((vitals.bodyTemp - 34) / 6) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-medium">Normal Core Temp</span>
            <span className="text-slate-500 font-mono text-[11px]">Target: 36.5°C</span>
          </div>
        </div>

        {/* Fall Detection & IMU Status Card */}
        <div
          onClick={() => setActiveTab('fall')}
          className={`bg-slate-900 border p-5 rounded-2xl shadow-lg transition-all cursor-pointer group ${
            isFallActive
              ? 'border-rose-500 bg-rose-950/30'
              : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Fall Guard IMU
            </span>
            <div className={`p-2 rounded-xl ${isFallActive ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-950/50 text-emerald-400'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-white font-mono tabular-nums tracking-tight">
              {fallData.currentGForce.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">G-Force</span>
          </div>

          <div className="h-8 flex items-center text-xs text-slate-400 font-mono">
            <span>X: {fallData.vector.x.toFixed(2)}G · Y: {fallData.vector.y.toFixed(2)}G · Z: {fallData.vector.z.toFixed(2)}G</span>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className={isFallActive ? 'text-rose-400 font-bold animate-pulse' : 'text-emerald-400 font-medium'}>
              {isFallActive ? `ALARM: ${fallData.countdownSeconds}s` : 'Active Protection'}
            </span>
            <span className="text-slate-500 font-mono text-[11px]">Peak: {fallData.peakGForce}G</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Fall Detection Module + Live GPS Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fall Detection Sandbox Quick Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Fall Detection & Impact Guard</h3>
                  <p className="text-xs text-slate-400">3-Axis high-speed inertial deceleration sensor</p>
                </div>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
                ARMED & MONITORING
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 mb-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Detection Algorithm:</span>
                <span className="text-slate-200 font-medium">Free-fall Deceleration + Impact Threshold (3.5G)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Grace Cancellation Window:</span>
                <span className="text-slate-200 font-medium">30 Seconds (Wristband touch or app)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Automatic Action:</span>
                <span className="text-rose-400 font-medium">Auto-dispatch 911 EMS + Caregivers</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={triggerSimulatedFall}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Simulate High-Impact Fall (4.2G)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('fall')}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        </div>

        {/* Live GPS & Geofence Mini Widget */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Live GPS & Safe Zone Geofence</h3>
                  <p className="text-xs text-slate-400">Satellite GPS + Cellular triangulation</p>
                </div>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-full font-mono ${
                  location.isInsideSafeZone
                    ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                    : 'bg-amber-950 border border-amber-800 text-amber-300'
                }`}
              >
                {location.isInsideSafeZone ? 'SAFE ZONE: HOME' : 'GEOFENCE BREACH'}
              </span>
            </div>

            {/* Stylized Mini Map Box */}
            <div className="relative h-32 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center mb-4">
              {/* Map grid lines */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />

              {/* Safe zone circle */}
              <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
                <span className="text-[10px] text-cyan-400/80 font-mono">250m Geofence</span>
                {/* Wearer Beacon Pin */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 rounded-full bg-cyan-400 animate-ping absolute" />
                  <div className="w-4 h-4 rounded-full bg-cyan-500 border-2 border-white relative z-10 shadow-lg" />
                </div>
              </div>

              {/* Coordinate overlay badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-slate-400">
                {location.latitude.toFixed(4)}° N, {Math.abs(location.longitude).toFixed(4)}° W
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-xs text-slate-400">
              <span className="text-slate-500">Address: </span>
              <span className="text-white font-medium">{location.address}</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('gps')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium transition-colors cursor-pointer shrink-0 ml-3"
            >
              Open Interactive Map
            </button>
          </div>
        </div>
      </div>

      {/* Emergency Contacts & Protocol Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-800/40 text-rose-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Emergency Contacts & Rapid Dispatch</h3>
              <p className="text-xs text-slate-400">Priority order triggered upon uncancelled fall or SOS button press</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('emergency')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
          >
            Manage Protocol
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map((contact, idx) => (
            <div
              key={contact.id}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-750 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Priority {contact.priority}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">
                    SMS & Call Ready
                  </span>
                </div>
                <div className="text-sm font-bold text-white truncate">{contact.name}</div>
                <div className="text-xs text-slate-400">{contact.relationship}</div>
                <div className="mt-2 text-xs font-mono text-cyan-400">{contact.phone}</div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>Direct Relay</span>
                <span className="text-slate-400">Automated Ping OK</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
