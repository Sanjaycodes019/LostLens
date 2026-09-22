# LostLens Implementation Plan

## Overview

LostLens is a MERN monorepo with an intelligent matching engine as the core differentiator.

## Architecture

```
React Client (Vite + TypeScript + Tailwind)
     ↓
Express REST API
     ↓
Controllers (thin)
     ↓
Services
     ├── matchingService (core)
     ├── aiService
     ├── notificationService
     ├── geolocationService
     └── imageService (Cloudinary)
     ↓
MongoDB (Mongoose)
```

External: Gemini, Cloudinary, Nominatim/OSM

## Modules

| Module | Responsibility |
|--------|----------------|
| Auth | Register, login, JWT, roles |
| Items | Lost/Found CRUD, search, filters |
| Matching | Score, explain, store Match documents |
| AI | Gemini multimodal analysis with fallback |
| Notifications | In-app + optional email |
| Claims | Request, verify, admin review |
| Admin | Stats, moderation, analytics |
| Geo | Haversine, geocoding, heatmap data |

## Database Collections

- User (email index, role)
- Item (type LOST/FOUND, GeoJSON 2dsphere)
- Match (lostItemId, foundItemId, score, breakdown)
- Notification
- Claim
- Category (admin-configurable)

## API Surface

See `docs/api-documentation.md` after implementation.

## Implementation Phases

1. **Foundation** — structure, MongoDB, auth, validation, errors
2. **Items** — reports, images (local dev fallback until Cloudinary keys)
3. **External** — Cloudinary, Gemini, maps (credentials on demand)
4. **Matching** — matchingService, Match model, explanations
5. **Notifications & Claims** — in-app, optional email
6. **Admin & Analytics** — dashboard, Recharts, heatmap
7. **Polish & Test** — responsive UI, seed, docs, Jest

## Dependencies

Server: express, mongoose, jwt, bcryptjs, zod, helmet, cors, rate-limit, multer, cloudinary, nodemailer

Client: react, vite, tailwind, react-router, axios, react-hook-form, zod, leaflet, recharts, lucide-react

## Matching Configuration

Centralized in `server/src/config/matching.config.js`:

- Weights: visual 30%, category 20%, color 15%, location 15%, time 10%, text 10%
- Thresholds: 0-39 low, 40-59 weak, 60-79 possible, 80-100 high

## Credential Workflow

Build without secrets first. Request Cloudinary when upload integration starts; Gemini when AI starts; email only if user opts in.
