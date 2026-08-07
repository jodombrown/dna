// Kept in sync with the canonical rules in src/lib/username/validation.ts
// (USERNAME_RULES) — this module previously allowed dots and up to 30
// characters, while the canonical rules allow neither, defining two
// conflicting username policies. This file is currently only referenced
// from an _archived component (dead code), but a stale, more permissive
// regex left lying around is exactly the kind of thing that silently
// reactivates a bug if that code is ever un-archived.
export const USERNAME_REGEX = /^[a-z0-9_-]{3,20}$/;

export const normalizeUsername = (name: string) => (name || '').trim().toLowerCase();

export const isValidUsername = (name: string) => {
  const v = normalizeUsername(name);
  return USERNAME_REGEX.test(v);
};

import { supabase } from '@/integrations/supabase/client';
export const isUsernameAvailable = async (name: string, excludeUserId?: string) => {
  const v = normalizeUsername(name);
  if (!isValidUsername(v)) return false;
  const query = supabase.from('profiles').select('id').eq('username', v).limit(1);
  const { data, error } = excludeUserId ? await query.neq('id', excludeUserId) : await query;
  if (error) throw error;
  return !data || data.length === 0;
};
