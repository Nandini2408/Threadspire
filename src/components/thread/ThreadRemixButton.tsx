import React, { useState } from 'react';
import { GitFork } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { threadService } from '@/lib/services/thread.service';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ThreadRemixButtonProps {
  threadId: string;
  authorName: string;
  compact?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

const ThreadRemixButton: React.FC<ThreadRemixButtonProps> = ({
  threadId,
  authorName,
  compact = false,
  variant = 'outline',
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleRemix = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to remix this thread',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsRemixing(true);
      const forkedThread = await threadService.forkThread(threadId);
      toast({
        title: 'Success',
        description: 'Thread remixed successfully! You can now edit it.',
      });
      setIsDialogOpen(false);
      // Navigate to edit the forked thread
      navigate(`/create?edit=${forkedThread.id}`);
    } catch (error) {
      console.error('Error remixing thread:', error);
      toast({
        title: 'Error',
        description: 'Failed to remix thread',
        variant: 'destructive',
      });
    } finally {
      setIsRemixing(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={compact ? 'sm' : 'default'}
        onClick={() => setIsDialogOpen(true)}
        className={compact ? 'px-2' : ''}
      >
        <GitFork className={`h-4 w-4 ${!compact ? 'mr-2' : ''}`} />
        {!compact && 'Remix'}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remix this thread</DialogTitle>
            <DialogDescription>
              This will create a copy of the thread that you can edit and publish as your own.
              The original author will be credited as inspiration.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              When you publish your remixed version, it will be marked as
              <span className="font-medium"> "Inspired by {authorName}"</span> and the
              original author will be notified.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isRemixing}>
              Cancel
            </Button>
            <Button onClick={handleRemix} disabled={isRemixing}>
              {isRemixing ? 'Remixing...' : 'Remix Thread'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThreadRemixButton;
