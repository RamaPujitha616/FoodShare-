import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationCenter from './NotificationCenter';
import { Sun, Moon, LogOut, Menu, X, Award, Shield, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'ngo') return '/ngo';
    return '/donor';
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkClass = (path) => {
    return `text-sm font-semibold transition-colors duration-200 ${
      isActive(path)
        ? 'text-emerald-500 dark:text-emerald-450'
        : 'text-gray-650 hover:text-emerald-500 dark:text-slate-300 dark:hover:text-emerald-400'
    }`;
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200/40 bg-white/80 backdrop-blur-md dark:border-slate-800/40 dark:bg-slate-900/80 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-emerald-450 dark:to-teal-400">
                FOODSHARE+
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={linkClass('/')}>
              Home
            </Link>
            <Link to="/leaderboard" className={linkClass('/leaderboard')}>
              Leaderboard
            </Link>
            {user && (
              <Link to={getDashboardPath()} className={linkClass(getDashboardPath())}>
                Dashboard
              </Link>
            )}
          </div>

          {/* Action Buttons & Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-150 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <>
                {/* Notification Center */}
                <NotificationCenter />

                {/* User Stats Preview */}
                <div className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-gray-800 dark:text-slate-200">
                      {user.role === 'ngo' ? user.orgName : user.name}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-650 dark:text-emerald-450">
                      <Award size={10} /> {user.impactPoints} pts
                    </span>
                  </div>
                  
                  {/* Role indicator */}
                  <div className="rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
                    {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="rounded-full p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm"
                >
                  Join Us
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-gray-500 hover:bg-gray-150 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user && <NotificationCenter />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Leaderboard
          </Link>
          {user && (
            <Link
              to={getDashboardPath()}
              onClick={() => setMobileMenuOpen(false)}
              className="block rounded-lg px-3 py-2 text-base font-semibold text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-emerald-50 p-2 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
                  {user.role === 'admin' ? <Shield size={18} /> : <UserIcon size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 dark:text-slate-200">
                    {user.role === 'ngo' ? user.orgName : user.name}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-650 dark:text-emerald-450">
                    {user.impactPoints} points
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-150 dark:border-slate-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center rounded-lg border border-gray-250 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center rounded-lg bg-emerald-650 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Join Us
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
