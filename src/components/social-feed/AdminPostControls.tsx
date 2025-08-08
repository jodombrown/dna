import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdminPostControlsProps {
  postId: string;
  currentType?: string | null;
  currentStatus?: string | null;
  onUpdated?: () => void;
}

export const AdminPostControls: React.FC<AdminPostControlsProps> = ({ postId, currentType, currentStatus, onUpdated }) => {
  const { toast } = useToast();

  const updatePost = async (updates: { type?: string; status?: string }) => {
    try {
      const { error } = await supabase.from('posts').update(updates).eq('id', postId);
      if (error) throw error;
      toast({ title: 'Post updated', description: 'Changes saved successfully.' });
      onUpdated?.();
    } catch (e: any) {
      console.error('Admin update post error:', e);
      toast({ title: 'Update failed', description: e.message || 'Please try again.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex items-center gap-2 pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => updatePost({ type: 'opportunity', status: currentStatus || 'published' })}
      >
        Mark as Opportunity
      </Button>
      <Button
        variant="secondary"
        size="sm"
        className="bg-dna-gold text-black hover:bg-dna-gold/90"
        onClick={() => updatePost({ type: 'spotlight', status: 'featured' })}
      >
        Spotlight
      </Button>
    </div>
  );
};
