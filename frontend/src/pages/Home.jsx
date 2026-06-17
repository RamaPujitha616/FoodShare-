import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Award, Heart, ArrowRight, UserPlus, Gift, MapPin, CheckCircle, Truck } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDonateClick = () => {
    if (!user) navigate('/login?redirect=donor');
    else if (user.role === 'donor') navigate('/donor');
    else navigate('/');
  };

  const statItems = [
    { label: 'Meals Served', value: '45,280+', icon: '🥗' },
    { label: 'Total Donations', value: '1,540+', icon: '📦' },
    { label: 'Food Saved (KG)', value: '12,500+', icon: '♻️' },
    { label: 'People Helped', value: '18,200+', icon: '❤️' },
  ];

  const steps = [
    {
      title: 'Donor Adds Food',
      desc: 'Fill in details like food name, count, location, and expiry time.',
      icon: <Gift size={32} className="text-emerald-500" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: 'NGO Accepts',
      desc: 'NGOs review live listings and claim available items.',
      icon: <CheckCircle size={32} className="text-sky-500" />,
      bg: 'bg-sky-50 dark:bg-sky-950/20',
    },
    {
      title: 'Collection',
      desc: 'NGO volunteers navigate to the pickup point to collect food.',
      icon: <Truck size={32} className="text-amber-500" />,
      bg: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      title: 'Delivery',
      desc: 'Food is safely delivered, updating the dashboard and awarding points.',
      icon: <Heart size={32} className="text-rose-500" />,
      bg: 'bg-rose-50 dark:bg-rose-950/20',
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-50/30 to-teal-50/20 dark:from-slate-900 dark:to-slate-850 z-0"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 px-4 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-350"
          >
            <Sparkles size={12} />
            <span>Zero Waste. Zero Hunger. Together.</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-6xl dark:text-white max-w-4xl mx-auto"
          >
            Donate Food. Reduce Waste. <br />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent dark:from-emerald-450 dark:to-teal-400">
              Feed Communities.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
          >
            FOODSHARE+ bridges the gap between surplus food donors (restaurants, events, households) and local NGOs. Together, we fulfill Sustainable Development Goals (SDG 2, 3, & 12).
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-4 pt-4"
          >
            <button
              onClick={handleDonateClick}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              Donate Now <ArrowRight size={18} />
            </button>
            <Link
              to="/register?role=ngo"
              className="flex items-center gap-2 rounded-xl bg-white border border-gray-250 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50 shadow-sm dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700"
            >
              Join as NGO <UserPlus size={18} />
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 px-6 py-3 font-semibold dark:bg-teal-950/20 dark:text-teal-400 dark:hover:bg-teal-950/30"
            >
              View Leaderboard <Award size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statItems.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="glass p-6 rounded-2xl text-center shadow-md dark:border-slate-800"
            >
              <span className="text-3xl block mb-2">{stat.icon}</span>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white block sm:text-3xl">
                {stat.value}
              </span>
              <span className="text-xs text-gray-550 dark:text-gray-400 font-semibold tracking-wider uppercase mt-1 block">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold dark:text-white">How It Works</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            A seamless coordination process linking donors with food distribution volunteers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center space-y-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.bg} shadow-md`}>
                {step.icon}
              </div>
              <span className="absolute top-2 left-1/2 ml-8 hidden md:block text-slate-300 dark:text-slate-700 text-3xl font-extrabold">
                {idx < 3 ? '→' : ''}
              </span>
              <h3 className="font-bold text-gray-800 dark:text-slate-100">{step.title}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed px-4">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Showcase */}
      <section className="bg-slate-50 dark:bg-slate-850/50 py-16 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold dark:text-white">Key Features</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Engineered with advanced alerts and reward mechanisms to maximize community impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <span className="inline-flex rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-3 text-emerald-600 dark:text-emerald-450">
                <MapPin size={24} />
              </span>
              <h3 className="text-lg font-bold dark:text-white">Real-time Tracking</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Track pickup details, locations, and contact numbers. Live notifications notify donors when their food gets accepted, collected, and delivered.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <span className="inline-flex rounded-xl bg-amber-50 dark:bg-amber-950/20 p-3 text-amber-600 dark:text-amber-450">
                <Sparkles size={24} />
              </span>
              <h3 className="text-lg font-bold dark:text-white">Food Expiry Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Color-coded badges categorize listings as Fresh or Expiring Soon, backed by live countdown tickers to avoid distributing spoiled food.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
              <span className="inline-flex rounded-xl bg-teal-50 dark:bg-teal-950/20 p-3 text-teal-600 dark:text-teal-450">
                <Award size={24} />
              </span>
              <h3 className="text-lg font-bold dark:text-white">Impact & Badges</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                Earn impact points proportional to meals delivered. Clear milestones reward top contributors with Bronze, Silver, Gold, and Platinum badges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-bold dark:text-white">What People Are Saying</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Read stories from volunteer coordinators and restaurant owners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-2xl border dark:border-slate-800">
            <p className="text-sm italic text-gray-600 dark:text-slate-350 leading-relaxed">
              "We used to throw away kilograms of excess buffet lunch. With FoodShare+, we list it within minutes, and an NGO accepts it. It is fulfilling to watch meals go to hungry children rather than the landfill."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center font-bold text-emerald-700">
                S
              </div>
              <div>
                <h4 className="font-bold text-sm dark:text-white">Srinivas</h4>
                <p className="text-xs text-gray-400">Owner, Spice & Sizzle Restro</p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-2xl border dark:border-slate-800">
            <p className="text-sm italic text-gray-600 dark:text-slate-350 leading-relaxed">
              "Tracking donation expiry has been a game changer. The live timer alerts our volunteers to prioritize quick pickups. In the last month alone, we delivered over 1,200 meals using this system."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center font-bold text-sky-700">
                P
              </div>
              <div>
                <h4 className="font-bold text-sm dark:text-white">Padma</h4>
                <p className="text-xs text-gray-400">Coordinator, Hope Foundation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
};

export default Home;
