import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Recursively lists and removes every object under `prefix` in `bucket`.
 * Supabase Storage's `list()` only returns one level at a time (folder
 * entries come back with `id: null`), so nested paths — e.g.
 * dna-media-public/${uid}/${surface}/... — have to be walked explicitly.
 */
async function removeUserStorage(
  admin: ReturnType<typeof createClient>,
  bucket: string,
  prefix: string
): Promise<void> {
  const stack = [prefix];
  const filesToRemove: string[] = [];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    const { data: entries, error } = await admin.storage.from(bucket).list(dir, { limit: 1000 });
    if (error || !entries) continue;
    for (const entry of entries) {
      const fullPath = `${dir}/${entry.name}`;
      if (entry.id === null) {
        stack.push(fullPath);
      } else {
        filesToRemove.push(fullPath);
      }
    }
  }
  if (filesToRemove.length > 0) {
    const { error: removeErr } = await admin.storage.from(bucket).remove(filesToRemove);
    if (removeErr) {
      console.warn(`Storage cleanup: remove failed for ${bucket}/${prefix}:`, removeErr.message);
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
      return new Response(JSON.stringify({ ok: false, error: "Server config error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      console.error("getUser failed", userErr);
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Best-effort cleanup of the user's storage objects before deleting DB
    // rows/the auth user. These are the buckets that actually key files by
    // uid-prefixed path in current upload code (avatars/${uid}/..,
    // dna-media-public/${uid}/${surface}/.., post-media/${uid}/..); other
    // bucket names referenced historically (banners, event-images, etc.)
    // have no live uploader writing to them and are skipped.
    for (const bucket of ["avatars", "dna-media-public", "post-media"]) {
      try {
        await removeUserStorage(admin, bucket, userId);
      } catch (storageErr) {
        console.warn(`Storage cleanup failed for ${bucket}:`, storageErr);
      }
    }

    // Best-effort cleanup of user-related rows before deleting the auth user.
    // `connection_preferences`/`connection_intentions`/`connection_events`
    // were dropped entirely (migration 20251001163626) — deleting from them
    // is dead code. `connections`' real columns are `requester_id`/
    // `recipient_id`, not `a`/`b` (see src/integrations/supabase/types.ts).
    const deletions = [
      { table: "connections", col: "requester_id" },
      { table: "connections", col: "recipient_id" },
      { table: "dia_nudges", col: "user_id" },
      { table: "dia_recommendations", col: "user_id" },
      { table: "dia_events", col: "user_id" },
      { table: "dia_user_usage", col: "user_id" },
      { table: "dia_query_log", col: "user_id" },
      { table: "dia_preferences", col: "user_id" },
      { table: "dia_messaging_events", col: "user_id" },
      { table: "profiles", col: "id" },
    ];

    for (const d of deletions) {
      const { error } = await admin.from(d.table).delete().eq(d.col, userId);
      if (error) {
        // Log but don't fail the entire process; continue best-effort
        console.warn(`Delete from ${d.table} failed:`, error.message);
      }
    }

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      console.error("admin.deleteUser failed", delErr);
      return new Response(JSON.stringify({ ok: false, error: "Failed to delete account" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("delete-account error", err);
    return new Response(JSON.stringify({ ok: false, error: err?.message || String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
