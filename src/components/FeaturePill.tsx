import React from 'react';
import {
  Accessibility,
  ArrowUpDown,
  Bath,
  Car,
  FileText,
  Volume2,
  DoorOpen,
  HelpCircle,
  HandMetal,
  Check,
  X,
} from 'lucide-react';
import { FEATURE_METADATA } from '../utils/scoreCalculator';
import { AccessibilityFeatures } from '../types';

interface FeaturePillProps {
  featureKey: keyof AccessibilityFeatures;
  hasFeature: boolean;
  compact?: boolean;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Accessibility,
  ArrowUpDown,
  Bath,
  Car,
  FileText,
  Volume2,
  DoorOpen,
  HelpCircle,
  HandMetal,
};

export const FeaturePill: React.FC<FeaturePillProps> = ({
  featureKey,
  hasFeature,
  compact = false,
}) => {
  const meta = FEATURE_METADATA[featureKey];
  const IconComponent = ICON_MAP[meta.icon] || HelpCircle;

  if (compact) {
    return (
      <span
        title={`${meta.label}: ${hasFeature ? 'Available' : 'Not available'}`}
        className={`inline-flex items-center justify-center p-1.5 rounded-lg text-xs transition-colors ${
          hasFeature
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-200 dark:border-slate-800 line-through opacity-60'
        }`}
      >
        <IconComponent className="w-3.5 h-3.5" />
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-colors ${
        hasFeature
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
          : 'bg-slate-100 text-slate-400 border-slate-200 dark:bg-slate-800/40 dark:text-slate-500 dark:border-slate-800 line-through opacity-70'
      }`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0" />
      <span>{meta.label}</span>
      {hasFeature ? (
        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <X className="w-3 h-3 text-slate-400" />
      )}
    </div>
  );
};
