import api from './api';
import type { User, Item, Match, Notification, Claim, AdminStats, AiAnalysis } from '../types';

export const authApi = {
  register: (data: Record<string, string>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<{ success: boolean; data: User }>('/auth/me'),
};

export const itemsApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<{ success: boolean; data: Item[]; pagination: { total: number; pages: number } }>('/items', { params }),
  mine: () => api.get<{ success: boolean; data: Item[] }>('/items/mine'),
  get: (id: string) => api.get<{ success: boolean; data: Item }>(`/items/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post<{ success: boolean; data: { item: Item; matchesFound: number } }>('/items', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/items/${id}`, data),
  delete: (id: string) => api.delete(`/items/${id}`),
  upload: (formData: FormData) =>
    api.post<{ success: boolean; data: { url: string; publicId?: string } }>('/items/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  analyze: (formData: FormData) =>
    api.post<{ success: boolean; data: { analysis: AiAnalysis; image?: { url: string; publicId?: string } } }>(
      '/ai/analyze',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    ),
  matches: (id: string) => api.get<{ success: boolean; data: Match[] }>(`/items/${id}/matches`),
  recover: (id: string, notes?: string) => api.post(`/items/${id}/recover`, { notes }),
  flag: (id: string, reason: string) => api.post(`/items/${id}/flag`, { reason }),
};

export const matchesApi = {
  list: () => api.get<{ success: boolean; data: Match[] }>('/matches'),
  get: (id: string) => api.get<{ success: boolean; data: Match }>(`/matches/${id}`),
};

export const claimsApi = {
  create: (data: Record<string, unknown>) => api.post<{ success: boolean; data: Claim }>('/claims', data),
  mine: () => api.get<{ success: boolean; data: Claim[] }>('/claims/mine'),
  get: (id: string) => api.get<{ success: boolean; data: Claim }>(`/claims/${id}`),
  review: (id: string, data: { status: string; adminNotes?: string }) => api.patch(`/claims/${id}`, data),
};

export const notificationsApi = {
  list: (unread?: boolean) =>
    api.get<{ success: boolean; data: Notification[] }>('/notifications', {
      params: unread ? { unread: 'true' } : {},
    }),
  unreadCount: () => api.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const adminApi = {
  stats: () => api.get<{ success: boolean; data: AdminStats }>('/admin/stats'),
  items: (params?: Record<string, string>) => api.get('/admin/items', { params }),
  users: () => api.get('/admin/users'),
  claims: (status?: string) =>
    api.get<{ success: boolean; data: Claim[] }>('/admin/claims', { params: status ? { status } : {} }),
  moderateItem: (id: string, data: Record<string, unknown>) => api.patch(`/admin/items/${id}`, data),
  heatmap: () => api.get('/admin/heatmap'),
  matchingStats: () => api.get('/admin/matching-stats'),
};

export const geoApi = {
  search: async (query: string) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      { headers: { 'User-Agent': 'LostLens/1.0' } }
    );
    if (!res.ok) return [];
    return res.json();
  },
};
