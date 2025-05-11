import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookmarkIcon, SearchIcon, Loader2 } from 'lucide-react';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import FeaturedThreads from '@/components/discovery/FeaturedThreads';
import ThreadCard from '@/components/discovery/ThreadCard';
import FilterBar from '@/components/discovery/FilterBar';
import { threadService } from '@/lib/services/thread.service';
import { supabase } from '@/lib/supabase';

interface Thread {
  id: string;
  title: string;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
  segments: Array<{
    content: string;
  }>;
  tags: string[];
  snippet?: string;
  reaction_counts?: Record<string, number>;
  user_id: string;
}

interface FormattedThread {
  id: string;
  title: string;
  snippet: string;
  coverImage: string | null;
  author: {
    name: string;
    avatarUrl: string;
  };
  publishedAt: Date;
  readingTime: number;
  bookmarks: number;
  reactions: number;
  tags: string[];
}

const Index = () => {
  const [activeView, setActiveView] = useState<'card' | 'list'>('card');
  const [activeSort, setActiveSort] = useState('newest');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalThreads, setTotalThreads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 6;
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [profileMap, setProfileMap] = useState<Record<string, { name: string; avatarUrl: string }>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load threads from database instead of static data
  useEffect(() => {
    const loadThreads = async () => {
      try {
        setLoading(true);
        const { threads: loadedThreads, total } = await threadService.getThreads({
          page: currentPage,
          limit: threadsPerPage,
          sortBy: activeSort === 'newest' ? 'created_at' : 'updated_at',
          sortOrder: 'desc',
          onlyPublished: true
        });
        // Extract unique tags from loaded threads
        const allTags = loadedThreads.flatMap(thread => thread.tags);
        setAvailableTags(Array.from(new Set(allTags)));
        // Client-side tag filtering
        let filteredThreads = loadedThreads;
        if (selectedTags.length > 0) {
          filteredThreads = loadedThreads.filter(thread =>
            selectedTags.every(tag => thread.tags.includes(tag))
          );
        }
        // Search filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.trim().toLowerCase();
          filteredThreads = filteredThreads.filter(thread =>
            thread.title.toLowerCase().includes(q) ||
            (thread.snippet && thread.snippet.toLowerCase().includes(q))
          );
        }
        // Client-side sorting for bookmarks and reactions
        if (activeSort === 'bookmarks') {
          filteredThreads = [...filteredThreads].sort((a, b) => (Number(b.bookmarks) || 0) - (Number(a.bookmarks) || 0));
        } else if (activeSort === 'reactions') {
          filteredThreads = [...filteredThreads].sort((a, b) => {
            const aReactions = Object.values(a.reaction_counts || {}).reduce((x, y) => Number(x) + Number(y), 0);
            const bReactions = Object.values(b.reaction_counts || {}).reduce((x, y) => Number(x) + Number(y), 0);
            return Number(bReactions) - Number(aReactions);
          });
        }
        setThreads(filteredThreads);
        setTotalThreads(filteredThreads.length);
        // Fetch all unique user_ids for the current threads
        const userIds = Array.from(new Set(filteredThreads.map(t => t.user_id)));
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
      } catch (error) {
        console.error('Error loading threads:', error);
        setError('Failed to load threads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadThreads();
  }, [activeSort, currentPage, selectedTags, searchQuery]);
  
  // Handler for tag filtering
  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    // Reset to first page when filter changes
    setCurrentPage(1);
  };
  
  // Format thread for ThreadCard component
  const formatThreadForCard = (thread: Thread): FormattedThread => {
    // Calculate total reactions
    const reactionTotal = Object.values(thread.reaction_counts || {}).reduce(
      (a: number, b: number) => a + b, 
      0
    );
    const author = profileMap[thread.user_id] || { name: 'Anonymous', avatarUrl: '/placeholder-avatar.jpg' };
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (thread.segments?.[0]?.content.substring(0, 120) + '...') || "No content",
      coverImage: thread.cover_image,
      author,
      publishedAt: new Date(thread.created_at),
      readingTime: thread.segments?.length || 1,
      bookmarks: 0,
      reactions: reactionTotal,
      tags: thread.tags,
    };
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalThreads / threadsPerPage);

  return (
    <Layout fullWidth>
      {/* Featured Section */}
      <div className="bg-accent/30 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <FeaturedThreads />
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-playfair font-semibold mb-6">Discover Threads</h2>
          
          {/* Search and Filter Controls */}
          <FilterBar 
            activeView={activeView}
            setActiveView={setActiveView}
            activeSort={activeSort}
            setActiveSort={setActiveSort}
            selectedTags={selectedTags}
            onTagToggle={handleTagToggle}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            availableTags={availableTags}
          />
        </div>
        
        {/* Loading state */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <h3 className="text-xl font-medium mb-2">Error</h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        ) : threads.length > 0 ? (
          /* Thread Cards */
          activeView === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {threads.map(thread => (
                <ThreadCard key={thread.id} thread={formatThreadForCard(thread)} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {threads.map(thread => (
                <Link 
                  key={thread.id}
                  to={`/thread/${thread.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {thread.cover_image && (
                          <div className="hidden md:block flex-shrink-0 w-24 h-24">
                            <img 
                              src={thread.cover_image} 
                              alt="" 
                              className="w-full h-full object-cover rounded-md"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={profileMap[thread.user_id]?.avatarUrl || '/placeholder-avatar.jpg'} alt={profileMap[thread.user_id]?.name || 'Anonymous'} />
                                <AvatarFallback>{(profileMap[thread.user_id]?.name || 'A')[0]}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs">{profileMap[thread.user_id]?.name || 'Anonymous'}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
                                  .format(new Date(thread.created_at))}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{thread.segments?.length || 1} min read</span>
                          </div>
                          <h3 className="text-lg font-playfair font-medium mb-2">{thread.title}</h3>
                          <div
                            className="text-muted-foreground text-sm mb-3 line-clamp-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: thread.snippet || (thread.segments?.[0]?.content.substring(0, 120) + '...') || "No content" }}
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex gap-1">
                              {thread.tags.slice(0, 2).map((tag: string) => (
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
                                0
                              </span>
                              <span>
                                {Object.values(thread.reaction_counts || {}).reduce(
                                  (a: number, b: number) => a + b, 
                                  0
                                )} reactions
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )
        ) : (
          <div className="text-center py-16 border border-dashed rounded-lg">
            <h3 className="text-xl font-medium mb-2">No threads found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedTags.length > 0 
                ? 'Try adjusting your tag filters' 
                : 'Be the first to create a thread!'}
            </p>
            <Button asChild>
              <Link to="/create">Create a Thread</Link>
            </Button>
          </div>
        )}
        
        {/* Pagination */}
        {threads.length > 0 && totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={i}>
                    <PaginationLink 
                      onClick={() => setCurrentPage(pageNum)}
                      isActive={currentPage === pageNum}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </Layout>
  );
};

export default Index;
