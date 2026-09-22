import { calculateMatch } from '../services/matchingService.js';

// Test case 1: Perfect match (should be 100)
const perfectLost = {
  type: 'LOST',
  category: 'Bags',
  color: 'Black',
  brand: 'Lenovo',
  location: { coordinates: [77.1734, 31.1048] },
  eventDate: '2024-08-20',
  title: 'Black Lenovo backpack',
  description: 'Black Lenovo backpack with red keychain',
};

const perfectFound = {
  type: 'FOUND',
  category: 'Bags',
  color: 'Black',
  brand: 'Lenovo',
  location: { coordinates: [77.1735, 31.1048] }, // ~10m away
  eventDate: '2024-08-20',
  title: 'Black Lenovo backpack',
  description: 'Black Lenovo backpack with red keychain',
};

// Test case 2: Category only (should be 30)
const categoryOnlyLost = {
  type: 'LOST',
  category: 'Electronics',
  color: 'Blue',
  brand: 'Samsung',
  location: { coordinates: [77.2000, 31.1100] },
  eventDate: '2024-08-19',
  title: 'Blue Samsung phone',
  description: 'Blue Samsung phone',
};

const categoryOnlyFound = {
  type: 'FOUND',
  category: 'Electronics',
  color: 'Red',
  brand: 'Apple',
  location: { coordinates: [77.3000, 31.2000] },
  eventDate: '2024-08-18',
  title: 'Red Apple phone',
  description: 'Red Apple phone',
};

// Test case 3: No match (should be 0)
const noMatchLost = {
  type: 'LOST',
  category: 'Books',
  color: 'White',
  brand: 'Unknown',
  location: { coordinates: [77.1000, 31.1000] },
  eventDate: '2024-08-15',
  title: 'White book',
  description: 'White book',
};

const noMatchFound = {
  type: 'FOUND',
  category: 'Keys',
  color: 'Silver',
  brand: 'Unknown',
  location: { coordinates: [77.5000, 31.5000] },
  eventDate: '2024-08-10',
  title: 'Silver keys',
  description: 'Silver keys',
};

console.log('=== Matching Algorithm Test ===\n');

console.log('Test 1: Perfect Match (Expected: 100)');
const result1 = calculateMatch(perfectLost, perfectFound);
console.log('Score:', result1.score);
console.log('Breakdown:', result1.scoreBreakdown);
console.log('Explanation:', result1.explanation);
console.log();

console.log('Test 2: Category Only (Expected: 30)');
const result2 = calculateMatch(categoryOnlyLost, categoryOnlyFound);
console.log('Score:', result2.score);
console.log('Breakdown:', result2.scoreBreakdown);
console.log('Explanation:', result2.explanation);
console.log();

console.log('Test 3: No Match (Expected: 0)');
const result3 = calculateMatch(noMatchLost, noMatchFound);
console.log('Score:', result3.score);
console.log('Breakdown:', result3.scoreBreakdown);
console.log('Explanation:', result3.explanation);
console.log();

// Verify scoring
const test1Pass = result1.score === 100;
const test2Pass = result2.score === 30;
const test3Pass = result3.score === 0;

console.log('=== Test Results ===');
console.log('Test 1 (Perfect Match):', test1Pass ? '✅ PASS' : '❌ FAIL');
console.log('Test 2 (Category Only):', test2Pass ? '✅ PASS' : '❌ FAIL');
console.log('Test 3 (No Match):', test3Pass ? '✅ PASS' : '❌ FAIL');
console.log();

if (test1Pass && test2Pass && test3Pass) {
  console.log('✅ All tests passed!');
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}
