import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { Navigation, MapPin, X, CheckCircle, RefreshCw } from 'lucide-react';
import { COIMBATORE_CENTER } from '../utils/distance';

export const LocationBanner: React.FC = () => {
  const {
    permissionStatus,
    usingFallback,
    isLive,
    accuracy,
    requestLocation,
    useCoimbatoreCenter,
    loading,
  } = useLocation();

  const [dismissed, setDismissed] = useState<boolean>(false);
  const [showPresets, setShowPresets] = useState<boolean>(false);

  // Quick simulation points in Coimbatore for testing
  const presets = [
    { name: 'RS Puram (Brookefields)', lat: 11.0053, lng: 76.9541 },
    { name: 'Peelamedu (PSG Tech / Hospitals)', lat: 11.0264, lng: 77.0033 },
    { name: 'Gandhipuram Bus Stand', lat: 11.0175, lng: 76.9672 },
    { name: 'Coimbatore Junction Railway', lat: 10.9972, lng: 76.9628 },
    { name: 'Saravanampatti (Prozone Mall)', lat: 11.0553, lng: 76.9944 },
    { name: 'Coimbatore Airport (CJB)', lat: 11.0298, lng: 77.0434 },
  ];

  if (dismissed && isLive) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white px-4 py-3 shadow-md border-b border-indigo-700/50">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-700/80 rounded-xl text-cyan-300 ring-2 ring-cyan-400/30 shrink-0">
            {isLive ? (
              <Navigation className="w-5 h-5 animate-pulse text-cyan-300" />
            ) : (
              <MapPin className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div>
            {isLive ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-cyan-200">🟢 Live GPS Active:</span>
                <span>Real-time Coimbatore location tracked</span>
                {accuracy && (
                  <span className="text-xs bg-indigo-950/70 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Accuracy: ±{Math.round(accuracy)}m
                  </span>
                )}
              </div>
            ) : usingFallback ? (
              <div>
                <span className="font-semibold text-amber-200">📍 Using Coimbatore City Center:</span>{' '}
                <span>Enable browser location for dynamic distances from your exact spot.</span>
              </div>
            ) : (
              <div>
                <span className="font-semibold text-white">Enable GPS Location:</span>{' '}
                <span>Instantly discover wheelchair ramps, lifts, and accessible facilities nearest to you in Coimbatore.</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {!isLive && (
            <button
              onClick={requestLocation}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Detecting GPS...' : 'Allow Live Location'}
            </button>
          )}

          <button
            onClick={() => setShowPresets(!showPresets)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-700/80 hover:bg-indigo-600 text-indigo-100 text-xs font-medium border border-indigo-500/40 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Test Neighborhoods
          </button>

          {!isLive && usingFallback && (
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-white/10 rounded-lg text-indigo-200 transition-colors cursor-pointer"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Preset Neighborhood Selector */}
      {showPresets && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-indigo-700/60 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-indigo-200 font-medium">Jump location:</span>
          {presets.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                // Dispatch custom location change event or set via hook
                window.dispatchEvent(
                  new CustomEvent('cbe-set-location', {
                    detail: { lat: preset.lat, lng: preset.lng, name: preset.name },
                  })
                );
                setShowPresets(false);
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-cyan-500 hover:text-slate-950 text-indigo-200 border border-indigo-700/50 transition-colors cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
          <button
            onClick={useCoimbatoreCenter}
            className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-700 text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
          >
            Reset to Town Hall (11.0168, 76.9558)
          </button>
        </div>
      )}
    </div>
  );
};
