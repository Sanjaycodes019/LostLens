# Setup Guide

1. Install Node 18+, MongoDB local or Atlas free tier.
2. `npm install` && `cp .env.example .env`
3. `npm run seed` for fictional demo data.
4. `npm run dev` for API + frontend.

## Credentials (add when needed)

- **Cloudinary** — when testing production image uploads
- **GEMINI_API_KEY** — when testing live AI analysis
- **EMAIL_*** — optional SMTP for email notifications

The app runs without these using local uploads and AI fallback.
