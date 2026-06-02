import PageLoader from './PageLoader';
import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

const RequireAuth: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <PageLoader fullScreen={false} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/#login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default RequireAuth;
