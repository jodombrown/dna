import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function AssigneeSelect({ spaceId, value, onChange }: { spaceId: string; value?: string|null; onChange: (uid: string) => void }) {
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => { (async () => {
    const { data } = await supabase
      .from('collaboration_memberships')
      .select('user_id, profiles!inner(username, full_name)')
      .eq('space_id', spaceId).eq('status','approved');
    setMembers(data || []);
  })(); }, [spaceId]);
  return (
    <Select value={value || ''} onValueChange={onChange}>
      <SelectTrigger className="w-48"><SelectValue placeholder="Assign to" /></SelectTrigger>
      <SelectContent>
        {members.map(m => (
          <SelectItem key={m.user_id} value={m.user_id}>{m.profiles?.full_name || m.profiles?.username || m.user_id}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
