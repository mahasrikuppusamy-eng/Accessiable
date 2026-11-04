import React from 'react';
import { getAccessibilityTier } from '../utils/scoreCalculator';
import { ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const tier = getAccessibilityTier(score);

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-bold px-3 py-1.5 gap-2',
  }[size];

  const Icon = score >= 80 ? ShieldCheck : score >= 50 ? AlertTriangle : AlertCircle;

  return (
    <div
      className={`inline-flex items-center rounded-full border ${tier.badgeBg} ${tier.badgeText} ${tier.badgeBorder} shadow-xs font-sans transition-all`}
    >
      <div className={`inline-flex items-center ${sizeClasses}`}>
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{score}%</span>
        {showLabel && (
          <span className="opacity-90 font-medium hidden sm:inline">
            • {tier.label}
          </span>
        )}
      </div>
    </div>
  );
};
