import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import FlashCard from '../components/FlashCard';
import BookmarkButton from '../components/BookmarkButton';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import useSwipe from '../hooks/useSwipe';
import {
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiTrash2,
  FiCheck,
  FiRotateCcw,
  FiArrowLeft
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function DeckStudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  // Add Card Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cardFront, setCardFront] = useState('');
  const [cardBack, setCardBack] = useState('');
  const [cardTopic, setCardTopic] = useState('');
  const [savingCard, setSavingCard] = useState(false);

  const fetchDeckAndCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/decks/${deckId}`);
      setDeck(res.data.deck);
      setCards(res.data.cards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load flashcard deck.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeckAndCards();
  }, [deckId]);

  // Check if current card is bookmarked
  const checkBookmark = useCallback(async () => {
    if (!cards[currentIndex]) return;
    try {
      const res = await api.get('/bookmarks?type=flashcard');
      const bms = res.data.bookmarks || [];
      const match = bms.some((b) => b.refId === cards[currentIndex]._id);
      setIsBookmarked(match);
    } catch (err) {
      console.error('Bookmark check failed', err);
    }
  }, [cards, currentIndex]);

  useEffect(() => {
    checkBookmark();
  }, [checkBookmark]);

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

  // Keyboard navigation (Left / Right arrows, Space to flip)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (addModalOpen) return;
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, addModalOpen]);

  // Swipe support on mobile
  const swipeRef = useSwipe(handleNext, handlePrev);

  // Review card with SM-2 (quality: 4 for Known, 1 for Need Review)
  const handleReview = async (quality) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      await api.post(`/cards/${currentCard._id}/review`, { quality });
      toast.success(quality >= 3 ? 'Marked as Known! Scheduled for later.' : 'Need Review! Scheduled for soon.');
      handleNext();
    } catch (err) {
      toast.error('Failed to submit card review.');
    }
  };

  // Toggle bookmark
  const handleToggleBookmark = async () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    try {
      setBookmarkLoading(true);
      const res = await api.post('/bookmarks/toggle', {
        type: 'flashcard',
        refId: currentCard._id
      });
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.bookmarked ? 'Card bookmarked!' : 'Bookmark removed.');
    } catch (err) {
      toast.error('Failed to toggle bookmark.');
    } finally {
      setBookmarkLoading(false);
    }
  };

  // Add Card
  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardFront || !cardBack) {
      toast.error('Both front and back are required.');
      return;
    }

    try {
      setSavingCard(true);
      const res = await api.post('/cards', {
        front: cardFront,
        back: cardBack,
        topic: cardTopic,
        deck: deckId,
        subject: deck.subject?._id || deck.subject
      });
      toast.success('Card added to deck!');
      setCards([...cards, res.data.card]);
      setAddModalOpen(false);
      setCardFront('');
      setCardBack('');
      setCardTopic('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add card.');
    } finally {
      setSavingCard(false);
    }
  };

  // Delete Card
  const handleDeleteCard = async () => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;
    if (!window.confirm('Delete this flashcard?')) return;

    try {
      await api.delete(`/cards/${currentCard._id}`);
      toast.success('Card deleted.');
      const updated = cards.filter((c) => c._id !== currentCard._id);
      setCards(updated);
      if (currentIndex >= updated.length) {
        setCurrentIndex(Math.max(0, updated.length - 1));
      }
      setIsFlipped(false);
    } catch (err) {
      toast.error('Failed to delete card.');
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Opening study deck..." />;
  }

  if (error || !deck) {
    return <ErrorState message={error || 'Deck not found.'} onRetry={fetchDeckAndCards} />;
  }

  const isOwner = deck.owner?._id === user?._id || deck.owner === user?._id;
  const currentCard = cards[currentIndex];
  const progressPercent = cards.length > 0 ? ((currentIndex + 1) / cards.length) * 100 : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-6 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/flashcards"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </Link>

        {isOwner && (
          <button
            onClick={() => setAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-xs font-bold hover:bg-primary-100 transition-colors"
          >
            <FiPlus className="w-4 h-4" /> Add Card
          </button>
        )}
      </div>

      {/* Deck Header & Progress Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
            {deck.subject?.icon || '📚'} {deck.subject?.name || 'Subject'}
          </span>
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
            Card {cards.length > 0 ? currentIndex + 1 : 0} of {cards.length}
          </span>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          {deck.name}
        </h1>

        {/* Progress bar track */}
        <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
          <div
            className="bg-primary-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Card Study Area */}
      {cards.length === 0 ? (
        <EmptyState
          title="This Deck is Empty"
          description="Add your first flashcard to start studying with spaced repetition."
          actionLabel={isOwner ? 'Add First Flashcard' : null}
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div ref={swipeRef} className="space-y-6">
          {/* Card Component with Actions */}
          <div className="relative">
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1">
              <BookmarkButton
                isBookmarked={isBookmarked}
                onToggle={handleToggleBookmark}
                loading={bookmarkLoading}
              />
              {isOwner && (
                <button
                  onClick={handleDeleteCard}
                  aria-label="Delete this card"
                  className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              )}
            </div>

            <FlashCard
              front={currentCard.front}
              back={currentCard.back}
              subject={deck.subject?.name}
              topic={currentCard.topic}
              isFlipped={isFlipped}
              onFlip={setIsFlipped}
            />
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrev}
              aria-label="Previous card"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              <FiChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Spaced Repetition Marking Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReview(1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-all shadow-sm active:scale-95 min-h-[44px]"
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
              aria-label="Next card"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm active:scale-95 min-h-[44px]"
            >
              Next <FiChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center text-[11px] text-gray-400 dark:text-gray-500">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">←</kbd> and <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">→</kbd> to navigate, or swipe horizontally on mobile.
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Flashcard to Deck"
      >
        <form onSubmit={handleAddCard} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Front (Concept / Question) *
            </label>
            <textarea
              required
              rows="3"
              value={cardFront}
              onChange={(e) => setCardFront(e.target.value)}
              placeholder="e.g. What is the difference between let and const in JavaScript?"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Back (Explanation / Answer) *
            </label>
            <textarea
              required
              rows="4"
              value={cardBack}
              onChange={(e) => setCardBack(e.target.value)}
              placeholder="e.g. let allows re-assignment and has block scope; const prevents re-assignment..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Topic Tag (Optional)
            </label>
            <input
              type="text"
              value={cardTopic}
              onChange={(e) => setCardTopic(e.target.value)}
              placeholder="e.g. ES6 Features"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingCard}
              className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold shadow-md active:scale-95 disabled:opacity-50"
            >
              {savingCard ? 'Saving...' : 'Add Flashcard'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

