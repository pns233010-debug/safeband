import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  AlertOctagon,
  PhoneCall,
  ShieldAlert,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Heart,
  FileText,
  UserCheck,
  Stethoscope,
  X,
  Volume2,
} from 'lucide-react';

export const EmergencyAlertView: React.FC = () => {
  const {
    emergencyAlert,
    triggerSos,
    cancelEmergencyAlert,
    resolveEmergencyAlert,
    contacts,
    location,
    currentUser,
  } = useSafeBand();

  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestContact = (name: string) => {
    setTestResult(`Test SMS dispatched to ${name}. Delivery verified.`);
    setTimeout(() => setTestResult(null), 4000);
  };

  const isAlertActive = emergencyAlert && emergencyAlert.active;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Emergency SOS Dispatch Command
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-800 text-rose-300 font-mono">
              E911 & Caregiver Relay
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Direct cellular link triggered via tactile wristband SOS button, severe cardiac distress, or unacknowledged fall.
          </p>
        </div>

        {isAlertActive ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelEmergencyAlert}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel Alert
            </button>
            <button
              type="button"
              onClick={resolveEmergencyAlert}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => triggerSos('manual_test')}
            className="py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors shadow-lg shadow-rose-950/60 flex items-center gap-2 cursor-pointer"
          >
            <AlertOctagon className="w-4 h-4" />
            <span>TRIGGER SOS TEST ALERT</span>
          </button>
        )}
      </div>

      {testResult && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-800 text-cyan-200 text-xs flex items-center justify-between">
          <span>{testResult}</span>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-cyan-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Big Tactical SOS Trigger & Status Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Physical Tactical Button Simulation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            SafeBand Tactile SOS Switch
          </span>

          {/* Big Circular SOS Button */}
          <button
            type="button"
            onClick={() => triggerSos('sos_button')}
            className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer ${
              isAlertActive
                ? 'border-rose-400 bg-rose-600 text-white shadow-2xl shadow-rose-600 animate-pulse'
                : 'border-rose-700/80 bg-gradient-to-b from-rose-600 to-rose-800 text-white hover:scale-105 shadow-xl shadow-rose-950/80 active:scale-95'
            }`}
          >
            <AlertOctagon className="w-10 h-10 mb-1" />
            <span className="text-xl font-black tracking-wider">SOS</span>
            <span className="text-[10px] text-rose-200 font-mono uppercase">
              {isAlertActive ? 'DISPATCHING' : 'PRESS TO DISPATCH'}
            </span>
          </button>

          <p className="text-xs text-slate-400 mt-5 max-w-xs">
            {isAlertActive
              ? 'Emergency alert is currently broadcasting to all contacts and EMS.'
              : 'Simulates the physical tactile recessed button located on the side bezel of the SafeBand.'}
          </p>
        </div>

        {/* Live Dispatch State & Telemetry Package */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <h3 className="text-sm font-bold text-white">Emergency Dispatch Payload</h3>
              </div>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                  isAlertActive
                    ? 'bg-rose-950 border border-rose-800 text-rose-300 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {isAlertActive ? 'PAYLOAD TRANSMITTING' : 'STANDBY MODE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 font-medium">Wearer Identity</div>
                <div className="text-sm font-bold text-white">Robert Vance (Age 74)</div>
                <div className="text-slate-400">Blood Type: <span className="text-slate-200 font-mono">A+</span></div>
                <div className="text-slate-400">Primary Language: <span className="text-slate-200">English</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 font-medium">Critical Medical Profile</div>
                <div className="text-slate-300">Type 2 Diabetes, Pacemaker (2023)</div>
                <div className="text-slate-400">Allergies: <span className="text-rose-400 font-medium">Penicillin</span></div>
                <div className="text-slate-400">Physician: <span className="text-slate-200">Dr. Michael Chen</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 sm:col-span-2">
                <div className="text-slate-400 font-medium flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pinned GPS Dispatch Location</span>
                </div>
                <div className="text-sm font-semibold text-white">{location.address}</div>
                <div className="text-slate-400 font-mono text-[11px]">
                  Coordinates: {location.latitude.toFixed(6)}° N, {Math.abs(location.longitude).toFixed(6)}° W (Accuracy: ±{location.accuracyMeters}m)
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Transmission: Dual-band LTE-M + NB-IoT fallback</span>
            <span className="font-mono">Encryption: AES-256 TLS 1.3</span>
          </div>
        </div>
      </div>

      {/* Emergency Response Contacts */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Emergency Contact Roster & Escalation Ladder</h3>
            <p className="text-xs text-slate-400">
              When an SOS or fall triggers, alerts are dispatched concurrently in priority order.
            </p>
          </div>
          <span className="text-xs text-emerald-400 font-mono">
            3 Contacts Configured
          </span>
        </div>

        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-750 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white font-mono shrink-0">
                  #{contact.priority}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {contact.name}
                    {contact.priority === 1 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                        PRIMARY
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">{contact.relationship} · {contact.phone}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-400 font-mono mr-2">
                  {contact.notifySms && 'SMS'} {contact.notifyCall && '· Voice Call'}
                </span>

                <button
                  type="button"
                  onClick={() => handleTestContact(contact.name)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  Send Test Ping
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Action Protocol */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-3">
          Field Responders & Caregiver Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">1. Audio Confirmation</div>
            <p className="text-slate-400">
              SafeBand speaker will chirp and vibrate. Attempt direct two-way call to wearer before dispatching ambulance.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">2. Rapid Location Check</div>
            <p className="text-slate-400">
              Check GPS coordinates in the GPS tab to determine if wearer is inside residence or outdoors.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-white mb-1">3. Clinical Handover</div>
            <p className="text-slate-400">
              Transmit digital vital history (Heart rate, SpO2, impact force) to incoming paramedics on arrival.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
