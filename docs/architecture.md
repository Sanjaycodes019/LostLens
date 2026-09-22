# LostLens Architecture

```mermaid
flowchart TB
  subgraph Client["React Client (Vite)"]
    UI[Pages & Components]
    API_CLIENT[Axios /api]
  end

  subgraph Server["Express REST API"]
    Routes[Routes]
    Controllers[Controllers]
    subgraph Services
      Matching[Matching Service]
      Analysis[Rule-based Analysis Service]
      Notify[Notification Service]
      Geo[Geolocation Service]
      Image[Image Service]
    end
  end

  DB[(MongoDB)]

  Cloudinary[Cloudinary]
  OSM[OpenStreetMap / Nominatim]

  UI --> API_CLIENT --> Routes --> Controllers --> Services --> DB
  Image --> Cloudinary
  Geo --> OSM
  Matching --> Geo
```

## Principles

1. Thin controllers — HTTP only; business logic in services.
2. Matching-first — `matchingService` is the core differentiator.
3. Rule-based — Simple, transparent matching algorithm (no AI/ML).
4. Graceful degradation — no email/Cloudinary keys required for local demo.
5. Security — Helmet, CORS, rate limits, JWT httpOnly cookies, server-side role checks.
