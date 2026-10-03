import React from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Activity,
  HeartPulse,
  ShieldAlert,
  AlertOctagon,
  Navigation,
  Cpu,
  FlaskConical,
  LogOut,
  UserCheck,
  Stethoscope,
  Wifi,
  BatteryMedium,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    logout,
    switchRole,
    activeTab,
    setActiveTab,
    device,
    emergencyAlert,
    fallData,
    location,
    setIsSimulationOpen,
  } = useSafeBand();

  const isEmergencyActive = !!emergencyAlert?.active || fallData.state === 'countdown_active';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Activity,
      badge: null,
    },
    {
      id: 'health',
      label: 'Health Monitoring',
      icon: HeartPulse,
      badge: null,
    },
    {
      id: 'fall',
      label: 'Fall Detection',
      icon: ShieldAlert,
      badge: fallData.state === 'countdown_active' ? 'ALERT' : null,
      badgeColor: 'bg-rose-500 text-white animate-pulse',
    },
    {
      id: 'emergency',
      label: 'Emergency Alert',
      icon: AlertOctagon,
      badge: isEmergencyActive ? 'SOS ACTIVE' : null,
      badgeColor: 'bg-rose-600 text-white animate-pulse',
    },
    {
      id: 'gps',
      label: 'GPS & Geofence',
      icon: Navigation,
      badge: !location.isInsideSafeZone ? 'BREACH' : null,
      badgeColor: 'bg-amber-500 text-slate-950 font-bold',
    },
    {
      id: 'device',
      label: 'Device Status',
      icon: Cpu,
      badge: device.batteryLevel < 15 ? 'LOW BAT' : null,
      badgeColor: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'simulation',
      label: 'Simulation & Test Mode',
      icon: FlaskConical,
      badge: 'Phase 1',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
              SafeBand
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                PRO
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Sentinel Health System</div>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Snapshot */}
      <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-850 mx-3 my-3 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-slate-400 font-medium">SafeBand #SB-9412</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
          <div className="flex items-center gap-1">
            <BatteryMedium className={`w-3.5 h-3.5 ${device.batteryLevel < 20 ? 'text-rose-400' : 'text-emerald-400'}`} />
            <span className="font-mono tabular-nums">{device.batteryLevel}%</span>
          </div>
          <div className="flex items-center gap-1">
            <Wifi className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono tabular-nums">{device.bleRssi} dBm</span>
          </div>
          <div className="flex items-center gap-1">
            {device.wornOnWrist ? (
              <span className="text-emerald-400 text-[10px]">Worn</span>
            ) : (
              <span className="text-amber-400 text-[10px]">Off-Wrist</span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Primary Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'simulation') {
                  setActiveTab('simulation');
                  setIsSimulationOpen(true);
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Monitored Wearer Card */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2.5">
          <img
            src="/src/assets/images/avatar_wearer_1791004244538.jpg"
            alt="Robert Vance"
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-slate-700 shrink-0"
          />
          <div className="overflow-hidden min-w-0 flex-1">
            <div className="text-xs font-semibold text-white truncate">Robert Vance</div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
              {location.isInsideSafeZone ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>In Safe Zone</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-amber-300">Out of Zone</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Authenticated User & Actions */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/90">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCheck className="w-4 h-4 text-slate-300" />
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-semibold text-white truncate">
                {currentUser?.name}
              </div>
              <div
                className="text-[10px] text-cyan-400 font-mono truncate"
                title={`Firebase Authenticated: ${currentUser?.email}`}
              >
                {currentUser?.email}
              </div>
            </div>
          </div>

          <button
            type="button"
            title={`Log out of session (${currentUser?.email})`}
            onClick={logout}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800 hover:bg-rose-950/80 border border-slate-750 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>

        <button
          type="button"
          onClick={switchRole}
          className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-[11px] text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {currentUser?.role === 'caregiver' ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Perspective: Caregiver</span>
            </>
          ) : (
            <>
              <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
              <span>Perspective: Wearer</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
