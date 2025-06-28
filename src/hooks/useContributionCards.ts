
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

      const formattedCards: ContributionCard[] = data?.map(card => ({
        id: card.id,
        created_by: card.created_by,
        title: card.title,
        description: card.description,
        contribution_type: card.contribution_type as ContributionCard['contribution_type'],
        impact_area: card.impact_area,
        location: card.location,
        amount_needed: card.amount_needed,
        amount_raised: card.amount_raised || 0,
        target_date: card.target_date,
        status: card.status as ContributionCard['status'],
        image_url: card.image_url,
        created_at: card.created_at,
        creator: (card.profiles && typeof card.profiles === 'object' && 'full_name' in card.profiles && card.profiles !== null) ? {
          full_name: card.profiles.full_name || 'Unknown User',
          avatar_url: card.profiles.avatar_url || undefined
        } : undefined
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

      const newCard: ContributionCard = {
        id: data.id,
        created_by: data.created_by,
        title: data.title,
        description: data.description,
        contribution_type: data.contribution_type as ContributionCard['contribution_type'],
        impact_area: data.impact_area,
        location: data.location,
        amount_needed: data.amount_needed,
        amount_raised: data.amount_raised || 0,
        target_date: data.target_date,
        status: data.status as ContributionCard['status'],
        image_url: data.image_url,
        created_at: data.created_at,
        creator: (data.profiles && typeof data.profiles === 'object' && 'full_name' in data.profiles && data.profiles !== null) ? {
          full_name: data.profiles.full_name || 'Unknown User',
          avatar_url: data.profiles.avatar_url || undefined
        } : undefined
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
