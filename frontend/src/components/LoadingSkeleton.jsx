import React from 'react';

export const CardSkeleton = () => {
  return (
    <div className="rounded-xl border border-gray-150 p-6 bg-white dark:border-slate-800 dark:bg-slate-850 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4"></div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
      </div>
      <div className="mt-6 flex justify-between gap-4">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3"></div>
      </div>
    </div>
  );
};

export const TableRowSkeleton = ({ cols = 5 }) => {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, idx) => (
        <td key={idx} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
};

export const StatsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} className="bg-white border border-gray-150 rounded-xl p-5 dark:bg-slate-850 dark:border-slate-800">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
};

const LoadingSkeleton = {
  CardSkeleton,
  TableRowSkeleton,
  StatsSkeleton,
};

export default LoadingSkeleton;
