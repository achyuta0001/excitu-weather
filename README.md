# excitu 🌩

> A minimalist cyberpunk weather experience.

## Setup

```bash
npm install
npm run dev
```

That's it. **No API key required.**

## APIs Used
| Service | Purpose | Cost |
|---|---|---|
| [Open-Meteo](https://open-meteo.com) | Weather + forecast data | Free, no key |
| [Nominatim / OSM](https://nominatim.openstreetmap.org) | Reverse geocoding (lat/lon → city name) | Free, no key |
| Browser Geolocation API | User coordinates | Built-in |

## Stack
- React 18 + TypeScript
- Vite
- CSS Modules

## Structure
```
src/
  components/     # UI components + CSS modules
  hooks/          # useWeather, useClock
  services/       # weatherService (Open-Meteo), geoService (browser)
  types/          # TypeScript interfaces
  utils/          # WMO scene mapper, formatters
  styles/         # Global CSS variables + fonts
```
