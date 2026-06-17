import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CountdownTimer from '../components/CountdownTimer';
import { StatsSkeleton, CardSkeleton } from '../components/LoadingSkeleton';
import { Truck, CheckCircle, Gift, MapPin, Phone, Filter, RotateCcw, AlertTriangle, Calendar } from 'lucide-react';

const NgoDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [availableListings, setAvailableListings] = useState([]);

  // Filters
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const fetchNgoData = async () => {
    try {
      const statsRes = await axios.get('/api/dashboard');
      if (statsRes.data.success) {
        setMetrics(statsRes.data.data.metrics);
        setTodayTasks(statsRes.data.data.todayTasks);
        setRecentDeliveries(statsRes.data.data.recentDeliveries);
      }

      // Fetch Available listings with query filters
      let queryUrl = '/api/donations?status=Available';
      if (filterLocation) queryUrl += `&location=${filterLocation}`;
      if (filterCategory) queryUrl += `&category=${filterCategory}`;

      const listRes = await axios.get(queryUrl);
      if (listRes.data.success) {
        setAvailableListings(listRes.data.data);
      }
    } catch (error) {
      console.error('Error loading NGO dashboard:', error);
      showToast('Error loading NGO dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNgoData();
  }, [filterLocation, filterCategory]);

  const handleClearFilters = () => {
    setFilterLocation('');
    setFilterCategory('');
  };

  const handleAcceptDonation = async (id) => {
    try {
      const res = await axios.put(`/api/donations/${id}`, { status: 'Accepted' });
      if (res.data.success) {
        showToast('Donation accepted successfully! Arranging pickup.', 'success');
        fetchNgoData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error accepting donation', 'error');
    }
  };

  const handleMarkCollected = async (id) => {
    try {
      const res = await axios.put(`/api/donations/${id}`, { status: 'Collected' });
      if (res.data.success) {
        showToast('Donation collected! Navigating to distribution.', 'success');
        fetchNgoData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating collection status', 'error');
    }
  };

  const handleMarkDelivered = async (id) => {
    try {
      const res = await axios.put(`/api/donations/${id}`, { status: 'Delivered' });
      if (res.data.success) {
        const points = res.data.data.impactPointsAwarded;
        showToast(`Donation delivered! Earned ${points} Impact Points!`, 'success');
        fetchNgoData();
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating delivery status', 'error');
    }
  };

  if (loading && !metrics) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        <StatsSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Header */}
      <div className="border-b border-gray-200/40 pb-6 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
          Welcome back, {user?.orgName || user?.name}!
        </h1>
        <p className="text-sm text-gray-550 dark:text-gray-400 mt-1">
          NGO Hub Portal: Claim available listings, manage distributions, and track impact.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Available Donations */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Available Donations</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.availableDonationsCount}
              </h3>
            </div>
            <span className="text-2xl bg-teal-50 dark:bg-teal-950/20 p-2 rounded-xl text-teal-600">📦</span>
          </div>
        </div>

        {/* Active Tasks */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Active Tasks</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.activeTasksCount}
              </h3>
            </div>
            <span className="text-2xl bg-sky-50 dark:bg-sky-950/20 p-2 rounded-xl text-sky-600">🚚</span>
          </div>
        </div>

        {/* Deliveries Completed */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Deliveries Done</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.deliveriesCount}
              </h3>
            </div>
            <span className="text-2xl bg-green-50 dark:bg-green-950/20 p-2 rounded-xl text-green-650">✓</span>
          </div>
        </div>

        {/* Impact Points */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-450 uppercase dark:text-gray-450">Total Impact Points</p>
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
                {metrics?.impactPoints}
              </h3>
            </div>
            <span className="text-2xl bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded-xl text-yellow-600">⭐</span>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Tasks vs Available Listings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Available Listings (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header & Filter panel */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-805 dark:text-white flex items-center gap-1.5">
                <Gift size={20} className="text-emerald-500" /> Available Donations Nearby
              </h2>
              {(filterLocation || filterCategory) && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-red-500 font-bold flex items-center gap-1 hover:underline"
                >
                  <RotateCcw size={12} /> Clear Filters
                </button>
              )}
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Location query */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <MapPin size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Filter by location/city..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Category selector */}
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Filter size={16} />
                </span>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="block w-full rounded-xl border border-gray-250 bg-white pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-slate-750 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">All Categories</option>
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Dry Goods">Dry Goods</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings list */}
          {availableListings.length === 0 ? (
            <div className="glass p-12 rounded-2xl text-center space-y-4 dark:border-slate-800">
              <Gift className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-bold dark:text-white">No Listings Found</h3>
              <p className="text-sm text-gray-550 dark:text-gray-405 max-w-xs mx-auto">
                All donations have been claimed or expired. Check back later or clear your filters!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {availableListings.map((don) => (
                <div
                  key={don._id}
                  className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm flex flex-col justify-between h-76 border-l-4 border-l-emerald-500"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-gray-905 dark:text-white truncate max-w-[160px]" title={don.foodName}>
                        {don.foodName}
                      </h3>
                      <span className="bg-gray-105 text-gray-750 text-[10px] font-bold px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-350">
                        {don.category}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1 bg-gray-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-gray-100 dark:border-slate-750">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700 dark:text-slate-300">Quantity:</span> {don.quantity} ({don.mealsCount} meals)
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin size={12} className="text-gray-400" />
                        <span className="truncate">{don.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-400" />
                        <span>{don.pickupContact}</span>
                      </div>
                    </div>

                    {don.description && (
                      <p className="text-xs text-gray-450 dark:text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                        {don.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center gap-4">
                    <CountdownTimer expiryTime={don.expiryTime} donationStatus={don.status} />
                    <button
                      onClick={() => handleAcceptDonation(don._id)}
                      className="rounded-lg bg-emerald-650 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shrink-0"
                    >
                      Accept Task
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right column: Active Tasks (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-805 dark:text-white flex items-center gap-1.5 border-b border-gray-100 pb-3 dark:border-slate-700">
              <Truck size={20} className="text-sky-500" /> Active Tasks ({todayTasks.length})
            </h2>

            {todayTasks.length === 0 ? (
              <div className="py-8 text-center space-y-2 text-gray-450">
                <Truck size={36} className="mx-auto text-gray-300" />
                <p className="text-xs font-semibold">No active collections today.</p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Accept a listing from the available list on the left to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {todayTasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 rounded-xl border border-gray-150 bg-gray-50/50 dark:border-slate-750 dark:bg-slate-800/30 space-y-3"
                  >
                    <div>
                      <h4 className="font-extrabold text-sm text-gray-850 dark:text-white truncate">
                        {task.foodName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-450 mt-1 flex items-center gap-1">
                        <MapPin size={10} /> {task.pickupLocation}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-2 border-t border-dashed border-gray-200 pt-2 dark:border-slate-700">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${task.status === 'Accepted' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300'}`}>
                        {task.status}
                      </span>
                      {task.status === 'Accepted' ? (
                        <button
                          onClick={() => handleMarkCollected(task._id)}
                          className="rounded-lg bg-sky-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-sky-700"
                        >
                          Mark Collected
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkDelivered(task._id)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-green-700"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Collection History preview */}
          <div className="bg-white border border-gray-150 rounded-2xl p-6 dark:bg-slate-850 dark:border-slate-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-gray-805 dark:text-white uppercase tracking-wider">
              Recent Deliveries
            </h2>
            <div className="space-y-3">
              {recentDeliveries.length === 0 ? (
                <p className="text-xs text-gray-450 dark:text-gray-500">No completed deliveries yet.</p>
              ) : (
                recentDeliveries.slice(0, 3).map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-xs">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-slate-350 truncate max-w-[150px]">
                        {item.foodName}
                      </p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.deliveredAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-650 dark:text-emerald-400">
                      +{item.impactPointsAwarded} pts
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default NgoDashboard;
