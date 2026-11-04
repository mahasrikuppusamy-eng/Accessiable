import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserCoordinates } from '../types';
import { COIMBATORE_CENTER } from '../utils/distance';

interface LocationContextType {
  userLocation: UserCoordinates | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  isLive: boolean;
  areaName: string | null;
  usingFallback: boolean;
  requestLocation: () => Promise<void>;
  useCoimbatoreCenter: () => void;
  startWatching: () => void;
  stopWatching: () => void;
  lastUpdated: Date | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const NOMINATIM_CACHE_KEY = 'cbe_reverse_geo_cache';

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<UserCoordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isLive, setIsLive] = useState<boolean>(false);
  const [areaName, setAreaName] = useState<string | null>('Coimbatore, Tamil Nadu');
  const [usingFallback, setUsingFallback] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastGeocodeTimeRef = useRef<number>(0);
  const lastGeocodedCoordsRef = useRef<UserCoordinates | null>(null);

  // Reverse geocode lat/lng to human area using Nominatim
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    const now = Date.now();
    // Throttle requests (max once every 10 seconds)
    if (now - lastGeocodeTimeRef.current < 10000) return;

    // Check if moved significantly (> 150m)
    if (
      lastGeocodedCoordsRef.current &&
      Math.abs(lastGeocodedCoordsRef.current.lat - lat) < 0.0015 &&
      Math.abs(lastGeocodedCoordsRef.current.lng - lng) < 0.0015
    ) {
      return;
    }

    try {
      const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      const cached = sessionStorage.getItem(`${NOMINATIM_CACHE_KEY}_${cacheKey}`);
      if (cached) {
        setAreaName(cached);
        return;
      }

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=16&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      if (res.ok) {
        const data = await res.json();
        const address = data.address || {};
        const sub =
          address.suburb ||
          address.neighbourhood ||
          address.residential ||
          address.commercial ||
          address.road ||
          'Central';
        const formatted = `${sub}, Coimbatore`;
        setAreaName(formatted);
        sessionStorage.setItem(`${NOMINATIM_CACHE_KEY}_${cacheKey}`, formatted);
        lastGeocodeTimeRef.current = now;
        lastGeocodedCoordsRef.current = { lat, lng };
      }
    } catch (e) {
      console.warn('Reverse geocoding unavailable, using fallback', e);
      setAreaName('Coimbatore, Tamil Nadu');
    }
  }, []);

  const handlePositionSuccess = useCallback(
    (position: GeolocationPosition) => {
      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setUserLocation(coords);
      setAccuracy(position.coords.accuracy);
      setLoading(false);
      setError(null);
      setPermissionStatus('granted');
      setIsLive(true);
      setUsingFallback(false);
      setLastUpdated(new Date());

      reverseGeocode(coords.lat, coords.lng);
    },
    [reverseGeocode]
  );

  const handlePositionError = useCallback((err: GeolocationPositionError) => {
    console.warn('Geolocation warning / error:', err.message);
    setLoading(false);
    setError(err.message || 'Unable to retrieve your location');
    if (err.code === err.PERMISSION_DENIED) {
      setPermissionStatus('denied');
    }
    // Fallback to Coimbatore City Center
    setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
    setUsingFallback(true);
    setIsLive(false);
    setAreaName('Gandhipuram / Town Hall, Coimbatore');
    setLastUpdated(new Date());
  }, []);

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported by your browser');
      setUsingFallback(true);
      setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        handlePositionSuccess(pos);
        startWatching();
      },
      (err) => {
        handlePositionError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 10000,
      }
    );
  }, [handlePositionSuccess, handlePositionError]);

  const useCoimbatoreCenter = useCallback(() => {
    setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
    setUsingFallback(true);
    setLoading(false);
    setIsLive(false);
    setAreaName('Town Hall / Central, Coimbatore');
    setLastUpdated(new Date());
  }, []);

  const startWatching = useCallback(() => {
    if (!('geolocation' in navigator) || watchIdRef.current !== null) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handlePositionSuccess(pos);
      },
      (err) => {
        console.warn('WatchPosition error:', err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );
  }, [handlePositionSuccess]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setIsLive(false);
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    if ('permissions' in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((status) => {
          setPermissionStatus(status.state as 'prompt' | 'granted' | 'denied');
          if (status.state === 'granted') {
            requestLocation();
          } else {
            // Default to Coimbatore center on first load while showing banner
            setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
            setUsingFallback(true);
            setLoading(false);
          }

          status.onchange = () => {
            setPermissionStatus(status.state as 'prompt' | 'granted' | 'denied');
            if (status.state === 'granted') {
              requestLocation();
            }
          };
        })
        .catch(() => {
          // If permission API fails, attempt gentle prompt
          setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
          setUsingFallback(true);
          setLoading(false);
        });
    } else {
      setUserLocation({ lat: COIMBATORE_CENTER.lat, lng: COIMBATORE_CENTER.lng });
      setUsingFallback(true);
      setLoading(false);
    }

    // Listen for custom neighborhood jump simulation
    const handleSetLocation = (e: Event) => {
      const customEvent = e as CustomEvent<{ lat: number; lng: number; name?: string }>;
      if (customEvent.detail) {
        setUserLocation({ lat: customEvent.detail.lat, lng: customEvent.detail.lng });
        if (customEvent.detail.name) {
          setAreaName(customEvent.detail.name);
        }
        setIsLive(true);
        setUsingFallback(false);
        setLastUpdated(new Date());
      }
    };
    window.addEventListener('cbe-set-location', handleSetLocation);

    return () => {
      stopWatching();
      window.removeEventListener('cbe-set-location', handleSetLocation);
    };
  }, [requestLocation, stopWatching]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        accuracy,
        loading,
        error,
        permissionStatus,
        isLive,
        areaName,
        usingFallback,
        requestLocation,
        useCoimbatoreCenter,
        startWatching,
        stopWatching,
        lastUpdated,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
