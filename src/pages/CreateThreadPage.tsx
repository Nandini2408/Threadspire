
import React from 'react';
import Layout from '@/components/layout/Layout';
import ThreadCreatorFixed from '@/components/thread/ThreadCreatorFixed';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const CreateThreadPage = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/create' }} />;
  }

  return (
    <Layout>
      <ThreadCreatorFixed />
    </Layout>
  );
};

export default CreateThreadPage;
