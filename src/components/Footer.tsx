import React from 'react';
import { Accessibility, Phone, Heart, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <div className="p-1.5 rounded-xl bg-indigo-600 text-cyan-300">
                <Accessibility className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-base tracking-tight">
                AccessAble Coimbatore
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Empowering persons with reduced mobility, wheelchair users, and elderly citizens across Coimbatore with real-time verified accessibility data.
            </p>
          </div>

          {/* Emergency & Helpline Numbers in Coimbatore */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-slate-100 text-xs uppercase tracking-wider">
              Coimbatore Helplines
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Differently Abled Office: +91 422 2300055</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Railway Sahayata CBE: 139</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Medical Emergency / Ambulance: 108</span>
              </li>
            </ul>
          </div>

          {/* Quick Category Discovery */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-slate-100 text-xs uppercase tracking-wider">
              Popular Categories
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                'KG Hospital',
                'PSG Tech',
                'Brookefields Mall',
                'Coimbatore Junction',
                'VOC Park',
                'Perur Temple',
                'Annapoorna RS Puram',
                'CJB Airport',
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Standards & Compliance */}
          <div className="space-y-2.5">
            <h4 className="font-heading font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              Standards & Guidelines
            </h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Compliant with Harmonised Guidelines and Space Standards for Barrier Free Built Environment (Govt. of India) and WCAG 2.1 AA accessibility.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} AccessAble Coimbatore • Built for Coimbatore, Tamil Nadu, India.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Live Location & Haversine Distance Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
