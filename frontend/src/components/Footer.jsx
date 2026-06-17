import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🥗</span>
              <span className="bg-gradient-to-r from-emerald-450 to-teal-400 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                FOODSHARE+
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              Connecting surplus food donors with NGOs and volunteer networks to feed communities in need, save waste, and combat climate impact.
            </p>
            
            {/* SDG Badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1 rounded bg-amber-900/50 border border-amber-800 px-2 py-1 text-[10px] font-bold text-amber-300">
                SDG 2: Zero Hunger
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-emerald-900/50 border border-emerald-800 px-2 py-1 text-[10px] font-bold text-emerald-300">
                SDG 3: Good Health
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-teal-900/50 border border-teal-800 px-2 py-1 text-[10px] font-bold text-teal-300">
                SDG 12: Responsible Consumption
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-250 mb-4 text-sm tracking-wider uppercase">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/leaderboard" className="hover:text-emerald-400 transition-colors">Leaderboard</Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="font-semibold text-slate-250 mb-4 text-sm tracking-wider uppercase">Contact</h3>
            <ul className="space-y-2.5 text-sm">
              <li>Email: <a href="mailto:ramapujitha.a@gmail.com" className="hover:text-emerald-400 transition-colors">ramapujitha.a@gmail.com</a></li>
              <li>Phone: +91 7207455662</li>
              <li>NGO Hub: Rama Pujitha, Visakhapatnam</li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FOODSHARE+ Alliance. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
