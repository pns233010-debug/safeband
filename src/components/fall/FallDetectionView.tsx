import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  RotateCcw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Activity,
  Zap,
} from 'lucide-react';

export const FallDetectionView: React.FC = () => {
  const {
    fallData,
    triggerSimulatedFall,
    cancelFallCountdown,
    confirmFallEmergency,
    location,
  } = useSafeBand();

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'cancelled' | 'resolved' | 'dispatched'>('all');

  const filteredIncidents = fallData.incidentHistory.filter((inc) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'cancelled') return inc.status === 'cancelled_by_user';
    return inc.status === selectedFilter;
  });

  const isCountdown = fallData.state === 'countdown_active';

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Fall Detection & Impact Guard
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono">
              6-Axis IMU Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine learning algorithm analyzing high-G deceleration, rotational velocity, and post-fall lack of movement.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={triggerSimulatedFall}
          disabled={isCountdown}
          className={`px-4 py-2.5 rounded-xl font-medium text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
            isCountdown
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/60'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>{isCountdown ? 'Alarm Active (Counting Down)' : 'Simulate Hard Fall (4.25G)'}</span>
        </button>
      </div>

      {/* Active Alarm Banner (If Counting Down) */}
      {isCountdown && (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-rose-950/80 border-2 border-rose-500 rounded-2xl p-6 shadow-2xl animate-pulse">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-16 h-16 rounded-2xl bg-rose-600 flex items-center justify-center text-white shrink-0 shadow-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold uppercase text-rose-400">
                  SAFETY COUNTDOWN ENGAGED
                </span>
                <h3 className="text-xl font-extrabold text-white">
                  Sudden Deceleration Impact Detected!
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Impact force reached <span className="font-bold text-rose-300 font-mono">4.25 G</span> at {location.address}.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-4xl font-black font-mono text-rose-400 tabular-nums">
                00:{fallData.countdownSeconds < 10 ? `0${fallData.countdownSeconds}` : fallData.countdownSeconds}
              </div>
              <span className="text-[11px] text-slate-400">Automatic 911 dispatch in {fallData.countdownSeconds}s</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={cancelFallCountdown}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I'M OK - CANCEL</span>
              </button>

              <button
                type="button"
                onClick={confirmFallEmergency}
                className="py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                DISPATCH 911 NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3-Axis IMU Telemetry & Vector Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Total G-Force Resultant */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Deceleration Force
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                √ (X² + Y² + Z²)
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-5xl font-extrabold text-white font-mono tabular-nums">
                {fallData.currentGForce.toFixed(2)}
              </span>
              <span className="text-base text-slate-400 font-mono">G</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Baseline Gravity (At rest)</span>
                <span className="text-slate-200 font-mono">1.00 G</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fall Impact Threshold</span>
                <span className="text-rose-400 font-mono font-bold">3.50 G</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Today's Peak Recorded Impact</span>
                <span className="text-cyan-400 font-mono">{fallData.peakGForce.toFixed(2)} G</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 mt-4">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
              <span>Gravity Normal (1.0G)</span>
              <span>Trigger (3.5G)</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  fallData.currentGForce > 3.0 ? 'bg-rose-500' : 'bg-cyan-500'
                }`}
                style={{ width: `${Math.min(100, (fallData.currentGForce / 5.0) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3-Axis Accelerometer (X, Y, Z) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Live 3-Axis Vector Decomposition</h3>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                100 Hz Sampling
              </span>
            </div>

            <div className="space-y-4">
              {/* X Axis */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">X-Axis (Lateral Tilt)</span>
                  <span className="font-mono text-cyan-400 tabular-nums">
                    {fallData.vector.x > 0 ? `+${fallData.vector.x.toFixed(3)}` : fallData.vector.x.toFixed(3)} G
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.abs(fallData.vector.x) * 40)}%` }}
                  />
                </div>
              </div>

              {/* Y Axis */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Y-Axis (Forward / Backward)</span>
                  <span className="font-mono text-emerald-400 tabular-nums">
                    {fallData.vector.y > 0 ? `+${fallData.vector.y.toFixed(3)}` : fallData.vector.y.toFixed(3)} G
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.abs(fallData.vector.y) * 40)}%` }}
                  />
                </div>
              </div>

              {/* Z Axis */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-300">Z-Axis (Vertical Earth Gravity)</span>
                  <span className="font-mono text-indigo-400 tabular-nums">
                    {fallData.vector.z > 0 ? `+${fallData.vector.z.toFixed(3)}` : fallData.vector.z.toFixed(3)} G
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-200"
                    style={{ width: `${Math.min(100, Math.abs(fallData.vector.z) * 40)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>IMU Sensor: InvenSense 6-Axis MotionTracking™</span>
            <span className="font-mono">Calibration: Factory Calibrated (±0.01G)</span>
          </div>
        </div>
      </div>

      {/* Detection Workflow Pipeline Explainer */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">
          SafeBand Fall Verification Pipeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Phase 1</span>
            <div className="text-xs font-bold text-white mt-1">Free-Fall Drop</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Sudden drop in vector magnitude below 0.5G indicating weightlessness.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Phase 2</span>
            <div className="text-xs font-bold text-white mt-1">Impact Deceleration</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Violent spike exceeding 3.5G as body collides with ground/floor.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Phase 3</span>
            <div className="text-xs font-bold text-white mt-1">Inactivity Check</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Gyroscopic sensor confirms wearer remains stationary and unable to stand.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-mono text-cyan-400 uppercase">Phase 4</span>
            <div className="text-xs font-bold text-white mt-1">30s Grace Countdown</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Haptic buzzer & screen alert give wearer time to dismiss false alarms.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60">
            <span className="text-[10px] font-mono text-rose-400 uppercase">Phase 5</span>
            <div className="text-xs font-bold text-white mt-1">Automatic Dispatch</div>
            <p className="text-[11px] text-slate-400 mt-1">
              Cellular LTE dispatches GPS pin and health profile to 911 & Caregiver.
            </p>
          </div>
        </div>
      </div>

      {/* Historical Fall Incidents Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Historical Fall & Deceleration Log</h3>
            <p className="text-xs text-slate-400">All registered impact thresholds and wearer resolutions</p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Events
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('cancelled')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'cancelled'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dismissed (False)
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('resolved')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedFilter === 'resolved'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dispatched / Resolved
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">Peak Force</th>
                <th className="pb-3">Descent Speed</th>
                <th className="pb-3">Location Pin</th>
                <th className="pb-3">Resolution Status</th>
                <th className="pb-3 pr-2">Clinical Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No incidents match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 pl-2 font-mono text-slate-300">{incident.timestamp}</td>
                    <td className="py-3 font-mono font-bold text-rose-400 tabular-nums">
                      {incident.peakGForce.toFixed(1)} G
                    </td>
                    <td className="py-3 font-mono text-slate-300 tabular-nums">
                      {incident.speedOfDescent} m/s
                    </td>
                    <td className="py-3 text-slate-300">{incident.location}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded ${
                          incident.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : incident.status === 'dispatched'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {incident.status === 'cancelled_by_user' ? 'Dismissed by User' : incident.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-slate-400 max-w-xs truncate">{incident.notes}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
