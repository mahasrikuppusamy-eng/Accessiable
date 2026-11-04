import React, { useState, useEffect, useCallback } from 'react';
import { Place, PlaceCategory } from './types';
import { LocationProvider, useLocation } from './context/LocationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationBanner } from './components/LocationBanner';
import { Navbar } from './components/Navbar';
import { PlaceCard } from './components/PlaceCard';
import { MapView } from './components/MapView';
import { RadiusFilter } from './components/RadiusFilter';
import { ScoreBadge } from './components/ScoreBadge';
import { PlaceDetailsModal } from './components/PlaceDetailsModal';
import { AddPlaceModal } from './components/AddPlaceModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { VoiceAssistant } from './components/VoiceAssistant';
import { Footer } from './components/Footer';
import {
  Search,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
  Building2,
  GraduationCap,
  ShoppingBag,
  Train,
  Trees,
  Landmark,
  Building,
  UtensilsCrossed,
  Plane,
  Layers,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';

const CATEGORY_ITEMS: Array<{ label: string; value: PlaceCategory | 'All'; icon: React.ElementType }> = [
  { label: 'All Places', value: 'All', icon: Layers },
  { label: 'Hospitals', value: 'Hospital', icon: Building2 },
  { label: 'Colleges', value: 'College', icon: GraduationCap },
  { label: 'Malls', value: 'Mall', icon: ShoppingBag },
  { label: 'Railway & Transit', value: 'Railway', icon: Train },
  { label: 'Parks & Lake', value: 'Park', icon: Trees },
  { label: 'Temples', value: 'Temple', icon: Landmark },
  { label: 'Govt Offices', value: 'Government', icon: Building },
  { label: 'Restaurants', value: 'Restaurant', icon: UtensilsCrossed },
  { label: 'Airport', value: 'Airport', icon: Plane },
];

function MainContent() {
  const { userLocation, areaName, isLive, lastUpdated } = useLocation();
  const { isAdmin } = useAuth();

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | 'All'>('All');
  const [selectedRadius, setSelectedRadius] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'distance' | 'score' | 'rating'>('distance');

  const [currentView, setCurrentView] = useState<'list' | 'map'>('list');
  const [selectedPlaceModal, setSelectedPlaceModal] = useState<Place | null>(null);
  const [focusedPlaceOnMap, setFocusedPlaceOnMap] = useState<Place | null>(null);

  const [isAddOpen, setIsAddOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Fetch places from server API
  const fetchPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (selectedRadius !== 'all') params.append('radius', selectedRadius);
      if (minScore > 0) params.append('minScore', minScore.toString());
      params.append('sort', sortBy);

      if (userLocation) {
        params.append('lat', userLocation.lat.toString());
        params.append('lng', userLocation.lng.toString());
      }

      const res = await fetch(`/api/places?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPlaces(data.places);
      }
    } catch (err) {
      console.error('Failed to fetch Coimbatore places:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, selectedRadius, minScore, sortBy, userLocation]);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  // Periodic refresh every 30s as user moves
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPlaces();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchPlaces]);

  // AI voice command execution handler
  const handleAIAction = (action: string, payload: any) => {
    if (action === 'navigate') {
      if (payload?.placeId) {
        const p = places.find((item) => item.id === payload.placeId);
        if (p) {
          setSelectedPlaceModal(p);
          setFocusedPlaceOnMap(p);
        }
      }
    } else if (action === 'search') {
      if (payload?.query) {
        setSearchQuery(payload.query);
      }
    } else if (action === 'filter') {
      if (payload?.category) {
        setSelectedCategory(payload.category);
      }
      if (payload?.radius) {
        setSelectedRadius(payload.radius.toString());
      }
      if (payload?.minScore) {
        setMinScore(payload.minScore);
      }
    } else if (action === 'add') {
      setIsAddOpen(true);
    }
  };

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlaceModal(place);
    setFocusedPlaceOnMap(place);
  };

  const handleLocateOnMap = (place: Place) => {
    setFocusedPlaceOnMap(place);
    setCurrentView('map');
  };

  const nearestPlace = places.length > 0 ? places[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* 1. Live GPS Location Banner */}
      <LocationBanner />

      {/* 2. Sticky Header Navbar */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAddPlace={() => setIsAddOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 3. Main Views */}
      {currentView === 'list' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Hero Banner with Search & Spotlight */}
          <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-950 text-white p-6 sm:p-10 shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-10 w-60 h-60 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 text-cyan-300 border border-indigo-700/60 text-xs font-semibold backdrop-blur-md">
                <Compass className="w-3.5 h-3.5" />
                <span>Live Location Disability Directory • Coimbatore, TN</span>
              </div>

              <h1 className="font-heading font-extrabold text-2xl sm:text-4xl leading-tight tracking-tight drop-shadow-xs">
                Accessible Coimbatore <br className="hidden sm:inline" />
                <span className="text-cyan-300">Right Around You</span>
              </h1>

              <p className="text-xs sm:text-sm text-indigo-100 max-w-2xl leading-relaxed">
                Discover wheelchair ramps, elevators, accessible toilets, and audio guides across Coimbatore’s hospitals, colleges, malls, transit hubs, and parks.
              </p>

              {/* Nearest Place Spotlight Pill */}
              {nearestPlace && (
                <div
                  onClick={() => handlePlaceSelect(nearestPlace)}
                  className="mt-2 inline-flex items-center gap-3 p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 transition-all cursor-pointer group"
                >
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Nearest accessible location:
                  </span>
                  <span className="text-xs font-semibold text-white group-hover:text-cyan-200">
                    {nearestPlace.name} ({nearestPlace.distanceText})
                  </span>
                  <ChevronRight className="w-4 h-4 text-cyan-300 group-hover:translate-x-1 transition-transform" />
                </div>
              )}

              {/* Search Bar Input */}
              <div className="pt-2">
                <div className="relative flex items-center max-w-2xl">
                  <Search className="absolute left-4 w-5 h-5 text-indigo-300" />
                  <input
                    type="text"
                    placeholder="Search hospitals, colleges, malls, restaurants, or streets in Coimbatore..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/95 text-slate-900 placeholder:text-slate-400 text-xs sm:text-sm shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-400/40 font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Category Filter Chips Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Explore Categories
              </h2>
              <span className="text-xs font-semibold text-indigo-600 dark:text-cyan-400">
                {places.length} places found
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_ITEMS.map((item) => {
                const IconComponent = item.icon;
                const active = selectedCategory === item.value;
                return (
                  <button
                    key={item.label}
                    onClick={() => setSelectedCategory(item.value)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-102'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700/60 shadow-xs'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${active ? 'text-cyan-300' : 'text-indigo-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Radius Filter & Sorting Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3">
              <RadiusFilter selectedRadius={selectedRadius} onChange={setSelectedRadius} />

              {/* Accessibility Score Filter */}
              <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="px-2 font-medium text-slate-500">Min Score:</span>
                {[0, 50, 80].map((sc) => (
                  <button
                    key={sc}
                    onClick={() => setMinScore(sc)}
                    className={`px-2.5 py-1 rounded-xl font-semibold transition-colors cursor-pointer ${
                      minScore === sc
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {sc === 0 ? 'Any' : `${sc}%+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Switcher */}
            <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="p-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-hidden cursor-pointer"
              >
                <option value="distance">Nearest to Me (GPS)</option>
                <option value="score">Highest Accessibility Score</option>
                <option value="rating">Top Rated by Users</option>
              </select>
            </div>
          </div>

          {/* Place Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="h-80 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 animate-pulse p-4 space-y-4"
                >
                  <div className="h-40 rounded-xl bg-slate-200 dark:bg-slate-700" />
                  <div className="h-5 w-3/4 rounded-md bg-slate-200 dark:bg-slate-700" />
                  <div className="h-4 w-1/2 rounded-md bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : places.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  onSelect={handlePlaceSelect}
                  onLocateOnMap={handleLocateOnMap}
                  selected={selectedPlaceModal?.id === place.id}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center rounded-3xl bg-white dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-800 dark:text-slate-100">
                No accessible places match your filters
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Try widening your distance radius, choosing 'All Places', or contribute this location to the Coimbatore directory!
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedCategory('All');
                    setSelectedRadius('all');
                    setSearchQuery('');
                    setMinScore(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => setIsAddOpen(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  + Add New Coimbatore Place
                </button>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* Fullscreen Interactive Map View with Sidebar */
        <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
          {/* Left Sidebar (Desktop 380px) */}
          <div className="w-full md:w-[380px] lg:w-[420px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full shadow-lg z-10 shrink-0">
            {/* Sidebar Filter Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search map places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <RadiusFilter selectedRadius={selectedRadius} onChange={setSelectedRadius} />
                <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400 shrink-0">
                  {places.length} Places
                </span>
              </div>
            </div>

            {/* Scrollable list of nearby sorted places */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {places.map((place) => {
                const isSelected = focusedPlaceOnMap?.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => {
                      setFocusedPlaceOnMap(place);
                      setSelectedPlaceModal(place);
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500 shadow-md'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800 hover:border-indigo-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {place.category}
                        </span>
                        <span className="text-[11px] font-bold text-indigo-600 dark:text-cyan-400">
                          {place.distanceText}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white truncate">
                        {place.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {place.address.area}, Coimbatore
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <ScoreBadge score={place.accessibilityScore} size="sm" showLabel={false} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Map Canvas */}
          <div className="flex-1 h-full relative">
            <MapView
              places={places}
              selectedPlace={focusedPlaceOnMap}
              onSelectPlace={(p) => {
                setFocusedPlaceOnMap(p);
                setSelectedPlaceModal(p);
              }}
              radiusMeters={
                selectedRadius !== 'all' ? parseInt(selectedRadius, 10) : null
              }
              className="h-full w-full"
            />
          </div>
        </div>
      )}

      {/* 4. Floating AI Voice Assistant */}
      <VoiceAssistant onExecuteAction={handleAIAction} />

      {/* 5. Modals */}
      <PlaceDetailsModal
        place={selectedPlaceModal}
        onClose={() => setSelectedPlaceModal(null)}
        onReviewSubmitted={(updated) => {
          setSelectedPlaceModal(updated);
          fetchPlaces();
        }}
      />

      <AddPlaceModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onPlaceAdded={(newPlace) => {
          fetchPlaces();
          setSelectedPlaceModal(newPlace);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onPlaceUpdated={fetchPlaces}
      />

      {/* 6. Footer (shown on list view) */}
      {currentView === 'list' && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <MainContent />
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
