import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { Claim } from '../models/Claim.js';
import { Notification } from '../models/Notification.js';
import { Category } from '../models/Category.js';
import { ITEM_CATEGORIES } from '../config/index.js';
import { calculateMatch } from '../services/matchingService.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

const CAMPUS_LOCATIONS = [
  { name: 'Central Library', lat: 31.1048, lng: 77.1734 },
  { name: 'Main Canteen', lat: 31.1055, lng: 77.1742 },
  { name: 'Computer Lab Block A', lat: 31.1039, lng: 77.1728 },
  { name: 'Parking Lot North', lat: 31.1062, lng: 77.1755 },
  { name: 'Main Gate', lat: 31.107, lng: 77.176 },
  { name: 'Sports Complex', lat: 31.1025, lng: 77.171 },
  { name: 'Administration Block', lat: 31.104, lng: 77.1745 },
];

const DEMO_ITEMS = [
  {
    type: 'LOST',
    title: 'Black Lenovo Backpack',
    description: 'Black Lenovo laptop backpack with red keychain on front zipper pocket. Contains notebooks and a water bottle pocket on the side.',
    category: 'Bags',
    brand: 'Lenovo',
    color: 'black',
    secondaryColors: ['red'],
    daysAgo: 1,
    locationIdx: 0,
    userIdx: 0,
  },
  {
    type: 'FOUND',
    title: 'Black Backpack Found Near Library',
    description: 'Found a black backpack near the library entrance. Has a red keychain and Lenovo tag. Looks like a student bag.',
    category: 'Bags',
    brand: 'Unknown',
    color: 'black',
    secondaryColors: ['red'],
    daysAgo: 0,
    locationIdx: 0,
    userIdx: 1,
  },
  {
    type: 'LOST',
    title: 'iPhone 13 Pro',
    description: 'Space gray iPhone 13 Pro lost near canteen. Has a clear case with campus sticker.',
    category: 'Electronics',
    brand: 'Apple',
    color: 'gray',
    daysAgo: 2,
    locationIdx: 1,
    userIdx: 2,
  },
  {
    type: 'FOUND',
    title: 'Gray Smartphone Found',
    description: 'Found a gray iPhone near the canteen tables. Screen lock on, clear case.',
    category: 'Electronics',
    brand: 'Apple',
    color: 'gray',
    daysAgo: 1,
    locationIdx: 1,
    userIdx: 3,
  },
  {
    type: 'LOST',
    title: 'Student ID Card',
    description: 'Lost my campus ID card with blue lanyard near the main gate.',
    category: 'ID Cards',
    brand: 'Unknown',
    color: 'blue',
    daysAgo: 3,
    locationIdx: 4,
    userIdx: 4,
  },
  {
    type: 'FOUND',
    title: 'ID Card on Ground',
    description: 'Picked up an ID card near main gate with blue lanyard attached.',
    category: 'ID Cards',
    brand: 'Unknown',
    color: 'blue',
    daysAgo: 2,
    locationIdx: 4,
    userIdx: 5,
  },
];

function daysAgoDate(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(10 + (days % 5), 30, 0, 0);
  return d;
}

export async function seed() {
  await connectDatabase();

  console.log('Clearing existing seed data...');
  await Promise.all([
    User.deleteMany({}),
    Item.deleteMany({}),
    Match.deleteMany({}),
    Claim.deleteMany({}),
    Notification.deleteMany({}),
    Category.deleteMany({}),
  ]);

  console.log('Creating categories...');
  for (let i = 0; i < ITEM_CATEGORIES.length; i++) {
    const name = ITEM_CATEGORIES[i];
    await Category.create({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      sortOrder: i,
    });
  }

  console.log('Creating users...');
  const passwordHash = await bcrypt.hash('Demo@1234', 12);

  const usersData = [
    { name: 'Aarav Sharma', email: 'aarav.demo@campus.edu', role: 'STUDENT', studentId: 'CS2021041' },
    { name: 'Priya Patel', email: 'priya.demo@campus.edu', role: 'STUDENT', studentId: 'CS2021089' },
    { name: 'Rohan Mehta', email: 'rohan.demo@campus.edu', role: 'STUDENT', studentId: 'EC2022044' },
    { name: 'Sneha Reddy', email: 'sneha.demo@campus.edu', role: 'STUDENT', studentId: 'ME2023012' },
    { name: 'Kabir Singh', email: 'kabir.demo@campus.edu', role: 'STUDENT', studentId: 'CS2021077' },
    { name: 'Ananya Iyer', email: 'ananya.demo@campus.edu', role: 'STUDENT', studentId: 'EE2022098' },
    { name: 'Vikram Das', email: 'vikram.demo@campus.edu', role: 'STUDENT', studentId: 'CS2021033' },
    { name: 'Meera Nair', email: 'meera.demo@campus.edu', role: 'STUDENT', studentId: 'IT2022110' },
    { name: 'Admin User', email: 'admin@lostlens.demo', role: 'ADMIN', studentId: 'ADMIN001' },
  ];

  const users = [];
  for (const u of usersData) {
    users.push(await User.create({ ...u, password: passwordHash, isActive: true }));
  }

  console.log('Creating items...');
  const items = [];
  for (const template of DEMO_ITEMS) {
    const loc = CAMPUS_LOCATIONS[template.locationIdx];
    const user = users[template.userIdx];
    const eventDate = daysAgoDate(template.daysAgo);

    items.push(
      await Item.create({
        userId: user._id,
        type: template.type,
        title: template.title,
        description: template.description,
        category: template.category,
        brand: template.brand,
        color: template.color,
        secondaryColors: template.secondaryColors || [],
        images: [],
        aiAnalysis: {
          category: template.category,
          brand: template.brand,
          primaryColor: template.color,
          secondaryColors: template.secondaryColors || [],
          visibleFeatures: template.type === 'LOST' ? ['front zipper pocket', 'red keychain'] : ['red keychain', 'logo tag'],
          objectType: template.category.toLowerCase(),
          confidence: 0.88,
          source: 'FALLBACK',
          analyzedAt: eventDate,
        },
        location: {
          type: 'Point',
          coordinates: [loc.lng + (Math.random() - 0.5) * 0.002, loc.lat + (Math.random() - 0.5) * 0.002],
          address: `${loc.name}, Campus Area`,
          placeName: loc.name,
        },
        eventDate,
        eventTime: '10:30',
        status: 'ACTIVE',
        contactPreference: 'IN_APP',
      })
    );
  }

  for (let i = 0; i < 24; i++) {
    const type = i % 2 === 0 ? 'LOST' : 'FOUND';
    const loc = CAMPUS_LOCATIONS[i % CAMPUS_LOCATIONS.length];
    const user = users[i % 8];
    const categories = ['Electronics', 'Bags', 'Keys', 'Books', 'Accessories', 'Documents'];
    const category = categories[i % categories.length];

    items.push(
      await Item.create({
        userId: user._id,
        type,
        title: `${type === 'LOST' ? 'Lost' : 'Found'} ${category} #${i + 1}`,
        description: `Fictional demo ${type.toLowerCase()} item report #${i + 1} for campus demonstration. Not real student data.`,
        category,
        brand: i % 3 === 0 ? 'Unknown' : 'Generic',
        color: ['black', 'blue', 'red', 'white', 'brown'][i % 5],
        location: {
          type: 'Point',
          coordinates: [loc.lng, loc.lat],
          placeName: loc.name,
        },
        eventDate: daysAgoDate(i % 7),
        status: 'ACTIVE',
      })
    );
  }

  console.log('Computing matches...');
  const lostItems = items.filter((i) => i.type === 'LOST').slice(0, 6);
  const foundItems = items.filter((i) => i.type === 'FOUND').slice(0, 6);
  const matches = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      if (lost.category !== found.category) continue;
      const result = calculateMatch(lost, found);
      if (result.score >= 40) {
        matches.push(
          await Match.create({
            lostItemId: lost._id,
            foundItemId: found._id,
            score: result.score,
            scoreBreakdown: result.scoreBreakdown,
            explanation: result.explanation,
            distanceMeters: result.distanceMeters,
            timeDiffMinutes: result.timeDiffMinutes,
            status: result.score >= 60 ? 'NOTIFIED' : 'PENDING',
          })
        );
      }
    }
  }

  const topMatch = matches.sort((a, b) => b.score - a.score)[0];
  if (topMatch) {
    const lost = await Item.findById(topMatch.lostItemId);
    await Notification.create({
      userId: lost.userId,
      type: 'MATCH',
      title: 'Possible match found',
      message: `Your lost ${lost.title} may match a recently reported found item. Match confidence: ${topMatch.score}%`,
      link: `/matches/${topMatch._id}`,
      metadata: { matchId: topMatch._id, score: topMatch.score },
    });
  }

  console.log(`
Seed complete (fictional demo data):
  Users: ${users.length}
  Items: ${items.length}
  Matches: ${matches.length}

Demo login (development only):
  Student: aarav.demo@campus.edu / Demo@1234
  Admin:   admin@lostlens.demo / Demo@1234
`);

  await disconnectDatabase();
}

const isSeedScript = process.argv[1]?.replace(/\\/g, '/').includes('seed.js');
if (isSeedScript) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
