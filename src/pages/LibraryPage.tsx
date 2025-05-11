import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ThreadCard from '@/components/discovery/ThreadCard';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Edit, FileText, BookmarkIcon, Loader2 } from 'lucide-react';
import { threadService } from '@/lib/services/thread.service';
import { bookmarkService } from '@/lib/services/bookmark.service';
import { useAuth } from '@/hooks/useAuth';
import { draftService } from '@/lib/services/draft.service';
import { toast } from '@/hooks/use-toast';
import { stripHtmlTags } from '@/lib/utils/html-utils';
import CollectionManager from '@/components/collection/CollectionManager';

const LibraryPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("saved");
  const [loading, setLoading] = useState(false);
  const [savedThreads, setSavedThreads] = useState<any[]>([]);
  const [myThreads, setMyThreads] = useState<any[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/library' } });
      return;
    }

    loadLibraryData(activeTab);
  }, [isAuthenticated, activeTab]);

  const loadLibraryData = async (tab: string) => {
    if (!isAuthenticated || !user) return;
    
    setLoading(true);
    try {
      switch (tab) {
        case 'saved':
          const { threads: bookmarkedThreads } = await bookmarkService.getBookmarkedThreads({});
          setSavedThreads(bookmarkedThreads);
          break;
        case 'my-threads':
          const { threads: publishedThreads } = await threadService.getThreads({
            userId: user.id,
            onlyPublished: true
          });
          setMyThreads(publishedThreads);
          break;
        case 'drafts':
          const draftsData = await draftService.getDraftsByUser(user.id);
          setDrafts(draftsData);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tab} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const formatThreadForCard = (thread: any) => {
    // Calculate total reactions
    const reactionTotal = Object.values(thread.reaction_counts || {}).reduce(
      (a: number, b: number) => a + b, 
      0
    );
    // Use author info if available, fallback to 'You'
    const authorName = thread.author?.name || thread.profile?.name || 'You';
    const authorAvatar = thread.author?.avatar || thread.profile?.avatar_url || '/placeholder-avatar.jpg';
    return {
      id: thread.id,
      title: thread.title,
      snippet: thread.snippet || (thread.segments[0]?.content.substring(0, 120) + '...'),
      coverImage: thread.cover_image,
      author: {
        name: authorName,
        avatarUrl: authorAvatar,
      },
      publishedAt: new Date(thread.created_at),
      readingTime: thread.segments.length,
      bookmarks: 0,
      reactions: reactionTotal as number,
      tags: thread.tags,
      segments: thread.segments,
    };
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-playfair font-semibold">My Library</h1>
          <Button asChild>
            <Link to="/create">New Thread</Link>
          </Button>
        </div>
        
        <Tabs defaultValue="saved" onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4" />
              <span>Saved</span>
            </TabsTrigger>
            <TabsTrigger value="my-threads" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>My Threads</span>
            </TabsTrigger>
            <TabsTrigger value="drafts" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              <span>Drafts</span>
            </TabsTrigger>
            <TabsTrigger value="collections" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Collections</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          {/* Saved tab */}
          <TabsContent value="saved">
            {!loading && (
              <>
                {savedThreads.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedThreads.map(thread => (
                      <ThreadCard key={thread.id} thread={formatThreadForCard(thread)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed rounded-lg">
                    <BookmarkIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No saved threads yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Bookmark threads that you want to revisit later
                    </p>
                    <Button asChild>
                      <Link to="/explore">Explore Threads</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* My Threads tab */}
          <TabsContent value="my-threads">
            {!loading && (
              <>
                {myThreads.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myThreads.map(thread => (
                      <ThreadCard key={thread.id} thread={formatThreadForCard(thread)} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">You haven't published any threads yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Share your knowledge and insights with the ThreadSpire community
                    </p>
                    <Button asChild>
                      <Link to="/create">Create a Thread</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Drafts tab */}
          <TabsContent value="drafts">
            {!loading && (
              <>
                {drafts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map(draft => (
                      <Card key={draft.id} className="hover:shadow-md transition-shadow duration-300">
                        <CardHeader>
                          <CardTitle>{draft.title || "Untitled Draft"}</CardTitle>
                          <CardDescription>
                            Last updated on {new Intl.DateTimeFormat('en-US', { 
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            }).format(new Date(draft.updated_at))}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-muted-foreground line-clamp-2 prose dark:prose-invert max-w-none text-sm">
                            {draft.content && Array.isArray(draft.content) && draft.content[0]?.content ? (
                              <p>{stripHtmlTags(draft.content[0].content).substring(0, 150)}</p>
                            ) : (
                              <p>No content</p>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button variant="outline" className="w-full" asChild>
                            <Link to={`/create?draft=${draft.id}`}>Continue Editing</Link>
                          </Button>
                          <Button
                            variant="destructive"
                            className="w-full"
                            onClick={async () => {
                              try {
                                await draftService.deleteDraft(draft.id);
                                setDrafts(drafts.filter(d => d.id !== draft.id));
                                toast({ title: "Draft deleted" });
                              } catch (e) {
                                toast({ title: "Error", description: "Could not delete draft", variant: "destructive" });
                              }
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            variant="default"
                            className="w-full"
                            onClick={async () => {
                              try {
                                const thread = await draftService.publishDraft(draft.id);
                                setDrafts(drafts.filter(d => d.id !== draft.id));
                                toast({ title: "Draft published" });
                                navigate(`/thread/${thread.id}`);
                              } catch (e) {
                                toast({ title: "Error", description: "Could not publish draft", variant: "destructive" });
                              }
                            }}
                          >
                            Publish
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 border border-dashed rounded-lg">
                    <Edit className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-medium mb-2">No drafts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start writing and save drafts to continue later
                    </p>
                    <Button asChild>
                      <Link to="/create">Start Writing</Link>
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          {/* Collections tab */}
          <TabsContent value="collections">
            <CollectionManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default LibraryPage;
