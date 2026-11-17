import React, { useState } from 'react';
import { FiRotateCw } from 'react-icons/fi';

export default function FlashCard({
  front,
  back,
  subject,
  topic,
  isFlipped: controlledFlipped,
  onFlip
}) {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped;

  const handleFlip = () => {
    if (onFlip) {
      onFlip(!isFlipped);
    } else {
      setInternalFlipped(!internalFlipped);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Flashcard: ${isFlipped ? 'Answer side' : 'Question side'}. Press Space or Enter to flip.`}
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      className="flip-card w-full max-w-xl mx-auto h-72 sm:h-80 cursor-pointer select-none outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 rounded-2xl"
    >
      <div className={`flip-card-inner relative w-full h-full duration-500 rounded-2xl ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of Card */}
        <div className="flip-card-front absolute inset-0 w-full h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300">
              {subject || 'General'}
            </span>
            {topic && (
              <span className="text-gray-500 dark:text-gray-400">
                {topic}
              </span>
            )}
          </div>

          <div className="my-auto text-center px-2">
            <span className="text-xs uppercase tracking-wider text-primary-500 font-bold block mb-2">Question / Concept</span>
            <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white leading-relaxed">
              {front}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <FiRotateCw className="w-3.5 h-3.5" />
            <span>Click or tap to reveal answer</span>
          </div>
        </div>

        {/* Back of Card */}
        <div className="flip-card-back absolute inset-0 w-full h-full bg-gradient-to-br from-primary-900 via-gray-900 to-indigo-950 text-white rounded-2xl border border-primary-500/30 shadow-xl p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-200 border border-primary-400/30">
              Answer & Explanation
            </span>
            {topic && <span className="text-primary-300/80">{topic}</span>}
          </div>

          <div className="my-auto overflow-y-auto max-h-48 px-2 text-center">
            <p className="text-base sm:text-lg font-medium text-gray-100 leading-relaxed">
              {back}
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-primary-300/70">
            <FiRotateCw className="w-3.5 h-3.5" />
            <span>Click or tap to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}

