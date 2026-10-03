import React from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  Volume2,
} from 'lucide-react';

export const ActiveAlertOverlay: React.FC = () => {
  const {
    fallData,
    cancelFallCountdown,
    confirmFallEmergency,
    emergencyAlert,
    cancelEmergencyAlert,
    resolveEmergencyAlert,
    contacts,
    location,
  } = useSafeBand();

  const isCountdown = fallData.state === 'countdown_active';
  const isEmergency = emergencyAlert && emergencyAlert.active;

  if (!isCountdown && !isEmergency) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      {/* 30-Second Fall Countdown Modal */}
      {isCountdown && (
        <div className="w-full max-w-lg bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/80 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center">
            {/* Pulsing Alert Icon */}
            <div className="relative inline-flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-ping" />
              <div className="relative w-20 h-20 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-950/50">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              Potential Fall Detected!
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              SafeBand recorded an impact of <span className="font-bold text-rose-400 font-mono">4.25 G</span>.
            </p>

            {/* Huge 30s Countdown Clock */}
            <div className="my-6 p-4 rounded-2xl bg-slate-950 border border-rose-900/60 inline-flex flex-col items-center justify-center min-w-[200px]">
              <div className="text-5xl font-black font-mono tracking-tight text-rose-500 tabular-nums">
                00:{fallData.countdownSeconds < 10 ? `0${fallData.countdownSeconds}` : fallData.countdownSeconds}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-rose-400" />
                <span>Auto-dispatching 911 if no response</span>
              </div>
            </div>

            {/* Countdown progress bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 mb-6 overflow-hidden">
              <div
                className="bg-rose-500 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(fallData.countdownSeconds / 30) * 100}%` }}
              />
            </div>

            {/* Location context */}
            <div className="mb-6 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-left flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-slate-400">Wearer GPS Location: </span>
                <span className="font-semibold text-white">{location.address}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={cancelFallCountdown}
                className="flex-1 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>I'M OK - CANCEL ALARM</span>
              </button>

              <button
                type="button"
                onClick={confirmFallEmergency}
                className="py-3.5 px-6 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5" />
                <span>SEND HELP NOW</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Emergency SOS Modal */}
      {isEmergency && !isCountdown && (
        <div className="w-full max-w-xl bg-slate-900 border border-rose-600 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-950/90 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-950">
                <AlertOctagon className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 font-bold">
                  ACTIVE EMERGENCY DISPATCH
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {emergencyAlert.title}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={cancelEmergencyAlert}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Dismiss modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Incident Details */}
          <div className="my-5 space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
              <div className="text-slate-400 mb-1">Incident Summary:</div>
              <div className="text-sm font-medium text-white">{emergencyAlert.message}</div>
              <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-400 font-mono">
                <span>Trigger Time: {emergencyAlert.timestamp}</span>
                <span>•</span>
                <span>Source: {emergencyAlert.source}</span>
              </div>
            </div>

            {/* GPS Pin */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center gap-3">
              <MapPin className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <div className="text-slate-400 text-[11px]">Wearer GPS Coordinates:</div>
                <div className="font-semibold text-white">
                  {location.latitude.toFixed(4)}° N, {Math.abs(location.longitude).toFixed(4)}° W
                </div>
                <div className="text-slate-400 text-[11px]">{location.address}</div>
              </div>
            </div>

            {/* Responders Notification Status */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-xs font-semibold text-slate-300 mb-2.5 flex items-center justify-between">
                <span>Responders & Contacts</span>
                <span className="text-[11px] text-emerald-400 font-normal">SMS & Call Relay Sent</span>
              </div>

              <div className="space-y-2">
                {contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs"
                  >
                    <div>
                      <div className="font-medium text-white">{contact.name}</div>
                      <div className="text-[11px] text-slate-400">{contact.phone}</div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      DISPATCHED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={cancelEmergencyAlert}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel / False Alarm
            </button>

            <button
              type="button"
              onClick={resolveEmergencyAlert}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-lg shadow-emerald-950/60 flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Incident Resolved</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
