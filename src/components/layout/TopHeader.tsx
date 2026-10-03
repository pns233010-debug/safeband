import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Bell,
  FlaskConical,
  AlertOctagon,
  BatteryMedium,
  Wifi,
  Radio,
  X,
  ShieldCheck,
  CheckCircle,
  Database,
  LogOut,
} from 'lucide-react';

interface TopHeaderProps {
  onOpenSimulation: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSimulation }) => {
  const {
    currentUser,
    logout,
    activeTab,
    device,
    triggerSos,
    emergencyAlert,
    fallData,
    simEvents,
    isFirebaseConfigured,
    isFirebaseConnected,
  } = useSafeBand();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSosConfirm, setShowSosConfirm] = useState(false);

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return { section: 'Telemetry Console', title: 'Dashboard Overview' };
      case 'health':
        return { section: 'Biometrics', title: 'Health Telemetry & Vitals' };
      case 'fall':
        return { section: 'Inertial Safety', title: 'Fall Detection & Impact Guard' };
      case 'emergency':
        return { section: 'Dispatch Center', title: 'Emergency Alert & 911 Protocol' };
      case 'gps':
        return { section: 'Geofence Guard', title: 'GPS Location & Perimeter' };
      case 'device':
        return { section: 'Hardware Diagnostics', title: 'Device Status & Sensor Health' };
      case 'simulation':
        return { section: 'Sandbox Engine', title: 'Hardware Simulation & Test Mode' };
      default:
        return { section: 'Sentinel', title: 'Console' };
    }
  };

  const navMeta = getTitle();
  const hasActiveAlert = !!emergencyAlert?.active || fallData.state === 'countdown_active';

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-30 backdrop-blur-md">
      {/* Breadcrumb / Title */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">{navMeta.section}</span>
        <span className="text-slate-600">/</span>
        <h1 className="text-sm font-semibold text-white tracking-tight">{navMeta.title}</h1>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-3">
        {/* Hardware Status Strip */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5" title="Battery Remaining">
            <BatteryMedium
              className={`w-4 h-4 ${device.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`}
            />
            <span className="font-mono tabular-nums font-medium">{device.batteryLevel}%</span>
          </div>

          <div className="w-px h-3 bg-slate-800" />

          <div className="flex items-center gap-1.5" title="Bluetooth LE 5.2">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono tabular-nums text-slate-400">BLE -62dBm</span>
          </div>

          <div className="w-px h-3 bg-slate-800" />

          <div className="flex items-center gap-1.5" title="Cellular LTE-M">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[11px]">LTE Standby</span>
          </div>

          <div className="w-px h-3 bg-slate-800" />

          <div className="flex items-center gap-1.5" title={isFirebaseConnected ? 'Firebase Realtime Database: Live' : 'Firebase Realtime Database: Standby'}>
            <Database className={`w-3.5 h-3.5 ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-slate-400 text-[11px]">
              {isFirebaseConnected ? 'RTDB Live' : isFirebaseConfigured ? 'RTDB Connecting' : 'RTDB Demo'}
            </span>
          </div>
        </div>

        {/* Simulation Sandbox Button */}
        <button
          type="button"
          onClick={onOpenSimulation}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-700/60 hover:border-cyan-500 text-cyan-300 text-xs font-medium transition-all shadow-sm shadow-cyan-950/40 cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline">Simulation Mode</span>
          <span className="text-[10px] px-1 py-0.2 rounded bg-cyan-800/80 text-white font-mono">
            TEST
          </span>
        </button>

        {/* Big Emergency SOS Trigger */}
        <button
          type="button"
          onClick={() => setShowSosConfirm(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md cursor-pointer ${
            hasActiveAlert
              ? 'bg-rose-600 text-white animate-bounce shadow-rose-950/80'
              : 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-rose-950/40 hover:shadow-rose-900/60'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-white" />
          <span>EMERGENCY SOS</span>
        </button>

        {/* Event Notifications Dropdown Toggle */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Event Notifications"
            className="p-2 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-750 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {simEvents.some((e) => e.status === 'alert' || e.status === 'warning') && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* Notifications Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-white">Hardware & Telemetry Log</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNotifications(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {simEvents.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">
                    No hardware events recorded.
                  </div>
                ) : (
                  simEvents.slice(0, 10).map((evt) => (
                    <div key={evt.id} className="p-3 hover:bg-slate-850/50 transition-colors text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-semibold uppercase text-[10px] px-1.5 py-0.5 rounded ${
                            evt.status === 'alert'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : evt.status === 'warning'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {evt.category}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">{evt.timestamp}</span>
                      </div>
                      <p className="text-slate-300 leading-snug">{evt.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Authenticated User Session & Logout Button */}
        {currentUser && (
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[150px]">
                {currentUser.name}
              </span>
              <span
                className="text-[10px] text-cyan-400 font-mono leading-tight truncate max-w-[170px]"
                title={`Firebase Authenticated: ${currentUser.email}`}
              >
                {currentUser.email}
              </span>
            </div>

            <button
              type="button"
              onClick={logout}
              title={`Sign out (${currentUser.email})`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* SOS Confirmation Modal */}
      {showSosConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-rose-700/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Broadcast Emergency SOS?</h3>
                <p className="text-xs text-slate-400">
                  This will dispatch alerts to all assigned caregivers and simulate a 911 EMS call.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 text-xs text-rose-300 mb-6">
              Location will be pinned at: <span className="font-semibold text-white">742 Evergreen Terrace, San Francisco, CA</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSosConfirm(false)}
                className="flex-1 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerSos('sos_button');
                  setShowSosConfirm(false);
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-950/60 cursor-pointer"
              >
                Yes, Dispatch SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
