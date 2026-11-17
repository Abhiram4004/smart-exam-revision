import React from 'react';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function QuestionCard({
  questionText,
  options = [],
  selectedIndex,
  onSelectOption,
  showResult = false,
  correctIndex,
  explanation,
  topic
}) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
      {topic && (
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 mb-3">
          {topic}
        </span>
      )}
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-snug">
        {questionText}
      </h3>

      <div className="space-y-3">
        {options.map((option, idx) => {
          const isSelected = selectedIndex === idx;
          const isCorrect = correctIndex === idx;

          let btnClass = 'w-full text-left p-4 rounded-xl text-sm sm:text-base font-medium transition-all border flex items-center justify-between min-h-[48px] ';

          if (!showResult) {
            if (isSelected) {
              btnClass += 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 text-primary-900 dark:text-primary-100 ring-2 ring-primary-500/20';
            } else {
              btnClass += 'bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700/60 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200';
            }
          } else {
            if (isCorrect) {
              btnClass += 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-100 ring-2 ring-emerald-500/30';
            } else if (isSelected && !isCorrect) {
              btnClass += 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-900 dark:text-red-100 ring-2 ring-red-500/30';
            } else {
              btnClass += 'bg-gray-50/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={showResult}
              onClick={() => onSelectOption && onSelectOption(idx)}
              className={btnClass}
            >
              <div className="flex items-center gap-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  isSelected ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{option}</span>
              </div>

              {showResult && isCorrect && (
                <FiCheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
              )}
              {showResult && isSelected && !isCorrect && (
                <FiXCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
      </div>

      {showResult && explanation && (
        <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-xs sm:text-sm text-blue-900 dark:text-blue-200">
          <span className="font-bold block mb-1">Explanation:</span>
          <p>{explanation}</p>
        </div>
      )}
    </div>
  );
}

