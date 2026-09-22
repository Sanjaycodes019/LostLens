import { describe, it, expect } from '@jest/globals';
import { calculateMatch, getMatchLabel, MATCH_MIN_SCORE } from '../services/matchingService.js';
import { haversineDistance, formatDistance, locationScoreFromDistance } from '../services/geolocationService.js';

const baseLocation = (lat, lng) => ({
  location: { coordinates: [lng, lat] },
});

function makeItem(overrides = {}) {
  return {
    type: 'LOST',
    category: 'Bags',
    color: 'black',
    secondaryColors: [],
    brand: 'Lenovo',
    title: 'Black Lenovo Backpack',
    description: 'Black backpack with red keychain and front pocket',
    eventDate: new Date('2026-08-19T10:00:00Z'),
    aiAnalysis: {
      primaryColor: 'black',
      secondaryColors: ['red'],
      visibleFeatures: ['front zipper pocket', 'red keychain'],
      objectType: 'backpack',
    },
    ...overrides,
  };
}

describe('matchingService', () => {
  it('Case 1: same category, color, nearby, close time → high score', () => {
    const lost = makeItem({
      type: 'LOST',
      ...baseLocation(31.1048, 77.1734),
      eventDate: new Date('2026-08-19T10:00:00Z'),
    });
    const found = makeItem({
      type: 'FOUND',
      brand: 'Unknown',
      ...baseLocation(31.1061, 77.175),
      eventDate: new Date('2026-08-19T10:27:00Z'),
    });

    const result = calculateMatch(lost, found);
    expect(result.score).toBeGreaterThanOrEqual(80);
    expect(getMatchLabel(result.score)).toBe('High possibility');
    expect(result.explanation.factors.length).toBeGreaterThan(0);
  });

  it('Case 2: different category, distant, old report → low score', () => {
    const lost = makeItem({
      type: 'LOST',
      category: 'Electronics',
      color: 'gray',
      ...baseLocation(31.1048, 77.1734),
      eventDate: new Date('2026-08-10T08:00:00Z'),
    });
    const found = makeItem({
      type: 'FOUND',
      category: 'Books',
      color: 'brown',
      title: 'Physics textbook',
      description: 'Old hardcover textbook',
      ...baseLocation(31.2, 77.3),
      eventDate: new Date('2026-08-18T14:00:00Z'),
    });

    const result = calculateMatch(lost, found);
    expect(result.score).toBeLessThan(60);
    expect(['Low possibility', 'Weak possibility']).toContain(getMatchLabel(result.score));
  });

  it('Case 3: same category but far location/time → medium or low', () => {
    const lost = makeItem({ type: 'LOST', ...baseLocation(31.1048, 77.1734) });
    const found = makeItem({
      type: 'FOUND',
      ...baseLocation(31.15, 77.22),
      eventDate: new Date('2026-08-17T09:00:00Z'),
    });

    const result = calculateMatch(lost, found);
    expect(result.score).toBeLessThan(80);
    expect(result.score).toBeGreaterThan(0);
  });

  it('Case 4: missing brand still produces a valid score', () => {
    const lost = makeItem({ type: 'LOST', brand: 'Unknown' });
    const found = makeItem({ type: 'FOUND', brand: 'Unknown' });
    const result = calculateMatch(lost, found);
    expect(result.score).toBeGreaterThan(MATCH_MIN_SCORE);
    expect(result.explanation.factors.some((f) => f.type === 'brand')).toBe(true);
  });

  it('Case 5: without AI analysis uses manual attributes', () => {
    const lost = makeItem({
      type: 'LOST',
      aiAnalysis: undefined,
      description: 'Black backpack with red keychain',
    });
    const found = makeItem({
      type: 'FOUND',
      aiAnalysis: undefined,
      description: 'Black bag with red keychain near library',
    });

    const result = calculateMatch(lost, found);
    expect(result.score).toBeGreaterThan(40);
    expect(result.scoreBreakdown.description).toBeGreaterThan(0);
  });
});

describe('geolocationService', () => {
  it('calculates ~200m between campus demo coordinates', () => {
    const d = haversineDistance(31.1048, 77.1734, 31.1061, 77.175);
    expect(d).toBeGreaterThan(150);
    expect(d).toBeLessThan(350);
    expect(formatDistance(d)).toMatch(/m|km/);
  });

  it('scores closer distances higher', () => {
    expect(locationScoreFromDistance(80)).toBe(1);
    expect(locationScoreFromDistance(400)).toBeLessThan(locationScoreFromDistance(150));
  });
});
