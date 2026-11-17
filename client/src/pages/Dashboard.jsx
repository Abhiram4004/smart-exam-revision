import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ProgressRing from '../components/ProgressRing';
import StudyStreakBadge from '../components/StudyStreakBadge';
import ExamCountdown from '../components/ExamCountdown';
import SubjectCard from '../components/SubjectCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import { FiPlay, FiBookOpen, FiLayers, FiAlertCircle, FiArrowRight } from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [dueCardsCount, setDueCardsCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [progRes, subjRes, dueRes] = await Promise.all([
        api.get('/progress/dashboard'),
        api.get('/subjects'),
        api.get('/cards/due')
      ]);

      setProgressData(progRes.data);
      setSubjects(subjRes.data.subjects || []);
      setDueCardsCount(dueRes.data.count || 0);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to fetch dashboard data. Make sure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading revision dashboard..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboardData} />;
  }

  const streak = progressData?.streak?.current || user?.streak?.current || 0;
  const dailyGoal = progressData?.dailyGoal?.target || user?.settings?.dailyGoal || 20;
  const completedToday = progressData?.dailyGoal?.completed || 0;
  const goalPercentage = progressData?.dailyGoal?.percentage || 0;
  const weakTopics = progressData?.weakTopics || [];

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-6xl mx-auto px-4 sm:px-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-primary-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-sm mb-3">
            Smart Exam Preparation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-blue-100 mt-2 leading-relaxed">
            {dueCardsCount > 0
              ? `You have ${dueCardsCount} flashcard${dueCardsCount === 1 ? '' : 's'} scheduled for spaced review today.`
              : 'You are all caught up on due flashcards! Take a quick quiz or practice weak areas.'}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <Link
              to="/study"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-primary-700 hover:bg-blue-50 text-sm font-bold shadow-md transition-all active:scale-95 min-h-[44px]"
            >
              <FiPlay className="w-4 h-4" /> Start Daily Revision
            </Link>
            <Link
              to="/quiz"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700/60 hover:bg-blue-700/80 text-white text-sm font-semibold border border-white/20 transition-all min-h-[44px]"
            >
              <FiBookOpen className="w-4 h-4" /> Take Quiz
            </Link>
          </div>
        </div>

        {/* Decorative circle glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Metrics Row: Streak + Progress Ring + Exam Countdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StudyStreakBadge streak={streak} dailyGoal={dailyGoal} todayProgress={completedToday} />

        {/* Daily Goal Card with Progress Ring */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
              Daily Study Goal
            </span>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white">
              {completedToday} <span className="text-sm font-normal text-gray-400">/ {dailyGoal}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Cards reviewed today
            </p>
          </div>
          <ProgressRing progress={goalPercentage} size={84} strokeWidth={8} color="#2563eb" label="Goal" />
        </div>

        <ExamCountdown examDate={user?.examDate} />
      </div>

      {/* Weak Topics Alert (Uniqueness feature) */}
      {weakTopics.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Weak Topics Detected ({weakTopics.length})
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  Your quiz history shows scores below 60% in:{' '}
                  <span className="font-semibold text-amber-800 dark:text-amber-200">
                    {weakTopics.map((t) => t.topic).join(', ')}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/quiz')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 whitespace-nowrap min-h-[44px]"
            >
              <span>Practice Weak Areas</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Course Subjects Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Course Subjects
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select a subject to practice flashcards and multiple-choice quizzes
            </p>
          </div>
          <Link
            to="/flashcards"
            className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            <span>View All Decks</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subject) => (
            <Link key={subject._id} to={`/flashcards?subject=${subject._id}`}>
              <SubjectCard subject={subject} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

