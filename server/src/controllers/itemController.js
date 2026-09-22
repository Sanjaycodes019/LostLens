import { Item } from '../models/Item.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { analyzeItem } from '../services/aiService.js';
import { findAndStoreMatchesForItem, getMatchesForItem } from '../services/matchRunnerService.js';
import { uploadImage } from '../services/imageService.js';
import { config } from '../config/index.js';

function buildItemPayload(body, userId) {
  const { latitude, longitude, ...locRest } = body.location;
  return {
    userId,
    type: body.type,
    title: body.title,
    description: body.description,
    category: body.category,
    subcategory: body.subcategory,
    brand: body.brand || 'Unknown',
    color: body.color || 'Unknown',
    secondaryColors: body.secondaryColors || [],
    images: body.images || [],
    aiAnalysis: body.aiAnalysis,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
      ...locRest,
    },
    eventDate: new Date(body.eventDate),
    eventTime: body.eventTime,
    contactPreference: body.contactPreference || 'IN_APP',
  };
}

function formatItem(item) {
  const obj = item.toObject ? item.toObject() : item;
  if (obj.location?.coordinates) {
    obj.latitude = obj.location.coordinates[1];
    obj.longitude = obj.location.coordinates[0];
  }
  return obj;
}

export const createItem = asyncHandler(async (req, res) => {
  const payload = buildItemPayload(req.body, req.user._id);
  const item = await Item.create(payload);

  const matches = await findAndStoreMatchesForItem(item);

  res.status(201).json({
    success: true,
    data: { item: formatItem(item), matchesFound: matches.length },
  });
});

export const getItems = asyncHandler(async (req, res) => {
  const {
    type,
    category,
    color,
    brand,
    status = 'ACTIVE',
    search,
    sort = 'newest',
    page = 1,
    limit = 20,
    lat,
    lng,
  } = req.query;

  const filter = {};
  if (type) filter.type = type;
  if (category) filter.category = category;
  if (color) filter.color = new RegExp(color, 'i');
  if (brand) filter.brand = new RegExp(brand, 'i');
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  let query = Item.find(filter).populate('userId', 'name email').skip(skip).limit(Number(limit));

  if (sort === 'oldest') query = query.sort({ createdAt: 1 });
  else query = query.sort({ createdAt: -1 });

  const [items, total] = await Promise.all([query.lean(), Item.countDocuments(filter)]);

  const formatted = items.map((item) => {
    if (item.location?.coordinates) {
      item.latitude = item.location.coordinates[1];
      item.longitude = item.location.coordinates[0];
    }
    return item;
  });

  res.json({
    success: true,
    data: formatted,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
  });
});

export const getMyItems = asyncHandler(async (req, res) => {
  const items = await Item.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: items.map(formatItem) });
});

export const getItemById = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id).populate('userId', 'name email studentId');
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');

  res.json({ success: true, data: formatItem(item) });
});

export const updateItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  if (item.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized to edit this item', 403, 'FORBIDDEN');
  }
  if (!['ACTIVE', 'MATCHED'].includes(item.status)) {
    throw new AppError('Cannot edit resolved or cancelled items', 400, 'INVALID_STATUS');
  }

  const allowed = [
    'title', 'description', 'category', 'subcategory', 'brand', 'color',
    'secondaryColors', 'images', 'eventDate', 'eventTime', 'contactPreference',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) item[key] = req.body[key];
  }
  if (req.body.location) {
    item.location = {
      type: 'Point',
      coordinates: [req.body.location.longitude, req.body.location.latitude],
      address: req.body.location.address,
      placeName: req.body.location.placeName,
    };
  }

  await item.save();
  res.json({ success: true, data: formatItem(item) });
});

export const deleteItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  if (item.userId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }

  item.status = 'CANCELLED';
  await item.save();
  res.json({ success: true, message: 'Item cancelled' });
});

export const analyzeItemImage = asyncHandler(async (req, res) => {
  const { description, category } = req.body;
  let imageUrl = req.body.imageUrl;

  if (req.file) {
    const uploaded = await uploadImage(req.file);
    imageUrl = uploaded.url.startsWith('http')
      ? uploaded.url
      : `${req.protocol}://${req.get('host')}${uploaded.url}`;
  }

  const analysis = await analyzeItem({ imageUrl, description, category });
  res.json({ success: true, data: analysis });
});

export const getItemMatches = asyncHandler(async (req, res) => {
  const matches = await getMatchesForItem(req.params.id, req.user._id);
  res.json({ success: true, data: matches });
});

export const markRecovered = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  if (item.userId.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403, 'FORBIDDEN');
  }

  item.status = 'RESOLVED';
  item.recoveryInfo = {
    recoveredAt: new Date(),
    recoveredBy: req.user._id,
    notes: req.body.notes,
  };
  await item.save();

  res.json({ success: true, data: formatItem(item) });
});

export const flagItem = asyncHandler(async (req, res) => {
  const item = await Item.findById(req.params.id);
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');

  item.isFlagged = true;
  item.flagReason = req.body.reason || 'Suspicious content reported';
  await item.save();

  res.json({ success: true, message: 'Report submitted' });
});

export const uploadItemImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('No image provided', 400, 'NO_FILE');
  const image = await uploadImage(req.file);
  res.json({ success: true, data: image });
});
