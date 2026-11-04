import React, { useState } from 'react';
import { Place, AccessibilityFeatures, PlaceCategory } from '../types';
import { calculateAccessibilityScore, getAccessibilityTier, FEATURE_METADATA } from '../utils/scoreCalculator';
import { useLocation } from '../context/LocationContext';
import { COIMBATORE_CENTER } from '../utils/distance';
import { X, MapPin, Navigation, PlusCircle, CheckCircle, Sparkles } from 'lucide-react';

interface AddPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceAdded: (place: Place) => void;
}

const CATEGORIES: PlaceCategory[] = [
  'Hospital',
  'College',
  'Mall',
  'Railway',
  'Park',
  'Temple',
  'Government',
  'Restaurant',
  'Airport',
  'Other',
];

export const AddPlaceModal: React.FC<AddPlaceModalProps> = ({
  isOpen,
  onClose,
  onPlaceAdded,
}) => {
  const { userLocation } = useLocation();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<PlaceCategory>('Hospital');
  const [description, setDescription] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('RS Puram');
  const [pincode, setPincode] = useState('641001');
  const [lat, setLat] = useState(userLocation?.lat || COIMBATORE_CENTER.lat);
  const [lng, setLng] = useState(userLocation?.lng || COIMBATORE_CENTER.lng);
  const [phone, setPhone] = useState('+91 422 ');
  const [openHours, setOpenHours] = useState('Mon - Sun: 9:00 AM - 9:00 PM');
  const [imageUrl, setImageUrl] = useState('');

  const [accessibility, setAccessibility] = useState<AccessibilityFeatures>({
    wheelchairRamp: true,
    lift: false,
    accessibleToilet: true,
    parking: true,
    brailleFacility: false,
    audioAssistance: false,
    wideDoorways: true,
    handrails: true,
    signLanguageSupport: false,
  });

  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const liveScore = calculateAccessibilityScore(accessibility);
  const tier = getAccessibilityTier(liveScore);

  const toggleFeature = (key: keyof AccessibilityFeatures) => {
    setAccessibility((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUseMyCoordinates = () => {
    if (userLocation) {
      setLat(userLocation.lat);
      setLng(userLocation.lng);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name,
        category,
        description,
        address: {
          street,
          area,
          city: 'Coimbatore',
          state: 'Tamil Nadu',
          pincode,
        },
        location: {
          lat: parseFloat(lat.toString()),
          lng: parseFloat(lng.toString()),
        },
        contact: {
          phone,
        },
        openHours,
        accessibility,
        images: imageUrl
          ? [imageUrl]
          : [
              'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
            ],
      };

      const res = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.place) {
        onPlaceAdded(data.place);
        onClose();
      }
    } catch (err) {
      console.error('Error adding place:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
              Contribute Accessible Place in Coimbatore
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Help persons with disabilities, wheelchair users, and seniors navigate Coimbatore.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Score Preview Bar */}
        <div className="mt-4 p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Calculated Accessibility Score
              </div>
              <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{liveScore}%</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${tier.badgeBg} ${tier.badgeText} border ${tier.badgeBorder}`}>
                  {tier.label}
                </span>
              </div>
            </div>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right max-w-[200px] hidden sm:block">
            Auto-weighted based on ramps, elevators, restrooms & tactile support
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Place Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Kongunadu Speciality Clinic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as PlaceCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Accessibility Features
            </label>
            <textarea
              rows={2}
              placeholder="Describe access routes, entrance gradient, elevator capacity..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
            />
          </div>

          {/* Address Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                placeholder="e.g., 42, West Club Road"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Area / Neighbourhood
              </label>
              <input
                type="text"
                placeholder="e.g., Race Course, Peelamedu"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Pincode
              </label>
              <input
                type="text"
                placeholder="641018"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          {/* Coordinates row */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                GPS Coordinates (Lat / Lng)
              </label>
              {userLocation && (
                <button
                  type="button"
                  onClick={handleUseMyCoordinates}
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  Use My Current GPS
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                required
                placeholder="Latitude (e.g., 11.0168)"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
              <input
                type="number"
                step="any"
                required
                placeholder="Longitude (e.g., 76.9558)"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>

          {/* Accessibility Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Select Verified Accessibility Features:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {(Object.keys(FEATURE_METADATA) as Array<keyof AccessibilityFeatures>).map((key) => {
                const meta = FEATURE_METADATA[key];
                const checked = accessibility[key];
                return (
                  <label
                    key={key}
                    onClick={() => toggleFeature(key)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer select-none transition-colors ${
                      checked
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}} // Handled by label click
                      className="rounded-sm text-indigo-600 pointer-events-none"
                    />
                    <span>{meta.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Publishing Place...' : 'Publish Accessible Place'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
