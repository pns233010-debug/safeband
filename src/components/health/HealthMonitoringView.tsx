import React, { useState, useEffect, useRef } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Heart,
  Activity,
  Thermometer,
  Flame,
  Footprints,
  Wind,
  ShieldCheck,
  AlertCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';

export const HealthMonitoringView: React.FC = () => {
  const { vitals, updateHeartRateSim, toggleLowSpo2Sim } = useSafeBand();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeZone, setActiveZone] = useState<'all' | 'hr' | 'spo2' | 'temp'>('all');

  // Simulated live ECG trace on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const width = canvas.width;
    const height = canvas.height;
    const points: number[] = new Array(width).fill(height / 2);

    const render = () => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      // Draw faint grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Generate ECG waveform pattern based on current heart rate
      const beatInterval = Math.max(15, Math.floor(1800 / vitals.heartRate));
      const posInBeat = step % beatInterval;
      let yVal = height / 2;

      // PQRST Wave simulation
      if (posInBeat === 2) yVal -= 6; // P wave
      else if (posInBeat === 4) yVal += 2;
      else if (posInBeat === 6) yVal += 5; // Q
      else if (posInBeat === 8) yVal -= 38; // R peak
      else if (posInBeat === 10) yVal += 16; // S drop
      else if (posInBeat === 14) yVal -= 10; // T wave
      else if (posInBeat === 16) yVal -= 4;

      points.push(yVal);
      if (points.length > width) {
        points.shift();
      }

      // Draw ECG trace
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = vitals.heartRate > 110 ? '#f43f5e' : '#06b6d4';
      ctx.shadowColor = vitals.heartRate > 110 ? '#f43f5e' : '#06b6d4';
      ctx.shadowBlur = 8;

      for (let i = 0; i < points.length; i++) {
        if (i === 0) ctx.moveTo(i, points[i]);
        else ctx.lineTo(i, points[i]);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      step++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [vitals.heartRate]);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Biometric Telemetry & Vital Sensors
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
              PPG Optical + Medical Thermistor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time optical photoplethysmography (PPG), blood oxygen saturation, and body surface temperature.
          </p>
        </div>

        {/* Quick simulation buttons right on page */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => updateHeartRateSim(vitals.heartRate > 100 ? 72 : 142)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-rose-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>{vitals.heartRate > 100 ? 'Reset Normal HR' : 'Simulate Tachycardia (142 BPM)'}</span>
          </button>

          <button
            type="button"
            onClick={toggleLowSpo2Sim}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-cyan-300 font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>{vitals.spo2 < 92 ? 'Reset Normal SpO2' : 'Simulate Low SpO2 (88%)'}</span>
          </button>
        </div>
      </div>

      {/* Real-Time Live ECG Oscilloscope Screen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Live ECG Rhythm Waveform</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-emerald-400 font-mono">STREAMING (250 Hz)</span>
              </div>
              <p className="text-xs text-slate-400">Calculated via SafeBand dual-wavelength optical PPG array</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">HEART RATE:</span>
              <span className="text-lg font-bold text-white tabular-nums">{vitals.heartRate}</span>
              <span className="text-slate-400">BPM</span>
            </div>
            <div className="flex items-center gap-1 text-slate-300">
              <span className="text-slate-500">STATUS:</span>
              <span className={`font-semibold ${vitals.heartRate > 110 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {vitals.ecgStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
          <canvas
            ref={canvasRef}
            width={800}
            height={160}
            className="w-full h-40 block"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>Sweep: 25 mm/s</span>
            <span>·</span>
            <span>Gain: 10 mm/mV</span>
            <span>·</span>
            <span>Filter: 0.5 - 40 Hz Medical Bandpass</span>
          </div>
          <div>
            Lead I PPG Reflection · Electrode Impedance: 12.4 kΩ (Nominal)
          </div>
        </div>
      </div>

      {/* Detailed Vital Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Heart Rate Deep Dive */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h4 className="text-sm font-bold text-white">Heart Rate Telemetry</h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300">
                Live
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                {vitals.heartRate}
              </span>
              <span className="text-xs text-slate-400 font-mono">BPM</span>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Resting Heart Rate</span>
                <span className="text-slate-200 font-mono">68 BPM</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Today's Range</span>
                <span className="text-slate-200 font-mono">64 - 88 BPM</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Heart Rate Variability (HRV)</span>
                <span className="text-slate-200 font-mono">48 ms (Good)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
              Cardiac Zones
            </div>
            <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-slate-800">
              <div className="w-1/3 bg-cyan-500" title="Resting (50-70)" />
              <div className="w-1/3 bg-emerald-500" title="Normal (70-90)" />
              <div className="w-1/3 bg-rose-500" title="Elevated (>90)" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>Rest</span>
              <span>Nominal</span>
              <span>Cardio</span>
            </div>
          </div>
        </div>

        {/* SpO2 Blood Oxygen Deep Dive */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">Oxygen Saturation (SpO2)</h4>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded font-mono ${
                  vitals.spo2 < 90 ? 'bg-rose-950 text-rose-300' : 'bg-cyan-950 text-cyan-300'
                }`}
              >
                {vitals.spo2 < 90 ? 'WARNING' : 'NOMINAL'}
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                {vitals.spo2}
              </span>
              <span className="text-xs text-slate-400 font-mono">% O2</span>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Baseline Saturation</span>
                <span className="text-slate-200 font-mono">98%</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Hypoxia Safety Threshold</span>
                <span className="text-slate-200 font-mono">&lt; 90% SpO2</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Respiration Rate</span>
                <span className="text-slate-200 font-mono">{vitals.respirationRate} Br/min</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
              24-Hour Trend
            </div>
            <div className="flex items-end gap-2 h-10">
              {[98, 97, 98, 99, 98, 97, vitals.spo2].map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-sm ${v < 90 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                    style={{ height: `${((v - 80) / 20) * 100}%` }}
                  />
                  <span className="text-[9px] text-slate-500 font-mono">{18 + i}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skin & Core Temperature Deep Dive */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-amber-400" />
                <h4 className="text-sm font-bold text-white">Body Temperature</h4>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono">
                Stable
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-white font-mono tabular-nums">
                {vitals.bodyTemp.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400 font-mono">°C</span>
              <span className="text-sm text-slate-500 font-mono">
                ({(vitals.bodyTemp * 1.8 + 32).toFixed(1)} °F)
              </span>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Baseline Body Temp</span>
                <span className="text-slate-200 font-mono">36.6 °C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fever Alert Threshold</span>
                <span className="text-slate-200 font-mono">38.0 °C (100.4 °F)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ambient Wrist Contact</span>
                <span className="text-emerald-400 font-mono">Optimal Seal</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] text-slate-500 mb-1.5 uppercase font-mono tracking-wider">
              Temperature Gauge
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-400 via-emerald-400 to-amber-500 h-full rounded-full"
                style={{ width: `${((vitals.bodyTemp - 34) / 6) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>34.0°C</span>
              <span>36.6°C (Target)</span>
              <span>40.0°C</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Mobility Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-400" />
          <span>Daily Mobility & Activity Metrics</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Steps Today</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {vitals.stepsCount.toLocaleString()}
            </div>
            <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(vitals.stepsCount / vitals.stepsGoal) * 100}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-1">Goal: {vitals.stepsGoal} steps</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Active Duration</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {vitals.activeMinutes} min
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Light walking & daily movement</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs text-slate-400 mb-1">Energy Burned</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {vitals.caloriesBurned} kcal
            </div>
            <div className="text-[11px] text-slate-500 mt-2">Active metabolic expenditure</div>
          </div>
        </div>
      </div>
    </div>
  );
};
