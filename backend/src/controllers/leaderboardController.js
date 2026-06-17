import User from '../models/User.js';

// Helper to get badge name
const getBadge = (points) => {
  if (points >= 2500) return 'Platinum';
  if (points >= 1000) return 'Gold';
  if (points >= 500) return 'Silver';
  if (points >= 100) return 'Bronze';
  return 'None';
};

// @desc    Get leaderboard rankings
// @route   GET /api/leaderboard
// @access  Private
export const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['donor', 'ngo'] } })
      .sort({ impactPoints: -1 })
      .select('name email role orgName impactPoints mealsDonated deliveriesCompleted')
      .limit(50); // limit to top 50

    const rankings = users.map((user, index) => {
      const displayName = user.role === 'ngo' ? user.orgName : user.name;
      return {
        rank: index + 1,
        id: user._id,
        name: displayName,
        email: user.email,
        role: user.role,
        points: user.impactPoints,
        badge: getBadge(user.impactPoints),
        mealsDonated: user.role === 'donor' ? user.mealsDonated : undefined,
        deliveriesCompleted: user.role === 'ngo' ? user.deliveriesCompleted : undefined,
      };
    });

    res.status(200).json({ success: true, count: rankings.length, data: rankings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
