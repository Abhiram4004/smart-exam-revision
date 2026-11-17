import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineSun,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineShieldCheck
} from 'react-icons/hi2';
import { FiBookOpen, FiLayers, FiBarChart2, FiHome, FiUsers } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navLinkClasses = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 font-bold'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-8">
        {/* Brand Logo - Links to /admin for Admin, / for Students */}
        <Link
          to={isAdmin ? '/admin' : '/'}
          className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400"
          aria-label="SmartRevise Home"
        >
          <FiBookOpen className="w-6 h-6" />
          <span>SmartRevise</span>
          {isAdmin && (
            <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Admin
            </span>
          )}
        </Link>

        {/* Distinct Navigation Links based on role */}
        <div className="flex items-center gap-1">
          {isAdmin ? (
            /* Admin Portal Navigation */
            <>
              <Link to="/admin" className={navLinkClasses('/admin')} aria-label="Admin Overview">
                <span className="flex items-center gap-1.5">
                  <FiBarChart2 className="w-4 h-4" /> Overview
                </span>
              </Link>
              <Link to="/admin/students" className={navLinkClasses('/admin/students')} aria-label="Student Progress">
                <span className="flex items-center gap-1.5">
                  <FiUsers className="w-4 h-4" /> Student Progress
                </span>
              </Link>
              <Link to="/admin/subjects" className={navLinkClasses('/admin/subjects')} aria-label="Curriculum Subjects">
                <span className="flex items-center gap-1.5">
                  <FiBookOpen className="w-4 h-4" /> Subjects
                </span>
              </Link>
              <Link to="/admin/questions" className={navLinkClasses('/admin/questions')} aria-label="Question Bank">
                <span className="flex items-center gap-1.5">
                  <FiLayers className="w-4 h-4" /> Question Bank
                </span>
              </Link>
            </>
          ) : (
            /* Student Revision Navigation */
            <>
              <Link to="/" className={navLinkClasses('/')} aria-label="Dashboard">
                <span className="flex items-center gap-1.5">
                  <FiHome className="w-4 h-4" /> Dashboard
                </span>
              </Link>
              <Link to="/flashcards" className={navLinkClasses('/flashcards')} aria-label="Flashcards">
                <span className="flex items-center gap-1.5">
                  <FiLayers className="w-4 h-4" /> Flashcards
                </span>
              </Link>
              <Link to="/quiz" className={navLinkClasses('/quiz')} aria-label="Quiz">
                <span className="flex items-center gap-1.5">
                  <FiBookOpen className="w-4 h-4" /> Quiz
                </span>
              </Link>
              <Link to="/progress" className={navLinkClasses('/progress')} aria-label="Progress">
                <span className="flex items-center gap-1.5">
                  <FiBarChart2 className="w-4 h-4" /> Progress
                </span>
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>

        {/* User Account Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
              isAdmin
                ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                : 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
            }`}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-gray-700 dark:text-gray-200">
                {user?.name}
              </div>
              <div className="text-[10px] text-gray-400">
                {isAdmin ? 'Administrator' : 'Student'}
              </div>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 animate-fade-in z-50">
              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.name}
                </div>
                <div className="text-[11px] text-gray-400 truncate">
                  {user?.email}
                </div>
              </div>

              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <HiOutlineShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Admin Overview
                  </Link>
                  <Link
                    to="/admin/students"
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <FiUsers className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Student Progress
                  </Link>
                </>
              ) : null}

              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <HiOutlineUser className="w-4 h-4 text-gray-500" /> Profile
              </Link>

              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <HiOutlineCog6Tooth className="w-4 h-4 text-gray-500" /> Settings
              </Link>

              <hr className="my-1 border-gray-100 dark:border-gray-700" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
