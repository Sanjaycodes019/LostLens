export const CATEGORIES = [
  'Electronics',
  'Bags',
  'Wallets',
  'Keys',
  'Documents',
  'ID Cards',
  'Clothing',
  'Books',
  'Accessories',
  'Watches',
  'Jewelry',
  'Stationery',
  'Vehicles',
  'Other',
];

export const COLORS = [
  'black', 'white', 'gray', 'red', 'blue', 'green', 'brown', 'yellow', 'pink', 'purple', 'orange', 'Unknown',
];

export function getMatchLabel(score: number) {
  if (score >= 80) return 'High possibility';
  if (score >= 60) return 'Possible match';
  if (score >= 40) return 'Weak possibility';
  return 'Low possibility';
}

export function getMatchColor(score: number) {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-brand-700 bg-brand-50 border-brand-200';
  if (score >= 40) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-slate-600 bg-slate-50 border-slate-200';
}

export function formatDistance(meters?: number) {
  if (meters == null) return 'Unknown';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
