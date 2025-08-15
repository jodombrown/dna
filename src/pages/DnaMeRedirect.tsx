import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const DnaMeRedirect: React.FC = () => {
  const [to, setTo] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTo('/auth');
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.error('Profile lookup error:', error);
      }
      setTo(data?.username ? `/dna/${data.username}` : '/dna');
    };
    run();
  }, []);

  if (!to) return null;
  return <Navigate to={to} replace />;
};

export default DnaMeRedirect;
