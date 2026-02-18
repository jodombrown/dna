/**
 * DNA Platform — Typed Supabase Singleton
 *
 * Use this instead of `supabase as any` for provisional tables.
 * See src/types/database.types.augmentation.ts for table shapes.
 */

import { supabase } from '@/integrations/supabase/client';
import { createTypedSupabase } from '@/types/database.types.augmentation';

export const typedSupabase = createTypedSupabase(supabase);
