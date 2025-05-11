
import React from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import CollectionView from '@/components/collection/CollectionView';

const CollectionPage = () => {
  const { collectionId } = useParams();
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8">
        {collectionId ? <CollectionView /> : <div>Collection ID not found</div>}
      </div>
    </Layout>
  );
};

export default CollectionPage;
