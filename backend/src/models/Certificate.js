import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['donor', 'ngo'],
      required: true,
    },
    certificateType: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mealsAchieved: {
      type: Number,
      required: true,
    },
    impactPoints: {
      type: Number,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Certificate = mongoose.model('Certificate', CertificateSchema);
export default Certificate;
