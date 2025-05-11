import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ThreadReader from '@/components/thread/ThreadReader';

const ThreadPage = () => {
  const { threadId } = useParams<{ threadId: string }>();
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {threadId && <ThreadReader threadId={threadId} />}
      </div>
    </Layout>
  );
};

export default ThreadPage;
