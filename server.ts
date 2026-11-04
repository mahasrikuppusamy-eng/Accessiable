import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
// FIX: Removed the '.ts' extensions from all local imports
import { COIMBATORE_PLACES } from './src/data/coimbatoreSeed';
import { calculateDistance, formatDistance, COIMBATORE_CENTER } from './src/utils/distance';
import { calculateAccessibilityScore } from './src/utils/scoreCalculator';
import { Place, Review } from './src/types/index';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory persistent state (seeded with 30+ verified places)
let placesStore: Place[] = JSON.parse(JSON.stringify(COIMBATORE_PLACES));

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. GET /api/places
app.get('/api/places', (req: Request, res: Response) => {
  const { category, search, minScore, radius, lat, lng, sort } = req.query;

  let userLat: number | null = lat ? parseFloat(lat as string) : null;
  let userLng: number | null = lng ? parseFloat(lng as string) : null;

  // If user location is not provided, fallback to Coimbatore city center
  if (userLat === null || isNaN(userLat) || userLng === null || isNaN(userLng)) {
    userLat = COIMBATORE_CENTER.lat;
    userLng = COIMBATORE_CENTER.lng;
  }

  let results = placesStore.map((place) => {
    const dist = calculateDistance(userLat!, userLng!, place.location.lat, place.location.lng);
    return {
      ...place,
      distance: dist,
      distanceText: formatDistance(dist),
    };
  });

  // Filter by category
  if (category && category !== 'All') {
    results = results.filter(
      (p) => p.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  // Filter by search query
  if (search) {
    const q = (search as string).toLowerCase().trim();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.address.area.toLowerCase().includes(q) ||
        p.address.street.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Filter by min accessibility score
  if (minScore) {
    const min = parseInt(minScore as string, 10);
    if (!isNaN(min)) {
      results = results.filter((p) => p.accessibilityScore >= min);
    }
  }

  // Filter by radius in meters
  if (radius && radius !== 'all') {
    const radMeters = parseInt(radius as string, 10);
    if (!isNaN(radMeters)) {
      results = results.filter((p) => (p.distance ?? 0) <= radMeters);
    }
  }

  // Sort
  if (sort === 'score') {
    results.sort((a, b) => b.accessibilityScore - a.accessibilityScore);
  } else if (sort === 'rating') {
    results.sort((a, b) => b.averageRating - a.averageRating);
  } else {
    // Default: nearest first
    results.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  res.json({
    success: true,
    count: results.length,
    userLocation: { lat: userLat, lng: userLng },
    places: results,
  });
});

// 2. GET /api/places/:id
app.get('/api/places/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { lat, lng } = req.query;

  const place = placesStore.find((p) => p.id === id);
  if (!place) {
    return res.status(404).json({ success: false, message: 'Place not found' });
  }

  let dist: number | undefined;
  if (lat && lng) {
    const uLat = parseFloat(lat as string);
    const uLng = parseFloat(lng as string);
    if (!isNaN(uLat) && !isNaN(uLng)) {
      dist = calculateDistance(uLat, uLng, place.location.lat, place.location.lng);
    }
  }

  res.json({
    success: true,
    place: {
      ...place,
      distance: dist,
      distanceText: dist !== undefined ? formatDistance(dist) : undefined,
    },
  });
});

// 3. POST /api/places (Add new place)
app.post('/api/places', (req: Request, res: Response) => {
  try {
    const { name, category, description, address, location, contact, accessibility, images, openHours } = req.body;

    if (!name || !category || !location?.lat || !location?.lng) {
      return res.status(400).json({ success: false, message: 'Missing required place details' });
    }

    const calculatedScore = calculateAccessibilityScore(accessibility || {});

    const newPlace: Place = {
      id: `cbe-custom-${Date.now()}`,
      name,
      category,
      description: description || 'Community contributed accessible location.',
      address: {
        street: address?.street || 'Coimbatore',
        area: address?.area || 'Coimbatore',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: address?.pincode || '641001',
      },
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat],
        lat: location.lat,
        lng: location.lng,
      },
      contact: contact || {},
      accessibility: {
        wheelchairRamp: !!accessibility?.wheelchairRamp,
        lift: !!accessibility?.lift,
        accessibleToilet: !!accessibility?.accessibleToilet,
        parking: !!accessibility?.parking,
        brailleFacility: !!accessibility?.brailleFacility,
        audioAssistance: !!accessibility?.audioAssistance,
        wideDoorways: !!accessibility?.wideDoorways,
        handrails: !!accessibility?.handrails,
        signLanguageSupport: !!accessibility?.signLanguageSupport,
      },
      accessibilityScore: calculatedScore,
      images: images && images.length ? images : [
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      ],
      openHours: openHours || 'Hours not specified',
      isVerified: false,
      reviewsCount: 1,
      averageRating: 5.0,
      reviews: [
        {
          id: `rev-${Date.now()}`,
          userId: 'community',
          userName: 'Community Contributor',
          rating: 5,
          accessibilityRating: 5,
          comment: 'Submitted accessibility features for verification.',
          date: new Date().toISOString().split('T')[0],
        },
      ],
    };

    placesStore.unshift(newPlace);

    res.status(201).json({
      success: true,
      message: 'Place added successfully and queued for verification',
      place: newPlace,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. POST /api/places/:id/reviews
app.post('/api/places/:id/reviews', (req: Request, res: Response) => {
  const { id } = req.params;
  const { userName, rating, accessibilityRating, comment, featuresConfirmed } = req.body;

  const placeIndex = placesStore.findIndex((p) => p.id === id);
  if (placeIndex === -1) {
    return res.status(404).json({ success: false, message: 'Place not found' });
  }

  const place = placesStore[placeIndex];
  const newReview: Review = {
    id: `rev-${Date.now()}`,
    userId: `user-${Date.now()}`,
    userName: userName || 'Anonymous Citizen',
    rating: Number(rating) || 5,
    accessibilityRating: Number(accessibilityRating) || 5,
    comment: comment || 'Verified accessible on site.',
    date: new Date().toISOString().split('T')[0],
    featuresConfirmed,
  };

  const existingReviews = place.reviews || [];
  const updatedReviews = [newReview, ...existingReviews];
  const avgRating =
    updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

  // If user confirmed additional features, update them
  if (featuresConfirmed && typeof featuresConfirmed === 'object') {
    Object.assign(place.accessibility, featuresConfirmed);
    place.accessibilityScore = calculateAccessibilityScore(place.accessibility);
  }

  place.reviews = updatedReviews;
  place.reviewsCount = updatedReviews.length;
  place.averageRating = parseFloat(avgRating.toFixed(1));

  placesStore[placeIndex] = place;

  res.json({
    success: true,
    message: 'Review added successfully',
    place,
  });
});

// 5. GET /api/stats (Admin & Dashboard overview)
app.get('/api/stats', (_req: Request, res: Response) => {
  const total = placesStore.length;
  const fullyAccessible = placesStore.filter((p) => p.accessibilityScore >= 80).length;
  const partiallyAccessible = placesStore.filter(
    (p) => p.accessibilityScore >= 50 && p.accessibilityScore < 80
  ).length;
  const limitedAccessible = placesStore.filter((p) => p.accessibilityScore < 50).length;
  const verified = placesStore.filter((p) => p.isVerified).length;

  const categoryCounts: Record<string, number> = {};
  for (const p of placesStore) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }

  res.json({
    success: true,
    totalPlaces: total,
    verifiedPlaces: verified,
    unverifiedPlaces: total - verified,
    accessibilityBreakdown: {
      fullyAccessible,
      partiallyAccessible,
      limitedAccessible,
    },
    categoryCounts,
  });
});

// 6. PATCH /api/admin/verify/:id
app.patch('/api/admin/verify/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const place = placesStore.find((p) => p.id === id);
  if (!place) {
    return res.status(404).json({ success: false, message: 'Place not found' });
  }

  place.isVerified = true;
  place.verifiedBy = 'AccessAble Coimbatore Admin';
  res.json({ success: true, message: 'Place verified', place });
});

// 7. DELETE /api/admin/places/:id
app.delete('/api/admin/places/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = placesStore.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Place not found' });
  }

  placesStore.splice(index, 1);
  res.json({ success: true, message: 'Place deleted' });
});

// 8. POST /api/ai/command (Voice & Natural Language Assistant)
app.post('/api/ai/command', async (req: Request, res: Response) => {
  try {
    const { transcript, userLocation } = req.body;
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({ success: false, message: 'Transcript is required' });
    }

    const cleanInput = transcript.toLowerCase().trim();
    const uLat = userLocation?.lat || COIMBATORE_CENTER.lat;
    const uLng = userLocation?.lng || COIMBATORE_CENTER.lng;

    // Helper to calculate distances for sorting
    const placesWithDist = placesStore.map((p) => ({
      ...p,
      distance: calculateDistance(uLat, uLng, p.location.lat, p.location.lng),
    }));
    placesWithDist.sort((a, b) => a.distance - b.distance);

    // If Gemini client is active, try advanced contextual understanding
    if (geminiClient) {
      try {
        const prompt = `User voice command in Coimbatore accessibility app: "${transcript}".
Current user location coordinates: (${uLat}, ${uLng}).
Available place categories: Hospital, College, Mall, Railway, Park, Temple, Government, Restaurant, Airport, Other.

You must categorize the user's intent into one of the following actions:
- "navigate": user wants to go to or view a specific place (payload: { placeId, placeName })
- "search": user wants to find or search places matching a query (payload: { query })
- "filter": user wants to filter by category or radius or accessibility (payload: { category?: string, radius?: number, minScore?: number })
- "speak": user asks a question about their location, facts, or instructions (payload: { answer })
- "add": user wants to add a new place
- "logout": user wants to sign out

Return a JSON object conforming to:
{
  "action": "navigate" | "search" | "filter" | "speak" | "add" | "logout",
  "payload": object,
  "speech": "Natural voice sentence to read aloud to the user (keep it polite, crisp, mentioning Coimbatore locations if relevant)"
}`;

        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                action: {
                  type: Type.STRING,
                  enum: ['navigate', 'search', 'filter', 'speak', 'add', 'logout'],
                },
                payload: {
                  type: Type.OBJECT,
                },
                speech: {
                  type: Type.STRING,
                },
              },
              required: ['action', 'speech'],
            },
          },
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);
          return res.json({
            success: true,
            action: parsed.action,
            payload: parsed.payload || {},
            speech: parsed.speech,
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini command parsing fallback triggered:', geminiErr);
      }
    }

    // Deterministic Rule-Based Coimbatore Parser (Fallback)
    // 1. Current Location
    if (cleanInput.includes('my current location') || cleanInput.includes('where am i')) {
      return res.json({
        success: true,
        action: 'speak',
        payload: { coords: { lat: uLat, lng: uLng } },
        speech: `You are in Coimbatore, near coordinates ${uLat.toFixed(4)} North, ${uLng.toFixed(4)} East.`,
      });
    }

    // 2. Nearest Accessible Mall
    if (cleanInput.includes('nearest') && (cleanInput.includes('mall') || cleanInput.includes('shopping'))) {
      const nearestMall = placesWithDist.find((p) => p.category === 'Mall');
      if (nearestMall) {
        return res.json({
          success: true,
          action: 'navigate',
          payload: { placeId: nearestMall.id, placeName: nearestMall.name },
          speech: `The nearest accessible mall is ${nearestMall.name}, located ${formatDistance(nearestMall.distance)} in ${nearestMall.address.area}. It has an accessibility score of ${nearestMall.accessibilityScore} percent.`,
        });
      }
    }

    // 3. Nearest Place / Nearest Hospital
    if (cleanInput.includes('hospital') || cleanInput.includes('clinic') || cleanInput.includes('doctor')) {
      const nearestHosp = placesWithDist.find((p) => p.category === 'Hospital');
      return res.json({
        success: true,
        action: 'filter',
        payload: { category: 'Hospital', placeId: nearestHosp?.id },
        speech: nearestHosp
          ? `Showing all hospitals in Coimbatore. The closest to you is ${nearestHosp.name}, ${formatDistance(nearestHosp.distance)} away with full ramp and lift access.`
          : 'Showing accessible hospitals in Coimbatore.',
      });
    }

    // 4. Restaurant within 2 km / wheelchair accessible restaurants
    if (cleanInput.includes('restaurant') || cleanInput.includes('food') || cleanInput.includes('eat')) {
      let rad = 5000;
      if (cleanInput.includes('2 km') || cleanInput.includes('2km')) rad = 2000;
      if (cleanInput.includes('1 km') || cleanInput.includes('1km')) rad = 1000;

      return res.json({
        success: true,
        action: 'filter',
        payload: { category: 'Restaurant', radius: rad, minScore: 50 },
        speech: `Filtering wheelchair accessible restaurants in Coimbatore within ${rad / 1000} kilometres.`,
      });
    }

    // 5. Specific place navigation (PSG, KG, Ganga, Brookefields, Airport, etc.)
    const matchedPlace = placesWithDist.find(
      (p) =>
        cleanInput.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().split(' ').some((word) => word.length > 3 && cleanInput.includes(word))
    );
    if (matchedPlace && (cleanInput.includes('take me to') || cleanInput.includes('navigate') || cleanInput.includes('show') || cleanInput.includes('go to'))) {
      return res.json({
        success: true,
        action: 'navigate',
        payload: { placeId: matchedPlace.id, placeName: matchedPlace.name },
        speech: `Opening directions and accessibility details for ${matchedPlace.name} in ${matchedPlace.address.area}, ${formatDistance(matchedPlace.distance)} from you.`,
      });
    }

    // 6. Read reviews
    if (cleanInput.includes('review') || cleanInput.includes('rating')) {
      const targetPlace = matchedPlace || placesWithDist[0];
      const topReview = targetPlace.reviews?.[0]?.comment || 'Rated very highly for barrier-free access.';
      return res.json({
        success: true,
        action: 'speak',
        payload: { placeId: targetPlace.id },
        speech: `Recent review for ${targetPlace.name}: ${topReview}. Its current rating is ${targetPlace.averageRating} out of 5.`,
      });
    }

    // 7. Add place
    if (cleanInput.includes('add a new place') || cleanInput.includes('add place') || cleanInput.includes('contribute')) {
      return res.json({
        success: true,
        action: 'add',
        payload: {},
        speech: 'Opening the Add New Place form. You can pin the location on the Coimbatore map.',
      });
    }

    // 8. General search
    return res.json({
      success: true,
      action: 'search',
      payload: { query: transcript },
      speech: `Searching Coimbatore accessibility directory for ${transcript}.`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message, speech: 'Sorry, I encountered an error processing that.' });
  }
});

// ----------------------------------------------------
// VITE DEV SERVER / STATIC PRODUCTION SERVING
// ----------------------------------------------------

async function startServer() {
  // FORCE production mode if we are on Render (which sets RENDER=true automatically)
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  if (!isProduction) {
    // Development mode with Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('🚀 Vite dev middleware attached');
  } else {
    // Production build static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
    console.log('📦 Serving static files from dist');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ AccessAble Coimbatore server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();