import User from '../models/User.js';
import Donation from '../models/Donation.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
// @access  Private (Admin only)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a user (Admin only)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, phone, role, orgName, address } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (orgName) user.orgName = orgName;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin' && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete themselves' });
    }

    // Delete donations and user
    await Donation.deleteMany({ donor: user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User and their donations deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Export donations to CSV
// @route   GET /api/admin/export/csv
// @access  Private (Admin only)
export const exportCSV = async (req, res) => {
  try {
    const donations = await Donation.find({})
      .populate('donor', 'name email')
      .populate('ngo', 'orgName name')
      .sort({ createdAt: -1 });

    let csvContent = 'ID,Food Name,Category,Quantity,Meals Count,Status,Donor Name,Donor Email,NGO Org,NGO Contact Name,Points Awarded,Expiry Time,Created At\n';
    
    donations.forEach((d) => {
      const donorName = d.donor ? d.donor.name.replace(/"/g, '""') : 'Deleted User';
      const donorEmail = d.donor ? d.donor.email.replace(/"/g, '""') : 'N/A';
      const ngoOrg = d.ngo ? (d.ngo.orgName || d.ngo.name).replace(/"/g, '""') : 'N/A';
      const ngoContact = d.ngo ? d.ngo.name.replace(/"/g, '""') : 'N/A';
      const expiry = d.expiryTime ? d.expiryTime.toISOString() : 'N/A';
      const created = d.createdAt ? d.createdAt.toISOString() : 'N/A';

      csvContent += `"${d._id}","${d.foodName.replace(/"/g, '""')}","${d.category}","${d.quantity.replace(/"/g, '""')}","${d.mealsCount}","${d.status}","${donorName}","${donorEmail}","${ngoOrg}","${ngoContact}","${d.impactPointsAwarded}","${expiry}","${created}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=foodshare_donations_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
