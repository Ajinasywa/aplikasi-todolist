'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Check authentication status after loading is complete
    if (!isLoading && (!isAuthenticated || !token)) {
      // Redirect to login if not authenticated
      router.push('/login');
    }
  }, [isAuthenticated, token, isLoading, router]);

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, return loading indicator (redirect will happen via useEffect)
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated, render the children
  return <>{children}</>;
};

export default ProtectedRoute;