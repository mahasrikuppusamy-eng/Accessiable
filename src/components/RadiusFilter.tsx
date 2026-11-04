import React from 'react';
import { Target } from 'lucide-react';

interface RadiusFilterProps {
  selectedRadius: string; // '500', '1000', '2000', '5000', 'all'
  onChange: (radius: string) => void;
}

export const RadiusFilter: React.FC<RadiusFilterProps> = ({ selectedRadius, onChange }) => {
  const options = [
    { label: '500 m', value: '500' },
    { label: '1 km', value: '1000' },
    { label: '2 km', value: '2000' },
    { label: '5 km', value: '5000' },
    { label: 'All City', value: 'all' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
      <div className="flex items-center gap-1 px-2 text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
        <Target className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Radius:</span>
      </div>
      {options.map((opt) => {
        const active = selectedRadius === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              active
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/60'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
