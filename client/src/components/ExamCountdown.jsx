import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';

export default function ExamCountdown({ examDate }) {
  if (!examDate) {
    return (
      <div className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <FiCalendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Exam Date Countdown</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Set your exam target date in Settings</p>
          </div>
        </div>
        <Link
          to="/settings"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline px-3 py-1.5 rounded-lg bg-indigo-100/60 dark:bg-indigo-900/40"
        >
          Set Date
        </Link>
      </div>
    );
  }

  const target = new Date(examDate);
  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isPast = diffDays < 0;
  const isToday = diffDays === 0;

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 dark:from-blue-950/40 dark:to-purple-950/40 border border-blue-200 dark:border-blue-800/60 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20 shrink-0">
          <FiClock className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Target Exam Date
          </span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {target.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div className="text-right">
        {isPast ? (
          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Exam completed</span>
        ) : isToday ? (
          <span className="text-base font-extrabold text-red-600 dark:text-red-400 animate-pulse">Exam Today!</span>
        ) : (
          <div>
            <span className="text-2xl font-extrabold text-primary-600 dark:text-primary-400">
              {diffDays}
            </span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block">
              day{diffDays === 1 ? '' : 's'} remaining
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

