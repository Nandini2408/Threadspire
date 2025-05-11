
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const LoginPage = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && !isLoading) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-300px)] flex flex-col items-center justify-center py-12">
        <LoginForm />
      </div>
    </Layout>
  );
};

export default LoginPage;
