import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({
  icon: Icon = FiInbox,
  title = 'Nothing here yet',
  description = 'Get started by creating something or revising available topics.',
  actionLabel,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm max-w-md mx-auto my-6">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 text-2xl">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-all shadow-md active:scale-95 min-h-[44px]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

