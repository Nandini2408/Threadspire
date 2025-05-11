import React, { useState } from 'react';
import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { localCollectionService } from '@/lib/services/local-collections.service';
import { useToast } from '@/hooks/use-toast';
import AddToCollectionDialog from './AddToCollectionDialog';

interface ThreadCollectionButtonProps {
  threadId: string;
}

const ThreadCollectionButton: React.FC<ThreadCollectionButtonProps> = ({ threadId }) => {
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const handleSuccess = () => {
    toast({
      title: 'Success',
      description: 'Thread added to collection',
    });
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-1"
        onClick={() => setShowDialog(true)}
      >
        <FolderPlus className="h-4 w-4" />
        <span className="hidden md:inline">Add to Collection</span>
      </Button>

      <AddToCollectionDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        threadId={threadId}
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default ThreadCollectionButton;
