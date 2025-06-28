
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ContributionCard {
  id: string;
  created_by: string;
  title: string;
  description?: string;
  contribution_type: 'funding' | 'skills' | 'time' | 'network' | 'advocacy' | 'mentorship' | 'resources';
  impact_area?: string;
  location?: string;
  amount_needed?: number;
  amount_raised: number;
  target_date?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  image_url?: string;
  created_at: string;
  creator?: {
    full_name: string;
    avatar_url?: string;
  };
}

export const useContributionCards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cards, setCards] = useState<ContributionCard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contribution_cards')
        .select(`
          *,
          profiles!contribution_cards_created_by_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCards = data?.map(card => ({
        ...card,
        creator: card.profiles
      })) || [];

      setCards(formattedCards);
    } catch (error) {
      console.error('Error fetching contribution cards:', error);
      toast({
        title: "Error",
        description: "Failed to load contribution opportunities",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCard = async (cardData: Omit<ContributionCard, 'id' | 'created_by' | 'amount_raised' | 'created_at' | 'creator'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('contribution_cards')
        .insert({
          ...cardData,
          created_by: user.id
        })
        .select(`
          *,
          profiles!contribution_cards_created_by_fkey (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;

      const newCard = {
        ...data,
        creator: data.profiles
      };

      setCards(prev => [newCard, ...prev]);
      
      toast({
        title: "Success",
        description: "Contribution opportunity created successfully!",
      });

      return newCard;
    } catch (error) {
      console.error('Error creating contribution card:', error);
      toast({
        title: "Error",
        description: "Failed to create contribution opportunity",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  return {
    cards,
    loading,
    createCard,
    refreshCards: fetchCards
  };
};
