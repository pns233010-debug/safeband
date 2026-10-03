import React, { useState } from 'react';
import { useSafeBand } from '../../context/SafeBandContext';
import {
  Navigation,
  MapPin,
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const GpsTrackingView: React.FC = () => {
  const {
    location,
    pingDevice,
    toggleGeofenceBreachSim,
  } = useSafeBand();

  const [geofenceRadius, setGeofenceRadius] = useState<number>(250);
  const [pingMessage, setPingMessage] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = async () => {
    setIsPinging(true);
    const result = await pingDevice();
    setPingMessage(result);
    setIsPinging(false);
    setTimeout(() => setPingMessage(null), 5000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              GPS Location & Geofence Guard
            </h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono ${
                location.isInsideSafeZone
                  ? 'bg-emerald-950 border border-emerald-800 text-emerald-300'
                  : 'bg-amber-950 border border-amber-800 text-amber-300'
              }`}
            >
              {location.isInsideSafeZone ? 'SAFE ZONE ACTIVE' : 'PERIMETER BREACH'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Continuous GNSS satellite positioning with multi-constellation GPS/GLONASS/Galileo support.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleGeofenceBreachSim}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer border ${
              location.isInsideSafeZone
                ? 'bg-slate-800 hover:bg-slate-750 text-amber-300 border-amber-800/60'
                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
            }`}
          >
            {location.isInsideSafeZone ? 'Simulate Geofence Exit (680m)' : 'Return to Safe Zone'}
          </button>

          <button
            type="button"
            onClick={handlePing}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Pinging Band...' : 'Ping Device GPS'}</span>
          </button>
        </div>
      </div>

      {pingMessage && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-800 text-cyan-200 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{pingMessage}</span>
        </div>
      )}

      {/* Main Map Canvas Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Interactive Map Visualizer */}
        <div className="relative h-96 sm:h-[420px] bg-slate-950 w-full overflow-hidden flex items-center justify-center select-none">
          {/* Street & Block Grid Canvas */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="smallGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#1e293b" strokeWidth="0.5" />
              </pattern>
              <pattern id="streetGrid" width="120" height="120" patternUnits="userSpaceOnUse">
                <rect width="120" height="120" fill="url(#smallGrid)" />
                <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#334155" strokeWidth="2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#090d16" />
            <rect width="100%" height="100%" fill="url(#streetGrid)" />

            {/* Stylized street avenues */}
            <path d="M 0 180 L 1200 180" stroke="#1e293b" strokeWidth="24" opacity="0.6" />
            <path d="M 0 320 L 1200 320" stroke="#1e293b" strokeWidth="20" opacity="0.6" />
            <path d="M 400 0 L 400 600" stroke="#1e293b" strokeWidth="28" opacity="0.6" />
            <path d="M 780 0 L 780 600" stroke="#1e293b" strokeWidth="22" opacity="0.6" />

            {/* Park Green Area */}
            <rect x="520" y="40" width="180" height="100" rx="8" fill="#064e3b" opacity="0.25" />
            <text x="540" y="80" fill="#34d399" fontSize="11" fontFamily="sans-serif" opacity="0.7">
              Dolores Green Park
            </text>

            {/* Street labels */}
            <text x="80" y="174" fill="#64748b" fontSize="10" fontFamily="sans-serif">Evergreen Terrace</text>
            <text x="80" y="314" fill="#64748b" fontSize="10" fontFamily="sans-serif">Valencia Street</text>
            <text x="410" y="60" fill="#64748b" fontSize="10" fontFamily="sans-serif" transform="rotate(90, 410, 60)">20th Avenue</text>
          </svg>

          {/* Safe Zone Geofence Circle (Home) */}
          <div
            className="absolute rounded-full border-2 border-dashed border-cyan-400/60 bg-cyan-500/10 flex items-center justify-center transition-all duration-500"
            style={{
              width: `${(geofenceRadius / 250) * 220}px`,
              height: `${(geofenceRadius / 250) * 220}px`,
              left: '42%',
              top: '46%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-[11px] font-mono text-cyan-300/80 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
              Safe Zone ({geofenceRadius}m)
            </span>
          </div>

          {/* Wearer Live Beacon Pin */}
          <div
            className="absolute transition-all duration-700 ease-out z-20"
            style={{
              left: location.isInsideSafeZone ? '42%' : '68%',
              top: location.isInsideSafeZone ? '46%' : '26%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Ping Rings */}
            <div
              className={`w-12 h-12 rounded-full absolute -top-3 -left-3 animate-ping opacity-60 ${
                location.isInsideSafeZone ? 'bg-cyan-400' : 'bg-amber-400'
              }`}
            />
            {/* Center Beacon */}
            <div
              className={`w-6 h-6 rounded-full border-2 border-white shadow-2xl flex items-center justify-center ${
                location.isInsideSafeZone ? 'bg-cyan-500' : 'bg-amber-500'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>

            {/* Wearer Floating Tag */}
            <div className="absolute left-8 -top-3 whitespace-nowrap bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xl flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="text-xs font-bold text-white">Robert Vance</div>
                <div className="text-[10px] text-slate-400">
                  {location.isInsideSafeZone ? 'At Home' : 'Outside Safe Perimeter'}
                </div>
              </div>
            </div>
          </div>

          {/* Map Corner Overlays */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-xs space-y-1 z-10 shadow-lg">
            <div className="text-slate-400 font-medium">Wearer Location</div>
            <div className="font-semibold text-white">{location.address}</div>
            <div className="font-mono text-[11px] text-cyan-400">
              {location.latitude.toFixed(5)}° N, {Math.abs(location.longitude).toFixed(5)}° W
            </div>
          </div>

          <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 p-3 rounded-xl backdrop-blur-md text-xs space-y-1 z-10 shadow-lg font-mono">
            <div className="text-slate-400 text-[10px]">GPS FIX: 3D SATELLITE LOCK (9 SVs)</div>
            <div className="text-slate-200 text-[11px]">Accuracy: ±{location.accuracyMeters}m · Altitude: {location.altitudeMeters}m</div>
            <div className="text-slate-400 text-[10px]">Speed: {location.speedKmh} km/h (Walking)</div>
          </div>
        </div>

        {/* Map Control Bar */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-xs text-slate-400 whitespace-nowrap font-medium">
              Geofence Radius:
            </span>
            <input
              type="range"
              min={100}
              max={1000}
              step={50}
              value={geofenceRadius}
              onChange={(e) => setGeofenceRadius(Number(e.target.value))}
              className="w-40 accent-cyan-500 cursor-pointer"
            />
            <span className="text-xs font-mono text-cyan-400 font-bold w-12">
              {geofenceRadius}m
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span>Safe Zone: Home Residence</span>
            <span>·</span>
            <span>Updated: {location.lastPingTime}</span>
          </div>
        </div>
      </div>

      {/* Movement Breadcrumb History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">
          Recent Location Breadcrumbs & Check-ins
        </h3>

        <div className="space-y-3">
          {location.breadcrumbs.map((crumb, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">{crumb.label}</div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    Lat {crumb.lat.toFixed(4)}, Long {crumb.lng.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">{crumb.timestamp}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  VERIFIED
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
