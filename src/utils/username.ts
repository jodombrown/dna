export const USERNAME_REGEX = /^[a-z0-9._-]{3,30}$/;

export const normalizeUsername = (name: string) => (name || '').trim().toLowerCase();

export const isValidUsername = (name: string) => {
  const v = normalizeUsername(name);
  return USERNAME_REGEX.test(v);
};

import { supabase } from '@/integrations/supabase/client';
export const isUsernameAvailable = async (name: string, excludeUserId?: string) => {
  const v = normalizeUsername(name);
  if (!isValidUsername(v)) return false;
  
  // Use case-insensitive check to match the unique index
  const query = supabase.from('profiles').select('id').ilike('username', v).limit(1);
  const { data, error } = excludeUserId ? await query.neq('id', excludeUserId) : await query;
  if (error) throw error;
  return !data || data.length === 0;
};
