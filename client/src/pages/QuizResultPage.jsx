import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import QuestionCard from '../components/QuestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  FiAward,
  FiRotateCcw,
  FiCheckCircle,
  FiXCircle,
  FiShare2,
  FiArrowRight,
  FiClock,
  FiHome
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function QuizResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/quiz/attempts/${attemptId}`);
        setAttempt(res.data.attempt);
      } catch (err) {
        console.error(err);
        setError('Failed to load quiz results.');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attemptId]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Calculating your exam result..." />;
  }

  if (error || !attempt) {
    return <ErrorState message={error || 'Attempt not found.'} onRetry={() => navigate('/quiz')} />;
  }

  const score = attempt.score;
  const total = attempt.total;
  const percentage = Math.round((score / total) * 100);
  const wrongAnswers = attempt.answers?.filter((a) => !a.isCorrect) || [];

  let badgeColor = 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800';
  let resultMessage = 'Outstanding! You have mastered these exam topics.';
  if (percentage < 60) {
    badgeColor = 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800';
    resultMessage = 'Needs more revision. Review explanations below and retry wrong answers.';
  } else if (percentage < 80) {
    badgeColor = 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800';
    resultMessage = 'Good effort! Review the questions you missed to achieve an A grade.';
  }

  const handleShare = () => {
    const text = `I just scored ${percentage}% (${score}/${total}) on the ${attempt.subject?.name || 'SmartRevise'} exam revision quiz! 🎓`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success('Result copied to clipboard!');
    } else {
      toast(text);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-fade-in">
      {/* Result Summary Card */}
      <div className={`p-8 rounded-3xl border text-center shadow-lg ${badgeColor}`}>
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-md mb-4">
          <FiAward className="w-8 h-8" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-1">
          {percentage}%
        </h1>
        <p className="text-base font-bold text-gray-800 dark:text-gray-100">
          You answered {score} out of {total} correctly
        </p>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-md mx-auto">
          {resultMessage}
        </p>

        {attempt.durationSec && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-4">
            <FiClock className="w-4 h-4" />
            <span>Completed in {Math.round(attempt.durationSec)} seconds</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          <button
            onClick={() => navigate(`/quiz/${attempt.subject?._id || attempt.subject}?count=${total}`)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all min-h-[44px]"
          >
            <FiRotateCcw className="w-4 h-4" />
            <span>Retake Subject Quiz</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[44px]"
          >
            <FiShare2 className="w-4 h-4" />
            <span>Share Score</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm font-semibold border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all min-h-[44px]"
          >
            <FiHome className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Question Review & Explanations
          </h2>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {attempt.answers?.length || 0} Questions
          </span>
        </div>

        <div className="space-y-4">
          {attempt.answers?.map((ans, idx) => {
            const q = ans.question;
            if (!q) return null;

            return (
              <div key={idx} className="relative">
                <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                  <span>Q{idx + 1}</span>
                  {ans.isCorrect ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Correct
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 font-extrabold flex items-center gap-1">
                      <FiXCircle className="w-3.5 h-3.5" /> Incorrect
                    </span>
                  )}
                </div>

                <div className="pt-6">
                  <QuestionCard
                    questionText={q.questionText}
                    options={q.options}
                    selectedIndex={ans.selectedIndex}
                    showResult={true}
                    correctIndex={q.correctIndex}
                    explanation={q.explanation}
                    topic={q.topic}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

