import nodemailer from 'nodemailer';
import { Notification } from '../models/Notification.js';
import { isEmailConfigured, config } from '../config/index.js';

let transporter = null;

function getTransporter() {
  if (!isEmailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }
  return transporter;
}

export async function createNotification({ userId, type, title, message, link, metadata }) {
  const notification = await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    metadata,
  });

  if (isEmailConfigured()) {
    try {
      const transport = getTransporter();
      const user = await import('../models/User.js').then((m) => m.User.findById(userId));
      if (user?.email) {
        await transport.sendMail({
          from: config.email.from,
          to: user.email,
          subject: `[LostLens] ${title}`,
          text: `${message}\n\nView: ${config.clientUrl}${link || ''}`,
        });
      }
    } catch (error) {
      console.warn('Email notification failed:', error.message);
    }
  }

  return notification;
}

export async function notifyMatch(userId, match, item) {
  return createNotification({
    userId,
    type: 'MATCH',
    title: 'Possible match found',
    message: `Your ${item.type === 'LOST' ? 'lost' : 'found'} ${item.title} may match a recently reported item. Match confidence: ${match.score}%`,
    link: `/matches/${match._id}`,
    metadata: { matchId: match._id, score: match.score },
  });
}

export async function notifyClaimUpdate(userId, claim, status) {
  const titles = {
    APPROVED: 'Claim approved',
    REJECTED: 'Claim rejected',
    UNDER_REVIEW: 'Claim under review',
  };
  return createNotification({
    userId,
    type: 'CLAIM_UPDATE',
    title: titles[status] || 'Claim update',
    message: `Your claim has been ${status.toLowerCase().replace('_', ' ')}.`,
    link: `/claims/${claim._id}`,
    metadata: { claimId: claim._id, status },
  });
}

export async function getUserNotifications(userId, { unreadOnly = false, limit = 50 } = {}) {
  const filter = { userId };
  if (unreadOnly) filter.isRead = false;
  return Notification.find(filter).sort({ createdAt: -1 }).limit(limit);
}

export async function markNotificationRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
}

export async function markAllNotificationsRead(userId) {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
}

export async function getUnreadCount(userId) {
  return Notification.countDocuments({ userId, isRead: false });
}
