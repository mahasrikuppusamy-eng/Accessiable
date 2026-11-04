# AccessAble Coimbatore — Live Location Accessibility Platform

A live-location, AI-powered accessibility discovery platform specifically built for Coimbatore city, Tamil Nadu, India. It empowers people with disabilities, wheelchair users, and seniors to locate accessible places (hospitals, colleges, malls, transit, parks, temples, government offices, restaurants, and airports) around them in real time.

---

## 🚀 Key Features

1. **Live GPS Location System**:
   - High-accuracy geolocation (`navigator.geolocation.watchPosition`).
   - Pulsing cyan dot on the live map representing user position.
   - Haversine distance engine: dynamic distance recalculation ("350 m away", "1.2 km away") every 30 seconds.
   - Graceful fallback to Coimbatore city center (11.0168°N, 76.9558°E).
   - Real-time reverse geocoding via OpenStreetMap Nominatim with caching: displays your neighborhood (e.g., *"RS Puram, Coimbatore"*).
   - Neighborhood testing presets (Peelamedu, RS Puram, Gandhipuram, Railway Junction, Airport, Saravanampatti).

2. **Interactive Leaflet Map**:
   - Leaflet + OpenStreetMap integration.
   - Custom SVG pin markers color-coded by accessibility score:
     - 🟢 **80–100%**: Fully Accessible
     - 🟡 **50–79%**: Partially Accessible
     - 🔴 **0–49%**: Limited Accessibility
   - Dynamic distance radius circle overlay (500m, 1km, 2km, 5km, or all city).
   - Floating "Recenter to Me" and "Fit All" controls.

3. **38+ Real Verified Coimbatore Places**:
   - **Hospitals**: KG Hospital, PSG Hospitals, Ganga Orthopaedic Hospital, KMCH, Sri Ramakrishna Hospital, CMCH Govt Hospital.
   - **Colleges & Universities**: PSG Tech, CIT, GRD College, Bharathiar University, Amrita Vishwa Vidyapeetham, Kumaraguru College of Tech.
   - **Malls**: Brookefields Mall, Prozone Mall, Fun Republic Mall, Cross Cut Road.
   - **Transit & Railway**: Coimbatore Junction (CBE), Coimbatore North, Podanur Junction, Gandhipuram Central Bus Stand, Singanallur Bus Terminal.
   - **Airports**: Coimbatore International Airport (CJB).
   - **Parks & Lakes**: VOC Park & Grounds, Bharathi Park, Gass Forest Museum, Race Course Walking Promenade, Valankulam Lake Promenade.
   - **Temples & Heritage**: Perur Pateeswarar Temple, Marudhamalai Hilltop Murugan Temple, Eachanari Vinayagar Temple.
   - **Government Offices**: Coimbatore District Collectorate, Coimbatore City Municipal Corporation (CCMC), RTO Central.
   - **Restaurants**: Sree Annapoorna (RS Puram), Hotel Junior Kuppanna, Hari Bhavanam, Anandhaas.

4. **AI Voice Assistant (Coimbatore-Aware)**:
   - Voice input via Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`).
   - Voice responses via SpeechSynthesis API.
   - Powered by Gemini 3.8 Flash (`POST /api/ai/command`) with local intelligent NLP fallback.
   - Voice commands:
     - *"Find hospitals near me"*
     - *"Which is the nearest accessible mall?"*
     - *"Take me to PSG Hospital"*
     - *"Show wheelchair accessible restaurants within 2 km"*
     - *"What is my current location?"*
     - *"Read reviews for Brookefields Mall"*
     - *"Add a new place"*

5. **Universal Design & WCAG 2.1 AA Compliance**:
   - High Contrast Mode toggle for visually impaired users.
   - Dark Mode & Light Mode support.
   - Screen-reader friendly semantic HTML.
   - 9-point accessibility checklist with weighted scoring.

---

## 🛠️ VS Code & Local Setup

### Prerequisites
- Node.js >= 18
- npm or pnpm

### 1. Installation
```bash
git clone <repo-url>
cd accessable-coimbatore
npm install
```

### 2. Environment Configuration
Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
Ensure you have:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Live Location in DevTools
1. Open Google Chrome DevTools (`F12` or `Ctrl+Shift+I`).
2. Click the three dots menu (⋮) -> **More tools** -> **Sensors**.
3. Under **Location**, select **Custom** and enter:
   - Latitude: `11.0168`
   - Longitude: `76.9558` (Coimbatore City Center)
   - Or test Peelamedu: `11.0264`, `77.0033`
4. Click **Allow Location** in the top banner.
5. Notice all place distances dynamically recalculate relative to the simulated GPS position.

---

## 📦 Deployment

### Deploying to Render (Full-Stack Express + Node)
1. Push this repository to GitHub.
2. In Render, create a new **Web Service**.
3. Build Command: `npm run build`
4. Start Command: `node server.ts`
5. Environment Variables:
   - `NODE_ENV=production`
   - `GEMINI_API_KEY=your_key`

### Deploying to Vercel (Frontend SPA)
1. Run `npm run build`.
2. Connect repository to Vercel with output directory `dist`.
