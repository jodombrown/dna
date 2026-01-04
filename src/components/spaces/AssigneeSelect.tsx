import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface MemberWithProfile {
  user_id: string;
  profile?: {
    username: string | null;
    full_name: string | null;
  };
}

export default function AssigneeSelect({ spaceId, value, onChange }: { spaceId: string; value?: string|null; onChange: (uid: string) => void }) {
  const [members, setMembers] = useState<MemberWithProfile[]>([]);
  
  useEffect(() => { 
    (async () => {
      // Step 1: Fetch memberships
      const { data: memberships } = await supabase
        .from('collaboration_memberships')
        .select('user_id')
        .eq('space_id', spaceId)
        .eq('status', 'approved');
      
      if (!memberships || memberships.length === 0) {
        setMembers([]);
        return;
      }

      // Step 2: Fetch profiles separately
      const userIds = [...new Set(memberships.map(m => m.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .in('id', userIds);

      // Step 3: Merge data
      const profilesMap = new Map(profiles?.map(p => [p.id, p]) || []);
      const membersWithProfiles = memberships.map(m => ({
        user_id: m.user_id,
        profile: profilesMap.get(m.user_id) || null,
      }));

      setMembers(membersWithProfiles);
    })(); 
  }, [spaceId]);

  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-48"><SelectValue placeholder="Assign to" /></SelectTrigger>
      <SelectContent>
        {members.map(m => (
          <SelectItem key={m.user_id} value={m.user_id}>
            {m.profile?.full_name || m.profile?.username || m.user_id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
