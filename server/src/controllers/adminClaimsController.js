import { Claim } from '../models/Claim.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const getAdminClaims = asyncHandler(async (req, res) => {
  const { status = 'PENDING,UNDER_REVIEW' } = req.query;
  const statuses = String(status).split(',');

  const claims = await Claim.find({ status: { $in: statuses } })
    .populate('claimantId', 'name email')
    .populate('lostItemId', 'title category')
    .populate('foundItemId', 'title category')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: claims });
});
