import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, Circle, Award, Gift, Calendar, CheckSquare, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NotificationCenter = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
        setUnreadCount(res.data.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Event listener to close dropdown on outside click
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [token]);

  const markAsRead = async (id) => {
    try {
      const res = await axios.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev =>
          prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await axios.put('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'Badge':
        return <Award className="text-yellow-500 h-5 w-5" />;
      case 'Delivered':
        return <CheckSquare className="text-emerald-500 h-5 w-5" />;
      case 'Accepted':
        return <Gift className="text-sky-500 h-5 w-5" />;
      case 'Reminder':
        return <Calendar className="text-amber-500 h-5 w-5" />;
      default:
        return <Bell className="text-gray-500 h-5 w-5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-500 hover:bg-gray-150 hover:text-gray-700 focus:outline-none dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-slate-800 dark:ring-white dark:ring-opacity-10 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell size={32} className="text-gray-300 mb-2 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">All caught up! No notifications.</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors ${!notif.isRead ? 'bg-primary-50/30 dark:bg-primary-950/10' : ''}`}
                >
                  <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notif.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold text-gray-800 dark:text-slate-200 ${!notif.isRead ? 'font-bold' : ''}`}>
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-gray-450 dark:text-gray-500 mt-1 block">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {!notif.isRead && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      title="Mark as read"
                      className="mt-0.5 self-start text-primary-500 hover:text-primary-600 dark:text-primary-400"
                    >
                      <Circle size={10} fill="currentColor" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
