# API Documentation

Base URL: `/api`

## Auth

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register student |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current user |

## Items

| Method | Path | Description |
|--------|------|-------------|
| POST | `/items` | Create report |
| GET | `/items` | List with filters |
| GET | `/items/mine` | My reports |
| GET | `/items/:id` | Detail |
| POST | `/items/upload` | Upload image |
| POST | `/ai/analyze` | AI analysis (pre-submit) |
| GET | `/items/:id/matches` | Item matches |

## Matches & Claims

See README and server route files for full listing.

## Response Format

```json
{ "success": true, "data": {} }
```

```json
{ "success": false, "message": "...", "code": "ERROR_CODE" }
```
