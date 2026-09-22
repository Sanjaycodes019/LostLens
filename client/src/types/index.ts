export interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN';
  studentId?: string;
  phone?: string;
}

export interface ItemImage {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
}

export interface AiAnalysis {
  category?: string;
  brand?: string;
  primaryColor?: string;
  secondaryColors?: string[];
  visibleFeatures?: string[];
  objectType?: string;
  confidence?: number;
  source?: string;
}

export interface Item {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  type: 'LOST' | 'FOUND';
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  brand: string;
  color: string;
  secondaryColors?: string[];
  images: ItemImage[];
  aiAnalysis?: AiAnalysis;
  location?: {
    coordinates: [number, number];
    address?: string;
    placeName?: string;
  };
  latitude?: number;
  longitude?: number;
  eventDate: string;
  eventTime?: string;
  status: string;
  contactPreference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchFactor {
  type: string;
  message: string;
  positive: boolean;
}

export interface Match {
  _id: string;
  lostItemId: Item;
  foundItemId: Item;
  score: number;
  scoreBreakdown: {
    category: number;
    color: number;
    brand: number;
    location: number;
    date: number;
    description: number;
  };
  explanation: {
    summary: string;
    factors: MatchFactor[];
  };
  status: string;
  distanceMeters?: number;
  timeDiffMinutes?: number;
  createdAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface Claim {
  _id: string;
  matchId: string | Match;
  claimantId: { _id: string; name: string; email: string };
  lostItemId: Item;
  foundItemId: Item;
  hiddenDetails?: string;
  additionalDescription?: string;
  proofImages?: { url: string; publicId?: string }[];
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalLostReports: number;
  totalFoundReports: number;
  activeMatches: number;
  successfulRecoveries: number;
  pendingClaims: number;
  reportsThisWeek: number;
  recoveryRate: number;
  lostByCategory: { _id: string; count: number }[];
  reportsOverTime: { _id: string; lost: number; found: number }[];
}
