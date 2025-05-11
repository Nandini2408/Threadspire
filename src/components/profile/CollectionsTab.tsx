
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CollectionsTabProps {
  userId: string;
}

// Mock collections data
const getMockUserCollections = () => [
  {
    id: 'col1',
    title: 'Productivity Essentials',
    description: 'Core concepts for effective work and focus',
    threadCount: 7,
    isPrivate: false,
    coverColor: 'bg-threadspire-gold/20',
    coverImage: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=400&h=200&q=80'
  },
  {
    id: 'col2',
    title: 'Mindfulness Practices',
    description: 'Daily techniques for presence and awareness',
    threadCount: 12,
    isPrivate: false,
    coverColor: 'bg-blue-500/20',
    coverImage: null
  },
  {
    id: 'col3',
    title: 'Work in Progress',
    description: 'Ideas and concepts I\'m currently exploring',
    threadCount: 4,
    isPrivate: true,
    coverColor: 'bg-purple-500/20',
    coverImage: null
  },
  {
    id: 'col4',
    title: 'Reading Notes',
    description: 'Key insights from books and articles',
    threadCount: 9,
    isPrivate: false,
    coverColor: 'bg-green-500/20',
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=400&h=200&q=80'
  }
];

const CollectionsTab = ({ userId }: CollectionsTabProps) => {
  const collections = getMockUserCollections();
  
  if (collections.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No collections created yet.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Link to="/collections/create" className="no-underline">
          <button className="text-sm font-medium flex items-center gap-2 text-threadspire-gold">
            <Folder className="h-4 w-4" /> New Collection
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map(collection => (
          <Link key={collection.id} to={`/collections/${collection.id}`} className="no-underline">
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
              {/* Cover Image or Color */}
              {collection.coverImage ? (
                <div className="h-32 w-full overflow-hidden">
                  <img 
                    src={collection.coverImage} 
                    alt={collection.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div className={`h-32 w-full ${collection.coverColor}`} />
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-playfair line-clamp-1">
                    {collection.title}
                  </CardTitle>
                  {collection.isPrivate && (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                {collection.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
                    {collection.description}
                  </p>
                )}
              </CardContent>
              
              <CardFooter>
                <p className="text-xs text-muted-foreground">
                  {collection.threadCount} thread{collection.threadCount !== 1 ? 's' : ''}
                </p>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollectionsTab;
