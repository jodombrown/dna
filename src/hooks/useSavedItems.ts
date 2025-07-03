
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/CleanAuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SavedItem {
  id: string;
  user_id: string;
  target_type: 'post' | 'event' | 'opportunity';
  target_id: string;
  created_at: string;
}

export const useSavedItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSavedItems = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type cast the data to ensure target_type is properly typed
      const typedData = data?.map(item => ({
        ...item,
        target_type: item.target_type as 'post' | 'event' | 'opportunity'
      })) || [];
      
      setSavedItems(typedData);
    } catch (error) {
      console.error('Error fetching saved items:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveItem = async (targetType: 'post' | 'event' | 'opportunity', targetId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save content",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_items')
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Already Saved",
            description: "This content is already in your saved items",
          });
          return false;
        }
        throw error;
      }

      toast({
        title: "Saved!",
        description: "Content added to your saved items",
      });

      // Refresh saved items
      fetchSavedItems();
      return true;
    } catch (error) {
      console.error('Error saving item:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
      return false;
    }
  };

  const unsaveItem = async (targetType: 'post' | 'event' | 'opportunity', targetId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('target_id', targetId);

      if (error) throw error;

      toast({
        title: "Removed",
        description: "Content removed from saved items",
      });

      // Refresh saved items
      fetchSavedItems();
      return true;
    } catch (error) {
      console.error('Error unsaving item:', error);
      toast({
        title: "Error",
        description: "Failed to remove content",
        variant: "destructive",
      });
      return false;
    }
  };

  const isSaved = (targetType: 'post' | 'event' | 'opportunity', targetId: string) => {
    return savedItems.some(item => 
      item.target_type === targetType && item.target_id === targetId
    );
  };

  const toggleSave = async (targetType: 'post' | 'event' | 'opportunity', targetId: string) => {
    if (isSaved(targetType, targetId)) {
      return await unsaveItem(targetType, targetId);
    } else {
      return await saveItem(targetType, targetId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedItems();
    }
  }, [user]);

  return {
    savedItems,
    loading,
    saveItem,
    unsaveItem,
    isSaved,
    toggleSave,
    refreshSavedItems: fetchSavedItems
  };
};
