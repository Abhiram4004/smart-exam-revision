import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';

export default function AdminRoute() {
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast.error('Access Denied: Administrator privileges required.');
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Verifying administrator credentials..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
