import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded pages for performance and code-splitting
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage'));
const DeckStudyPage = lazy(() => import('./pages/DeckStudyPage'));
const DailyRevisionPage = lazy(() => import('./pages/DailyRevisionPage'));
const QuizSetupPage = lazy(() => import('./pages/QuizSetupPage'));
const QuizPage = lazy(() => import('./pages/QuizPage'));
const QuizResultPage = lazy(() => import('./pages/QuizResultPage'));
const BookmarksPage = lazy(() => import('./pages/BookmarksPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminSubjectsPage = lazy(() => import('./pages/AdminSubjectsPage'));
const AdminQuestionsPage = lazy(() => import('./pages/AdminQuestionsPage'));

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Top Navbar on desktop */}
      {user && <Navbar />}

      {/* Main Content Area */}
      <main className={`flex-1 ${user ? 'pt-6 pb-20 md:pb-8' : 'flex items-center justify-center'}`}>
        <Suspense fallback={<LoadingSpinner fullScreen message="Loading page..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Student / User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flashcards" element={<FlashcardsPage />} />
              <Route path="/flashcards/:deckId" element={<DeckStudyPage />} />
              <Route path="/study" element={<DailyRevisionPage />} />
              <Route path="/quiz" element={<QuizSetupPage />} />
              <Route path="/quiz/:subjectId" element={<QuizPage />} />
              <Route path="/quiz/result/:attemptId" element={<QuizResultPage />} />
              <Route path="/bookmarks" element={<BookmarksPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/subjects" element={<AdminSubjectsPage />} />
              <Route path="/admin/questions" element={<AdminQuestionsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom navigation bar on mobile */}
      {user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '16px',
              background: '#1f2937',
              color: '#f9fafb',
              fontSize: '13px'
            }
          }}
        />
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

