/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in meters.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Format distance in meters into human-readable string (e.g., "350 m away" or "1.4 km away")
 */
export function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters)) {
    return 'Distance unavailable';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Coimbatore city center default constants
 */
export const COIMBATORE_CENTER = {
  lat: 11.0168,
  lng: 76.9558,
  name: 'Town Hall / Gandhipuram, Coimbatore',
};
