# Database Schema

## User

email (unique), password (hashed), role STUDENT|ADMIN, studentId, isActive.

## Item

type LOST|FOUND, GeoJSON Point location (2dsphere index), aiAnalysis embed, images with Cloudinary metadata, status lifecycle ACTIVE → RESOLVED.

## Match

lostItemId, foundItemId, score 0–100, scoreBreakdown, explanation, distanceMeters, timeDiffMinutes.

## Claim

matchId, hiddenDetails, proofImages, status PENDING → APPROVED|REJECTED.

## Notification

userId, type, title, message, link, isRead.
