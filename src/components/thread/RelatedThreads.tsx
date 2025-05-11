
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { BookmarkIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Mock data for related threads
const relatedThreadsData = [
  {
    id: '2',
    title: 'Deep Work in a Distracted World',
    snippet: 'Strategies for achieving focused work in environments designed for constant interruption.',
    author: {
      name: 'Alex Rivera',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80'
    },
    bookmarks: 32,
    reactions: 78,
    readingTime: 7,
    tags: ['Productivity', 'Focus', 'Work']
  },
  {
    id: '3',
    title: 'The Science of Mindful Breaks',
    snippet: 'How strategic pauses can improve cognitive performance and creativity throughout the day.',
    author: {
      name: 'Sarah Chen',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80'
    },
    bookmarks: 41,
    reactions: 63,
    readingTime: 4,
    tags: ['Mindfulness', 'Productivity', 'Health']
  },
  {
    id: '4',
    title: 'Digital Minimalism: Reclaiming Focus',
    snippet: 'How intentional technology use can create space for meaningful work and relationships.',
    author: {
      name: 'Jordan Taylor',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80'
    },
    bookmarks: 29,
    reactions: 47,
    readingTime: 6,
    tags: ['Digital Wellness', 'Mindfulness', 'Productivity']
  }
];

interface RelatedThreadsProps {
  threadId: string;
  tags: string[];
}

const RelatedThreads = ({ threadId, tags }: RelatedThreadsProps) => {
  // In a real app, we'd filter related threads based on tags and exclude the current thread
  const threads = relatedThreadsData.filter(thread => thread.id !== threadId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {threads.map(thread => (
        <Card key={thread.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-0">
            <Link to={`/thread/${thread.id}`} className="block p-6">
              {/* Thread preview content */}
              <h3 className="text-lg font-playfair font-medium mb-2 text-balance">{thread.title}</h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{thread.snippet}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={thread.author.avatarUrl} alt={thread.author.name} />
                    <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{thread.author.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{thread.readingTime} min read</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  {thread.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full">
                      {tag}
                    </span>
                  ))}
                  {thread.tags.length > 2 && (
                    <span className="text-xs px-2 py-0.5 bg-secondary/30 rounded-full">
                      +{thread.tags.length - 2}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookmarkIcon className="h-3 w-3" />
                    {thread.bookmarks}
                  </span>
                  <span>
                    {thread.reactions} reactions
                  </span>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RelatedThreads;
