import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FiBookOpen, FiUser, FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiSun, FiMoon } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await register(name.trim(), email.trim(), password);
      toast.success('Registration successful! Welcome to SmartRevise.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 shadow-xl relative">
        {/* Quick Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-700 transition-colors"
        >
          {theme === 'dark' ? <FiSun className="w-4 h-4 text-amber-400" /> : <FiMoon className="w-4 h-4 text-indigo-600" />}
        </button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400 mb-4 shadow-sm">
            <FiBookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Start your smart, offline-ready exam revision journey
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-400">
                <FiUser className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff'
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-400">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff'
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Password (min 6 characters)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff'
                }}
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  color: theme === 'dark' ? '#ffffff' : '#111827',
                  backgroundColor: theme === 'dark' ? '#374151' : '#ffffff'
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-400 text-sm font-medium focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Register & Begin</span>
                <FiArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
