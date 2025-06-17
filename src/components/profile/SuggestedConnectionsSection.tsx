
import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User } from "lucide-react";

interface SuggestedConnectionsSectionProps {
  userId: string;
  countryOfOrigin?: string;
  location?: string;
  onConnect?: (profileId: string) => void;
}

const SuggestedConnectionsSection: React.FC<SuggestedConnectionsSectionProps> = ({
  userId,
  countryOfOrigin,
  location,
  onConnect,
}) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchSuggestions() {
      setLoading(true);
      try {
        // Simple query to get profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .neq('user_id', userId)
          .limit(5);

        if (error) {
          console.error('Error fetching suggestions:', error);
          setProfiles([]);
        } else {
          setProfiles(data || []);
        }
      } catch (e) {
        console.error('Error in fetchSuggestions:', e);
        setProfiles([]);
      } finally {
        setLoading(false);
      }
    }
    
    if (userId) {
      fetchSuggestions();
    }
  }, [userId, countryOfOrigin, location]);

  if (loading) return <div className="text-sm text-gray-400 py-4">Loading…</div>;
  if (!profiles.length)
    return <div className="text-sm text-gray-500 py-4">No suggestions yet—fill out more profile fields for better matches.</div>;

  return (
    <div className="grid gap-3">
      {profiles.map((p) => (
        <Card key={p.id} className="flex flex-row gap-4 items-center p-4">
          <img
            src={p.avatar_url || "/placeholder.svg"}
            className="w-10 h-10 rounded-full border bg-gray-100"
            alt={p.full_name || 'Profile'}
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-medium text-dna-forest truncate">{p.full_name || 'DNA Member'}</span>
            <span className="text-xs text-gray-600 truncate">{p.professional_role || 'Professional'}</span>
            <span className="text-xs text-gray-400">{p.company || ''}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onConnect?.(p.id)}>
            <User className="w-4 h-4 mr-1" /> Connect
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default SuggestedConnectionsSection;
