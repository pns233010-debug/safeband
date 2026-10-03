import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Heart,
  Activity,
  AlertOctagon,
  BatteryMedium,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Terminal,
  Database,
  Wifi,
  Radio,
} from 'lucide-react';

interface SimulationPanelProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ isModal = false, onClose }) => {
  const {
    vitals,
    device,
    fallData,
    location,
    emergencyAlert,
    simEvents,
    triggerSimulatedFall,
    triggerSos,
    updateHeartRateSim,
    updateBatterySim,
    toggleGeofenceBreachSim,
    toggleWristDetachedSim,
    toggleLowSpo2Sim,
    resetAllSimulations,
    isFirebaseConfigured,
    isFirebaseConnected,
    testFirebaseConnection,
    simulateEsp32Packet,
  } = useSafeBand();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingRtdb, setIsTestingRtdb] = useState(false);

  const [esp32Result, setEsp32Result] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);
  const [isSendingEsp32, setIsSendingEsp32] = useState(false);

  const handleTestRtdb = async () => {
    setIsTestingRtdb(true);
    const res = await testFirebaseConnection();
    setIsTestingRtdb(false);
    setTestResult(res.message);
    setTimeout(() => setTestResult(null), 6000);
  };

  const handleSimulateEsp32 = async () => {
    setIsSendingEsp32(true);
    setEsp32Result(null);
    try {
      const res = await simulateEsp32Packet();
      if (res.success) {
        setEsp32Result({
          success: true,
          message: 'ESP32 simulation packet sent successfully',
          details:
            'Verified write & read-back from Firebase at /devices/SB-PRO-9412/ (HR: 72 BPM, SpO2: 98%, Temp: 36.6°C, GPS: 17.6868° N, 83.2185° E)',
        });
      } else {
        setEsp32Result({
          success: false,
          message: res.message || res.error || 'Firebase write rejected.',
          details:
            res.error ||
            'Check Firebase Realtime Database rules in console (Realtime Database -> Rules).',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setEsp32Result({
        success: false,
        message: `Firebase write rejected: ${msg}`,
        details: 'Check your Firebase Realtime Database rules in console.',
      });
    } finally {
      setIsSendingEsp32(false);
    }
  };

  const filteredEvents = simEvents.filter((e) => {
    if (activeCategory === 'all') return true;
    return e.category === activeCategory;
  });

  const content = (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              <span>SafeBand Hardware & Firebase RTDB Sandbox</span>
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              Phase 2 Integrated
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate incoming ESP32 packets over Wi-Fi and verify live real-time listeners across all device vitals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestRtdb}
            disabled={isTestingRtdb}
            className="px-3.5 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isTestingRtdb ? 'Testing RTDB...' : 'Test Firebase RTDB'}</span>
          </button>

          <button
            type="button"
            onClick={resetAllSimulations}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Restore Baseline</span>
          </button>
        </div>
      </div>

      {/* ESP32 -> Wi-Fi -> Firebase Architecture Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white flex items-center gap-2">
              <span>ESP32 Wi-Fi Pipeline:</span>
              <span className="font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800 text-[10px]">
                ESP32 → Wi-Fi → Firebase RTDB → SafeBand Website
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              The browser listens directly to Firebase Realtime Database. Hardware sends telemetry over Wi-Fi via standard REST/WebSockets.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSimulateEsp32}
          disabled={isSendingEsp32}
          className={`px-3.5 py-2 rounded-xl text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-lg ${
            isSendingEsp32
              ? 'bg-cyan-800 cursor-not-allowed opacity-80'
              : 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-950/50'
          }`}
        >
          <Wifi className={`w-3.5 h-3.5 ${isSendingEsp32 ? 'animate-pulse' : ''}`} />
          <span>{isSendingEsp32 ? 'Transmitting to Firebase...' : 'Simulate ESP32 Wi-Fi Packet'}</span>
        </button>
      </div>

      {/* ESP32 Packet Result Feedback Banner */}
      {esp32Result && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 shadow-md animate-in fade-in transition-all ${
            esp32Result.success
              ? 'bg-emerald-950/70 border-emerald-700/80 text-emerald-200'
              : 'bg-rose-950/70 border-rose-800 text-rose-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {esp32Result.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-bold text-white text-xs">{esp32Result.message}</div>
              {esp32Result.details && (
                <div className="text-[11px] text-slate-300 mt-0.5 font-mono leading-relaxed">
                  {esp32Result.details}
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEsp32Result(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {testResult && (
        <div className="p-3.5 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-200 text-xs flex items-center justify-between">
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

      {/* Preset Scenario Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>One-Click Emergency & Anomaly Presets</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">Instant Telemetry Injection</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Preset 1: Hard Fall */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Sudden Fall (4.25G)</span>
                <ShieldAlert className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Spikes 3-axis IMU deceleration and starts the 30-second cancellation countdown.
              </p>
            </div>
            <button
              type="button"
              onClick={triggerSimulatedFall}
              className="w-full py-2 px-3 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/80 text-rose-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Fall</span>
            </button>
          </div>

          {/* Preset 2: Tachycardia */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Tachycardia (145 BPM)</span>
                <Heart className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates elevated resting heart rate and accelerates the live ECG rhythm waveform.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateHeartRateSim(vitals.heartRate > 100 ? 72 : 145)}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{vitals.heartRate > 100 ? 'Reset HR' : 'Spike HR (145 BPM)'}</span>
            </button>
          </div>

          {/* Preset 3: Low SpO2 */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Hypoxia (88% SpO2)</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Drops blood oxygen saturation below the critical 90% threshold.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleLowSpo2Sim}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{vitals.spo2 < 90 ? 'Restore SpO2' : 'Drop SpO2 (88%)'}</span>
            </button>
          </div>

          {/* Preset 4: SOS Press */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Tactile SOS Button</span>
                <AlertOctagon className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates wearer pressing the physical emergency microswitch on the wristband.
              </p>
            </div>
            <button
              type="button"
              onClick={() => triggerSos('sos_button')}
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Broadcast SOS</span>
            </button>
          </div>

          {/* Preset 5: Geofence Breach */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Geofence Departure</span>
                <Navigation className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Moves wearer 680m away from Home safe zone to Oak Park Ave.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleGeofenceBreachSim}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{location.isInsideSafeZone ? 'Breach Safe Zone' : 'Return Home'}</span>
            </button>
          </div>

          {/* Preset 6: Wristband Removed */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Band Removed (Skin Loss)</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Simulates optical/impedance sensor losing contact with the wrist.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleWristDetachedSim}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{device.wornOnWrist ? 'Detach from Wrist' : 'Put Band Back On'}</span>
            </button>
          </div>

          {/* Preset 7: Critical Low Battery */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-rose-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">Critical Battery (8%)</span>
                <BatteryMedium className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Drains battery to trigger low power notification and conservation mode.
              </p>
            </div>
            <button
              type="button"
              onClick={() => updateBatterySim(device.batteryLevel < 15 ? 86 : 8)}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{device.batteryLevel < 15 ? 'Charge Battery (86%)' : 'Set to 8%'}</span>
            </button>
          </div>

          {/* Preset 8: Normal Baseline */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-900/60 transition-colors flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white">All Nominal Baseline</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Sets 72 BPM, 98% SpO2, 36.6°C, safe zone active, zero alarms.
              </p>
            </div>
            <button
              type="button"
              onClick={resetAllSimulations}
              className="w-full py-2 px-3 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Baseline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Hardware Controls & Sliders */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <span>Manual Variable Telemetry Sliders</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Heart Rate Slider */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Heart Rate (BPM)</span>
              <span className="font-mono text-base font-bold text-rose-400 tabular-nums">
                {vitals.heartRate} BPM
              </span>
            </div>
            <input
              type="range"
              min={45}
              max={180}
              value={vitals.heartRate}
              onChange={(e) => updateHeartRateSim(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Bradycardia (45)</span>
              <span>Nominal (72)</span>
              <span>Tachycardia (180)</span>
            </div>
          </div>

          {/* Battery Level Slider */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Battery Level</span>
              <span className="font-mono text-base font-bold text-emerald-400 tabular-nums">
                {device.batteryLevel}%
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={device.batteryLevel}
              onChange={(e) => updateBatterySim(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Critical (1%)</span>
              <span>50%</span>
              <span>Full (100%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Hardware Event Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live Virtual Hardware Telemetry Feed</h3>
          </div>

          {/* Category filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            {['all', 'fall', 'sos', 'sensor', 'gps', 'system'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-lg uppercase font-mono text-[10px] transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs max-h-72 overflow-y-auto space-y-2">
          {filteredEvents.map((evt) => (
            <div key={evt.id} className="flex items-start gap-3 py-1 border-b border-slate-900/80">
              <span className="text-slate-500 shrink-0">{evt.timestamp}</span>
              <span
                className={`uppercase font-bold shrink-0 text-[10px] px-1.5 py-0.2 rounded ${
                  evt.status === 'alert'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : evt.status === 'warning'
                    ? 'bg-amber-950 text-amber-300 border border-amber-800'
                    : 'bg-slate-900 text-cyan-300'
                }`}
              >
                [{evt.category}]
              </span>
              <span className="text-slate-300 leading-snug">{evt.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-cyan-800/80 rounded-2xl shadow-2xl overflow-y-auto p-6">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Hardware Simulation Controls</h2>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>
    );
  }

  return <div className="p-6">{content}</div>;
};
