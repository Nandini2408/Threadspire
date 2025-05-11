
import React from 'react';
import Layout from '@/components/layout/Layout';
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-300px)] flex flex-col items-center justify-center py-12">
        <ForgotPasswordForm />
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
