import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Search, Loader2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ThreadCard from '@/components/discovery/ThreadCard';
import { threadService } from '@/lib/services/thread.service';
import { analyticsService } from '@/lib/services/analytics.service';
import { supabase } from '@/lib/supabase';

const ExplorePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [trendingThreads, setTrendingThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingLoading, setTrendingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; avatarUrl: string }>>({});

  // Load threads on initial render
  useEffect(() => {
    loadThreads();
    loadTrendingThreads();
  }, []);

  // Fetch profiles for all user_ids in results whenever results change
  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = Array.from(new Set(results.map(t => t.user_id)));
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
    };
    if (results.length > 0) fetchProfiles();
  }, [results]);

  const loadThreads = async (query = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const { threads } = await threadService.getThreads({
        sortBy: getSortField(sortBy),
        sortOrder: 'desc',
        onlyPublished: true,
        limit: 30
      });
      
      setResults(threads);
      
      // Extract all tags for filtering
      const allTags = threads.flatMap(thread => thread.tags);
      const uniqueTags = Array.from(new Set(allTags));
      setAvailableTags(uniqueTags);
    } catch (error) {
      console.error('Error loading threads:', error);
      setError('Failed to load threads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadTrendingThreads = async () => {
    try {
      setTrendingLoading(true);
      const trending = await analyticsService.getTrendingThreads(3);
      
      // Get full thread data for each trending thread
      const trendingDetails = await Promise.all(
        trending.map(async (thread) => {
          try {
            return await threadService.getThreadById(thread.id);
          } catch (error) {
            console.error(`Error fetching trending thread ${thread.id}:`, error);
            return null;
          }
        })
      );
      
      setTrendingThreads(trendingDetails.filter(Boolean));
    } catch (error) {
      console.error('Error loading trending threads:', error);
    } finally {
      setTrendingLoading(false);
    }
  };

  const getSortField = (sortOption: string) => {
    switch (sortOption) {
      case 'newest': return 'created_at';
      case 'updated': return 'updated_at';
      case 'forks': return 'fork_count';
      default: return 'created_at';
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const { threads } = await threadService.getThreads({
        sortBy: getSortField(sortBy),
        sortOrder: 'desc',
        onlyPublished: true,
        limit: 30
      });
      
      // Client-side filtering since we don't have a dedicated search endpoint
      const filteredResults = searchQuery.trim() === '' 
        ? threads 
        : threads.filter(thread => 
            thread.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            thread.segments.some((segment: any) => 
              segment.content.toLowerCase().includes(searchQuery.toLowerCase())
            ) ||
            thread.tags.some((tag: string) => 
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
          );
      
      setResults(filteredResults);
    } catch (error) {
      console.error('Error searching threads:', error);
      setError('Search failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    loadThreads();
  };

  // Filter results based on active tab
  const getFilteredResults = () => {
    if (activeTab === 'all') return results;
    return results.filter(thread => 
      thread.tags.some((tag: string) => tag.toLowerCase() === activeTab.toLowerCase())
    );
  };

  const filteredResults = getFilteredResults();

  const formatThreadForCard = (thread: any) => {
    // Calculate total reactions
    const reactionTotal = Object.values(thread.reaction_counts || {}).reduce(
      (a: number, b: number) => a + b, 
      0
    );
    const author = profileMap[thread.user_id] || { name: 'Anonymous', avatarUrl: '/placeholder-avatar.jpg' };
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (thread.segments[0]?.content.substring(0, 120) + '...'),
      coverImage: thread.cover_image,
      author,
      publishedAt: new Date(thread.created_at),
      readingTime: thread.segments.length,
      bookmarks: 0,
      reactions: reactionTotal as number,
      tags: thread.tags,
    };
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-playfair font-semibold mb-6">Explore Threads</h1>
        
        {/* Search form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              type="text"
              placeholder="Search for topics, keywords, or authors..." 
              className="pl-10 pr-24"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              className="absolute right-1 top-1/2 transform -translate-y-1/2"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Explore'}
            </Button>
          </div>
        </form>
        
        {/* Trending Threads */}
        {trendingThreads.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-threadspire-gold" />
              <h2 className="text-xl font-playfair font-semibold">Trending Now</h2>
            </div>
            
            {trendingLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {trendingThreads.map(thread => (
                  <ThreadCard 
                    key={thread.id} 
                    thread={formatThreadForCard(thread)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Sort Options */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-playfair font-semibold">All Threads</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="updated">Recently Updated</SelectItem>
                <SelectItem value="forks">Most Remixed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Filter tabs */}
        <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="mb-4 flex flex-wrap gap-2">
            <TabsTrigger value="all">All</TabsTrigger>
            {availableTags.slice(0, 5).map(tag => (
              <TabsTrigger key={tag} value={tag.toLowerCase()}>{tag}</TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResults.map(thread => (
                  <ThreadCard 
                    key={thread.id} 
                    thread={formatThreadForCard(thread)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <h3 className="text-xl font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or exploring different topics
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ExplorePage;
