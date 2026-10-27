import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BadgeIcon from '../components/BadgeIcon';
import { TableRowSkeleton } from '../components/LoadingSkeleton';
import { Award, Medal, Trophy, Users, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await axios.get('/api/leaderboard');
        if (res.data.success) {
          setRankings(res.data.data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const topThree = rankings.slice(0, 3);
  const remainingRankings = rankings.slice(3);

  const getTrophyColor = (rank) => {
    if (rank === 1) return 'text-yellow-500 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20';
    if (rank === 2) return 'text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-900/20';
    return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20';
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex rounded-full bg-emerald-50 p-2 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450">
          <Trophy size={32} />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
          Community Leaderboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Celebrating our top donors and volunteer networks who are leading the fight against hunger and food waste.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-44 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
        </div>
      ) : rankings.length === 0 ? (
        <div className="glass p-12 rounded-2xl text-center space-y-4 dark:border-slate-800">
          <Users className="mx-auto h-12 w-12 text-gray-350 dark:text-gray-650" />
          <h3 className="text-lg font-bold dark:text-white">No Rankings Yet</h3>
          <p className="text-sm text-gray-550 dark:text-gray-405 max-w-xs mx-auto">
            Get involved, create or distribute donations to make it onto the board!
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 podium cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            
            {/* 2nd Place */}
            {topThree[1] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass border-2 border-slate-200 p-6 rounded-2xl text-center shadow-md dark:border-slate-800 flex flex-col items-center order-2 md:order-1 h-72 justify-between"
              >
                <div className={`p-3 rounded-2xl border ${getTrophyColor(2)} flex items-center justify-center`}>
                  <Medal size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg truncate max-w-[180px] dark:text-white mt-3">
                    {topThree[1].name}
                  </h3>
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800 uppercase tracking-wider dark:bg-slate-800 dark:text-slate-300">
                    {topThree[1].role === 'ngo' ? 'NGO' : 'Donor'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <BadgeIcon rank={topThree[1].badge} size="sm" />
                  <span className="text-2xl font-extrabold text-slate-650 dark:text-slate-200">
                    {topThree[1].points} <span className="text-xs font-semibold text-gray-400">pts</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="glass border-2 border-yellow-300 p-8 rounded-2xl text-center shadow-xl dark:border-slate-800 flex flex-col items-center order-1 md:order-2 h-80 justify-between relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-yellow-300 text-yellow-900 font-bold px-3 py-1 text-[10px] tracking-wide uppercase rounded-bl-xl">
                  Champion
                </div>
                <div className={`p-4 rounded-2xl border ${getTrophyColor(1)} flex items-center justify-center`}>
                  <Trophy size={36} />
                </div>
                <div>
                  <h3 className="font-black text-xl truncate max-w-[200px] dark:text-white mt-4">
                    {topThree[0].name}
                  </h3>
                  <span className="inline-flex rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold text-yellow-800 uppercase tracking-wider dark:bg-yellow-905/30 dark:text-yellow-350">
                    {topThree[0].role === 'ngo' ? 'NGO' : 'Donor'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <BadgeIcon rank={topThree[0].badge} size="sm" />
                  <span className="text-3xl font-black text-yellow-600 dark:text-yellow-450">
                    {topThree[0].points} <span className="text-xs font-semibold text-gray-400">pts</span>
                  </span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass border-2 border-amber-200 p-6 rounded-2xl text-center shadow-md dark:border-slate-800 flex flex-col items-center order-3 md:order-3 h-70 justify-between"
              >
                <div className={`p-3 rounded-2xl border ${getTrophyColor(3)} flex items-center justify-center`}>
                  <Medal size={28} />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg truncate max-w-[180px] dark:text-white mt-3">
                    {topThree[2].name}
                  </h3>
                  <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider dark:bg-amber-900/20 dark:text-amber-300">
                    {topThree[2].role === 'ngo' ? 'NGO' : 'Donor'}
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1.5 mt-2">
                  <BadgeIcon rank={topThree[2].badge} size="sm" />
                  <span className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">
                    {topThree[2].points} <span className="text-xs font-semibold text-gray-400">pts</span>
                  </span>
                </div>
              </motion.div>
            )}

          </div>

          {/* Remaining ranks in list table */}
          {remainingRankings.length > 0 && (
            <div className="glass rounded-2xl overflow-hidden shadow-md dark:border-slate-800">
              <table className="min-w-full divide-y divide-gray-150 dark:divide-slate-700">
                <thead className="bg-gray-50/50 dark:bg-slate-800/40">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-20">
                      Rank
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-28">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-36">
                      Badge
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400 w-36">
                      Impact Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150 dark:divide-slate-700">
                  {remainingRankings.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-650 dark:text-slate-400">
                        #{user.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-450 dark:text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${user.role === 'ngo' ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/20 dark:text-sky-350' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-350'}`}>
                          {user.role === 'ngo' ? 'NGO' : 'Donor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <BadgeIcon rank={user.badge} size="sm" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">
                            {user.badge === 'None' ? 'Newbie' : user.badge}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-extrabold text-emerald-650 dark:text-emerald-450">
                        {user.points} <span className="text-xs font-medium text-gray-400">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Leaderboard;
