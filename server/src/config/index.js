import dotenv from 'dotenv';

dotenv.config({ path: new URL('../../../.env', import.meta.url) });

export const config = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostlens',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-jwt-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@lostlens.local',
  },
};

export const isCloudinaryConfigured = () =>
  Boolean(config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret);

export const isEmailConfigured = () =>
  Boolean(config.email.host && config.email.user && config.email.password);

export const ITEM_CATEGORIES = [
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

export const MATCH_WEIGHTS = {
  category: 0.30,
  color: 0.20,
  brand: 0.15,
  location: 0.15,
  date: 0.10,
  description: 0.10,
};

export const MATCH_THRESHOLDS = {
  low: 40,
  weak: 60,
  possible: 80,
  high: 100,
};

export const TIME_SCORE_BANDS = [
  { maxMinutes: 30, score: 1.0 },
  { maxMinutes: 120, score: 0.85 },
  { maxMinutes: 360, score: 0.65 },
  { maxMinutes: 1440, score: 0.4 },
  { maxMinutes: Infinity, score: 0.15 },
];

export const MAX_IMAGES_PER_ITEM = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
