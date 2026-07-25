import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { auth } = useAuth();

  if (!auth.isAuthenticated) {
    // Redirect to login with the employee tab active
    return <Navigate to="/login?role=employee" replace />;
  }

  if (requiredRole && auth.role !== requiredRole) {
    // If authenticated but wrong role, redirect to appropriate page
    if (auth.role === 'hr') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
