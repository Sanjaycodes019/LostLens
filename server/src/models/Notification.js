import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['MATCH', 'CLAIM', 'CLAIM_UPDATE', 'RECOVERY', 'SYSTEM', 'MODERATION'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: String,
    metadata: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
