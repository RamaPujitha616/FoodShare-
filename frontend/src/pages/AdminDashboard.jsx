import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../context/ToastContext';
import { StatsSkeleton, TableRowSkeleton } from '../components/LoadingSkeleton';
import { Shield, Download, Users, Package, Award, Smile, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, users
  
  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState('donor');
  const [editOrgName, setEditOrgName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchAdminData = async () => {
    try {
      const statsRes = await axios.get('/api/dashboard');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const usersRes = await axios.get('/api/admin/users');
      if (usersRes.data.success) {
        setUsers(usersRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Error loading administrative records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleExportCSV = () => {
    // Open CSV download link in a new window or trigger download
    window.open('/api/admin/export/csv', '_blank');
    showToast('Donations report CSV download initiated.', 'success');
  };

  const handlePrintPDF = () => {
    // Trigger standard browser print window, customized via CSS
    window.print();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPhone(user.phone);
    setEditRole(user.role);
    setEditOrgName(user.orgName || '');
    setEditAddress(user.address || '');
    setModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName || !editEmail || !editPhone) {
      showToast('Please specify all details.', 'error');
      return;
    }

    const payload = {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole,
      orgName: editRole === 'ngo' ? editOrgName : undefined,
      address: editRole === 'ngo' ? editAddress : undefined,
    };

    try {
      const res = await axios.put(`/api/admin/users/${editingUser._id}`, payload);
      if (res.data.success) {
        showToast('User profiles synchronized!', 'success');
        setModalOpen(false);
        fetchAdminData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Update failed', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This will also purge all food listings they created.')) {
      return;
    }

    try {
      const res = await axios.delete(`/api/admin/users/${id}`);
      if (res.data.success) {
        showToast('User record permanently removed.', 'success');
        fetchAdminData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Purge failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <StatsSkeleton />
        <div className="h-96 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const { metrics, charts } = stats || {};

  const PIE_COLORS = ['#3b82f6', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/40 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-emerald-500" /> Admin Console
          </h1>
          <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
            System administration panel: access user credentials, export data spreadsheets, and monitor system-wide statistics.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-650 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md"
          >
            Print PDF Report
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'analytics' ? 'border-primary-555 text-emerald-600 dark:border-primary-450 dark:text-emerald-450' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
        >
          System Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary-555 text-emerald-600 dark:border-primary-450 dark:text-emerald-450' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400'}`}
        >
          User Accounts Directory ({users.length})
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Metrics Row */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            
            {/* Total Donations */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Total Donations</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {metrics?.totalDonations}
                  </h3>
                </div>
                <span className="text-2xl bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl">📦</span>
              </div>
            </div>

            {/* Meals Served */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Meals Served</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {metrics?.mealsServed}
                  </h3>
                </div>
                <span className="text-2xl bg-sky-50 dark:bg-sky-950/20 p-2 rounded-xl">🥗</span>
              </div>
            </div>

            {/* Food Waste Reduced */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">Recovery Rate</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {metrics?.foodWasteReduced}%
                  </h3>
                </div>
                <span className="text-2xl bg-amber-50 dark:bg-amber-950/20 p-2 rounded-xl">♻️</span>
              </div>
            </div>

            {/* People Helped */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-gray-450 uppercase">People Impacted</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                    {metrics?.peopleHelped}
                  </h3>
                </div>
                <span className="text-2xl bg-rose-50 dark:bg-rose-950/20 p-2 rounded-xl">❤️</span>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Status Distribution Pie Chart */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">Status Distribution</h3>
              <div className="h-64 flex items-center justify-center">
                {charts?.statusDistribution && charts.statusDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={charts.statusDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {charts.statusDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-450">No data available</p>
                )}
              </div>
              
              {/* Pie Legends */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs font-semibold">
                {charts?.statusDistribution?.map((entry, idx) => (
                  <span key={idx} className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></span>
                    <span>{entry.name} ({entry.value})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Monthly Trend Bar Chart */}
            <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4 lg:col-span-2">
              <h3 className="font-bold text-gray-800 dark:text-slate-100">Monthly Food Inflow Tendencies</h3>
              <div className="h-72 w-full">
                {charts?.donationsByMonth && charts.donationsByMonth.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={charts.donationsByMonth}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                      <YAxis stroke="#888888" fontSize={11} />
                      <Tooltip />
                      <Bar dataKey="donations" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-gray-450">No monthly data available</p>
                )}
              </div>
            </div>

          </div>

          {/* Top Donors Ranking List */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-slate-100 flex items-center gap-1.5">
              <Award className="text-yellow-500" /> Top Donors Ranking
            </h3>
            <div className="space-y-4">
              {charts?.topDonors?.length === 0 ? (
                <p className="text-xs text-gray-450">No top donors listed yet.</p>
              ) : (
                charts?.topDonors?.map((donor, idx) => (
                  <div key={donor._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2.5 dark:border-slate-700 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="font-black text-emerald-600 dark:text-emerald-450 w-6">#{idx + 1}</span>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-slate-200">{donor.name}</p>
                        <p className="text-xs text-gray-400">{donor.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-emerald-650 dark:text-emerald-450">{donor.impactPoints} pts</p>
                      <p className="text-[10px] text-gray-450">{donor.mealsDonated} meals donated</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        /* Users List Directory */
        <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm dark:bg-slate-850 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-150 dark:divide-slate-700">
              <thead className="bg-gray-50/50 dark:bg-slate-800/40">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Name / Org Contact
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Email / Phone
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-28">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-36">
                    Impact Points
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-700">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.role === 'ngo' ? item.orgName : item.name}
                      </div>
                      {item.role === 'ngo' && (
                        <div className="text-xs text-gray-450 dark:text-gray-500">
                          Contact: {item.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs text-gray-800 dark:text-slate-350">{item.email}</div>
                      <div className="text-xs text-gray-450 dark:text-gray-500 mt-0.5">{item.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${item.role === 'admin' ? 'bg-red-105 text-red-800 dark:bg-red-950/20 dark:text-red-300 border border-red-200/50' : item.role === 'ngo' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-300' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'}`}>
                        {item.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-emerald-650 dark:text-emerald-450">
                      {item.impactPoints} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-bold inline-flex items-center gap-0.5"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      
                      {item.role !== 'admin' ? (
                        <button
                          onClick={() => handleDeleteUser(item._id)}
                          className="text-red-500 hover:text-red-650 font-bold inline-flex items-center gap-0.5"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs italic dark:text-gray-600">Root</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full shadow-2xl border border-gray-150 dark:border-slate-700">
            
            <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4 dark:border-slate-700">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Modify User Account Details
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-650">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                  Access Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                >
                  <option value="donor">Donor</option>
                  <option value="ngo">NGO</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {editRole === 'ngo' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editOrgName}
                      onChange={(e) => setEditOrgName(e.target.value)}
                      className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1">
                      Office/Hub Address
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-250 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-650 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Synchronize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
