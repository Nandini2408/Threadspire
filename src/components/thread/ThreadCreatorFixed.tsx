import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Plus, 
  Type, 
  Trash2,
  Loader2,
  ArrowRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  Save,
  X,
  FileQuestion,
  AlertCircle,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Quote,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import { threadService } from "@/lib/services/thread.service";
import { draftService } from "@/lib/services/draft.service";
import { previewService } from "@/lib/services/preview.service";
import { supabase } from "@/integrations/supabase/client";
import SegmentEditor from "./SegmentEditor";
import "./editor-styles.css";

interface ThreadSegment {
  id: string;
  content: string;
  type: 'text';
}

interface ThreadData {
  id: string;
  title: string;
  coverImage: string | null;
  segments: ThreadSegment[];
  tags: string[];
  isPublic: boolean;
  lastSaved: Date | null;
}

const PREDEFINED_TAGS = [
  "Productivity",
  "Mindfulness",
  "Career",
  "Technology",
  "Creativity",
  "Health",
  "Philosophy",
  "Learning"
];

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

const ThreadCreatorFixed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Extract URL parameters
  const draftId = queryParams.get('draft');
  const threadId = queryParams.get('thread');
  const remixFrom = queryParams.get('remixFrom');
  const forkId = queryParams.get('fork');
  
  console.log('URL Parameters:', { draftId, forkId, remixFrom, threadId });
  
  const [thread, setThread] = useState<ThreadData>({
    id: generateId(),
    title: '',
    coverImage: null,
    segments: [{ id: generateId(), content: '', type: 'text' }],
    tags: [],
    isPublic: true,
    lastSaved: null
  });
  
  const [customTag, setCustomTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingThread, setIsEditingThread] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [showCoverImageField, setShowCoverImageField] = useState(false);
  const [editors, setEditors] = useState<{ [id: string]: any }>({});
  
  // Load thread data when component mounts
  useEffect(() => {
    const loadThread = async () => {
      console.log('Starting loadThread function with params:', { draftId, forkId, remixFrom, threadId });
      
      if (threadId) {
        try {
          setIsLoading(true);
          setIsEditingThread(true);
          const threadData = await threadService.getThreadById(threadId);
          console.log('Loaded thread data:', threadData);
          
          setThread({
            id: threadData.id,
            title: threadData.title,
            coverImage: threadData.cover_image || null,
            segments: threadData.segments.map((seg: any) => ({
              id: seg.id || generateId(),
              content: seg.content,
              type: 'text'
            })),
            tags: threadData.tags || [],
            isPublic: threadData.is_published,
            lastSaved: new Date(threadData.updated_at)
          });
          
          toast({
            title: "Thread loaded for editing",
            description: "Make your changes and save when ready.",
          });
        } catch (error) {
          console.error("Error loading thread for editing:", error);
          toast({
            title: "Error loading thread",
            description: "The thread could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
        return;
      }
      
      if (draftId) {
        try {
          setIsLoading(true);
          console.log('Attempting to load draft with ID:', draftId);
          
          // Direct database query for maximum reliability
          const { data: draftData, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('id', draftId)
            .single();
          
          if (error) {
            console.error('Error fetching draft:', error);
            throw error;
          }
          
          if (!draftData) {
            throw new Error('Draft not found');
          }
          
          console.log('Raw draft data from database:', draftData);
          
          // Parse content properly
          let segments: ThreadSegment[] = [];
          if (typeof draftData.content === 'string') {
            try {
              const parsed = JSON.parse(draftData.content);
              if (Array.isArray(parsed)) {
                segments = parsed.map((seg: any) => ({
                  id: seg.id || generateId(),
                  content: seg.content || '',
                  type: seg.type || 'text',
                }));
              } else {
                segments = [{ id: generateId(), content: draftData.content, type: 'text' }];
              }
            } catch {
              // If not JSON, treat as plain text
              segments = [{ id: generateId(), content: draftData.content, type: 'text' }];
            }
          } else if (Array.isArray(draftData.content)) {
            segments = draftData.content.map((seg: any) => ({
              id: seg.id || generateId(),
              content: seg.content || '',
              type: seg.type || 'text',
            }));
          } else {
            segments = [{ id: generateId(), content: '', type: 'text' }];
          }
          
          setThread({
            id: draftData.id,
            title: draftData.title || 'Untitled Draft',
            coverImage: null,
            segments: segments.length > 0 ? segments : [{ id: generateId(), content: '', type: 'text' }],
            tags: [],
            isPublic: false,
            lastSaved: draftData.updated_at ? new Date(draftData.updated_at) : null
          });
          
          toast({
            title: "Draft loaded",
            description: "Your draft has been loaded for editing.",
          });
        } catch (error) {
          console.error("Error loading draft:", error);
          toast({
            title: "Error loading draft",
            description: "The draft could not be loaded. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadThread();
  }, [draftId, forkId, remixFrom, threadId]);
  
  // Handler for when an editor is created and ready
  const handleEditorReady = (segmentId: string, editor: any) => {
    setEditors(prev => ({
      ...prev,
      [segmentId]: editor
    }));
  };
  
  // Handler for when an editor is destroyed
  const handleEditorDestroy = (segmentId: string) => {
    setEditors(prev => {
      const newEditors = { ...prev };
      delete newEditors[segmentId];
      return newEditors;
    });
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setThread(prev => ({ ...prev, title: e.target.value }));
  };
  
  const handleSegmentChange = (id: string, content: string) => {
    setThread(prev => ({
      ...prev,
      segments: prev.segments.map(segment => 
        segment.id === id ? { ...segment, content } : segment
      )
    }));
  };
  
  const handleAddSegment = () => {
    const newSegment = { id: generateId(), content: '', type: 'text' as const };
    setThread(prev => ({ ...prev, segments: [...prev.segments, newSegment] }));
  };
  
  const handleRemoveSegment = (id: string) => {
    if (thread.segments.length <= 1) {
      toast({
        title: "Cannot remove segment",
        description: "A thread must have at least one segment.",
        variant: "destructive"
      });
      return;
    }
    
    setThread(prev => ({
      ...prev,
      segments: prev.segments.filter(segment => segment.id !== id)
    }));
  };
  
  const handleSave = async (publish = false) => {
    try {
      setIsSaving(true);
      // Validate content
      if (!thread.title.trim()) {
        toast({
          title: "Title required",
          description: "Please add a title to your thread.",
          variant: "destructive"
        });
        return;
      }
      if (thread.segments.some(s => !s.content.trim())) {
        toast({
          title: "Empty segments",
          description: "Please fill in all segments or remove empty ones.",
          variant: "destructive"
        });
        return;
      }
      
      // Format data for the API
      const threadData = {
        title: thread.title,
        segments: thread.segments.map((seg, index) => ({
          id: seg.id,
          content: seg.content,
          order_index: index
        })),
        tags: thread.tags,
        is_published: publish,
        cover_image: thread.coverImage
      };
      
      let savedThread;
      if (isEditingThread) {
        // Update existing thread
        savedThread = await threadService.updateThread(
          thread.id,
          threadData
        );
      } else if (draftId && !forkId) {
        // Publishing a draft: create a new thread from the draft
        savedThread = await threadService.createThread(
          threadData.title,
          threadData.segments.map(s => s.content),
          threadData.tags,
          threadData.cover_image || undefined,
          true, // isPublished
          !thread.isPublic
        );
        await draftService.deleteDraft(draftId);
      } else {
        // Create new thread (normal flow)
        savedThread = await threadService.createThread(
          threadData.title,
          threadData.segments.map(s => s.content),
          threadData.tags,
          threadData.cover_image || undefined,
          publish,
          !thread.isPublic
        );
      }
      
      setThread(prev => ({ 
        ...prev, 
        id: savedThread.id,
        lastSaved: new Date()
      }));
      
      toast({
        title: publish ? "Thread published" : isEditingThread ? "Thread updated" : "Thread saved",
        description: publish 
          ? "Your thread has been published successfully." 
          : isEditingThread ? "Your thread has been updated." : "Your thread has been saved as a draft.",
      });
      
      if (publish) {
        navigate(`/thread/${savedThread.id}`);
      }
    } catch (error: any) {
      console.error("Error saving thread:", error);
      toast({
        title: "Error saving thread",
        description: error?.message || (typeof error === 'string' ? error : 'There was a problem saving your thread. Please try again.'),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleTagToggle = (tag: string) => {
    setThread(prev => {
      const exists = prev.tags.includes(tag);
      if (exists) {
        return { ...prev, tags: prev.tags.filter(t => t !== tag) };
      } else {
        if (prev.tags.length >= 5) {
          toast({
            title: "Maximum tags reached",
            description: "You can add up to 5 tags per thread.",
            variant: "destructive"
          });
          return prev;
        }
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };
  
  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    
    if (customTag.length > 20) {
      toast({
        title: "Tag too long",
        description: "Tags should be 20 characters or less.",
        variant: "destructive"
      });
      return;
    }
    
    if (thread.tags.includes(customTag)) {
      toast({
        description: "This tag already exists.",
        variant: "destructive"
      });
      return;
    }
    
    if (thread.tags.length >= 5) {
      toast({
        title: "Maximum tags reached",
        description: "You can add up to 5 tags per thread.",
        variant: "destructive"
      });
      return;
    }
    
    handleTagToggle(customTag);
    setCustomTag('');
  };

  const handlePrivacyChange = (isPublic: boolean) => {
    setThread(prev => ({ ...prev, isPublic }));
  };

  const handleAddCoverImage = () => {
    if (!coverImageUrl.trim()) return;
    
    setThread(prev => ({ ...prev, coverImage: coverImageUrl }));
    setCoverImageUrl('');
    setShowCoverImageField(false);
    
    toast({
      title: "Cover image added",
      description: "Your cover image has been added to the thread.",
    });
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      
      if (!thread.title.trim() && !thread.segments.some(s => s.content.trim())) {
        toast({
          title: "Cannot save empty draft",
          description: "Please add a title or some content before saving.",
          variant: "destructive"
        });
        return;
      }
      
      // Format data for the API
      const title = thread.title || 'Untitled Draft';
      const content = thread.segments;
      
      let savedDraft;
      if (draftId) {
        // Update existing draft
        savedDraft = await draftService.updateDraft(draftId, title, content);
      } else {
        // Create new draft
        savedDraft = await draftService.createDraft(title, content);
      }
      
      setThread(prev => ({ ...prev, id: savedDraft.id, lastSaved: new Date() }));
      
      toast({
        title: "Draft saved",
        description: "Your draft has been saved successfully.",
      });
      
    } catch (error: any) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: error?.message || 'There was a problem saving your draft. Please try again.',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold font-playfair min-h-[2.5rem]">
            {isEditingThread ? "Edit Thread" : "Create a New Thread"}
          </h1>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowPreview(true);
                setIsLoadingPreview(true);
                // Generate preview data
                setTimeout(() => {
                  setPreviewData({
                    title: thread.title || 'Untitled Thread',
                    segments: thread.segments,
                    tags: thread.tags,
                    authorName: 'You',
                    authorAvatar: null,
                    createdAt: new Date()
                  });
                  setIsLoadingPreview(false);
                }, 500);
              }}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileQuestion className="mr-2 h-4 w-4" />
                  Help
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-playfair">Creating a Great Thread</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium">Focus on Connections</h4>
                      <p className="text-sm text-muted-foreground">
                        Threads work best when each segment connects to the next one with a logical flow.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium">Keep Segments Focused</h4>
                      <p className="text-sm text-muted-foreground">
                        Each segment should contain one key idea. Use multiple segments for complex thoughts.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <AlertCircle className="h-5 w-5 text-threadspire-gold" />
                    </div>
                    <div>
                      <h4 className="font-medium">Choose Tags Carefully</h4>
                      <p className="text-sm text-muted-foreground">
                        Tags help others discover your thread. Be specific but not too niche.
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Thread Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={thread.title}
            onChange={handleTitleChange}
            placeholder="Enter a title for your thread"
            className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-threadspire-gold"
          />
        </div>
        
        {/* Cover Image */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              Cover Image
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCoverImageField(!showCoverImageField)}
            >
              {showCoverImageField ? 'Cancel' : 'Add Cover Image'}
            </Button>
          </div>
          
          {showCoverImageField && (
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-threadspire-gold"
              />
              <Button
                size="sm"
                onClick={handleAddCoverImage}
                disabled={!coverImageUrl.trim()}
              >
                Add
              </Button>
            </div>
          )}
          
          {thread.coverImage && (
            <div className="relative mt-2 rounded-md overflow-hidden">
              <img
                src={thread.coverImage}
                alt="Cover"
                className="w-full h-40 object-cover"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setThread(prev => ({ ...prev, coverImage: null }))}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Thread Segments */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Thread Segments</h2>
          </div>
          
          <div className="space-y-6">
            {thread.segments.map((segment) => (
              <div className="relative mb-8" key={segment.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Text</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveSegment(segment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Text Formatting Toolbar */}
                <div className="mb-2 p-1 border border-border rounded-md bg-background flex flex-wrap gap-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleBold().run()}
                          className={editors[segment.id]?.isActive('bold') ? 'bg-muted' : ''}
                        >
                          <Bold className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bold</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleItalic().run()}
                          className={editors[segment.id]?.isActive('italic') ? 'bg-muted' : ''}
                        >
                          <Italic className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Italic</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleHeading({ level: 1 }).run()}
                          className={editors[segment.id]?.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}
                        >
                          <Heading1 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Heading 1</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleHeading({ level: 2 }).run()}
                          className={editors[segment.id]?.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}
                        >
                          <Heading2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Heading 2</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleBulletList().run()}
                          className={editors[segment.id]?.isActive('bulletList') ? 'bg-muted' : ''}
                        >
                          <List className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Bullet List</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleOrderedList().run()}
                          className={editors[segment.id]?.isActive('orderedList') ? 'bg-muted' : ''}
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Numbered List</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const url = window.prompt('Enter the URL');
                            if (url) {
                              editors[segment.id]?.chain().focus().setLink({ href: url }).run();
                            }
                          }}
                          className={editors[segment.id]?.isActive('link') ? 'bg-muted' : ''}
                        >
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Add Link</TooltipContent>
                    </Tooltip>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => editors[segment.id]?.chain().focus().toggleBlockquote().run()}
                          className={editors[segment.id]?.isActive('blockquote') ? 'bg-muted' : ''}
                        >
                          <Quote className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Quote</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <SegmentEditor
                  segmentId={segment.id}
                  initialContent={segment.content}
                  onContentChange={(content) => handleSegmentChange(segment.id, content)}
                  onEditorReady={handleEditorReady}
                  onEditorDestroy={handleEditorDestroy}
                />
              </div>
            ))}
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                className="flex items-center"
                onClick={handleAddSegment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Segment
              </Button>
            </div>
          </div>
        </div>
        
        {/* Thread Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
          {/* Tags Selection */}
          <div>
            <h3 className="text-lg font-medium mb-3">Tags</h3>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {PREDEFINED_TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      thread.tags.includes(tag)
                        ? 'bg-threadspire-navy text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-1 focus:ring-threadspire-gold"
                  maxLength={20}
                />
                <Button 
                  size="sm"
                  disabled={!customTag.trim() || thread.tags.length >= 5}
                  onClick={handleAddCustomTag}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {thread.tags.map(tag => (
                  <div 
                    key={tag}
                    className="px-3 py-1 bg-threadspire-navy text-white rounded-full text-xs flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="ml-2 focus:outline-none"
                      aria-label={`Remove ${tag} tag`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              {thread.tags.length >= 5 && (
                <p className="text-xs text-muted-foreground">
                  Maximum of 5 tags reached.
                </p>
              )}
            </div>
          </div>
          
          {/* Privacy Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">Privacy</h3>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handlePrivacyChange(true)}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    thread.isPublic ? 'bg-threadspire-navy text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Public
                </button>
                <button
                  onClick={() => handlePrivacyChange(false)}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    !thread.isPublic ? 'bg-threadspire-navy text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Private
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {thread.isPublic 
                  ? 'Public threads are visible to all users and can be featured on the explore page.'
                  : 'Private threads are only visible to you.'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-4 border-t border-border">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          
          <Button 
            onClick={() => handleSave(true)} 
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditingThread ? "Updating..." : "Publishing..."}
              </>
            ) : (
              <>
                {isEditingThread ? "Update" : "Publish"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ThreadCreatorFixed;
