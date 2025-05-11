import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ReactionType, reactionService } from '@/lib/services/reaction.service';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ReactionBarProps {
  threadId: string;
}

const ReactionBar = ({ threadId }: ReactionBarProps) => {
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    '🧠': 0,
    '🔥': 0,
    '👏': 0,
    '👀': 0,
    '⚠': 0
  });
  const [totalReactions, setTotalReactions] = useState(0);
  const [recentReactors, setRecentReactors] = useState<string[]>([]);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    if (!threadId) return;
    
    // Load initial reaction counts
    const loadReactions = async () => {
      try {
        const counts = await reactionService.getReactionCounts(threadId);
        setReactionCounts(counts);
        setTotalReactions(Object.values(counts).reduce((sum, count) => sum + count, 0));
        
        // Get recent reactors (up to 3)
        const { data: recentReactionsData } = await supabase
          .from('reactions')
          .select(`
            user_id,
            profiles:user_id(name)
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentReactionsData && recentReactionsData.length > 0) {
          const names = recentReactionsData.map(reaction => 
            reaction.profiles?.name || 'Anonymous User'
          );
          setRecentReactors(names);
        }
        
        if (isAuthenticated) {
          const userReactions = await reactionService.getUserReactions(threadId);
          setUserReactions(userReactions);
        }
      } catch (error) {
        console.error('Error loading reactions:', error);
      }
    };
    
    loadReactions();
    
    // Subscribe to reaction changes
    const subscription = reactionService.subscribeToReactions(threadId, (reactions) => {
      const newCounts = { ...reactionCounts };
      reactions.forEach(r => {
        newCounts[r.type] = r.count;
      });
      setReactionCounts(newCounts);
      setTotalReactions(reactions.reduce((sum, reaction) => sum + reaction.count, 0));
      
      // Refresh recent reactors on changes
      const refreshRecentReactors = async () => {
        const { data: recentReactionsData } = await supabase
          .from('reactions')
          .select(`
            user_id,
            profiles:user_id(name)
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recentReactionsData && recentReactionsData.length > 0) {
          const names = recentReactionsData.map(reaction => 
            reaction.profiles?.name || 'Anonymous User'
          );
          setRecentReactors(names);
        }
      };
      
      refreshRecentReactors();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [threadId, isAuthenticated]);
  
  const handleReaction = async (type: ReactionType) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to react to threads",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userReactions.includes(type)) {
        // Remove reaction (toggle off)
        await reactionService.removeReaction(threadId, type);
        setUserReactions([]);
        setReactionCounts(prev => ({
          ...prev,
          [type]: Math.max(0, prev[type] - 1)
        }));
      } else {
        // Remove any existing reaction first (if any)
        if (userReactions.length > 0) {
          await reactionService.removeReaction(threadId, userReactions[0]);
        }
        // Add new reaction
        await reactionService.addReaction(threadId, type);
        setUserReactions([type]);
        setReactionCounts(prev => ({
          ...prev,
          [type]: prev[type] + 1
        }));
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction",
        variant: "destructive"
      });
    }
  };
  
  // Display reaction summary if there are reactions
  if (totalReactions > 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 group">
          <div className="flex">
            {Object.entries(reactionCounts)
              .filter(([_, count]) => count > 0)
              .slice(0, 3)
              .map(([type, _]) => (
                <span key={type} className="inline-block -ml-1 first:ml-0">
                  {type}
                </span>
              ))}
          </div>
          
          <span className="text-sm text-muted-foreground group-hover:underline cursor-pointer">
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </span>
        </div>
        
        {recentReactors.length > 0 && (
          <div className="text-xs text-muted-foreground hidden md:block">
            {recentReactors.length === 1 
              ? `${recentReactors[0]} reacted` 
              : recentReactors.length === 2 
                ? `${recentReactors[0]} and ${recentReactors[1]} reacted`
                : `${recentReactors[0]}, ${recentReactors[1]}, and ${totalReactions - 2} others reacted`
            }
          </div>
        )}
        
        <div className="flex bg-secondary/20 rounded-full p-1">
          {(['🧠', '🔥', '👏', '👀', '⚠'] as ReactionType[]).map(type => (
            <Button 
              key={type}
              variant="ghost" 
              size="sm"
              className={`px-2 rounded-full ${userReactions.includes(type) ? 'bg-secondary' : ''}`}
              onClick={() => handleReaction(type)}
            >
              <span>{type}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  }
  
  // Default reaction buttons when no reactions yet
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        className={`px-2 ${userReactions.includes('🧠') ? 'bg-muted' : ''}`}
        onClick={() => handleReaction('🧠')}
      >
        <span className="mr-1">🧠</span>
        <span className="text-xs">{reactionCounts['🧠']}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className={`px-2 ${userReactions.includes('🔥') ? 'bg-muted' : ''}`}
        onClick={() => handleReaction('🔥')}
      >
        <span className="mr-1">🔥</span>
        <span className="text-xs">{reactionCounts['🔥']}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className={`px-2 ${userReactions.includes('👏') ? 'bg-muted' : ''}`}
        onClick={() => handleReaction('👏')}
      >
        <span className="mr-1">👏</span>
        <span className="text-xs">{reactionCounts['👏']}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className={`px-2 ${userReactions.includes('👀') ? 'bg-muted' : ''}`}
        onClick={() => handleReaction('👀')}
      >
        <span className="mr-1">👀</span>
        <span className="text-xs">{reactionCounts['👀']}</span>
      </Button>
      
      <Button 
        variant="ghost" 
        size="sm"
        className={`px-2 ${userReactions.includes('⚠') ? 'bg-muted' : ''}`}
        onClick={() => handleReaction('⚠')}
      >
        <span className="mr-1">⚠</span>
        <span className="text-xs">{reactionCounts['⚠']}</span>
      </Button>
    </div>
  );
};

export default ReactionBar;
