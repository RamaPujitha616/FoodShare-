import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const CountdownTimer = ({ expiryTime, donationStatus }) => {
  const [timeLeft, setTimeLeft] = useState(0); // in ms
  const [timerString, setTimerString] = useState('');
  const [freshness, setFreshness] = useState('Fresh'); // Fresh, Expiring Soon, Expired

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(expiryTime).getTime() - Date.now();
      setTimeLeft(difference);

      if (difference <= 0) {
        setTimerString('Expired');
        setFreshness('Expired');
        return;
      }

      // Convert difference to hours/minutes/seconds
      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      const hourString = hours > 0 ? `${hours}h ` : '';
      const minString = minutes > 0 ? `${minutes}m ` : '';
      const secString = `${seconds}s`;

      setTimerString(`${hourString}${minString}${secString}`);

      // FRESHNESS CLASSIFICATION
      // > 3 hours -> Fresh
      // 1 to 3 hours -> Expiring Soon
      // < 1 hour -> Expired / Cannot accept
      const threeHoursInMs = 3 * 60 * 60 * 1000;
      const oneHourInMs = 60 * 60 * 1000;

      if (difference > threeHoursInMs) {
        setFreshness('Fresh');
      } else if (difference > oneHourInMs) {
        setFreshness('Expiring Soon');
      } else {
        setFreshness('Expired');
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  // If the donation is already delivered, we don't need countdown, just show completion status
  if (donationStatus === 'Delivered') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-150 px-2.5 py-0.5 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-300">
        <CheckCircle size={12} /> Delivered
      </span>
    );
  }

  if (donationStatus === 'Expired' || freshness === 'Expired') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
        <XCircle size={12} /> Expired
      </span>
    );
  }

  const badgeColors = {
    Fresh: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/30',
    'Expiring Soon': 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/30',
  };

  const icons = {
    Fresh: <CheckCircle size={12} className="text-emerald-500" />,
    'Expiring Soon': <AlertTriangle size={12} className="text-amber-500 animate-pulse" />,
  };

  return (
    <div className="flex flex-col gap-1 items-start">
      <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColors[freshness] || 'bg-gray-100 text-gray-800'}`}>
        {icons[freshness]}
        <span>{freshness}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
        <Clock size={12} />
        <span>{timerString} left</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
