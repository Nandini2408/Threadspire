import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User } from 'lucide-react';
import { analyticsService } from '@/lib/services/analytics.service';
import { threadService } from '@/lib/services/thread.service';
import { supabase } from '@/lib/supabase';

interface ThreadData {
  id: string;
  title: string;
  cover_image: string | null;
  created_at: string;
  user_id: string;
  snippet?: string;
  segments?: Array<{ content: string }>;
  tags?: string[];
}

function stripHtml(html: string) {
  const tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const FeaturedThreads = () => {
  const [featuredThreads, setFeaturedThreads] = useState<ThreadData[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; avatarUrl: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFeaturedThreads = async () => {
      try {
        setLoading(true);
        // Try to get trending threads first
        const trendingThreads = await analyticsService.getTrendingThreads(2);
        let threadsToShow = [];
        if (trendingThreads && trendingThreads.length >= 2) {
          threadsToShow = trendingThreads;
        } else {
          // Otherwise, fall back to recent threads
          const { threads } = await threadService.getThreads({
            limit: 2,
            sortBy: 'created_at',
            sortOrder: 'desc',
            onlyPublished: true
          });
          threadsToShow = threads.map((thread: any) => ({
            id: thread.id,
            title: thread.title,
            cover_image: thread.cover_image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80',
            created_at: thread.created_at,
            user_id: thread.user_id,
            snippet: thread.snippet || thread.segments?.[0]?.content.substring(0, 150),
            tags: thread.tags
          }));
        }
        setFeaturedThreads(threadsToShow);
        // Fetch creator profiles
        const userIds = Array.from(new Set(threadsToShow.map(t => t.user_id).filter(Boolean)));
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .in('id', userIds);
          const map: Record<string, { name: string; avatarUrl: string }> = {};
          profiles?.forEach((p: any) => {
            map[p.id] = { name: p.name || 'Anonymous', avatarUrl: p.avatar_url || '/placeholder-avatar.jpg' };
          });
          setProfileMap(map);
        } else {
          setProfileMap({});
        }
      } catch (err) {
        console.error('Error loading featured threads:', err);
        setError('Failed to load featured threads');
        setFeaturedThreads([
          {
            id: '1',
            title: 'Create your first thread',
            cover_image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80',
            created_at: new Date().toISOString(),
            user_id: '',
            snippet: 'Start sharing your knowledge with the ThreadSpire community.',
            tags: ['Getting Started']
          }
        ]);
        setProfileMap({});
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedThreads();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-playfair font-semibold mb-6">Featured</h2>
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-playfair font-semibold mb-6">Featured</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredThreads.map((thread) => (
          <Link 
            key={thread.id}
            to={`/thread/${thread.id}`}
            className="block group"
          >
            <Card className="overflow-hidden h-full border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-0 h-full">
                <div className="relative h-48 lg:h-64 w-full">
                  <img 
                    src={thread.cover_image || 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80'} 
                    alt={thread.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-background/20" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex gap-1 mb-3">
                      {thread.tags && thread.tags.slice(0, 2).map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-playfair font-semibold text-foreground mb-2">
                      {thread.title}
                    </h3>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(thread.snippet)}</p>
                  </div>
                </div>
                
                <div className="p-6 pt-0 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileMap[thread.user_id]?.avatarUrl || "/placeholder-avatar.jpg"} alt={profileMap[thread.user_id]?.name || "Anonymous"} />
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{profileMap[thread.user_id]?.name || 'Anonymous'}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(thread.created_at)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
};

export default FeaturedThreads;
