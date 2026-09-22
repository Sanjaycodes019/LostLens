import { Claim } from '../models/Claim.js';
import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { notifyClaimUpdate } from '../services/notificationService.js';

export const createClaim = asyncHandler(async (req, res) => {
  const { matchId, hiddenDetails, additionalDescription, proofImages } = req.body;

  const match = await Match.findById(matchId).populate('lostItemId foundItemId');
  if (!match) throw new AppError('Match not found', 404, 'NOT_FOUND');

  const lostItem = match.lostItemId;
  const foundItem = match.foundItemId;
  if (lostItem.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the owner of the lost item can submit a claim', 403, 'FORBIDDEN');
  }

  const existing = await Claim.findOne({ matchId, claimantId: req.user._id, status: { $nin: ['REJECTED', 'CANCELLED'] } });
  if (existing) throw new AppError('Claim already submitted for this match', 409, 'CLAIM_EXISTS');

  const claim = await Claim.create({
    matchId,
    claimantId: req.user._id,
    lostItemId: lostItem._id,
    foundItemId: foundItem._id,
    hiddenDetails,
    additionalDescription,
    proofImages: proofImages || [],
    status: 'PENDING',
  });

  await notifyClaimUpdate(foundItem.userId, claim, 'UNDER_REVIEW');

  res.status(201).json({ success: true, data: claim });
});

export const getMyClaims = asyncHandler(async (req, res) => {
  const claims = await Claim.find({ claimantId: req.user._id })
    .populate('matchId')
    .populate('lostItemId', 'title category images')
    .populate('foundItemId', 'title category images')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: claims });
});

export const getClaimById = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id)
    .populate('matchId')
    .populate('lostItemId')
    .populate('foundItemId')
    .populate('claimantId', 'name email');

  if (!claim) throw new AppError('Claim not found', 404, 'NOT_FOUND');

  const isParty =
    claim.claimantId._id.toString() === req.user._id.toString() ||
    claim.foundItemId?.userId?.toString() === req.user._id.toString();
  if (!isParty && req.user.role !== 'ADMIN') {
    throw new AppError('Access denied', 403, 'FORBIDDEN');
  }

  const response = claim.toObject();
  if (req.user.role !== 'ADMIN' && claim.claimantId._id.toString() !== req.user._id.toString()) {
    delete response.hiddenDetails;
  }

  res.json({ success: true, data: response });
});

export const reviewClaim = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['APPROVED', 'REJECTED', 'UNDER_REVIEW'].includes(status)) {
    throw new AppError('Invalid status', 400, 'VALIDATION_ERROR');
  }

  const claim = await Claim.findById(req.params.id).populate('foundItemId lostItemId');
  if (!claim) throw new AppError('Claim not found', 404, 'NOT_FOUND');

  claim.status = status;
  claim.adminNotes = adminNotes;
  claim.reviewedBy = req.user._id;
  claim.reviewedAt = new Date();
  await claim.save();

  if (status === 'APPROVED') {
    await Item.updateMany(
      { _id: { $in: [claim.lostItemId._id, claim.foundItemId._id] } },
      {
        status: 'RESOLVED',
        recoveryInfo: {
          recoveredAt: new Date(),
          recoveredBy: claim.claimantId,
          notes: adminNotes,
        },
      }
    );
    await Match.findByIdAndUpdate(claim.matchId, { status: 'RESOLVED' });
  }

  await notifyClaimUpdate(claim.claimantId, claim, status);

  res.json({ success: true, data: claim });
});

export const cancelClaim = asyncHandler(async (req, res) => {
  const claim = await Claim.findById(req.params.id);
  if (!claim) throw new AppError('Claim not found', 404, 'NOT_FOUND');
  if (claim.claimantId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }

  claim.status = 'CANCELLED';
  await claim.save();
  res.json({ success: true, message: 'Claim cancelled' });
});
