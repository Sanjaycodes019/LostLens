const EARTH_RADIUS_METERS = 6371000;

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

export function formatDistance(meters) {
  if (meters == null || Number.isNaN(meters)) return 'Unknown distance';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function locationScoreFromDistance(meters) {
  if (meters <= 100) return 1;
  if (meters <= 300) return 0.9;
  if (meters <= 500) return 0.8;
  if (meters <= 1000) return 0.65;
  if (meters <= 2000) return 0.45;
  if (meters <= 5000) return 0.25;
  return 0.1;
}

export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LostLens/1.0 (campus lost and found)' },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      address: data.display_name,
      placeName: data.name || data.address?.building || data.address?.road || '',
    };
  } catch {
    return null;
  }
}

export async function searchPlaces(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'LostLens/1.0 (campus lost and found)' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((place) => ({
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      address: place.display_name,
      placeName: place.name || place.display_name.split(',')[0],
    }));
  } catch {
    return [];
  }
}

export function getItemCoordinates(item) {
  const coords = item.location?.coordinates;
  if (!coords || coords.length !== 2) return null;
  return { longitude: coords[0], latitude: coords[1] };
}
