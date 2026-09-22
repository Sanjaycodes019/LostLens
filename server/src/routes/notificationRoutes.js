import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount,
} from '../services/notificationService.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id, {
    unreadOnly: req.query.unread === 'true',
  });
  res.json({ success: true, data: notifications });
}));

router.get('/unread-count', authenticate, asyncHandler(async (req, res) => {
  const count = await getUnreadCount(req.user._id);
  res.json({ success: true, data: { count } });
}));

router.patch('/:id/read', authenticate, asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.user._id, req.params.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: notification });
}));

router.patch('/read-all', authenticate, asyncHandler(async (req, res) => {
  await markAllNotificationsRead(req.user._id);
  res.json({ success: true, message: 'All notifications marked as read' });
}));

export default router;
