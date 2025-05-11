
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Pencil, Share, BookmarkIcon, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CollectionDetailProps {
  collectionId: string | undefined;
}

// Mock collection data
const getMockCollection = (collectionId: string | undefined) => ({
  id: collectionId || 'col1',
  title: 'Productivity Essentials',
  description: 'A curated collection of threads on core productivity concepts, tools, and techniques for knowledge workers and creative professionals.',
  coverColor: 'bg-threadspire-gold/20',
  coverImage: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?auto=format&fit=crop&w=1200&q=80',
  author: {
    id: 'user123',
    name: 'Maya Johnson',
    username: 'mayaj',
    avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=256&q=80',
  },
  createdAt: new Date('2025-03-10'),
  updatedAt: new Date('2025-04-18'),
  isPrivate: false,
  threadCount: 7,
  followers: 34,
  isFollowing: false,
  threads: [
    {
      id: 'thread1',
      title: 'The Art of Mindful Productivity: Balancing Focus and Rest',
      author: {
        name: 'Maya Johnson',
        avatarUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=256&q=80',
      },
      readingTime: 5,
      preview: 'The modern workday has become a constant battle for our attention. Notifications, emails, and meetings fragment our focus...'
    },
    {
      id: 'thread101',
      title: 'The Science of Deep Work and Focus',
      author: {
        name: 'Alex Chen',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      },
      readingTime: 7,
      preview: 'Understanding the mechanisms behind sustained attention and how to leverage them for deeper work...'
    },
    {
      id: 'thread102',
      title: 'Digital Minimalism: Reclaiming Focus and Attention',
      author: {
        name: 'Samantha Wright',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
      },
      readingTime: 6,
      preview: 'Strategies for intentional technology use in an age of distraction...'
    }
  ],
  authorNotes: [
    {
      id: 'note1',
      content: "I've curated these threads as a starting point for anyone looking to develop a more intentional relationship with their work. The first three focus on the foundation of productive work - attention and focus.",
      position: 0
    },
    {
      id: 'note2',
      content: "These next threads dive into practical techniques and tools that have transformed my own approach to work.",
      position: 3
    }
  ]
});

const CollectionDetail = ({ collectionId }: CollectionDetailProps) => {
  const collection = getMockCollection(collectionId);
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = React.useState(collection.isFollowing);
  
  const isOwner = user?.id === collection.author.id;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Add toast notification here
  };
  
  return (
    <div className="w-full">
      {/* Cover Image or Color */}
      <div className="relative w-full h-48 md:h-72 rounded-lg overflow-hidden mb-8">
        {collection.coverImage ? (
          <img 
            src={collection.coverImage} 
            alt={collection.title} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className={`w-full h-full ${collection.coverColor}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
      </div>
      
      {/* Collection Header */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {collection.isPrivate && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Private</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {isOwner ? (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </Button>
            ) : (
              <Button 
                variant={isFollowing ? "outline" : "default"} 
                size="sm"
                onClick={toggleFollow}
              >
                {isFollowing ? "Following" : "Follow"}
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleShare}>
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-playfair font-semibold mb-4">
          {collection.title}
        </h1>
        
        {collection.description && (
          <p className="text-muted-foreground mb-6">
            {collection.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/profile/${collection.author.username}`} className="flex items-center gap-2 no-underline">
              <Avatar className="h-8 w-8">
                <AvatarImage src={collection.author.avatarUrl} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{collection.author.name}</span>
            </Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Updated {formatDate(collection.updatedAt)}
          </div>
        </div>
      </div>
      
      {/* Collection Content */}
      <div className="max-w-3xl mx-auto">
        {collection.threads.map((thread, index) => {
          // Find author note that comes before this thread
          const noteBeforeThread = collection.authorNotes.find(note => note.position === index);
          
          return (
            <React.Fragment key={thread.id}>
              {noteBeforeThread && (
                <div className="mb-8 p-6 bg-threadspire-paper dark:bg-threadspire-navy/20 rounded-lg border-l-4 border-threadspire-gold">
                  <p className="italic text-muted-foreground">
                    {noteBeforeThread.content}
                  </p>
                </div>
              )}
              
              <Link to={`/thread/${thread.id}`} className="no-underline">
                <div className="mb-8 p-6 bg-card border border-border rounded-lg hover:border-threadspire-gold/30 hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={thread.author.avatarUrl} />
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{thread.author.name}</span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{thread.readingTime} min read</span>
                  </div>
                  
                  <h3 className="text-xl font-playfair font-medium mb-2">
                    {thread.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {thread.preview}
                  </p>
                </div>
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionDetail;
