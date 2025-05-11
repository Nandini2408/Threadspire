import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookmarkIcon } from 'lucide-react';
import { bookmarkService } from '@/lib/services/bookmark.service';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Thread {
  id: string;
  title: string;
  snippet: string;
  coverImage?: string;
  author: {
    id?: string;
    name: string;
    avatarUrl: string;
  };
  publishedAt: Date;
  readingTime: number;
  bookmarks: number;
  reactions: number;
  tags: string[];
  segments?: { content: string }[];
}

interface ThreadCardProps {
  thread: Thread;
  actions?: React.ReactNode;
}

function stripHtml(html: string) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const ThreadCard = ({ thread, actions }: ThreadCardProps) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [authorInfo, setAuthorInfo] = useState(thread.author);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await bookmarkService.isBookmarked(thread.id);
        setIsBookmarked(bookmarked);
      } catch (error) {
        console.error('Error checking bookmark status:', error);
      }
    };
    
    checkBookmarkStatus();
    
    // Fetch author information if author.id is available
    const fetchAuthorInfo = async () => {
      if (thread.author.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', thread.author.id)
            .single();
            
          if (profile) {
            setAuthorInfo({
              ...thread.author,
              name: profile.name || thread.author.name,
              avatarUrl: profile.avatar_url || thread.author.avatarUrl
            });
          }
        } catch (error) {
          console.error('Error fetching author info:', error);
        }
      }
    };
    
    fetchAuthorInfo();
  }, [thread.id, isAuthenticated, thread.author.id]);
  
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark threads",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (isBookmarked) {
        await bookmarkService.removeBookmark(thread.id);
        setIsBookmarked(false);
        toast({
          title: "Removed from bookmarks",
          description: "Thread removed from your bookmarks",
        });
      } else {
        await bookmarkService.addBookmark(thread.id);
        setIsBookmarked(true);
        toast({
          title: "Added to bookmarks",
          description: "Thread added to your bookmarks",
        });
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };
  
  // Create a snippet from the first 2 segments
  let segmentSnippet = '';
  if (thread.segments && thread.segments.length > 0) {
    segmentSnippet = thread.segments
      .slice(0, 2)
      .map(seg => stripHtml(seg.content))
      .filter(Boolean)
      .join(' ');
  } else {
    segmentSnippet = stripHtml(thread.snippet);
  }
  
  return (
    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-0 h-full flex flex-col">
        <Link to={`/thread/${thread.id}`} className="block flex-1 p-6">
          {/* Thread preview content */}
          <div className="mb-4 flex justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={authorInfo.avatarUrl} alt={authorInfo.name} />
                <AvatarFallback>{authorInfo.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-xs">{authorInfo.name}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {formatThreadDate(thread.publishedAt)}
            </span>
          </div>
          <h3 className="text-lg font-playfair font-medium mb-2 text-balance line-clamp-2">{thread.title}</h3>
          <div className="text-muted-foreground text-sm mb-2 line-clamp-3 prose prose-sm max-w-none">
            {segmentSnippet}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-4 w-4 text-threadspire-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" /></svg>
            <span className="text-xs text-muted-foreground">{thread.reactions}</span>
          </div>
          <div className="flex gap-1 mb-2">
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
        </Link>
        
        <div className="p-4 mt-auto border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {actions}
          </div>
          <div className="flex items-center gap-3">
            <button 
              className="flex items-center gap-1"
              onClick={handleBookmark}
              aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <BookmarkIcon 
                className={`h-4 w-4 ${isBookmarked ? 'fill-threadspire-gold text-threadspire-gold' : 'text-muted-foreground'}`} 
              />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function formatThreadDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
}

export default ThreadCard;
