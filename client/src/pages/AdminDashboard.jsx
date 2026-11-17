import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  FiUsers,
  FiBook,
  FiLayers,
  FiHelpCircle,
  FiAward,
  FiArrowRight,
  FiSettings,
  FiPlus
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading administrator metrics..." />;
  }

  if (error || !stats) {
    return <ErrorState message={error || 'Failed to load admin stats.'} onRetry={fetchStats} />;
  }

  const quizzesLast7Days = stats.quizzesLast7Days || [];
  const chartData = {
    labels: quizzesLast7Days.map((q) => {
      const parts = q.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: [
      {
        label: 'Quizzes Taken Across Platform',
        data: quizzesLast7Days.map((q) => q.quizzes),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 8
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Faculty / Admin Portal
          </span>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            System Administration
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage course curriculum, monitor exam bank questions, and analyze student engagement.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/subjects"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm min-h-[44px]"
          >
            <span>Manage Subjects</span>
          </Link>
          <Link
            to="/admin/questions"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all min-h-[44px]"
          >
            <FiPlus className="w-4 h-4" />
            <span>Question Bank</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard icon={FiUsers} label="Total Students" value={stats.totalUsers} subtitle={`${stats.recentUsers || 0} in last 30d`} color="primary" />
        <StatsCard icon={FiBook} label="Subjects" value={stats.totalSubjects} subtitle="Curriculum modules" color="indigo" />
        <StatsCard icon={FiLayers} label="Flashcards" value={stats.totalCards} subtitle="SM-2 study items" color="emerald" />
        <StatsCard icon={FiHelpCircle} label="Exam MCQs" value={stats.totalQuestions} subtitle="Question bank size" color="amber" />
        <StatsCard icon={FiAward} label="Quizzes Taken" value={stats.totalQuizzes} subtitle="Total evaluations" color="purple" />
      </div>

      {/* 7-Day Quiz Volume Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          7-Day Platform Quiz Activity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Real-time count of student quiz submissions across all subjects
        </p>
        <div className="h-64">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/subjects"
          className="group p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-2xl">
              📚
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Subject Management
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Add, rename, or organize course syllabus subjects and modules
              </p>
            </div>
          </div>
          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/questions"
          className="group p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl">
              ❓
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Question Bank Editor
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Create and edit MCQs, 4 answer options, correct indices, and explanations
              </p>
            </div>
          </div>
          <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}

