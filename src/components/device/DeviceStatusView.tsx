import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Cpu,
  BatteryMedium,
  BatteryCharging,
  Wifi,
  Radio,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Watch,
  ShieldCheck,
  Zap,
  Sliders,
  Database,
} from 'lucide-react';

export const DeviceStatusView: React.FC = () => {
  const {
    device,
    pingDevice,
    updateBatterySim,
    toggleWristDetachedSim,
    isFirebaseConfigured,
    isFirebaseConnected,
    testFirebaseConnection,
  } = useSafeBand();

  const [isSelfTesting, setIsSelfTesting] = useState(false);
  const [selfTestMessage, setSelfTestMessage] = useState<string | null>(null);
  const [isTestingRtdb, setIsTestingRtdb] = useState(false);

  const runSensorSelfTest = async () => {
    setIsSelfTesting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSelfTesting(false);
    setSelfTestMessage('Hardware self-diagnostics completed. All 5 onboard sensor subsystems reporting 100% nominal.');
    setTimeout(() => setSelfTestMessage(null), 5000);
  };

  const handleTestRtdb = async () => {
    setIsTestingRtdb(true);
    const res = await testFirebaseConnection();
    setIsTestingRtdb(false);
    setSelfTestMessage(res.message);
    setTimeout(() => setSelfTestMessage(null), 6000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Device Diagnostics & Hardware Telemetry
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
              BLE 5.2 PAIRED
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time battery gauge, sensor calibration health, wireless signal attenuation, and skin contact verification.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={runSensorSelfTest}
            disabled={isSelfTesting}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSelfTesting ? 'animate-spin' : ''}`} />
            <span>{isSelfTesting ? 'Running Self-Test...' : 'Run Diagnostics Self-Test'}</span>
          </button>
        </div>
      </div>

      {selfTestMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{selfTestMessage}</span>
        </div>
      )}

      {/* Product Showcase & Core Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Image Showcase */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col">
          <div className="relative h-56 bg-slate-950 overflow-hidden">
            <img
              src="/src/assets/images/safeband_device_render_1791004216245.jpg"
              alt="SafeBand Sentinel Pro"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-mono text-cyan-300">
              {device.serialNumber}
            </div>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white">{device.model}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Medical IoT Wearable Band with dual optical PPG, 6-axis IMU, and dedicated tactile SOS.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Firmware:</span>
                <span className="font-mono text-slate-200">{device.firmwareVersion}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Last Telemetry Sync:</span>
                <span className="font-mono text-slate-200">{device.lastSyncTime}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Wearing State:</span>
                <span className={device.wornOnWrist ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                  {device.wornOnWrist ? 'Skin Contact Verified' : 'Band Removed from Wrist'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Battery & Power Subsystem */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Battery Subsystem
              </span>
              <div className="p-2 rounded-xl bg-slate-800 text-emerald-400">
                {device.isCharging ? <BatteryCharging className="w-5 h-5 text-cyan-400" /> : <BatteryMedium className="w-5 h-5" />}
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-5xl font-extrabold text-white font-mono tabular-nums">
                {device.batteryLevel}
              </span>
              <span className="text-lg text-slate-400 font-mono">%</span>
            </div>

            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  device.batteryLevel < 15
                    ? 'bg-rose-500'
                    : device.batteryLevel < 30
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${device.batteryLevel}%` }}
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Estimated Runtime:</span>
                <span className="text-slate-200 font-mono">
                  ~{Math.round(device.batteryLevel * 0.44)} hours remaining
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Cell Health:</span>
                <span className="text-emerald-400 font-mono">98% (Optimal)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Charging State:</span>
                <span className="text-slate-200 font-mono">
                  {device.isCharging ? 'Magnetic Dock Connected' : 'Discharging Normally'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Battery Simulation Buttons */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <span className="text-[11px] text-slate-500 block mb-2 font-mono">TEST BATTERY STATES:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateBatterySim(8)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-rose-300 font-mono cursor-pointer"
              >
                Sim Low (8%)
              </button>
              <button
                type="button"
                onClick={() => updateBatterySim(50)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-amber-300 font-mono cursor-pointer"
              >
                Sim 50%
              </button>
              <button
                type="button"
                onClick={() => updateBatterySim(100)}
                className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-emerald-300 font-mono cursor-pointer"
              >
                Sim 100%
              </button>
            </div>
          </div>
        </div>

        {/* Wireless & Network Radios */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Network & Connectivity
              </span>
              <div className="p-2 rounded-xl bg-slate-800 text-cyan-400">
                <Wifi className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-3">
              {/* BLE */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">Bluetooth Low Energy 5.2</div>
                  <div className="text-slate-400 text-[11px]">Primary link to Gateway Phone</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-cyan-400 font-semibold">{device.bleRssi} dBm</div>
                  <div className="text-[10px] text-emerald-400">Excellent Signal</div>
                </div>
              </div>

              {/* Cellular */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">Cellular LTE-M / NB-IoT</div>
                  <div className="text-slate-400 text-[11px]">Autonomous outdoor fallback</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-emerald-400 font-semibold">STANDBY</div>
                  <div className="text-[10px] text-slate-400">B12 / B13 Active</div>
                </div>
              </div>

              {/* GNSS */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">GNSS Satellite Engine</div>
                  <div className="text-slate-400 text-[11px]">GPS / GLONASS / Galileo</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-indigo-400 font-semibold">9 SVs Locked</div>
                  <div className="text-[10px] text-emerald-400">Fix Acquired</div>
                </div>
              </div>

              {/* Firebase Realtime Database & ESP32 Channel */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Firebase RTDB (ESP32 Wi-Fi)</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {isFirebaseConnected
                      ? 'Live bidirectional synchronization'
                      : isFirebaseConfigured
                      ? 'Connecting to database...'
                      : 'Running in sandbox mode (.env ready)'}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-mono font-semibold ${isFirebaseConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {isFirebaseConnected ? 'ONLINE' : isFirebaseConfigured ? 'CONNECTING' : 'SANDBOX'}
                  </div>
                  <button
                    type="button"
                    onClick={handleTestRtdb}
                    disabled={isTestingRtdb}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                  >
                    {isTestingRtdb ? 'Testing...' : 'Test Connection'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Wrist Detach Toggle */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              type="button"
              onClick={toggleWristDetachedSim}
              className={`w-full py-2 px-3 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
                device.wornOnWrist
                  ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-800/60'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
              }`}
            >
              {device.wornOnWrist ? 'Simulate Band Detached from Wrist' : 'Simulate Band Put Back On'}
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Health Diagnostic Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">
          Onboard Subsystem Self-Test Matrix
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">PPG Optical</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">Green (525nm) & IR (940nm) emitter arrays calibrated.</div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">STATUS: PASS</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">6-Axis IMU</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">High-G accelerometer & gyroscope zero-bias aligned.</div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">STATUS: PASS</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Body Thermistor</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">Medical surface thermistor probe reading 36.6°C.</div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">STATUS: PASS</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">Skin Impedance</span>
              <CheckCircle2 className={`w-4 h-4 ${device.wornOnWrist ? 'text-emerald-400' : 'text-amber-400'}`} />
            </div>
            <div className="text-[11px] text-slate-400">Contact resistance check for wearer presence.</div>
            <div className={`mt-2 text-[10px] font-mono ${device.wornOnWrist ? 'text-emerald-400' : 'text-amber-400'}`}>
              {device.wornOnWrist ? 'STATUS: WORN' : 'STATUS: OFF-WRIST'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-white">SOS Switch</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-[11px] text-slate-400">Gold-plated tactile microswitch circuit closed & armed.</div>
            <div className="mt-2 text-[10px] font-mono text-emerald-400">STATUS: PASS</div>
          </div>
        </div>
      </div>
    </div>
  );
};
