import { MATCH_WEIGHTS, TIME_SCORE_BANDS } from '../config/index.js';
import {
  haversineDistance,
  formatDistance,
  locationScoreFromDistance,
  getItemCoordinates,
} from './geolocationService.js';

function normalize(value) {
  return (value || '').toLowerCase().trim();
}

function isUnknown(value) {
  const v = normalize(value);
  return !v || v === 'unknown' || v === 'n/a';
}

function compareCategory(a, b) {
  const catA = normalize(a.category);
  const catB = normalize(b.category);
  if (!catA || !catB) return 0;
  if (catA === catB) return 1;
  if (catA.includes(catB) || catB.includes(catA)) return 0.7;
  return 0;
}

function compareColors(itemA, itemB) {
  const colorsA = new Set([
    normalize(itemA.color),
    ...(itemA.secondaryColors || []).map(normalize),
    normalize(itemA.aiAnalysis?.primaryColor),
    ...((itemA.aiAnalysis?.secondaryColors || []).map(normalize)),
  ].filter((c) => !isUnknown(c)));

  const colorsB = new Set([
    normalize(itemB.color),
    ...(itemB.secondaryColors || []).map(normalize),
    normalize(itemB.aiAnalysis?.primaryColor),
    ...((itemB.aiAnalysis?.secondaryColors || []).map(normalize)),
  ].filter((c) => !isUnknown(c)));

  if (colorsA.size === 0 || colorsB.size === 0) return 0.5;

  const intersection = [...colorsA].filter((c) => colorsB.has(c));
  if (intersection.length > 0) return 1;

  const partial = [...colorsA].some((a) =>
    [...colorsB].some((b) => a.includes(b) || b.includes(a))
  );
  return partial ? 0.6 : 0.1;
}

function compareBrand(a, b) {
  const brandA = normalize(a.brand || a.aiAnalysis?.brand);
  const brandB = normalize(b.brand || b.aiAnalysis?.brand);
  if (isUnknown(brandA) || isUnknown(brandB)) return null;
  if (brandA === brandB) return 1;
  if (brandA.includes(brandB) || brandB.includes(brandA)) return 0.75;
  return 0;
}

function tokenize(text) {
  return normalize(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function compareText(a, b) {
  const tokensA = new Set(tokenize(`${a.title} ${a.description}`));
  const tokensB = new Set(tokenize(`${b.title} ${b.description}`));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  const intersection = [...tokensA].filter((t) => tokensB.has(t));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.length / union.size;
}

function compareVisualFeatures(a, b) {
  const featuresA = a.aiAnalysis?.visibleFeatures || [];
  const featuresB = b.aiAnalysis?.visibleFeatures || [];

  if (featuresA.length === 0 && featuresB.length === 0) {
    const objectA = normalize(a.aiAnalysis?.objectType || a.title);
    const objectB = normalize(b.aiAnalysis?.objectType || b.title);
    if (objectA && objectB && (objectA.includes(objectB) || objectB.includes(objectA))) {
      return 0.6;
    }
    return compareText(a, b) * 0.8;
  }

  if (featuresA.length === 0 || featuresB.length === 0) return 0.4;

  const normA = featuresA.map(normalize);
  const normB = featuresB.map(normalize);
  let matches = 0;
  for (const fA of normA) {
    if (normB.some((fB) => fA.includes(fB) || fB.includes(fA))) matches++;
  }
  return Math.min(1, matches / Math.max(normA.length, normB.length));
}

function compareTime(itemA, itemB) {
  const dateA = new Date(itemA.eventDate);
  const dateB = new Date(itemB.eventDate);
  const diffMinutes = Math.abs(dateA - dateB) / (1000 * 60);

  for (const band of TIME_SCORE_BANDS) {
    if (diffMinutes <= band.maxMinutes) return band.score;
  }
  return 0.15;
}

function getTimeDiffMinutes(itemA, itemB) {
  return Math.abs(new Date(itemA.eventDate) - new Date(itemB.eventDate)) / (1000 * 60);
}

export function calculateMatch(lostItem, foundItem) {
  if (lostItem.type !== 'LOST' || foundItem.type !== 'FOUND') {
    throw new Error('Can only match LOST with FOUND items');
  }

  // Category match (30 points)
  const categoryMatch = compareCategory(lostItem, foundItem);
  const categoryScore = categoryMatch === 1 ? 30 : 0;

  // Color match (20 points)
  const colorMatch = compareColors(lostItem, foundItem);
  const colorScore = colorMatch >= 0.7 ? 20 : 0;

  // Brand match (15 points)
  const brandMatch = compareBrand(lostItem, foundItem);
  const brandScore = brandMatch === 1 ? 15 : 0;

  // Location match (15 points)
  const coordsLost = getItemCoordinates(lostItem);
  const coordsFound = getItemCoordinates(foundItem);
  let distanceMeters = null;
  let locationScore = 0;

  if (coordsLost && coordsFound) {
    distanceMeters = haversineDistance(
      coordsLost.latitude,
      coordsLost.longitude,
      coordsFound.latitude,
      coordsFound.longitude
    );
    if (distanceMeters <= 200) locationScore = 15;
    else if (distanceMeters <= 500) locationScore = 10;
    else if (distanceMeters <= 1000) locationScore = 5;
  }

  // Date match (10 points)
  const dateA = new Date(lostItem.eventDate);
  const dateB = new Date(foundItem.eventDate);
  const dateScore = (dateA.toDateString() === dateB.toDateString()) ? 10 : 0;

  // Description match (10 points)
  const textMatch = compareText(lostItem, foundItem);
  const descriptionScore = textMatch >= 0.3 ? 10 : 0;

  const scoreBreakdown = {
    category: categoryScore,
    color: colorScore,
    brand: brandScore,
    location: locationScore,
    date: dateScore,
    description: descriptionScore,
  };

  const totalScore = Object.values(scoreBreakdown).reduce((sum, val) => sum + val, 0);

  const explanation = buildExplanation({
    scoreBreakdown,
    distanceMeters,
    brandMatch,
    lostItem,
    foundItem,
  });

  return {
    score: totalScore,
    scoreBreakdown,
    explanation,
    distanceMeters,
  };
}

function buildExplanation({ scoreBreakdown, distanceMeters, brandMatch, lostItem, foundItem }) {
  const factors = [];

  if (scoreBreakdown.category > 0) {
    factors.push({
      type: 'category',
      message: 'Same category',
      positive: true,
    });
  }

  if (scoreBreakdown.color > 0) {
    factors.push({
      type: 'color',
      message: 'Same color',
      positive: true,
    });
  }

  if (scoreBreakdown.brand > 0) {
    factors.push({
      type: 'brand',
      message: `Matching brand: ${lostItem.brand}`,
      positive: true,
    });
  }

  if (distanceMeters != null) {
    factors.push({
      type: 'location',
      message: `Found ${formatDistance(distanceMeters)} from reported location`,
      positive: scoreBreakdown.location > 0,
    });
  }

  if (scoreBreakdown.date > 0) {
    factors.push({
      type: 'date',
      message: 'Same date',
      positive: true,
    });
  }

  if (scoreBreakdown.description > 0) {
    factors.push({
      type: 'description',
      message: 'Similar description',
      positive: true,
    });
  }

  const label =
    scoreBreakdown.category >= 30 && scoreBreakdown.color >= 20 && scoreBreakdown.location >= 15
      ? 'High possibility match'
      : scoreBreakdown.category >= 30
        ? 'Possible match'
        : 'Weak possibility';

  return {
    summary: label,
    factors,
  };
}

export function getMatchLabel(score) {
  if (score >= 80) return 'High possibility';
  if (score >= 60) return 'Possible match';
  if (score >= 40) return 'Weak possibility';
  return 'Low possibility';
}

export const MATCH_MIN_SCORE = 40;
