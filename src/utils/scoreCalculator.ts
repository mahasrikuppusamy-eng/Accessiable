import { AccessibilityFeatures } from '../types';

export const FEATURE_WEIGHTS: Record<keyof AccessibilityFeatures, number> = {
  wheelchairRamp: 15,
  lift: 15,
  accessibleToilet: 15,
  parking: 10,
  brailleFacility: 10,
  audioAssistance: 10,
  wideDoorways: 10,
  handrails: 10,
  signLanguageSupport: 5,
};

export const FEATURE_METADATA: Record<
  keyof AccessibilityFeatures,
  { label: string; description: string; icon: string }
> = {
  wheelchairRamp: {
    label: 'Wheelchair Ramp',
    description: 'Gentle gradient entrance ramp with anti-slip surface',
    icon: 'Accessibility',
  },
  lift: {
    label: 'Elevator / Lift',
    description: 'Elevator with wide doors, voice alerts, and low buttons',
    icon: 'ArrowUpDown',
  },
  accessibleToilet: {
    label: 'Accessible Restroom',
    description: 'Wide door, support grab bars, wheelchair turnaround space',
    icon: 'Bath',
  },
  parking: {
    label: 'Reserved Disabled Parking',
    description: 'Designated accessible parking spaces near entrance',
    icon: 'Car',
  },
  brailleFacility: {
    label: 'Braille Signage',
    description: 'Tactile tactile paving and Braille markings on signs/lifts',
    icon: 'FileText',
  },
  audioAssistance: {
    label: 'Audio Guidance / Hearing Loop',
    description: 'Acoustic announcement systems and hearing-aid loop',
    icon: 'Volume2',
  },
  wideDoorways: {
    label: 'Wide Doorways (≥ 90cm)',
    description: 'Clear openings for motorized and manual wheelchairs',
    icon: 'DoorOpen',
  },
  handrails: {
    label: 'Safety Handrails',
    description: 'Continuous sturdy handrails on corridors and stairs',
    icon: 'HelpCircle',
  },
  signLanguageSupport: {
    label: 'Sign Language Support',
    description: 'Staff trained in Indian Sign Language (ISL) or video relay',
    icon: 'HandMetal',
  },
};

/**
 * Calculates accessibility score out of 100 based on verified features
 */
export function calculateAccessibilityScore(features: Partial<AccessibilityFeatures>): number {
  let score = 0;
  for (const [key, weight] of Object.entries(FEATURE_WEIGHTS)) {
    if (features[key as keyof AccessibilityFeatures]) {
      score += weight;
    }
  }
  return Math.min(100, Math.round(score));
}

/**
 * Returns tier category and theme colors
 */
export function getAccessibilityTier(score: number): {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  pinColor: string;
  colorName: 'emerald' | 'amber' | 'rose';
} {
  if (score >= 80) {
    return {
      label: 'Fully Accessible',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200 dark:border-emerald-800',
      pinColor: '#10B981',
      colorName: 'emerald',
    };
  }
  if (score >= 50) {
    return {
      label: 'Partially Accessible',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeText: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200 dark:border-amber-800',
      pinColor: '#F59E0B',
      colorName: 'amber',
    };
  }
  return {
    label: 'Limited Accessibility',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/60',
    badgeText: 'text-rose-700 dark:text-rose-300',
    badgeBorder: 'border-rose-200 dark:border-rose-800',
    pinColor: '#F43F5E',
    colorName: 'rose',
  };
}
