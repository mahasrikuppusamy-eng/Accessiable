import React from 'react';
import { Place } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { FeaturePill } from './FeaturePill';
import { MapPin, Navigation, Compass, Star, CheckCircle, Phone } from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  onSelect: (place: Place) => void;
  onLocateOnMap?: (place: Place) => void;
  selected?: boolean;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  onSelect,
  onLocateOnMap,
  selected = false,
}) => {
  const primaryFeatures: Array<keyof typeof place.accessibility> = [
    'wheelchairRamp',
    'lift',
    'accessibleToilet',
    'parking',
    'brailleFacility',
    'audioAssistance',
  ];

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      onClick={() => onSelect(place)}
      className={`group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-800/90 border transition-all duration-200 cursor-pointer overflow-hidden ${
        selected
          ? 'ring-2 ring-indigo-500 border-indigo-400 shadow-xl'
          : 'border-slate-200/80 dark:border-slate-700/60 shadow-sm hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-500/50'
      }`}
    >
      {/* Top Banner / Image & Distance */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
        <img
          src={place.images[0]}
          alt={place.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category & Verified Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 shadow-xs">
            {place.category}
          </span>
          {place.isVerified && (
            <span
              title="Verified by Coimbatore Accessibility Alliance"
              className="px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-md bg-emerald-500/90 text-white flex items-center gap-1 shadow-xs"
            >
              <CheckCircle className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Live Distance Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-indigo-600/90 text-white flex items-center gap-1 shadow-md">
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            {place.distanceText || 'Calculating...'}
          </span>
        </div>

        {/* Title over gradient at bottom of image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-heading font-bold text-lg text-white line-clamp-1 group-hover:text-cyan-200 transition-colors drop-shadow-xs">
            {place.name}
          </h3>
          <div className="flex items-center text-xs text-slate-200 gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-cyan-300" />
            <span className="truncate">
              {place.address.area}, {place.address.city}
            </span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col gap-3">
        {/* Score & Rating row */}
        <div className="flex items-center justify-between gap-2">
          <ScoreBadge score={place.accessibilityScore} size="md" />

          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{place.averageRating.toFixed(1)}</span>
            <span className="text-slate-400 font-normal">({place.reviewsCount})</span>
          </div>
        </div>

        {/* Short description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
          {place.description}
        </p>

        {/* Feature Icons Strip */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Accessibility Features</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">
              {Object.values(place.accessibility).filter(Boolean).length}/9 Available
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {primaryFeatures.map((feat) => (
              <FeaturePill
                key={feat}
                featureKey={feat}
                hasFeature={place.accessibility[feat]}
                compact
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center gap-2">
          <button
            onClick={() => onSelect(place)}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors text-center cursor-pointer"
          >
            Full Details & Reviews
          </button>

          {onLocateOnMap && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLocateOnMap(place);
              }}
              title="Focus on interactive map"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-indigo-500" />
            </button>
          )}

          <button
            onClick={handleDirections}
            title="Directions via Google Maps"
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-xs"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
