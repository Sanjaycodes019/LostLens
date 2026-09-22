import mongoose from 'mongoose';

const scoreBreakdownSchema = new mongoose.Schema(
  {
    category: { type: Number, default: 0 },
    color: { type: Number, default: 0 },
    brand: { type: Number, default: 0 },
    location: { type: Number, default: 0 },
    date: { type: Number, default: 0 },
    description: { type: Number, default: 0 },
  },
  { _id: false }
);

const matchSchema = new mongoose.Schema(
  {
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100, index: true },
    scoreBreakdown: scoreBreakdownSchema,
    explanation: {
      summary: String,
      factors: [
        {
          type: { type: String },
          message: String,
          positive: Boolean,
        },
      ],
    },
    status: {
      type: String,
      enum: ['PENDING', 'NOTIFIED', 'VIEWED', 'CLAIMED', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING',
      index: true,
    },
    distanceMeters: Number,
    timeDiffMinutes: Number,
  },
  { timestamps: true }
);

matchSchema.index({ lostItemId: 1, foundItemId: 1 }, { unique: true });
matchSchema.index({ score: -1 });

export const Match = mongoose.model('Match', matchSchema);
