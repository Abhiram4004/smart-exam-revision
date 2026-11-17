import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm my-4">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        <FiChevronLeft className="w-4 h-4" /> Previous
      </button>

      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Page <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> of{' '}
        <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
      </span>

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
      >
        Next <FiChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

