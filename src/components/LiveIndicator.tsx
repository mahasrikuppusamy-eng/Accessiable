import React from 'react';
import { useLocation } from '../context/LocationContext';
import { MapPin, Navigation } from 'lucide-react';

export const LiveIndicator: React.FC = () => {
  const { isLive, areaName, usingFallback, accuracy } = useLocation();

  return (
    <div
      title={
        isLive
          ? `Live GPS coordinates active (Accuracy: ±${Math.round(accuracy || 0)}m)`
          : 'Coimbatore City Center Default'
      }
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all ${
        isLive
          ? 'bg-cyan-500/10 text-cyan-700 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800'
          : 'bg-amber-500/10 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
      }`}
    >
      {isLive ? (
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
        </span>
      ) : (
        <MapPin className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
      )}
      <span className="font-semibold">{isLive ? 'Live GPS:' : 'Location:'}</span>
      <span className="max-w-[160px] truncate" title={areaName || 'Coimbatore'}>
        {areaName || 'Coimbatore, Tamil Nadu'}
      </span>
    </div>
  );
};
