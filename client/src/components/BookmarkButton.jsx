import React from 'react';
import { FiBookmark } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';

export default function BookmarkButton({ isBookmarked, onToggle, loading = false }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={(e) => {
        e.stopPropagation();
        if (onToggle) onToggle();
      }}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this item'}
      className={`p-2 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center ${
        isBookmarked
          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100'
          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {isBookmarked ? (
        <FaBookmark className="w-5 h-5 transition-transform scale-110" />
      ) : (
        <FiBookmark className="w-5 h-5 transition-transform" />
      )}
    </button>
  );
}

