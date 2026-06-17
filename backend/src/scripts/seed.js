import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Notification from '../models/Notification.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodshare');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Donation.deleteMany();
    await Notification.deleteMany();
    console.log('Database cleared.');

    // 1. Create Users
    // Admin
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@foodshare.com',
      password: 'Admin@123456',
      phone: '+919999999999',
      role: 'admin',
    });

    // Donor
    const donor = await User.create({
      name: 'Priya Sharma',
      email: 'priya@demo.com',
      password: 'Demo@12345',
      phone: '+919876543210',
      role: 'donor',
      impactPoints: 120, // Preloaded points
      mealsDonated: 120,
    });

    // NGO
    const ngo = await User.create({
      name: 'Robin Hood Army',
      email: 'ngo@demo.com',
      password: 'Demo@12345',
      phone: '+919111122222',
      role: 'ngo',
      orgName: 'Robin Hood Army NGO',
      address: 'Sector 62, Noida, Uttar Pradesh',
      impactPoints: 60,
      deliveriesCompleted: 3,
    });

    console.log('Seeded Users: Admin, Donor, NGO');

    // 2. Create Donations
    const now = new Date();

    // Donation 1: Available & Fresh (Expiry in 6 hours)
    const expiryFresh = new Date(now.getTime() + 6 * 60 * 60 * 1000);
    const donation1 = await Donation.create({
      foodName: 'Mixed Veg Curry and Roti',
      category: 'Veg',
      quantity: '20 Portions',
      mealsCount: 20,
      pickupLocation: 'GK-2, New Delhi',
      pickupContact: '+919876543210',
      description: 'Freshly cooked for a party that got downsized. Stored in clean containers.',
      expiryTime: expiryFresh,
      status: 'Available',
      donor: donor._id,
    });

    // Donation 2: Available & Expiring Soon (Expiry in 2 hours)
    const expirySoon = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const donation2 = await Donation.create({
      foodName: 'Paneer Butter Masala',
      category: 'Veg',
      quantity: '10 Portions',
      mealsCount: 10,
      pickupLocation: 'Saket, New Delhi',
      pickupContact: '+919876543210',
      description: 'Made this afternoon. Needs to be distributed quickly.',
      expiryTime: expirySoon,
      status: 'Available',
      donor: donor._id,
    });

    // Donation 3: Already Accepted (In progress)
    const expiryAccepted = new Date(now.getTime() + 4 * 60 * 60 * 1000);
    const donation3 = await Donation.create({
      foodName: 'Chicken Biryani',
      category: 'Non-Veg',
      quantity: '15 Portions',
      mealsCount: 15,
      pickupLocation: 'Indirapuram, Ghaziabad',
      pickupContact: '+919876543210',
      description: 'Spicy chicken biryani, kept in hot-cases.',
      expiryTime: expiryAccepted,
      status: 'Accepted',
      donor: donor._id,
      ngo: ngo._id,
      acceptedAt: new Date(now.getTime() - 30 * 60 * 1000), // Accepted 30 mins ago
    });

    // Donation 4: Delivered (with Points Awarded)
    // 30 meals. Delivered in 1 hour (Quick delivery bonus +10). Expiring soon bonus (+5) not applicable as it had 5 hours left.
    // Total impact points = 30 + 10 = 40.
    const creationPast = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Created 24h ago
    const deliveryPast = new Date(now.getTime() - 23 * 60 * 60 * 1000); // Delivered 23h ago (1 hour after creation)
    const expiryPast = new Date(now.getTime() - 18 * 60 * 60 * 1000); // Would have expired 18h ago
    const donation4 = await Donation.create({
      foodName: 'Lunch Boxes (Rice & Dal)',
      category: 'Veg',
      quantity: '40 Packets',
      mealsCount: 40,
      pickupLocation: 'Vasant Kunj, New Delhi',
      pickupContact: '+919876543210',
      description: 'Prepared for corporate meeting, unused food.',
      expiryTime: expiryPast,
      status: 'Delivered',
      donor: donor._id,
      ngo: ngo._id,
      createdAt: creationPast,
      acceptedAt: new Date(creationPast.getTime() + 15 * 60 * 1000), // Accepted after 15 mins
      collectedAt: new Date(creationPast.getTime() + 45 * 60 * 1000), // Collected after 45 mins
      deliveredAt: deliveryPast,
      wasExpiringSoon: false,
      bonusQuickDelivery: true,
      impactPointsAwarded: 50, // 40 meals + 10 quick delivery
    });

    console.log('Seeded Donations');

    // 3. Create Notifications
    await Notification.create({
      recipient: donor._id,
      title: 'Welcome to FoodShare+!',
      message: 'Thank you for joining our community to reduce food waste and feed people in need.',
      type: 'Badge',
    });

    await Notification.create({
      recipient: donor._id,
      title: 'Donation Delivered!',
      message: `Your donation of "Lunch Boxes (Rice & Dal)" has been successfully delivered. You earned 50 Impact Points!`,
      type: 'Delivered',
      donation: donation4._id,
    });

    await Notification.create({
      recipient: ngo._id,
      title: 'Donation Accepted',
      message: 'You have accepted the donation "Chicken Biryani". Please arrange pickup.',
      type: 'Accepted',
      donation: donation3._id,
    });

    console.log('Seeded Notifications');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
