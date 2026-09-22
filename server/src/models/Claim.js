import mongoose from 'mongoose';

const claimSchema = new mongoose.Schema(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true, index: true },
    claimantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    lostItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    foundItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    hiddenDetails: { type: String, required: true },
    additionalDescription: String,
    proofImages: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
      default: 'PENDING',
      index: true,
    },
    adminNotes: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
  },
  { timestamps: true }
);

export const Claim = mongoose.model('Claim', claimSchema);
