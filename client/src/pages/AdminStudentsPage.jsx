import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import {
  FiUsers,
  FiSearch,
  FiAward,
  FiLayers,
  FiClock,
  FiEye,
  FiDownload,
  FiArrowLeft,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('streak');

  // Drill-down Modal state
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [studentDetail, setStudentDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/students');
      setStudents(res.data.students || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch student progress records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch individual student drill-down dossier
  const handleOpenDossier = async (studentId) => {
    try {
      setSelectedStudentId(studentId);
      setDetailLoading(true);
      const res = await api.get(`/admin/students/${studentId}`);
      setStudentDetail(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not load student detailed report.');
      setSelectedStudentId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDossier = () => {
    setSelectedStudentId(null);
    setStudentDetail(null);
  };

  // Filtered & Sorted Students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q)
      );
    }

    // Status / Performance filter
    if (statusFilter === 'active') {
      result = result.filter((s) => s.status === 'Active');
    } else if (statusFilter === 'support') {
      result = result.filter((s) => s.averageScore < 50 && s.quizzesTaken > 0);
    } else if (statusFilter === 'high') {
      result = result.filter((s) => s.averageScore >= 70);
    }

    // Sort order
    if (sortBy === 'streak') {
      result.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else if (sortBy === 'quizzes') {
      result.sort((a, b) => (b.quizzesTaken || 0) - (a.quizzesTaken || 0));
    } else if (sortBy === 'score') {
      result.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0));
    } else if (sortBy === 'cards') {
      result.sort((a, b) => (b.cardsReviewed || 0) - (a.cardsReviewed || 0));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return result;
  }, [students, searchQuery, statusFilter, sortBy]);

  // Aggregate KPI Calculations
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const totalCardsReviewed = students.reduce((acc, s) => acc + (s.cardsReviewed || 0), 0);
  const totalQuizzes = students.reduce((acc, s) => acc + (s.quizzesTaken || 0), 0);
  const avgClassScore =
    totalQuizzes > 0
      ? Math.round(
          students
            .filter((s) => s.quizzesTaken > 0)
            .reduce((acc, s) => acc + s.averageScore, 0) /
            (students.filter((s) => s.quizzesTaken > 0).length || 1)
        )
      : 0;

  // Export to CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No student data to export.');
      return;
    }

    const headers = ['Name', 'Email', 'Joined Date', 'Current Streak', 'Cards Reviewed', 'Quizzes Taken', 'Avg Score %', 'Status'];
    const rows = students.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.email}"`,
      new Date(s.createdAt).toLocaleDateString(),
      s.streak || 0,
      s.cardsReviewed || 0,
      s.quizzesTaken || 0,
      `${s.averageScore || 0}%`,
      s.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_revision_student_progress_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Student report downloaded as CSV');
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading student progress data..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchStudents} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 space-y-8 animate-fade-in">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </Link>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Administrative Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
            Student Progress & Performance
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time tracking of student revision streaks, flashcard mastery, and exam quiz accuracy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm min-h-[44px]"
          >
            <FiDownload className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Total Students
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FiUsers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            {totalStudents}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            {activeStudents} active this week
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Cards Mastered
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FiLayers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            {totalCardsReviewed}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            SM-2 spaced reviews completed
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Quizzes Taken
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <FiAward className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            {totalQuizzes}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Total student evaluations
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Class Avg Accuracy
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FiTrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">
            {avgClassScore}%
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
            Overall student quiz performance
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Students</option>
              <option value="active">Active (Past 3 Days)</option>
              <option value="high">High Achievers (≥ 70%)</option>
              <option value="support">Needs Support (&lt; 50%)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-2 px-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-xs font-medium text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="streak">Highest Streak</option>
              <option value="score">Highest Quiz Score</option>
              <option value="quizzes">Most Quizzes Taken</option>
              <option value="cards">Most Cards Reviewed</option>
              <option value="newest">Recently Joined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            Enrolled Students ({filteredStudents.length})
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Admin accounts are private and excluded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-750 text-gray-500 dark:text-gray-400 uppercase text-[11px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-6">Student</th>
                <th className="py-3 px-4">Streak</th>
                <th className="py-3 px-4">Cards Studied</th>
                <th className="py-3 px-4">Quizzes Taken</th>
                <th className="py-3 px-4">Avg Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-gray-400">
                    No students found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const scoreColor =
                    s.quizzesTaken === 0
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      : s.averageScore >= 70
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      : s.averageScore >= 50
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                      : 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400';

                  const statusColor =
                    s.status === 'Active'
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : s.status === 'Recent'
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';

                  return (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50/80 dark:hover:bg-gray-750/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                            {s.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              {s.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {s.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-gray-800 dark:text-gray-200">
                          🔥 {s.streak || 0} <span className="text-xs font-normal text-gray-400">days</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {s.cardsReviewed || 0}
                      </td>

                      <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                        {s.quizzesTaken || 0}
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${scoreColor}`}>
                          {s.quizzesTaken === 0 ? 'No Quizzes' : `${s.averageScore}%`}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${statusColor}`}>
                          {s.status}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleOpenDossier(s._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-xs font-bold transition-all"
                        >
                          <FiEye className="w-3.5 h-3.5" />
                          <span>View Progress</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Student Drill-Down Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-750/30">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-primary-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                  {studentDetail?.student?.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {studentDetail?.student?.name || 'Loading Student...'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {studentDetail?.student?.email} • Student ID: {selectedStudentId.slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseDossier}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {detailLoading ? (
                <div className="py-16">
                  <LoadingSpinner message="Loading student study metrics..." />
                </div>
              ) : studentDetail ? (
                <>
                  {/* Performance Summary Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Current Streak
                      </span>
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                        🔥 {studentDetail.student.streak} days
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Flashcards Reviewed
                      </span>
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                        {studentDetail.metrics.cardsReviewed}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Quizzes Attempted
                      </span>
                      <div className="text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                        {studentDetail.metrics.quizzesTaken}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700">
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Avg Quiz Score
                      </span>
                      <div className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mt-1">
                        {studentDetail.metrics.avgScore}%
                      </div>
                    </div>
                  </div>

                  {/* Subject Breakdown */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                      Subject Performance Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {studentDetail.subjectBreakdown.map((subj) => (
                        <div
                          key={subj.subjectId}
                          className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                              <span>{subj.icon}</span> {subj.name}
                            </span>
                            <span className="font-extrabold text-primary-600 dark:text-primary-400">
                              {subj.attemptsCount > 0 ? `${subj.accuracy}%` : 'Not attempted'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-primary-600 h-full rounded-full transition-all"
                              style={{ width: `${subj.accuracy}%` }}
                            />
                          </div>
                          <div className="text-[11px] text-gray-400">
                            {subj.attemptsCount} evaluation{subj.attemptsCount === 1 ? '' : 's'} recorded
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Quiz Attempts */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                      Recent Quiz Submissions
                    </h4>
                    {studentDetail.attempts.length === 0 ? (
                      <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-750/40 text-center text-xs text-gray-400">
                        No quiz attempts recorded for this student yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {studentDetail.attempts.slice(0, 5).map((att) => {
                          const pct = Math.round((att.score / (att.total || 1)) * 100);
                          return (
                            <div
                              key={att._id}
                              className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750/30 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-lg">{att.subject?.icon || '📝'}</span>
                                <div>
                                  <div className="font-semibold text-gray-800 dark:text-gray-200">
                                    {att.subject?.name || 'Subject Quiz'}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {new Date(att.createdAt).toLocaleDateString()} • {att.durationSec ? `${att.durationSec}s` : 'Timed'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-extrabold text-gray-900 dark:text-white">
                                  {att.score} / {att.total}
                                </div>
                                <span
                                  className={`text-[10px] font-bold ${
                                    pct >= 70
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : pct >= 50
                                      ? 'text-amber-600 dark:text-amber-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}
                                >
                                  {pct}% accuracy
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-750/30 flex justify-end">
              <button
                onClick={handleCloseDossier}
                className="px-5 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-bold transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

