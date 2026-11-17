import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  FiMoon,
  FiSun,
  FiTarget,
  FiCalendar,
  FiClock,
  FiLock,
  FiRefreshCw,
  FiTrash2,
  FiSave
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings values
  const [dailyGoal, setDailyGoal] = useState(20);
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [examDate, setExamDate] = useState('');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Confirm dialogs
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/settings');
        const s = res.data.settings || {};
        if (s.dailyGoal !== undefined) setDailyGoal(s.dailyGoal);
        if (s.timerEnabled !== undefined) setTimerEnabled(s.timerEnabled);
        if (s.theme) setTheme(s.theme);
        if (res.data.examDate) {
          setExamDate(new Date(res.data.examDate).toISOString().split('T')[0]);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [setTheme]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.put('/settings', {
        theme,
        dailyGoal,
        timerEnabled,
        examDate: examDate || null
      });
      if (user) {
        updateUser({
          ...user,
          settings: res.data.settings,
          examDate: res.data.examDate
        });
      }
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setChangingPassword(true);
      await api.put('/auth/password', { currentPassword, newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleResetProgress = async () => {
    try {
      setResetting(true);
      await api.post('/progress/reset');
      toast.success('Study progress and spaced repetition counters have been reset.');
      setResetDialogOpen(false);
    } catch (err) {
      toast.error('Failed to reset progress.');
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      await api.delete('/auth/account');
      toast.success('Account deleted successfully.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error('Failed to delete account.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading user preferences..." />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Application Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Configure your study targets, appearance, exam schedule, and security.
        </p>
      </div>

      {/* Main Study Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
          Study & Appearance Preferences
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center">
              {theme === 'dark' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Dark Mode</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Toggle dark visual theme for night revision</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
              theme === 'dark'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            {theme === 'dark' ? 'Dark Theme' : 'Light Theme'}
          </button>
        </div>

        {/* Daily Study Goal */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <FiTarget className="w-4 h-4 text-primary-500" />
              <span>Daily Card Review Goal: <span className="text-primary-600 dark:text-primary-400 text-sm">{dailyGoal} cards</span></span>
            </label>
          </div>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={dailyGoal}
            onChange={(e) => setDailyGoal(Number(e.target.value))}
            className="w-full accent-primary-600 cursor-pointer h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>5 cards (light)</span>
            <span>25 cards (standard)</span>
            <span>50 cards (intensive)</span>
          </div>
        </div>

        {/* Exam Target Date */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-indigo-500" />
            <span>Target Exam Date (for countdown)</span>
          </label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Exam Timer Setting */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-2xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 flex items-center justify-center">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Quiz Timer Default</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable countdown timer by default on quiz sessions</p>
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

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-md active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          <FiSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
        </button>
      </form>

      {/* Change Password Card */}
      <form onSubmit={handleChangePassword} className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3 flex items-center gap-2">
          <FiLock className="w-4 h-4 text-primary-600" />
          <span>Change Account Password</span>
        </h2>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              New Password (min 6)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={changingPassword}
          className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-gray-700 hover:bg-black dark:hover:bg-gray-600 text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 min-h-[44px]"
        >
          {changingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </form>

      {/* Danger Zone */}
      <div className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900/50 p-6 sm:p-8 space-y-4">
        <h2 className="text-base font-bold text-red-900 dark:text-red-200">
          Danger Zone
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Reset Study Progress</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Reset spaced repetition schedules, quiz scores, and streak back to zero</p>
          </div>
          <button
            type="button"
            onClick={() => setResetDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 min-h-[44px]"
          >
            <FiRefreshCw className="w-4 h-4" /> Reset Progress
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-red-100 dark:border-red-900/40">
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Delete Account</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your profile, created decks, flashcards, and revision logs</p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0 min-h-[44px]"
          >
            <FiTrash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        isOpen={resetDialogOpen}
        title="Reset Study Progress?"
        message="Are you sure you want to reset all your flashcard spaced repetition intervals, quiz attempt records, and activity logs? This cannot be undone."
        confirmText="Yes, Reset All Progress"
        isDanger={true}
        loading={resetting}
        onConfirm={handleResetProgress}
        onCancel={() => setResetDialogOpen(false)}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Your Account?"
        message="This will immediately and permanently erase your account, all created flashcard decks, cards, bookmarks, and quiz statistics. Are you absolutely sure?"
        confirmText="Yes, Delete My Account"
        isDanger={true}
        loading={deleting}
        onConfirm={handleDeleteAccount}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </div>
  );
}

