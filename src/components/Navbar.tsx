import React, { useState } from 'react';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { LiveIndicator } from './LiveIndicator';
import {
  Accessibility,
  Map as MapIcon,
  List,
  PlusCircle,
  Sun,
  Moon,
  Eye,
  ShieldCheck,
  User,
  ChevronDown,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'list' | 'map';
  onViewChange: (view: 'list' | 'map') => void;
  onOpenAddPlace: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  onOpenAddPlace,
  onOpenAdmin,
}) => {
  const { isDark, toggleDark, isHighContrast, toggleHighContrast } = useTheme();
  const { user, isAdmin, switchDemoRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => onViewChange('list')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Accessibility className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-base sm:text-lg leading-tight tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>AccessAble</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-cyan-300 font-bold border border-indigo-200 dark:border-indigo-800">
                  Coimbatore
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Live Location Disability & Wheelchair Directory
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live GPS & Reverse Geocoded Area */}
        <div className="hidden md:flex items-center justify-center">
          <LiveIndicator />
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Switcher: List vs Full Map */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onViewChange('list')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Places</span>
            </button>

            <button
              onClick={() => onViewChange('map')}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                currentView === 'map'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Full Map View"
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Live Map</span>
            </button>
          </div>

          {/* Add Place Button */}
          <button
            onClick={onOpenAddPlace}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Add Place</span>
          </button>

          {/* Admin Dashboard if Admin */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition-colors cursor-pointer"
              title="Open Admin Audit Dashboard"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          {/* High Contrast Toggle (WCAG AA) */}
          <button
            onClick={toggleHighContrast}
            title={isHighContrast ? 'Disable High Contrast Mode' : 'Enable High Contrast Mode (WCAG 2.1)'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isHighContrast
                ? 'bg-amber-400 text-slate-950 border-amber-500'
                : 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDark}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile / Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 p-1 sm:px-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                {user ? user.name[0] : 'G'}
              </div>
              <span className="max-w-[70px] truncate hidden md:inline">
                {user ? user.name.split(' ')[0] : 'Guest'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1.5 font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] border-b border-slate-100 dark:border-slate-700/60">
                  Switch Active Role
                </div>
                <button
                  onClick={() => {
                    switchDemoRole('user');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                    user?.role === 'user'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <div>
                    <div className="font-semibold">Preethi (Wheelchair User)</div>
                    <div className="text-[10px] text-slate-400">Regular Citizen</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    switchDemoRole('admin');
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer transition-colors ${
                    user?.role === 'admin'
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <div>
                    <div className="font-semibold">Admin (Gov Inspector)</div>
                    <div className="text-[10px] text-slate-400">Can audit & verify places</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
