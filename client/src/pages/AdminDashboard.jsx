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
  FiTrendingUp,
  FiEye,
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
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, studentsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/students')
      ]);
      setStats(statsRes.data);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch administrator analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading administrator metrics..." />;
  }

  if (error || !stats) {
    return <ErrorState message={error || 'Failed to load admin stats.'} onRetry={fetchDashboardData} />;
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
              Faculty / Admin Portal
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-xs text-gray-400">Restricted Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Administrative Control Center
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor student cohort progress, analyze quiz performance, and manage exam curriculum.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/admin/students"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md active:scale-95 transition-all min-h-[44px]"
          >
            <FiUsers className="w-4 h-4" />
            <span>Student Progress</span>
          </Link>
          <Link
            to="/admin/questions"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm min-h-[44px]"
          >
            <FiPlus className="w-4 h-4 text-primary-500" />
            <span>Question Bank</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          icon={FiUsers}
          label="Enrolled Students"
          value={stats.totalStudents || stats.totalUsers}
          subtitle={`${stats.recentUsers || 0} joined recently`}
          color="primary"
        />
        <StatsCard
          icon={FiTrendingUp}
          label="Class Avg Accuracy"
          value={`${stats.platformAverageScore || 0}%`}
          subtitle="Across all quizzes"
          color="amber"
        />
        <StatsCard
          icon={FiLayers}
          label="Cards Mastered"
          value={stats.totalCardsReviewed || stats.totalCards}
          subtitle="Flashcard revisions"
          color="emerald"
        />
        <StatsCard
          icon={FiHelpCircle}
          label="Exam MCQs"
          value={stats.totalQuestions}
          subtitle="In question bank"
          color="indigo"
        />
        <StatsCard
          icon={FiAward}
          label="Quizzes Completed"
          value={stats.totalQuizzes}
          subtitle="Total evaluations"
          color="purple"
        />
      </div>

      {/* Student Progress Overview Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Student Cohort Progress Preview
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Live snapshot of student study consistency, flashcards mastered, and quiz performance.
            </p>
          </div>
          <Link
            to="/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
          >
            <span>View All Enrolled Students</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold tracking-wider rounded-xl">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Cards Studied</th>
                <th className="py-3 px-4">Quizzes Taken</th>
                <th className="py-3 px-4">Avg Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {students.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-400 text-xs">
                    No student accounts enrolled yet.
                  </td>
                </tr>
              ) : (
                students.slice(0, 5).map((s) => (
                  <tr key={s._id} className="hover:bg-gray-50/60 dark:hover:bg-gray-750/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-xs">
                          {s.name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white text-xs">
                            {s.name}
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {s.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-bold text-gray-800 dark:text-gray-200">
                      🔥 {s.streak || 0}d
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {s.cardsReviewed || 0} cards
                    </td>

                    <td className="py-3.5 px-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {s.quizzesTaken || 0} quizzes
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                          s.quizzesTaken === 0
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                            : s.averageScore >= 70
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                            : s.averageScore >= 50
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                            : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {s.quizzesTaken === 0 ? 'None' : `${s.averageScore}%`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/admin/students"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        <FiEye className="w-3 h-3" />
                        <span>Inspect</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7-Day Quiz Volume Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
          7-Day Platform Quiz Activity
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Real-time count of student quiz submissions across all curriculum subjects
        </p>
        <div className="h-64">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/students"
          className="group p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl">
              👥
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Student Progress
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Full student roster, activity streaks, and quiz reports
              </p>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/subjects"
          className="group p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center text-xl">
              📚
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Subject Syllabus
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Organize course subjects and curriculum modules
              </p>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          to="/admin/questions"
          className="group p-5 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-500 shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl">
              ❓
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                Question Bank
              </h4>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                Manage MCQs, answer keys, and explanations
              </p>
            </div>
          </div>
          <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </div>
  );
}
