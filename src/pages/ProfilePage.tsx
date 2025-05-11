
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import UserProfile from '@/components/profile/UserProfile';

const ProfilePage = () => {
  const { username } = useParams();
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        <UserProfile username={username} />
      </div>
    </Layout>
  );
};

export default ProfilePage;
