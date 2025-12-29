/**
 * Auto-Archive Releases Edge Function
 *
 * This function automatically archives releases that are older than 90 days
 * and are not pinned. It should be run on a daily cron schedule.
 *
 * Cron schedule: 0 0 * * * (daily at midnight)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ArchiveResult {
  ok: boolean;
  archived_count: number;
  archived_slugs: string[];
  error?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Calculate the cutoff date (90 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);
    const cutoffISOString = cutoffDate.toISOString().split("T")[0]; // YYYY-MM-DD format

    console.log(`Auto-archive: Checking for releases older than ${cutoffISOString}`);

    // First, get the slugs of releases that will be archived
    const { data: toArchive, error: selectError } = await supabase
      .from("releases")
      .select("slug")
      .eq("status", "published")
      .eq("is_pinned", false)
      .lt("release_date", cutoffISOString);

    if (selectError) {
      throw new Error(`Select error: ${selectError.message}`);
    }

    const slugsToArchive = (toArchive || []).map((r) => r.slug);

    if (slugsToArchive.length === 0) {
      console.log("Auto-archive: No releases to archive");
      return new Response(
        JSON.stringify({
          ok: true,
          archived_count: 0,
          archived_slugs: [],
          message: "No releases to archive",
        } satisfies ArchiveResult),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Archive the releases
    const { data: updated, error: updateError } = await supabase
      .from("releases")
      .update({
        status: "archived",
        archived_at: new Date().toISOString(),
      })
      .eq("status", "published")
      .eq("is_pinned", false)
      .lt("release_date", cutoffISOString)
      .select("slug");

    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`);
    }

    const archivedSlugs = (updated || []).map((r) => r.slug);

    console.log(`Auto-archive: Archived ${archivedSlugs.length} releases:`, archivedSlugs);

    return new Response(
      JSON.stringify({
        ok: true,
        archived_count: archivedSlugs.length,
        archived_slugs: archivedSlugs,
      } satisfies ArchiveResult),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("Auto-archive error:", err);

    return new Response(
      JSON.stringify({
        ok: false,
        archived_count: 0,
        archived_slugs: [],
        error: err?.message || String(err),
      } satisfies ArchiveResult),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
