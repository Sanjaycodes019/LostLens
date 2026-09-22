import { Item } from '../models/Item.js';
import { Match } from '../models/Match.js';
import { calculateMatch, MATCH_MIN_SCORE } from './matchingService.js';
import { notifyMatch } from './notificationService.js';

const CANDIDATE_LIMIT = 100;
const MAX_STORED_MATCHES = 20;
const NOTIFY_THRESHOLD = 60;

export async function findAndStoreMatchesForItem(newItem) {
  const oppositeType = newItem.type === 'LOST' ? 'FOUND' : 'LOST';

  const candidates = await Item.find({
    type: oppositeType,
    status: 'ACTIVE',
    category: newItem.category,
    _id: { $ne: newItem._id },
  })
    .sort({ createdAt: -1 })
    .limit(CANDIDATE_LIMIT)
    .lean();

  const broaderCandidates =
    candidates.length >= 10
      ? candidates
      : await Item.find({
          type: oppositeType,
          status: 'ACTIVE',
          _id: { $ne: newItem._id },
        })
          .sort({ createdAt: -1 })
          .limit(CANDIDATE_LIMIT)
          .lean();

  const uniqueCandidates = [...new Map(broaderCandidates.map((c) => [c._id.toString(), c])).values()];

  const results = [];

  for (const candidate of uniqueCandidates) {
    const lostItem = newItem.type === 'LOST' ? newItem : candidate;
    const foundItem = newItem.type === 'FOUND' ? newItem : candidate;

    const matchResult = calculateMatch(lostItem, foundItem);
    if (matchResult.score < MATCH_MIN_SCORE) continue;

    results.push({ candidate, ...matchResult });
  }

  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, MAX_STORED_MATCHES);

  const savedMatches = [];

  for (const result of topResults) {
    const lostItemId = newItem.type === 'LOST' ? newItem._id : result.candidate._id;
    const foundItemId = newItem.type === 'FOUND' ? newItem._id : result.candidate._id;

    const match = await Match.findOneAndUpdate(
      { lostItemId, foundItemId },
      {
        score: result.score,
        scoreBreakdown: result.scoreBreakdown,
        explanation: result.explanation,
        distanceMeters: result.distanceMeters,
        timeDiffMinutes: result.timeDiffMinutes,
        status: 'NOTIFIED',
      },
      { upsert: true, new: true }
    );

    savedMatches.push(match);

    if (result.score >= NOTIFY_THRESHOLD) {
      const lostOwner = newItem.type === 'LOST' ? newItem.userId : result.candidate.userId;
      const foundOwner = newItem.type === 'FOUND' ? newItem.userId : result.candidate.userId;

      await notifyMatch(lostOwner, match, newItem.type === 'LOST' ? newItem : result.candidate);
      await notifyMatch(foundOwner, match, newItem.type === 'FOUND' ? newItem : result.candidate);
    }
  }

  return savedMatches;
}

export async function getMatchesForItem(itemId, userId) {
  const item = await Item.findById(itemId);
  if (!item) return [];

  const filter =
    item.type === 'LOST'
      ? { lostItemId: itemId }
      : { foundItemId: itemId };

  const matches = await Match.find(filter)
    .sort({ score: -1 })
    .populate('lostItemId', 'title category color images status userId type')
    .populate('foundItemId', 'title category color images status userId type')
    .lean();

  return matches.filter((m) => {
    const lost = m.lostItemId;
    const found = m.foundItemId;
    return (
      lost?.userId?.toString() === userId.toString() ||
      found?.userId?.toString() === userId.toString() ||
      false
    );
  });
}

export async function getMatchById(matchId, userId) {
  const match = await Match.findById(matchId)
    .populate('lostItemId')
    .populate('foundItemId');

  if (!match) return null;

  const lostUserId = match.lostItemId?.userId?.toString();
  const foundUserId = match.foundItemId?.userId?.toString();
  const uid = userId.toString();

  if (lostUserId !== uid && foundUserId !== uid) {
    const User = (await import('../models/User.js')).User;
    const user = await User.findById(userId);
    if (user?.role !== 'ADMIN') return null;
  }

  return match;
}
