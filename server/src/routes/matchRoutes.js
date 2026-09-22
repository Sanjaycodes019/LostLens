import { Router } from 'express';
import { Match } from '../models/Match.js';
import { Item } from '../models/Item.js';
import { getMatchById } from '../services/matchRunnerService.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = Router();

router.get('/', authenticate, asyncHandler(async (req, res) => {
  const userItems = await Item.find({ userId: req.user._id }).select('_id');
  const itemIds = userItems.map((i) => i._id);

  const matches = await Match.find({
    $or: [{ lostItemId: { $in: itemIds } }, { foundItemId: { $in: itemIds } }],
  })
    .populate('lostItemId', 'title category color images status type userId')
    .populate('foundItemId', 'title category color images status type userId')
    .sort({ score: -1 })
    .limit(50);

  res.json({ success: true, data: matches });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const match = await getMatchById(req.params.id, req.user._id);
  if (!match) {
    return res.status(404).json({ success: false, message: 'Match not found', code: 'NOT_FOUND' });
  }
  res.json({ success: true, data: match });
}));

export default router;
