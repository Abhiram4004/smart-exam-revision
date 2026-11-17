import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

