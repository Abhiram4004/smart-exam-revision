import React from 'react';

export default function LoadingSpinner({ fullScreen = false, message = 'Loading...' }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin dark:border-primary-900 dark:border-t-primary-400"></div>
      {message && <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

