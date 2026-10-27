import Donation from '../models/Donation.js';
import User from '../models/User.js';

// Helper to calculate badge name
const getBadge = (points) => {
  if (points >= 2500) return 'Platinum';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  if (points >= 100) return 'Bronze';
  return 'None';
};

// @desc    Get dashboard analytics depending on user role
// @route   GET /api/dashboard
// @access  Private
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    if (role === 'donor') {
      // DONOR STATS
      const allDonations = await Donation.find({ donor: userId });
      const deliveredDonations = allDonations.filter(d => d.status === 'Delivered');

      const totalDonations = allDonations.length;
      const mealsDonated = deliveredDonations.reduce((sum, d) => sum + d.mealsCount, 0);
      const impactPoints = req.user.impactPoints;
      const currentBadge = getBadge(impactPoints);

      // Monthly donations (last 6 months)
      const monthlyDataMap = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Seed last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyDataMap[key] = { name: key, donations: 0, points: 0 };
      }

      allDonations.forEach(don => {
        const date = new Date(don.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyDataMap[key]) {
          monthlyDataMap[key].donations += 1;
          if (don.status === 'Delivered') {
            monthlyDataMap[key].points += don.impactPointsAwarded;
          }
        }
      });

      const monthlyStats = Object.values(monthlyDataMap);

      // Points Growth chart data (cumulative sum of last 10 deliveries)
      let cumulativePoints = 0;
      const pointsGrowth = deliveredDonations
        .sort((a, b) => new Date(a.deliveredAt) - new Date(b.deliveredAt))
        .map(don => {
          cumulativePoints += don.impactPointsAwarded;
          return {
            date: new Date(don.deliveredAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            points: cumulativePoints,
            meals: don.mealsCount
          };
        });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalDonations,
            mealsDonated,
            impactPoints,
            currentBadge,
            nextBadgeThreshold: currentBadge === 'Platinum' ? 0 : 
                                 currentBadge === 'Gold' ? 2500 : 
                                 currentBadge === 'Silver' ? 1000 : 
                                 currentBadge === 'Bronze' ? 500 : 100
          },
          charts: {
            monthlyStats,
            pointsGrowth: pointsGrowth.slice(-10) // last 10 milestones
          },
          recentDonations: allDonations.slice(0, 5)
        }
      });
    }

    if (role === 'ngo') {
      // NGO STATS
      const allNgoDonations = await Donation.find({ ngo: userId });
      const activeTasks = allNgoDonations.filter(d => ['Accepted', 'Collected'].includes(d.status));
      const deliveries = allNgoDonations.filter(d => d.status === 'Delivered');
      
      const availableDonationsCount = await Donation.countDocuments({ status: 'Available' });

      const mealsServed = deliveries.reduce((sum, d) => sum + d.mealsCount, 0);
      const deliveriesCount = deliveries.length;
      const impactPoints = req.user.impactPoints;

      // Delivery Analytics
      const tasksMap = {};
      activeTasks.forEach(t => {
        tasksMap[t.status] = (tasksMap[t.status] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            availableDonationsCount,
            activeTasksCount: activeTasks.length,
            deliveriesCount,
            mealsServed,
            impactPoints,
            badge: getBadge(impactPoints)
          },
          todayTasks: activeTasks,
          recentDeliveries: deliveries.slice(0, 5)
        }
      });
    }

    if (role === 'admin') {
      // ADMIN STATS
      const totalDonations = await Donation.countDocuments();
      const allDelivered = await Donation.find({ status: 'Delivered' });
      const mealsServed = allDelivered.reduce((sum, d) => sum + d.mealsCount, 0);
      
      // Calculate waste reduced: we can represent this as proportion of non-expired meals
      const allExpired = await Donation.countDocuments({ status: 'Expired' });
      const foodWasteReduced = totalDonations > 0 ? (((totalDonations - allExpired) / totalDonations) * 100).toFixed(1) : 100;
      
      // People helped (factor of 1.2 per meal served)
      const peopleHelped = Math.round(mealsServed * 1.2);

      // Status distribution chart
      const statuses = ['Available', 'Accepted', 'Collected', 'Delivered', 'Expired'];
      const statusDistribution = await Promise.all(
        statuses.map(async (status) => {
          const count = await Donation.countDocuments({ status });
          return { name: status, value: count };
        })
      );

      // Top Donors
      const topDonors = await User.find({ role: 'donor' })
        .sort({ impactPoints: -1 })
        .limit(5)
        .select('name email impactPoints mealsDonated');

      // Donations by Month
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyMap = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        monthlyMap[key] = { name: key, donations: 0 };
      }

      const allDons = await Donation.find({});
      allDons.forEach(don => {
        const date = new Date(don.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (monthlyMap[key]) {
          monthlyMap[key].donations += 1;
        }
      });

      const donationsByMonth = Object.values(monthlyMap);

      return res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalDonations,
            mealsServed,
            foodWasteReduced: parseFloat(foodWasteReduced),
            peopleHelped,
            totalUsers: await User.countDocuments(),
            totalNgos: await User.countDocuments({ role: 'ngo' }),
            totalDonors: await User.countDocuments({ role: 'donor' })
          },
          charts: {
            statusDistribution,
            donationsByMonth,
            topDonors
          }
        }
      });
    }

    res.status(400).json({ success: false, message: 'Invalid role dashboard access' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
