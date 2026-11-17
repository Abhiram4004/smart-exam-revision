import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ProgressRing from '../components/ProgressRing';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  FiCheckCircle,
  FiBookOpen,
  FiAward,
  FiZap,
  FiTrendingUp,
  FiAlertTriangle,
  FiArrowRight,
  FiLayers
} from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ProgressPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/progress/dashboard');
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch revision progress analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen message="Compiling study metrics and charts..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'No progress data found.'} onRetry={fetchProgress} />;
  }

  const { overallStats, perSubject = [], streak, last7Days = [], weakTopics = [], dailyGoal } = data;

  // Chart 1: Last 7 days activity
  const activityLabels = last7Days.map((d) => {
    const parts = d.date.split('-');
    return `${parts[1]}/${parts[2]}`;
  });

  const activityChartData = {
    labels: activityLabels,
    datasets: [
      {
        label: 'Cards Reviewed',
        data: last7Days.map((d) => d.cardsReviewed),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderRadius: 8
      },
      {
        label: 'Quizzes Taken',
        data: last7Days.map((d) => d.quizzesTaken),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderRadius: 8
      }
    ]
  };

  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: 'bold' }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 5 }
      }
    }
  };

  // Chart 2: Per-Subject Accuracy
  const subjectChartData = {
    labels: perSubject.map((s) => s.subject.name),
    datasets: [
      {
        label: 'Accuracy %',
        data: perSubject.map((s) => s.accuracy),
        backgroundColor: perSubject.map((s) =>
          s.accuracy >= 75 ? 'rgba(16, 185, 129, 0.8)' : s.accuracy >= 50 ? 'rgba(245, 158, 11, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderRadius: 8
      }
    ]
  };

  const subjectChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    }
  };

  const totalMastered = perSubject.reduce((acc, s) => acc + (s.cardsMastered || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <FiTrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          <span>Progress & Analytics Dashboard</span>
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Detailed breakdown of your study consistency, accuracy by subject, and spaced repetition mastery.
        </p>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={FiCheckCircle}
          label="Total Cards Reviewed"
          value={overallStats.totalCardsReviewed}
          subtitle="Cumulative flashcard flips"
          color="primary"
        />
        <StatsCard
          icon={FiBookOpen}
          label="Quizzes Completed"
          value={overallStats.totalQuizzes}
          subtitle="Self-assessment sessions"
          color="indigo"
        />
        <StatsCard
          icon={FiAward}
          label="Average Accuracy"
          value={`${overallStats.averageScore}%`}
          subtitle="Across all quiz attempts"
          color="emerald"
        />
        <StatsCard
          icon={FiZap}
          label="Current Streak"
          value={`${streak.current} Days`}
          subtitle={streak.studiedToday ? 'Active today!' : 'Review today to extend!'}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: 7-Day Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Last 7 Days Study Activity
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Daily frequency of flashcards flipped and quizzes completed
          </p>
          <div className="h-64">
            <Bar data={activityChartData} options={activityChartOptions} />
          </div>
        </div>

        {/* Chart 2: Subject Accuracy */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            Quiz Accuracy by Subject
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Benchmark performance per university course module
          </p>
          <div className="h-64">
            <Bar data={subjectChartData} options={subjectChartOptions} />
          </div>
        </div>
      </div>

      {/* Mastered Cards & Daily Goal Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mastered cards */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              <FiLayers className="w-4 h-4" />
              <span>Spaced Repetition Mastery</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {totalMastered} Cards
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
              Cards with review intervals of 21+ days are classified as long-term memorized.
            </p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl">
            🧠
          </div>
        </div>

        {/* Daily Goal */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block mb-1">
              Today's Goal Progress
            </span>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {dailyGoal?.completed || 0} / {dailyGoal?.target || 20}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Target cards to review before midnight
            </p>
          </div>
          <ProgressRing
            progress={dailyGoal?.percentage || 0}
            size={84}
            strokeWidth={8}
            color="#2563eb"
            label="Daily"
          />
        </div>
      </div>

      {/* Weak Topics Identification (Uniqueness feature) */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FiAlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Detected Weak Topics (Accuracy &lt; 60%)
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Algorithmically identified from recent quiz submissions to direct your revision focus
              </p>
            </div>
          </div>
        </div>

        {weakTopics.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
            🎉 Excellent! No weak topics detected. All recent quiz areas have accuracy above 60%.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {weakTopics.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    {item.topic}
                  </span>
                  <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                    Accuracy: {item.accuracy}%
                  </span>
                </div>
                <button
                  onClick={() => navigate('/quiz')}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

