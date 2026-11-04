import React, { useState } from 'react';
import { Place, AccessibilityFeatures } from '../types';
import { ScoreBadge } from './ScoreBadge';
import { FeaturePill } from './FeaturePill';
import { FEATURE_METADATA } from '../utils/scoreCalculator';
import {
  X,
  MapPin,
  Phone,
  Globe,
  Clock,
  Navigation,
  Star,
  CheckCircle,
  MessageSquarePlus,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface PlaceDetailsModalProps {
  place: Place | null;
  onClose: () => void;
  onReviewSubmitted: (updatedPlace: Place) => void;
}

export const PlaceDetailsModal: React.FC<PlaceDetailsModalProps> = ({
  place,
  onClose,
  onReviewSubmitted,
}) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewerName, setReviewerName] = useState('');
  const [overallRating, setOverallRating] = useState(5);
  const [comment, setComment] = useState('');
  const [verifiedFeatures, setVerifiedFeatures] = useState<Partial<AccessibilityFeatures>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!place) return null;

  const allFeatureKeys = Object.keys(FEATURE_METADATA) as Array<keyof AccessibilityFeatures>;

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/places/${place.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewerName || 'Verified Visitor',
          rating: overallRating,
          accessibilityRating: overallRating,
          comment,
          featuresConfirmed: verifiedFeatures,
        }),
      });
      const data = await res.json();
      if (data.success && data.place) {
        onReviewSubmitted(data.place);
        setShowReviewForm(false);
        setComment('');
        setReviewerName('');
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">
        {/* Header Image & Close Button */}
        <div className="relative h-56 sm:h-64 w-full bg-slate-950 shrink-0">
          <img
            src={place.images[0]}
            alt={place.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category & Status */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-white/90 dark:bg-slate-900/90 text-indigo-700 dark:text-indigo-300">
              {place.category}
            </span>
            {place.isVerified && (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md bg-emerald-500 text-white flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Verified Accessibility
              </span>
            )}
          </div>

          {/* Place Title & Location */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
              {place.name}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-cyan-200 mt-1">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>
                {place.address.street}, {place.address.area}, Coimbatore - {place.address.pincode}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 flex flex-col gap-6">
          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <ScoreBadge score={place.accessibilityScore} size="lg" />
              {place.distanceText && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-cyan-300 border border-indigo-200 dark:border-indigo-800">
                  {place.distanceText}
                </span>
              )}
            </div>

            <button
              onClick={handleDirections}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-cyan-300" />
              Get Live Directions
            </button>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-heading">
              About This Location
            </h3>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {place.description}
            </p>
          </div>

          {/* Full Accessibility Checklist (9 features) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
                Accessibility Amenities Checklist
              </h3>
              <span className="text-xs text-indigo-600 dark:text-cyan-400 font-semibold">
                Score: {place.accessibilityScore}/100
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {allFeatureKeys.map((key) => {
                const has = place.accessibility[key];
                const meta = FEATURE_METADATA[key];
                return (
                  <div
                    key={key}
                    className={`flex items-start gap-3 p-3 rounded-2xl border transition-colors ${
                      has
                        ? 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/50'
                        : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <FeaturePill featureKey={key} hasFeature={has} compact />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {meta.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {meta.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact & Hours Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {place.contact?.phone && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Phone</span>
                  <a
                    href={`tel:${place.contact.phone}`}
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {place.contact.phone}
                  </a>
                </div>
              </div>
            )}

            {place.openHours && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">Operating Hours</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {place.openHours}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Reviews & Community Verification */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-heading">
                  Community Reviews & Audits
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(place.averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {place.averageRating.toFixed(1)} out of 5
                  </span>
                  <span className="text-xs text-slate-400">({place.reviewsCount} reviews)</span>
                </div>
              </div>

              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-600 dark:text-cyan-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                {showReviewForm ? 'Cancel' : 'Add Review'}
              </button>
            </div>

            {/* Review submission form */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="mb-5 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex flex-col gap-3"
              >
                <h4 className="text-xs font-bold text-indigo-900 dark:text-cyan-300 uppercase">
                  Verify & Rate Accessibility on Site
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Your Name (e.g., Karthik R.)"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                  />
                  <div className="flex items-center gap-2 px-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>Rating:</span>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setOverallRating(s)}
                        className="cursor-pointer"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= overallRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  required
                  rows={3}
                  placeholder="Describe your accessibility experience here (e.g. Ramp slope, doorway clearance, staff assistance, restroom cleanliness)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />

                <button
                  type="submit"
                  disabled={submitting}
                  className="self-end inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Publishing...' : 'Submit Verification Review'}
                </button>
              </form>
            )}

            {/* List of reviews */}
            <div className="space-y-3">
              {place.reviews && place.reviews.length > 0 ? (
                place.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {rev.userName}
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-slate-400 ml-1">{rev.date}</span>
                      </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No reviews yet. Be the first to audit this place in Coimbatore!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
