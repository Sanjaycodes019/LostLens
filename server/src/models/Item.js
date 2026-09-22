import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    width: { type: Number },
    height: { type: Number },
  },
  { _id: false }
);

const aiAnalysisSchema = new mongoose.Schema(
  {
    category: String,
    brand: String,
    primaryColor: String,
    secondaryColors: [String],
    visibleFeatures: [String],
    objectType: String,
    confidence: Number,
    rawResponse: mongoose.Schema.Types.Mixed,
    analyzedAt: Date,
    source: { type: String, enum: ['GEMINI', 'RULE_BASED', 'MANUAL', 'FALLBACK'], default: 'MANUAL' },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['LOST', 'FOUND'], required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    subcategory: { type: String, trim: true },
    brand: { type: String, trim: true, default: 'Unknown' },
    color: { type: String, trim: true, default: 'Unknown' },
    secondaryColors: [{ type: String, trim: true }],
    images: [imageSchema],
    aiAnalysis: aiAnalysisSchema,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: String,
      placeName: String,
    },
    eventDate: { type: Date, required: true, index: true },
    eventTime: { type: String },
    status: {
      type: String,
      enum: ['ACTIVE', 'MATCHED', 'CLAIMED', 'RESOLVED', 'CANCELLED', 'REMOVED'],
      default: 'ACTIVE',
      index: true,
    },
    contactPreference: {
      type: String,
      enum: ['EMAIL', 'PHONE', 'IN_APP'],
      default: 'IN_APP',
    },
    recoveryInfo: {
      recoveredAt: Date,
      recoveredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: String,
    },
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true }
);

itemSchema.index({ location: '2dsphere' });
itemSchema.index({ createdAt: -1 });
itemSchema.index({ title: 'text', description: 'text', brand: 'text' });

itemSchema.pre('save', function normalizeLocation(next) {
  if (this.location?.coordinates?.length === 2) {
    this.location.type = 'Point';
  }
  next();
});

itemSchema.virtual('latitude').get(function () {
  return this.location?.coordinates?.[1];
});

itemSchema.virtual('longitude').get(function () {
  return this.location?.coordinates?.[0];
});

itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

export const Item = mongoose.model('Item', itemSchema);
