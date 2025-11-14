import { supabase } from '@/integrations/supabase/client';

// Temporary helper to bypass TypeScript errors for new tables
// until Supabase regenerates the types file
export const supabaseClient = supabase as any;
