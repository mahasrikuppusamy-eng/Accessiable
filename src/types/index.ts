export interface AccessibilityFeatures {
  wheelchairRamp: boolean;
  lift: boolean;
  accessibleToilet: boolean;
  parking: boolean;
  brailleFacility: boolean;
  audioAssistance: boolean;
  wideDoorways: boolean;
  handrails: boolean;
  signLanguageSupport: boolean;
}

export type PlaceCategory =
  | 'Hospital'
  | 'College'
  | 'Mall'
  | 'Railway'
  | 'Park'
  | 'Temple'
  | 'Government'
  | 'Restaurant'
  | 'Airport'
  | 'Other';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userRole?: string;
  rating: number; // 1-5
  accessibilityRating: number; // 1-5
  comment: string;
  date: string;
  featuresConfirmed?: Partial<AccessibilityFeatures>;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  description: string;
  address: {
    street: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
  };
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
    lat: number;
    lng: number;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  accessibility: AccessibilityFeatures;
  accessibilityScore: number; // 0 - 100
  images: string[];
  openHours?: string;
  priceRange?: string;
  isVerified: boolean;
  verifiedBy?: string;
  reviewsCount: number;
  averageRating: number;
  reviews?: Review[];
  distance?: number; // in meters (calculated relative to user)
  distanceText?: string;
}

export interface UserCoordinates {
  lat: number;
  lng: number;
}

export interface UserLocationState {
  coords: UserCoordinates | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied';
  isLive: boolean;
  areaName: string | null;
  usingFallback: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'volunteer';
  avatar?: string;
  specialNeeds?: string[];
}

export type AIAction = 'navigate' | 'search' | 'filter' | 'speak' | 'logout' | 'add';

export interface AICommandResponse {
  action: AIAction;
  payload?: any;
  speech: string;
}
