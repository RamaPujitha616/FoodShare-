import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BadgeIcon from '../components/BadgeIcon';
import CountdownTimer from '../components/CountdownTimer';
import { StatsSkeleton } from '../components/LoadingSkeleton';
import { Plus, Edit2, Calendar, Clipboard, Award, ShieldAlert, X, MapPin, Phone, MessageSquare, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DonorDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [donations, setDonations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);

  // Form states
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Veg');
  const [quantity, setQuantity] = useState('');
  const [mealsCount, setMealsCount] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [pickupContact, setPickupContact] = useState(user?.phone || '');
  const [description, setDescription] = useState('');
  const [expiryTime, setExpiryTime] = useState('');

  const fetchDashboardData = async () => {
    try {
      const statsRes = await axios.get('/api/dashboard');
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }

      const listRes = await axios.get('/api/donations');
      if (listRes.data.success) {
        setDonations(listRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching donor stats:', error);
      showToast('Error loading dashboard statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const openCreateModal = () => {
    setEditingDonation(null);
    setFoodName('');
    setCategory('Veg');
    setQuantity('');
    setMealsCount('');
    setPickupLocation('');
    setPickupContact(user?.phone || '');
    setDescription('');
    // set expiry to tomorrow or +5 hours
    const d = new Date();
    d.setHours(d.getHours() + 5);
    // Format to datetime-local compatible string
    const localDateTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setExpiryTime(localDateTime);
    
    setModalOpen(true);
  };

  const openEditModal = (donation) => {
    setEditingDonation(donation);
    setFoodName(donation.foodName);
    setCategory(donation.category);
    setQuantity(donation.quantity);
    setMealsCount(donation.mealsCount.toString());
    setPickupLocation(donation.pickupLocation);
    setPickupContact(donation.pickupContact);
    setDescription(donation.description || '');
    
    const d = new Date(donation.expiryTime);
    const localDateTime = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setExpiryTime(localDateTime);
    
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!foodName || !category || !quantity || !mealsCount || !pickupLocation || !pickupContact || !expiryTime) {
      showToast('Please fill in all mandatory fields', 'error');
      return;
    }

    const payload = {
      foodName,
      category,
      quantity,
      mealsCount: Number(mealsCount),
      pickupLocation,
      pickupContact,
      description,
      expiryTime: new Date(expiryTime).toISOString(),
    };

    try {
      if (editingDonation) {
        const res = await axios.put(`/api/donations/${editingDonation._id}`, payload);
        if (res.data.success) {
          showToast('Donation details updated!', 'success');
        }
      } else {
        const res = await axios.post('/api/donations', payload);
        if (res.data.success) {
          showToast('Donation listed successfully! Volunteers notified.', 'success');
        }
      }
      setModalOpen(false);
      fetchDashboardData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Transaction failed.', 'error');
    }
  };

  const calculateProgress = () => {
    if (!stats?.metrics) return 0;
    const { impactPoints, nextBadgeThreshold } = stats.metrics;
    if (nextBadgeThreshold === 0) return 100; // Platinum max
    
    // Find previous threshold
    let prevThreshold = 0;
    if (nextBadgeThreshold === 2500) prevThreshold = 1000;
    else if (nextBadgeThreshold === 1000) prevThreshold = 500;
    else if (nextBadgeThreshold === 500) prevThreshold = 100;
    
    const range = nextBadgeThreshold - prevThreshold;
    const progress = ((impactPoints - prevThreshold) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded w-1/4 animate-pulse"></div>
        <StatsSkeleton />
        <div className="h-96 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const { metrics, charts } = stats || {};

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/40 pb-6 dark:border-slate-800">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your impact points, update listings, or create new food donations.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-emerald-650 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/10"
        >
          <Plus size={18} /> Create Donation
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Donations */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Total Donations</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.totalDonations}
              </h3>
            </div>
            <span className="text-2xl bg-emerald-50 dark:bg-emerald-950/20 p-2 rounded-xl text-emerald-600">📦</span>
          </div>
        </div>

        {/* Meals Donated */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Meals Donated</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.mealsDonated}
              </h3>
            </div>
            <span className="text-2xl bg-sky-50 dark:bg-sky-950/20 p-2 rounded-xl text-sky-650">🥗</span>
          </div>
        </div>

        {/* Impact Points */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Impact Points</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.impactPoints}
              </h3>
            </div>
            <span className="text-2xl bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-xl text-yellow-600">⭐</span>
          </div>
        </div>

        {/* Current Badge */}
        <div className="bg-white border border-gray-150 rounded-2xl p-4 dark:bg-slate-850 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Donor Badge</p>
            <h3 className="text-lg font-bold text-gray-800 dark:text-slate-200 mt-1">
              {metrics?.currentBadge === 'None' ? 'Newbie' : `${metrics?.currentBadge} Donor`}
            </h3>
            {metrics?.nextBadgeThreshold > 0 && (
              <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">
                {metrics.nextBadgeThreshold - metrics.impactPoints} pts to next badge
              </span>
            )}
          </div>
          <BadgeIcon rank={metrics?.currentBadge} size="md" />
        </div>

      </div>

      {/* Progress Bar Tier */}
      {metrics?.nextBadgeThreshold > 0 && (
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex justify-between text-xs font-bold dark:text-slate-350">
            <span className="text-gray-600">Progress Tracker</span>
            <span className="text-emerald-600 dark:text-emerald-450">
              Next Tier: {metrics.nextBadgeThreshold === 500 ? 'Silver' : metrics.nextBadgeThreshold === 1000 ? 'Gold' : 'Platinum'}
            </span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${calculateProgress()}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            ></div>
          </div>
          <p className="text-[11px] text-gray-450 dark:text-gray-400 font-semibold">
            Point Accumulation: {metrics.impactPoints} / {metrics.nextBadgeThreshold} Points
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Monthly Donations */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">Monthly Donations History</h3>
          <div className="h-72 w-full">
            {charts?.monthlyStats && charts.monthlyStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="donations" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-450">No charts data available</div>
            )}
          </div>
        </div>

        {/* Chart 2: Cumulative Points Growth */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">Cumulative Points Milestones</h3>
          <div className="h-72 w-full">
            {charts?.pointsGrowth && charts.pointsGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts.pointsGrowth}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                  <YAxis stroke="#888888" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(30, 41, 59, 0.9)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Area type="monotone" dataKey="points" stroke="#10b981" fillOpacity={1} fill="url(#colorPoints)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-gray-450">Deliveries will trigger point milestone charts</div>
            )}
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm dark:bg-slate-850 dark:border-slate-800">
        <div className="border-b border-gray-150 px-6 py-4 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-gray-850 dark:text-slate-100">Donation History</h3>
        </div>
        
        <div className="overflow-x-auto">
          {donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-450">
              <Clipboard size={36} className="mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No food donations created yet.</p>
              <button onClick={openCreateModal} className="text-xs text-primary-500 font-bold hover:underline mt-1">
                Create your first listing now
              </button>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-150 dark:divide-slate-700">
              <thead className="bg-gray-50/50 dark:bg-slate-800/40">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Food Details
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Portions / Est. Meals
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Listed On
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Freshness & Timer
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-24">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-slate-700">
                {donations.map((don) => {
                  const statusColors = {
                    Available: 'bg-teal-100 text-teal-800 dark:bg-teal-950/20 dark:text-teal-400',
                    Accepted: 'bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-400',
                    Collected: 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-400',
                    Delivered: 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400',
                    Expired: 'bg-red-100 text-red-800 dark:bg-red-950/20 dark:text-red-400',
                  };

                  return (
                    <tr key={don._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{don.foodName}</div>
                        <div className="text-xs text-gray-450 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                          <span className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            {don.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-750 dark:text-slate-300">
                        {don.quantity} ({don.mealsCount} meals)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                        {new Date(don.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <CountdownTimer expiryTime={don.expiryTime} donationStatus={don.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColors[don.status] || 'bg-gray-100 text-gray-800'}`}>
                          {don.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {don.status === 'Available' ? (
                          <button
                            onClick={() => openEditModal(don)}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 flex items-center gap-1 justify-end ml-auto"
                          >
                            <Edit2 size={14} /> Edit
                          </button>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600 text-xs italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Creation & Editing */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-150 dark:border-slate-700 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4 dark:border-slate-700">
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                {editingDonation ? 'Edit Food Listing' : 'List Surplus Food'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Food Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1">
                    Food Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cooked Rice, Chappatis, Curry, Sandwich boxes"
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Veg">Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                    <option value="Bakery">Bakery</option>
                    <option value="Dry Goods">Dry Goods</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Meals Count */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1">
                    Estimated Meals Count *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 15"
                    value={mealsCount}
                    onChange={(e) => setMealsCount(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1">
                    Total Quantity / Description *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 kg, 20 boxes, 4 trays"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Expiry Date-time */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1 flex items-center gap-1">
                    Expiry Date & Time * <Clock size={12} />
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={expiryTime}
                    onChange={(e) => setExpiryTime(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Pickup Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1 flex items-center gap-1">
                    Pickup Location * <MapPin size={12} />
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Complete address for volunteer navigation..."
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Pickup Contact */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-650 dark:text-slate-400 mb-1 flex items-center gap-1">
                    Pickup Contact Phone * <Phone size={12} />
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 98765 43210"
                    value={pickupContact}
                    onChange={(e) => setPickupContact(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Description notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-605 dark:text-slate-400 mb-1 flex items-center gap-1">
                    Preparation details / Storage info (Optional) <MessageSquare size={12} />
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Stated whether item is spicy, stored in cold room, allergen details, etc..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-xl border border-gray-250 bg-white px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                  />
                </div>

              </div>

              {/* Warning label */}
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-3 flex gap-2 text-xs text-amber-800 dark:text-amber-400">
                <ShieldAlert size={16} className="flex-shrink-0" />
                <p>
                  Ensure food has been prepared cleanly and stored safely. Falsified lists or expired distributions will affect impact points.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-gray-250 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-650 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  {editingDonation ? 'Save Changes' : 'Submit Listing'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DonorDashboard;
