import React from 'react';

export default function StatsCard({ icon: Icon, label, value, subtitle, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400',
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400'
  };

  const badgeClass = colorMap[color] || colorMap.primary;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${badgeClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">
        {value}
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      )}
    </div>
  );
}

