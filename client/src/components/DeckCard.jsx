import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiPlay, FiDownload, FiTrash2 } from 'react-icons/fi';

export default function DeckCard({ deck, isOwner, onExport, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
            {deck.subject?.icon || '📚'} {deck.subject?.name || 'General'}
          </span>
          <div className="flex items-center gap-1">
            {onExport && (
              <button
                onClick={() => onExport(deck)}
                title="Export Deck JSON"
                aria-label="Export Deck JSON"
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
              </button>
            )}
            {isOwner && onDelete && (
              <button
                onClick={() => onDelete(deck)}
                title="Delete Deck"
                aria-label="Delete Deck"
                className="p-1.5 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          {deck.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {deck.description || 'Practice flashcards in this deck using spaced repetition.'}
        </p>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <FiLayers className="w-4 h-4 text-primary-500" />
          <span>{deck.cardCount || 0} cards</span>
        </div>
        <Link
          to={`/flashcards/${deck._id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <FiPlay className="w-3.5 h-3.5" />
          <span>Study</span>
        </Link>
      </div>
    </div>
  );
}

