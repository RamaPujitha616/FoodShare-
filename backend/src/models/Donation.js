import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: [true, 'Please add a food name'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Veg', 'Non-Veg', 'Bakery', 'Dry Goods', 'Other'],
    },
    quantity: {
      type: String,
      required: [true, 'Please specify quantity (e.g. 5 kg, 20 packets)'],
    },
    mealsCount: {
      type: Number,
      required: [true, 'Please estimate the equivalent number of meals'],
    },
    pickupLocation: {
      type: String,
      required: [true, 'Please specify pickup address'],
    },
    pickupContact: {
      type: String,
      required: [true, 'Please specify pickup contact phone number'],
    },
    description: {
      type: String,
      trim: true,
    },
    expiryTime: {
      type: Date,
      required: [true, 'Please specify food expiry date and time'],
    },
    photoUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Available', 'Accepted', 'Collected', 'Delivered', 'Expired'],
      default: 'Available',
    },
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ngo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    acceptedAt: {
      type: Date,
    },
    collectedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    wasExpiringSoon: {
      type: Boolean,
      default: false,
    },
    bonusQuickDelivery: {
      type: Boolean,
      default: false,
    },
    impactPointsAwarded: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Donation = mongoose.model('Donation', DonationSchema);
export default Donation;
