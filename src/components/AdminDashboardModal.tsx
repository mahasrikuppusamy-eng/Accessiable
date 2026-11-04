import React, { useState, useEffect } from 'react';
import { Place } from '../types';
import { ScoreBadge } from './ScoreBadge';
import {
  X,
  ShieldCheck,
  CheckCircle,
  Trash2,
  BarChart3,
  Building,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceUpdated: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onPlaceUpdated,
}) => {
  const [stats, setStats] = useState<any>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, placesRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/places?radius=all'),
      ]);
      const statsData = await statsRes.json();
      const placesData = await placesRes.json();

      if (statsData.success) setStats(statsData);
      if (placesData.success) setPlaces(placesData.places);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/verify/${id}`, { method: 'PATCH' });
      if (res.ok) {
        fetchAdminData();
        onPlaceUpdated();
      }
    } catch (err) {
      console.error('Error verifying place:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this place?')) return;
    try {
      const res = await fetch(`/api/admin/places/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdminData();
        onPlaceUpdated();
      }
    } catch (err) {
      console.error('Error deleting place:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white">
                Coimbatore Accessibility Administration
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official verification portal for Coimbatore City Corporation & Citizen Alliance audits
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overview Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-cyan-300 block">
                Total Places
              </span>
              <span className="text-2xl font-extrabold text-indigo-900 dark:text-white font-heading">
                {stats.totalPlaces}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">
                Fully Accessible
              </span>
              <span className="text-2xl font-extrabold text-emerald-900 dark:text-white font-heading">
                {stats.accessibilityBreakdown?.fullyAccessible || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">
                Partially Accessible
              </span>
              <span className="text-2xl font-extrabold text-amber-900 dark:text-white font-heading">
                {stats.accessibilityBreakdown?.partiallyAccessible || 0}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
              <span className="text-[11px] font-semibold text-cyan-700 dark:text-cyan-300 block">
                Audited & Verified
              </span>
              <span className="text-2xl font-extrabold text-cyan-900 dark:text-white font-heading">
                {stats.verifiedPlaces}
              </span>
            </div>
          </div>
        )}

        {/* Directory Management Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Registered Coimbatore Places ({places.length})
            </h3>
            <button
              onClick={fetchAdminData}
              className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold uppercase text-[10px] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Place Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Area</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {places.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {p.name}
                    </td>
                    <td className="py-3 px-4">{p.category}</td>
                    <td className="py-3 px-4">{p.address.area}</td>
                    <td className="py-3 px-4">
                      <ScoreBadge score={p.accessibilityScore} size="sm" showLabel={false} />
                    </td>
                    <td className="py-3 px-4">
                      {p.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          Pending Audit
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!p.isVerified && (
                        <button
                          onClick={() => handleVerify(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                        title="Delete place"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
