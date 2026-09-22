# Matching Algorithm

Config: `server/src/config/index.js`

## Overview

LostLens uses a simple, rule-based matching algorithm to compare lost and found items. The algorithm compares specific attributes and calculates a score between 0-100.

## Scoring System

The matching algorithm uses the following weighted scoring system:

| Attribute | Points | Description |
|-----------|--------|-------------|
| Category | 30 | Exact category match |
| Color | 20 | Primary color match |
| Brand | 15 | Exact brand match (if both provided) |
| Location | 15 | Proximity-based scoring |
| Date | 10 | Same date match |
| Description | 10 | Keyword similarity |

**Maximum Score: 100 points**

## Attribute Matching Rules

### Category Match (30 points)
- Exact match: +30 points
- No match: 0 points

### Color Match (20 points)
- Primary colors match: +20 points
- No match: 0 points
- Colors are normalized (case-insensitive)

### Brand Match (15 points)
- Both brands provided and match: +15 points
- One or both brands "Unknown": 0 points (no penalty)
- Brands don't match: 0 points

### Location Match (15 points)
- Same location / within 200m: +15 points
- 200m–500m: +10 points
- 500m–1km: +5 points
- >1km: 0 points

### Date Match (10 points)
- Same date: +10 points
- Different date: 0 points

### Description Match (10 points)
- Keyword similarity ≥30%: +10 points
- Below threshold: 0 points
- Uses simple tokenization and intersection

## Match Levels

| Score Range | Level |
|-------------|-------|
| 80–100 | High Probability |
| 60–79 | Possible Match |
| 40–59 | Weak Match |
| 0–39 | Low Match |

## Rules

- Only matches LOST ↔ FOUND items
- Never matches LOST ↔ LOST or FOUND ↔ FOUND
- Only stores matches with score ≥ 40
- Notifies users when score ≥ 60

## Example Calculation

**Lost Item:** Black Lenovo backpack, Library, Aug 20
**Found Item:** Black Lenovo backpack, Library, Aug 20

```
Category (Bags): 30 points
Color (Black): 20 points  
Brand (Lenovo): 15 points
Location (same): 15 points
Date (Aug 20): 10 points
Description (similar): 10 points
---
Total: 100 points (High Probability)
```

## Implementation

- Service: `server/src/services/matchingService.js`
- Config: `server/src/config/index.js`
- Test: `server/src/scripts/testMatching.js`

## Explanation

Each match includes:
- Total score (0-100)
- Score breakdown by attribute
- Match level label
- Detailed factor explanations

This makes the system transparent and easy to explain during viva demonstrations.
