import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { FiBookmark, FiTrash2, FiLayers, FiHelpCircle, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([]);
  const [typeFilter, setTypeFilter] = useState(''); // '' = all, 'flashcard', 'question'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = typeFilter ? `/bookmarks?type=${typeFilter}` : '/bookmarks';
      const res = await api.get(url);
      setBookmarks(res.data.bookmarks || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [typeFilter]);

  const handleRemove = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
      toast.success('Bookmark removed.');
    } catch (err) {
      toast.error('Failed to remove bookmark.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading bookmarked revision materials..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchBookmarks} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FiBookmark className="w-6 h-6 text-amber-500" />
          <span>Saved Bookmarks</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review difficult cards and important quiz questions you flagged for quick reference.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-3">
        {[
          { label: 'All Items', value: '' },
          { label: 'Flashcards', value: 'flashcard' },
          { label: 'Quiz Questions', value: 'question' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTypeFilter(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] ${
              typeFilter === tab.value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content list */}
      {bookmarks.length === 0 ? (
        <EmptyState
          icon={FiBookmark}
          title="No Bookmarks Saved Yet"
          description="Click the bookmark ribbon icon on any flashcard or quiz question to pin it here for rapid review."
          actionLabel="Browse Flashcards"
          onAction={() => window.location.href = '/flashcards'}
        />
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bm) => {
            const isCard = bm.type === 'flashcard';
            const item = bm.item;
            if (!item) return null;

            return (
              <div
                key={bm._id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      isCard
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                    }`}>
                      {isCard ? <FiLayers className="w-3 h-3" /> : <FiHelpCircle className="w-3 h-3" />}
                      <span>{isCard ? 'Flashcard' : 'Quiz Question'}</span>
                    </span>

                    {item.subject && (
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {item.subject.name || item.subject}
                      </span>
                    )}
                    {item.topic && (
                      <span className="text-xs text-gray-400">
                        • {item.topic}
                      </span>
                    )}
                  </div>

                  <p className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
                    {isCard ? item.front : item.questionText}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 bg-gray-50 dark:bg-gray-750 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Answer: </span>
                    {isCard ? item.back : item.explanation || item.options?.[item.correctIndex]}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleRemove(bm._id)}
                    aria-label="Remove bookmark"
                    title="Remove Bookmark"
                    className="p-2.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

