import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  // In a real app, this would be fetched from context/Redux/localStorage
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); 

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If authenticated and authorized, render the child routes (Outlet)
  return <Outlet />;
};

export default ProtectedRoute;
