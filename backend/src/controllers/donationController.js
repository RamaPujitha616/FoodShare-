import Donation from '../models/Donation.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// Helper to check badge triggers
const checkBadgeTrigger = async (user, pointsEarned) => {
  const oldPoints = user.impactPoints - pointsEarned;
  const newPoints = user.impactPoints;

  const thresholds = [
    { name: 'Bronze', points: 100 },
    { name: 'Silver', points: 500 },
    { name: 'Gold', points: 1000 },
    { name: 'Platinum', points: 2500 },
  ];

  for (const t of thresholds) {
    if (oldPoints < t.points && newPoints >= t.points) {
      // Create badge notification
      await Notification.create({
        recipient: user._id,
        title: `New Badge Earned: ${t.name}!`,
        message: `Congratulations! You have accumulated ${newPoints} impact points and earned the ${t.name} Badge.`,
        type: 'Badge',
      });
    }
  }
};

// @desc    Create a donation
// @route   POST /api/donations
// @access  Private (Donor only)
export const createDonation = async (req, res) => {
  try {
    const {
      foodName,
      category,
      quantity,
      mealsCount,
      pickupLocation,
      pickupContact,
      description,
      expiryTime,
    } = req.body;

    if (!foodName || !category || !quantity || !mealsCount || !pickupLocation || !pickupContact || !expiryTime) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const expiryDate = new Date(expiryTime);
    const timeDiff = expiryDate.getTime() - Date.now();
    
    // Check if food is already expired (less than 1 hour remaining or past)
    if (timeDiff <= 60 * 60 * 1000) {
      return res.status(400).json({ success: false, message: 'Cannot create a donation for food expiring in less than 1 hour.' });
    }

    const donation = await Donation.create({
      foodName,
      category,
      quantity,
      mealsCount: Number(mealsCount),
      pickupLocation,
      pickupContact,
      description,
      expiryTime: expiryDate,
      donor: req.user._id,
    });

    res.status(201).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all donations (filtered by role and query params)
// @route   GET /api/donations
// @access  Private
export const getDonations = async (req, res) => {
  try {
    const { status, category, location } = req.query;
    let query = {};

    // Filter by query parameters
    if (status) query.status = status;
    if (category) query.category = category;
    if (location) query.pickupLocation = { $regex: location, $options: 'i' };

    // Role-based scoping
    if (req.user.role === 'donor') {
      // Donors see their own donations
      query.donor = req.user._id;
    } else if (req.user.role === 'ngo') {
      // NGOs see available donations, or donations they have accepted/collected/delivered
      if (!status) {
        query.$or = [
          { status: 'Available' },
          { ngo: req.user._id }
        ];
      } else if (status === 'Available') {
        query.status = 'Available';
      } else {
        query.ngo = req.user._id;
        query.status = status;
      }
    }
    // Admin sees everything (no scope adjustments)

    // Automatically flag past available donations as Expired
    const now = new Date();
    const availableExpired = await Donation.find({
      status: 'Available',
      expiryTime: { $lte: new Date(now.getTime() + 60 * 60 * 1000) } // less than 1 hour left
    });

    if (availableExpired.length > 0) {
      for (const don of availableExpired) {
        don.status = 'Expired';
        await don.save();
      }
    }

    const donations = await Donation.find(query)
      .populate('donor', 'name email phone')
      .populate('ngo', 'name email phone orgName')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: donations.length, data: donations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single donation details
// @route   GET /api/donations/:id
// @access  Private
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name email phone impactPoints')
      .populate('ngo', 'name email phone orgName address impactPoints');

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    // Security check: Donors and NGOs should only see authorized details if not Admin
    if (
      req.user.role === 'donor' &&
      donation.donor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this donation' });
    }

    if (
      req.user.role === 'ngo' &&
      donation.status !== 'Available' &&
      donation.ngo &&
      donation.ngo._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this donation' });
    }

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update donation details / status
// @route   PUT /api/donations/:id
// @access  Private
export const updateDonation = async (req, res) => {
  try {
    let donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ success: false, message: 'Donation not found' });
    }

    const { status: newStatus } = req.body;

    // WORKFLOW STATE TRANSITIONS
    if (newStatus) {
      // 1. Accept Donation (NGO only)
      if (newStatus === 'Accepted') {
        if (req.user.role !== 'ngo') {
          return res.status(403).json({ success: false, message: 'Only NGOs can accept donations' });
        }
        if (donation.status !== 'Available') {
          return res.status(400).json({ success: false, message: 'Donation is no longer available' });
        }

        // Expiry check: Check if food is already expired (remaining time < 1 hour)
        const timeDiff = donation.expiryTime.getTime() - Date.now();
        if (timeDiff <= 60 * 60 * 1000) {
          donation.status = 'Expired';
          await donation.save();
          return res.status(400).json({ success: false, message: 'Food has expired and cannot be accepted.' });
        }

        // Determine if it was "Expiring Soon" (1 to 3 hours left) at acceptance time
        // 1 hour = 3,600,000 ms, 3 hours = 10,800,000 ms
        const isExpiringSoon = timeDiff >= 60 * 60 * 1000 && timeDiff <= 3 * 60 * 60 * 1000;

        donation.status = 'Accepted';
        donation.ngo = req.user._id;
        donation.acceptedAt = new Date();
        donation.wasExpiringSoon = isExpiringSoon;

        await donation.save();

        // Notify Donor
        await Notification.create({
          recipient: donation.donor,
          sender: req.user._id,
          title: 'Donation Accepted',
          message: `Your donation of "${donation.foodName}" has been accepted by ${req.user.orgName || req.user.name}.`,
          type: 'Accepted',
          donation: donation._id,
        });

        return res.status(200).json({ success: true, data: donation });
      }

      // 2. Collect Donation (NGO only)
      if (newStatus === 'Collected') {
        if (req.user.role !== 'ngo') {
          return res.status(403).json({ success: false, message: 'Only NGOs can update collection status' });
        }
        if (donation.status !== 'Accepted') {
          return res.status(400).json({ success: false, message: 'Donation must be accepted before collection' });
        }
        if (donation.ngo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'You are not the designated NGO for this donation' });
        }

        donation.status = 'Collected';
        donation.collectedAt = new Date();
        await donation.save();

        // Notify Donor
        await Notification.create({
          recipient: donation.donor,
          sender: req.user._id,
          title: 'Donation Collected',
          message: `Your donation of "${donation.foodName}" has been collected and is on the way to distribution.`,
          type: 'Reminder',
          donation: donation._id,
        });

        return res.status(200).json({ success: true, data: donation });
      }

      // 3. Deliver Donation (NGO only)
      if (newStatus === 'Delivered') {
        if (req.user.role !== 'ngo') {
          return res.status(403).json({ success: false, message: 'Only NGOs can mark donations as delivered' });
        }
        if (donation.status !== 'Collected') {
          return res.status(400).json({ success: false, message: 'Donation must be collected before delivery' });
        }
        if (donation.ngo.toString() !== req.user._id.toString()) {
          return res.status(403).json({ success: false, message: 'You are not the designated NGO for this donation' });
        }

        const deliveryTime = new Date();
        // Calculate Points:
        const meals = donation.mealsCount;
        let points = meals; // Proportional base points

        // Bonus 1: Delivered within 2 hours of creation
        const timeDiffFromCreation = deliveryTime.getTime() - donation.createdAt.getTime();
        const isQuickDelivery = timeDiffFromCreation <= 2 * 60 * 60 * 1000;
        if (isQuickDelivery) {
          points += 10;
        }

        // Bonus 2: Was expiring soon when accepted
        if (donation.wasExpiringSoon) {
          points += 5;
        }

        donation.status = 'Delivered';
        donation.deliveredAt = deliveryTime;
        donation.bonusQuickDelivery = isQuickDelivery;
        donation.impactPointsAwarded = points;

        await donation.save();

        // Update Donor Profile
        const donorUser = await User.findById(donation.donor);
        donorUser.impactPoints += points;
        donorUser.mealsDonated += meals;
        await donorUser.save();
        await checkBadgeTrigger(donorUser, points);

        // Update NGO Profile
        const ngoUser = await User.findById(donation.ngo);
        ngoUser.impactPoints += points;
        ngoUser.deliveriesCompleted += 1;
        await ngoUser.save();
        await checkBadgeTrigger(ngoUser, points);

        // Notify Donor
        await Notification.create({
          recipient: donation.donor,
          sender: req.user._id,
          title: 'Donation Delivered!',
          message: `Your donation of "${donation.foodName}" has been successfully delivered to those in need! You earned ${points} impact points.`,
          type: 'Delivered',
          donation: donation._id,
        });

        // Notify NGO
        await Notification.create({
          recipient: donation.ngo,
          sender: donation.donor,
          title: 'Delivery Confirmed',
          message: `You successfully delivered "${donation.foodName}" and earned ${points} impact points!`,
          type: 'Delivered',
          donation: donation._id,
        });

        return res.status(200).json({ success: true, data: donation });
      }
    }

    // 4. Edit Donation (Donor only, and only if status is Available)
    if (req.user.role !== 'donor' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only donors or admins can edit donation details' });
    }

    if (req.user.role === 'donor') {
      if (donation.donor.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only edit your own donations' });
      }
      if (donation.status !== 'Available') {
        return res.status(400).json({ success: false, message: 'Cannot edit donation once accepted or delivered' });
      }
    }

    // Fields allowed to edit
    const fieldsToUpdate = [
      'foodName',
      'category',
      'quantity',
      'mealsCount',
      'pickupLocation',
      'pickupContact',
      'description',
      'expiryTime',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'expiryTime') {
          donation[field] = new Date(req.body[field]);
        } else {
          donation[field] = req.body[field];
        }
      }
    });

    await donation.save();

    res.status(200).json({ success: true, data: donation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
