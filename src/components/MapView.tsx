import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Place } from '../types';
import { useLocation } from '../context/LocationContext';
import { getAccessibilityTier } from '../utils/scoreCalculator';
import { COIMBATORE_CENTER, formatDistance } from '../utils/distance';
import { Navigation, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface MapViewProps {
  places: Place[];
  selectedPlace?: Place | null;
  onSelectPlace: (place: Place) => void;
  radiusMeters?: number | null;
  className?: string;
}

export const MapView: React.FC<MapViewProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  radiusMeters,
  className = 'h-full w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const markerMapRef = useRef<Map<string, L.Marker>>(new Map());

  const { userLocation, isLive, usingFallback } = useLocation();

  // Create custom SVG marker icon based on accessibility score
  const createPlaceIcon = (place: Place, isSelected: boolean) => {
    const tier = getAccessibilityTier(place.accessibilityScore);
    const size = isSelected ? 40 : 32;
    const pinColor = tier.pinColor;

    const svgHtml = `
      <div class="custom-pin flex flex-col items-center justify-center cursor-pointer" style="width: ${size}px; height: ${size + 10}px;">
        <div style="background-color: ${pinColor}; border: 2px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border-radius: 9999px; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; color: #ffffff; font-weight: bold; font-size: ${isSelected ? '12px' : '10px'};">
          ${place.accessibilityScore}%
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${pinColor}; margin-top: -1px;"></div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: svgHtml,
      iconSize: [size, size + 10],
      iconAnchor: [size / 2, size + 10],
      popupAnchor: [0, -(size + 10)],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = userLocation?.lat || COIMBATORE_CENTER.lat;
    const initialLng = userLocation?.lng || COIMBATORE_CENTER.lng;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: false, // We provide modern styled zoom controls
    });

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update User Marker & Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const lat = userLocation?.lat || COIMBATORE_CENTER.lat;
    const lng = userLocation?.lng || COIMBATORE_CENTER.lng;

    // Custom pulsing user marker
    const userDivIcon = L.divIcon({
      className: 'user-marker',
      html: '<div class="pulse-dot"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    if (!userMarkerRef.current) {
      userMarkerRef.current = L.marker([lat, lng], {
        icon: userDivIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      userMarkerRef.current.bindTooltip(
        isLive ? '📍 You are here (Live GPS)' : '📍 Coimbatore City Center',
        { permanent: false, direction: 'top', offset: [0, -14] }
      );
    } else {
      userMarkerRef.current.setLatLng([lat, lng]);
      userMarkerRef.current.setTooltipContent(
        isLive ? '📍 You are here (Live GPS)' : '📍 Coimbatore City Center'
      );
    }

    // Radius Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radiusMeters && radiusMeters > 0) {
      radiusCircleRef.current = L.circle([lat, lng], {
        radius: radiusMeters,
        color: '#4F46E5',
        weight: 1.5,
        fillColor: '#6366F1',
        fillOpacity: 0.12,
        dashArray: '6, 6',
      }).addTo(map);
    }
  }, [userLocation, isLive, radiusMeters]);

  // Update Place Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    markerMapRef.current.clear();

    places.forEach((place) => {
      const isSelected = selectedPlace?.id === place.id;
      const icon = createPlaceIcon(place, isSelected);

      const marker = L.marker([place.location.lat, place.location.lng], { icon });

      // Create rich popup content
      const tier = getAccessibilityTier(place.accessibilityScore);
      const popupHtml = `
        <div style="width: 250px; font-family: 'Inter', sans-serif;" class="p-3 text-slate-800">
          <div style="font-weight: 700; font-size: 14px; margin-bottom: 2px;" class="font-heading">
            ${place.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            ${place.category} • ${place.address.area}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="background-color: ${tier.pinColor}20; color: ${tier.pinColor}; font-weight: 700; font-size: 11px; padding: 2px 8px; border-radius: 9999px; border: 1px solid ${tier.pinColor}40;">
              ${place.accessibilityScore}% • ${tier.label}
            </span>
            <span style="font-size: 11px; font-weight: 600; color: #4f46e5;">
              ${place.distanceText || ''}
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${place.description}
          </div>
          <button id="btn-inspect-${place.id}" style="width: 100%; background: #4f46e5; color: #ffffff; padding: 6px 10px; border-radius: 8px; font-weight: 600; font-size: 11px; cursor: pointer; border: none;">
            View Accessibility Details
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 300 });

      marker.on('click', () => {
        onSelectPlace(place);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-inspect-${place.id}`);
        if (btn) {
          btn.onclick = () => onSelectPlace(place);
        }
      });

      marker.addTo(layer);
      markerMapRef.current.set(place.id, marker);
    });
  }, [places, selectedPlace, onSelectPlace]);

  // Recenter / fly to selected place
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedPlace) return;

    map.flyTo([selectedPlace.location.lat, selectedPlace.location.lng], 15, {
      duration: 1.2,
    });

    const targetMarker = markerMapRef.current.get(selectedPlace.id);
    if (targetMarker) {
      targetMarker.openPopup();
    }
  }, [selectedPlace]);

  const handleRecenterMe = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const lat = userLocation?.lat || COIMBATORE_CENTER.lat;
    const lng = userLocation?.lng || COIMBATORE_CENTER.lng;
    map.flyTo([lat, lng], 14, { duration: 1 });
  };

  const handleFitAll = () => {
    const map = mapInstanceRef.current;
    if (!map || places.length === 0) return;

    const bounds = L.latLngBounds(
      places.map((p) => [p.location.lat, p.location.lng])
    );
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }
    map.fitBounds(bounds, { padding: [50, 50] });
  };

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Leaflet container */}
      <div ref={mapContainerRef} className="h-full w-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute bottom-6 right-4 z-10 flex flex-col gap-2">
        {/* Recenter to me */}
        <button
          onClick={handleRecenterMe}
          title="Recenter to my position"
          className="p-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center group"
        >
          <Navigation className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>

        {/* Fit All */}
        <button
          onClick={handleFitAll}
          title="Fit all Coimbatore places on screen"
          className="p-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* Zoom Controls */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-slate-200 dark:border-slate-700"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-4 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-2.5 rounded-2xl shadow-lg border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col gap-1.5 hidden sm:flex">
        <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider">
          Accessibility Score
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">80-100% Fully</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">50-79% Partial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">&lt;50% Limited</span>
          </div>
        </div>
      </div>
    </div>
  );
};
