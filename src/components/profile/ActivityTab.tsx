
import React from 'react';
import { GitFork, MessageSquare, BookmarkIcon, Folder, Edit, PlusCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

interface ActivityTabProps {
  userId: string;
}

// Mock activity data
const getMockUserActivity = () => [
  {
    id: 'act1',
    type: 'thread_created',
    date: new Date('2025-04-20'),
    data: {
      threadId: 'thread1',
      threadTitle: 'The Art of Mindful Productivity: Balancing Focus and Rest'
    }
  },
  {
    id: 'act2',
    type: 'collection_created',
    date: new Date('2025-04-18'),
    data: {
      collectionId: 'col1',
      collectionTitle: 'Productivity Essentials'
    }
  },
  {
    id: 'act3',
    type: 'thread_forked',
    date: new Date('2025-04-15'),
    data: {
      originalThreadId: 'thread105',
      originalThreadTitle: 'Time Blocking Techniques for Knowledge Workers',
      originalAuthor: {
        name: 'Taylor Rivers',
        avatarUrl: null
      },
      newThreadId: 'thread2',
      newThreadTitle: 'Why Deep Work Matters in a Distracted World'
    }
  },
  {
    id: 'act4',
    type: 'thread_added_to_collection',
    date: new Date('2025-04-12'),
    data: {
      threadId: 'thread106',
      threadTitle: 'Meditation for Beginners',
      collectionId: 'col2',
      collectionTitle: 'Mindfulness Practices'
    }
  },
  {
    id: 'act5',
    type: 'thread_updated',
    date: new Date('2025-04-08'),
    data: {
      threadId: 'thread3',
      threadTitle: 'Building Restorative Rest Practices into Your Routine'
    }
  },
];

const ActivityTab = ({ userId }: ActivityTabProps) => {
  const activities = getMockUserActivity();
  
  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No activity yet.</p>
      </div>
    );
  }
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const renderActivityContent = (activity: any) => {
    switch (activity.type) {
      case 'thread_created':
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-threadspire-gold/10">
              <PlusCircle className="h-4 w-4 text-threadspire-gold" />
            </div>
            <div>
              <p className="font-medium">Created a new thread</p>
              <Link to={`/thread/${activity.data.threadId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {activity.data.threadTitle}
              </Link>
            </div>
          </div>
        );
        
      case 'collection_created':
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-blue-500/10">
              <Folder className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="font-medium">Created a new collection</p>
              <Link to={`/collections/${activity.data.collectionId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {activity.data.collectionTitle}
              </Link>
            </div>
          </div>
        );
        
      case 'thread_forked':
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-500/10">
              <GitFork className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="font-medium">Remixed a thread</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Created</span>
                <Link to={`/thread/${activity.data.newThreadId}`} className="font-medium hover:text-primary transition-colors">
                  {activity.data.newThreadTitle}
                </Link>
                <span>from</span>
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={activity.data.originalAuthor.avatarUrl || undefined} />
                    <AvatarFallback>
                      <User className="h-2 w-2" />
                    </AvatarFallback>
                  </Avatar>
                  <span>{activity.data.originalAuthor.name}'s</span>
                </div>
                <Link to={`/thread/${activity.data.originalThreadId}`} className="hover:text-primary transition-colors">
                  thread
                </Link>
              </div>
            </div>
          </div>
        );
        
      case 'thread_added_to_collection':
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <BookmarkIcon className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="font-medium">Added thread to collection</p>
              <div className="text-sm text-muted-foreground">
                Added <Link to={`/thread/${activity.data.threadId}`} className="hover:text-primary transition-colors">
                  {activity.data.threadTitle}
                </Link> to <Link to={`/collections/${activity.data.collectionId}`} className="hover:text-primary transition-colors">
                  {activity.data.collectionTitle}
                </Link>
              </div>
            </div>
          </div>
        );
        
      case 'thread_updated':
        return (
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-amber-500/10">
              <Edit className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="font-medium">Updated a thread</p>
              <Link to={`/thread/${activity.data.threadId}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {activity.data.threadTitle}
              </Link>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  // Group activities by date
  const groupedActivities = activities.reduce((groups: any, activity) => {
    const date = formatDate(activity.date);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {});
  
  return (
    <div className="space-y-8">
      {Object.entries(groupedActivities).map(([date, acts]: [string, any]) => (
        <div key={date}>
          <h3 className="text-sm font-medium text-muted-foreground mb-4">{date}</h3>
          <div className="space-y-4">
            {acts.map((activity: any) => (
              <div key={activity.id} className="p-4 bg-card border border-border rounded-lg">
                {renderActivityContent(activity)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityTab;
