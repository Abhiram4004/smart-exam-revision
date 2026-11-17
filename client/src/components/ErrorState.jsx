import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading content.',
  onRetry
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-200 dark:border-red-900/50 max-w-md mx-auto my-6">
      <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
        <FiAlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-1">{title}</h3>
      <p className="text-sm text-red-700 dark:text-red-300 mb-5">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all shadow-md active:scale-95 min-h-[44px]"
        >
          <FiRefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}

