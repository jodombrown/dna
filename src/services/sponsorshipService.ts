/**
 * DNA Platform — Sponsorship Service
 * Handles sponsor CRUD, placement fetching, and analytics tracking.
 */

import { supabase } from '@/integrations/supabase/client';

export interface Sponsor {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  website_url: string | null;
  tier: string;
  contact_name: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SponsorPlacement {
  id: string;
  sponsor_id: string;
  placement: string;
  headline: string | null;
  cta_label: string | null;
  cta_url: string | null;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  impression_count: number;
  click_count: number;
  created_at: string;
  sponsors?: Sponsor;
}

export interface SponsorWithPlacements extends Sponsor {
  sponsor_placements?: SponsorPlacement[];
}

const db = supabase as ReturnType<typeof supabase['from']> extends never ? typeof supabase : typeof supabase;

export const sponsorshipService = {
  /** Fetch active placements for a given location with sponsor data */
  async getActivePlacements(placement: string): Promise<SponsorPlacement[]> {
    const now = new Date().toISOString();
    const { data, error } = await (supabase as any)
      .from('sponsor_placements')
      .select('*, sponsors(*)')
      .eq('placement', placement)
      .eq('is_active', true)
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('priority', { ascending: true });

    if (error) throw error;

    // Filter to only include placements where the sponsor is also active
    return (data || []).filter((p: SponsorPlacement) => p.sponsors?.is_active !== false);
  },

  /** Track impression via RPC */
  async trackImpression(placementId: string): Promise<void> {
    await supabase.rpc('track_sponsor_impression', { placement_id: placementId });
  },

  /** Track click via RPC */
  async trackClick(placementId: string): Promise<void> {
    await supabase.rpc('track_sponsor_click', { placement_id: placementId });
  },

  // ─── Admin CRUD ──────────────────────────────────────────────────────

  async getAllSponsors(): Promise<SponsorWithPlacements[]> {
    const { data, error } = await (supabase as any)
      .from('sponsors')
      .select('*, sponsor_placements(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async createSponsor(sponsor: Partial<Sponsor>): Promise<Sponsor> {
    const { data, error } = await (supabase as any)
      .from('sponsors')
      .insert(sponsor)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateSponsor(id: string, updates: Partial<Sponsor>): Promise<Sponsor> {
    const { data, error } = await (supabase as any)
      .from('sponsors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSponsor(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('sponsors')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async createPlacement(placement: Partial<SponsorPlacement>): Promise<SponsorPlacement> {
    const { data, error } = await (supabase as any)
      .from('sponsor_placements')
      .insert(placement)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePlacement(id: string, updates: Partial<SponsorPlacement>): Promise<SponsorPlacement> {
    const { data, error } = await (supabase as any)
      .from('sponsor_placements')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePlacement(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('sponsor_placements')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },
};
