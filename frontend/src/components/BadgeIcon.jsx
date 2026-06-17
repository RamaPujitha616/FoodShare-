import React from 'react';

const BadgeIcon = ({ rank, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const badgeStyles = {
    Bronze: {
      bg: 'from-amber-700 to-amber-500',
      border: 'border-amber-600',
      emoji: '🥉',
      textColor: 'text-amber-800 dark:text-amber-200',
    },
    Silver: {
      bg: 'from-slate-400 to-slate-200',
      border: 'border-slate-300',
      emoji: '🥈',
      textColor: 'text-slate-700 dark:text-slate-300',
    },
    Gold: {
      bg: 'from-yellow-500 to-amber-300',
      border: 'border-yellow-400',
      emoji: '🥇',
      textColor: 'text-yellow-800 dark:text-yellow-200',
    },
    Platinum: {
      bg: 'from-teal-300 to-sky-200',
      border: 'border-teal-400',
      emoji: '👑',
      textColor: 'text-teal-800 dark:text-teal-200',
    },
    None: {
      bg: 'from-gray-200 to-gray-100 dark:from-slate-800 dark:to-slate-700',
      border: 'border-gray-300 dark:border-slate-600',
      emoji: '🌱',
      textColor: 'text-gray-500 dark:text-gray-400',
    },
  };

  const style = badgeStyles[rank] || badgeStyles.None;
  const classes = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br ${style.bg} border-2 ${style.border} shadow-md ${classes.split(' ')[0]} ${classes.split(' ')[1]}`}
        title={`${rank} Badge`}
      >
        <span className="select-none">{style.emoji}</span>
      </div>
      {size !== 'sm' && (
        <span className={`mt-1 font-semibold text-xs ${style.textColor}`}>
          {rank === 'None' ? 'Newbie' : `${rank} Donor`}
        </span>
      )}
    </div>
  );
};

export default BadgeIcon;
