import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineSun, HiOutlineMoon, HiOutlineUser, HiOutlineCog6Tooth, HiOutlineArrowRightOnRectangle, HiOutlineShieldCheck } from 'react-icons/hi2';
import { FiBookOpen, FiLayers, FiBarChart2, FiHome } from 'react-icons/fi';

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

  const isActive = (path) => location.pathname === path;

  const navLinkClasses = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive(path)
        ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    }`;

  return (
    <nav className="hidden md:flex sticky top-0 z-50 h-16 items-center justify-between px-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400" aria-label="Home">
          <FiBookOpen className="w-6 h-6" />
          <span>SmartRevise</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link to="/" className={navLinkClasses('/')} aria-label="Dashboard">
            <span className="flex items-center gap-1.5"><FiHome className="w-4 h-4" /> Dashboard</span>
          </Link>
          <Link to="/flashcards" className={navLinkClasses('/flashcards')} aria-label="Flashcards">
            <span className="flex items-center gap-1.5"><FiLayers className="w-4 h-4" /> Flashcards</span>
          </Link>
          <Link to="/quiz" className={navLinkClasses('/quiz')} aria-label="Quiz">
            <span className="flex items-center gap-1.5"><FiBookOpen className="w-4 h-4" /> Quiz</span>
          </Link>
          <Link to="/progress" className={navLinkClasses('/progress')} aria-label="Progress">
            <span className="flex items-center gap-1.5"><FiBarChart2 className="w-4 h-4" /> Progress</span>
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
        </button>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden lg:inline">{user?.name}</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 animate-fade-in">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <HiOutlineUser className="w-4 h-4" /> Profile
              </Link>
              <Link
                to="/settings"
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDropdownOpen(false)}
              >
                <HiOutlineCog6Tooth className="w-4 h-4" /> Settings
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setDropdownOpen(false)}
                >
                  <HiOutlineShieldCheck className="w-4 h-4" /> Admin
                </Link>
              )}
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <HiOutlineArrowRightOnRectangle className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
