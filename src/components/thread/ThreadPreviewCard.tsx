import React from 'react';
import { User, Calendar, MessageSquare, Heart, BookmarkPlus, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { stripHtmlTags } from '@/lib/utils/html-utils';

interface ThreadPreviewCardProps {
  title: string;
  coverImage: string | null;
  content: string[];
  tags: string[];
  isPublic: boolean;
  authorName?: string;
  authorAvatar?: string;
  createdAt?: Date;
  onClose?: () => void;
}

const ThreadPreviewCard: React.FC<ThreadPreviewCardProps> = ({
  title,
  coverImage,
  content,
  tags,
  isPublic,
  authorName,
  authorAvatar,
  createdAt = new Date(),
  onClose
}) => {
  const { user } = useAuth();
  
  // Use the logged-in user's info if no author provided
  const displayName = authorName || user?.user_metadata?.name || 'Anonymous';
  const avatarUrl = authorAvatar || user?.user_metadata?.avatar_url;
  
  return (
    <div className="bg-card border border-border rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto animate-fade-in">
      {/* Cover image */}
      {coverImage && (
        <div className="w-full h-64 overflow-hidden">
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
          />
        </div>
      )}
      
      <div className="p-6">
        {/* Privacy badge */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPublic ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'}`}>
            {isPublic ? 'Public' : 'Private'}
          </span>
        </div>
        
        {/* Title */}
        <h2 className="text-2xl font-playfair font-semibold mb-3">{title || 'Untitled Thread'}</h2>
        
        {/* Author info */}
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-full bg-threadspire-navy text-white flex items-center justify-center overflow-hidden mr-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="font-medium">{displayName}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>{createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-threadspire-navy/10 text-threadspire-navy dark:bg-threadspire-navy/20 dark:text-threadspire-paper rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Content preview */}
        <div className="space-y-4 mb-6">
          {content && content.length > 0 ? (
            content.map((segment, index) => (
              <div key={index} className="prose dark:prose-invert max-w-none">
                {segment ? (
                  // Strip all HTML tags for clean preview
                  <p>{stripHtmlTags(segment)}</p>
                ) : (
                  <p className="text-muted-foreground italic">Empty segment</p>
                )}
                {index < content.length - 1 && (
                  <div className="my-4 border-b border-border w-1/4 mx-auto" />
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground italic">No content available for preview</p>
          )}
        </div>
        
        {/* Interaction buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Heart className="h-4 w-4 mr-1" />
              <span>0</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span>0</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <BookmarkPlus className="h-4 w-4 mr-1" />
              <span>Save</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Share2 className="h-4 w-4 mr-1" />
              <span>Share</span>
            </Button>
          </div>
          
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close Preview
            </Button>
          )}
        </div>
      </div>
      
      {/* Preview watermark */}
      <div className="absolute top-2 right-2 bg-threadspire-navy text-white text-xs px-2 py-1 rounded opacity-70">
        Preview
      </div>
    </div>
  );
};

export default ThreadPreviewCard;
