import React from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiHelpCircle, FiChevronRight } from 'react-icons/fi';

export default function SubjectCard({ subject }) {
  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all hover:border-primary-400 dark:hover:border-primary-500 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <span className="text-3xl p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50">
            {subject.icon || '📚'}
          </span>
          <span className="text-xs font-medium text-gray-400 group-hover:text-primary-500 transition-colors">
            <FiChevronRight className="w-5 h-5" />
          </span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {subject.name}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
          {subject.description || 'Comprehensive syllabus revision and exam preparation.'}
        </p>
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1.5">
          <FiLayers className="w-3.5 h-3.5 text-primary-500" />
          <span>{subject.cardCount || 0} cards</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiHelpCircle className="w-3.5 h-3.5 text-accent-500" />
          <span>{subject.questionCount || 0} MCQs</span>
        </div>
      </div>
    </div>
  );
}

