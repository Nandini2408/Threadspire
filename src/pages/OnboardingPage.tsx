
import React from 'react';
import Layout from '@/components/layout/Layout';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';

const OnboardingPage = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-300px)] flex flex-col items-center justify-center py-12">
        <OnboardingFlow />
      </div>
    </Layout>
  );
};

export default OnboardingPage;
