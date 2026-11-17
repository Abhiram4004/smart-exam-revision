import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import FlashCard from '../components/FlashCard';
import BookmarkButton from '../components/BookmarkButton';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import useSwipe from '../hooks/useSwipe';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiRotateCcw,
  FiZap,
  FiBookOpen,
  FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DailyRevisionPage() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewedCount, setReviewedCount] = useState(0);

  const fetchDueCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/cards/due');
      setCards(res.data.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch due flashcards for today.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDueCards();
  }, []);

  const handleNext = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  }, [cards.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  const swipeRef = useSwipe(handleNext, handlePrev);

  const handleReview = async (quality) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await api.post(`/cards/${currentCard._id}/review`, { quality });
      toast.success(quality >= 3 ? 'Mastered! Card interval increased.' : 'Needs Review! Scheduled for tomorrow.');
      setReviewedCount((prev) => prev + 1);

      // Remove reviewed card from the due queue
      const updated = cards.filter((_, idx) => idx !== currentIndex);
      setCards(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      setIsFlipped(false);
    } catch (err) {
      toast.error('Failed to log review.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Building your smart daily revision session..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDueCards} />;
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 flex items-center gap-1.5">
          <FiZap className="w-3.5 h-3.5" />
          <span>Spaced Repetition Active</span>
        </span>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md">
        <h1 className="text-xl sm:text-2xl font-extrabold mb-1">
          Smart Daily Revision Session
        </h1>
        <p className="text-xs sm:text-sm text-blue-100">
          The SM-2 algorithm selects flashcards whose optimal recall interval is due today.
        </p>
        <div className="flex items-center gap-4 mt-4 text-xs font-semibold">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
            Remaining Due: <span className="font-extrabold text-white">{cards.length}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg">
            Reviewed Today: <span className="font-extrabold text-emerald-300">{reviewedCount}</span>
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          icon={FiZap}
          title="All Caught Up for Today! 🎉"
          description="You have completed all spaced repetition flashcards due right now. Ready for an exam quiz?"
          actionLabel="Take a Practice Quiz"
          onAction={() => navigate('/quiz')}
        />
      ) : (
        <div ref={swipeRef} className="space-y-6">
          <div className="relative">
            <FlashCard
              front={currentCard.front}
              back={currentCard.back}
              subject={currentCard.subject?.name}
              topic={currentCard.topic}
              isFlipped={isFlipped}
              onFlip={setIsFlipped}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              <FiChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReview(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px]"
              >
                <FiRotateCcw className="w-3.5 h-3.5" />
                <span>Need Review</span>
              </button>
              <button
                onClick={() => handleReview(4)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px]"
              >
                <FiCheck className="w-3.5 h-3.5" />
                <span>Known</span>
              </button>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

