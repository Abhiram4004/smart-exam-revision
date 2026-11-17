import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { FiBookOpen, FiClock, FiHelpCircle, FiPlay, FiAward, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function QuizSetupPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form setup
  const [selectedSubject, setSelectedSubject] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subjRes, attRes] = await Promise.all([
        api.get('/subjects'),
        api.get('/quiz/attempts?limit=5')
      ]);
      const loadedSubjects = subjRes.data.subjects || [];
      setSubjects(loadedSubjects);
      if (loadedSubjects.length > 0) {
        setSelectedSubject(loadedSubjects[0]._id);
      }
      setRecentAttempts(attRes.data.attempts || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load quiz options.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartQuiz = (e) => {
    e.preventDefault();
    if (!selectedSubject) {
      toast.error('Please choose a subject for your quiz.');
      return;
    }
    navigate(`/quiz/${selectedSubject}?count=${questionCount}&timer=${timerEnabled ? '1' : '0'}`);
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading quiz center..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchData} />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FiBookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span>Interactive Exam Quiz</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Test your comprehension with randomized multiple-choice questions, instant feedback, and detailed explanations.
        </p>
      </div>

      {/* Quiz Configuration Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleStartQuiz} className="space-y-6">
          {/* Subject Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-3">
              1. Choose Revision Subject
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((s) => {
                const isSelected = selectedSubject === s._id;
                return (
                  <button
                    key={s._id}
                    type="button"
                    onClick={() => setSelectedSubject(s._id)}
                    className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all min-h-[48px] ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 ring-2 ring-primary-500/20'
                        : 'bg-gray-50 dark:bg-gray-750 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    }`}
                  >
                    <span className="text-2xl">{s.icon || '📚'}</span>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{s.questionCount || 0} Questions available</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              2. Number of Questions
            </label>
            <div className="flex flex-wrap gap-2.5">
              {[5, 10, 15, 20].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuestionCount(num)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                    questionCount === num
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {num} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Timer Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">Exam Simulation Timer</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {timerEnabled ? 'Timed mode: 60 seconds per question' : 'Untimed mode: practice at your own pace'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={timerEnabled}
                onChange={(e) => setTimerEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Start Button */}
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-base font-bold shadow-lg shadow-primary-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 min-h-[48px]"
          >
            <FiPlay className="w-5 h-5" />
            <span>Start Practice Quiz Now</span>
          </button>
        </form>
      </div>

      {/* Recent Quiz Attempts */}
      {recentAttempts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Recent Quiz Attempts
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm divide-y divide-gray-100 dark:divide-gray-700">
            {recentAttempts.map((attempt) => {
              const percentage = Math.round((attempt.score / attempt.total) * 100);
              const isPassing = percentage >= 60;
              return (
                <div key={attempt._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isPassing ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {percentage}%
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {attempt.subject?.name || 'Subject Quiz'}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {attempt.score} of {attempt.total} correct • {new Date(attempt.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/quiz/result/${attempt._id}`}
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <span>View Review</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

