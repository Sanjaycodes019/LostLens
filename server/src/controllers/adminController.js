import { User } from '../models/User.js';
import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { Claim } from '../models/Claim.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

export const getStats = asyncHandler(async (req, res) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalLost,
    totalFound,
    activeMatches,
    successfulRecoveries,
    pendingClaims,
    reportsThisWeek,
    lostByCategory,
    reportsOverTime,
  ] = await Promise.all([
    User.countDocuments({ role: 'STUDENT' }),
    Item.countDocuments({ type: 'LOST' }),
    Item.countDocuments({ type: 'FOUND' }),
    Match.countDocuments({ status: { $in: ['NOTIFIED', 'VIEWED', 'CLAIMED'] } }),
    Item.countDocuments({ status: 'RESOLVED' }),
    Claim.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
    Item.countDocuments({ createdAt: { $gte: weekAgo } }),
    Item.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    Item.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          lost: { $sum: { $cond: [{ $eq: ['$type', 'LOST'] }, 1, 0] } },
          found: { $sum: { $cond: [{ $eq: ['$type', 'FOUND'] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ]);

  const recoveryRate =
    totalLost + totalFound > 0
      ? Math.round((successfulRecoveries / Math.max(totalLost, 1)) * 100)
      : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      totalLostReports: totalLost,
      totalFoundReports: totalFound,
      activeMatches,
      successfulRecoveries,
      pendingClaims,
      reportsThisWeek,
      recoveryRate,
      lostByCategory,
      reportsOverTime,
    },
  });
});

export const getAdminItems = asyncHandler(async (req, res) => {
  const { type, status, category, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    Item.find(filter).populate('userId', 'name email').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Item.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: Number(page), limit: Number(limit), total },
  });
});

export const getAdminUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

export const moderateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');

  if (req.body.status) item.status = req.body.status;
  if (req.body.isFlagged !== undefined) item.isFlagged = req.body.isFlagged;
  if (req.body.flagReason) item.flagReason = req.body.flagReason;

  await item.save();
  res.json({ success: true, data: item });
});

export const getHeatmapData = asyncHandler(async (req, res) => {
  const points = await Item.find({
    'location.coordinates': { $exists: true },
    status: { $ne: 'REMOVED' },
  }).select('location type category createdAt');

  res.json({ success: true, data: points });
});

export const getMatchingStats = asyncHandler(async (req, res) => {
  const stats = await Match.aggregate([
    {
      $bucket: {
        groupBy: '$score',
        boundaries: [0, 40, 60, 80, 101],
        default: 'Other',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  res.json({ success: true, data: stats });
});