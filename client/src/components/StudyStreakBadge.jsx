import React from 'react';
import { FiZap } from 'react-icons/fi';

export default function StudyStreakBadge({ streak = 0, dailyGoal, todayProgress }) {
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 dark:from-amber-950/40 dark:to-orange-950/40 border border-orange-200 dark:border-orange-800/60 rounded-2xl p-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-orange-500/20 shrink-0">
        🔥
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-gray-900 dark:text-white">
            {streak} Day{streak === 1 ? '' : 's'}
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200">
            Streak
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {todayProgress !== undefined && dailyGoal
            ? `${todayProgress} / ${dailyGoal} cards reviewed today`
            : streak > 0
            ? 'Keep revising daily to preserve your streak!'
            : 'Start revising today to ignite your streak!'}
        </p>
      </div>
    </div>
  );
}

