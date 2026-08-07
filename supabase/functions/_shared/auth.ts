// Shared auth guards for edge functions.
// Centralizes JWT validation, admin role checks, and cron/service-role gating.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const CRON_SECRET = Deno.env.get("CRON_SECRET") ?? "";

export type AuthOk = { ok: true; userId: string; token: string; email: string | null };
export type AuthErr = { ok: false; response: Response };
export type AuthResult = AuthOk | AuthErr;

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Content-Type": "application/json",
};

function unauthorized(message = "Unauthorized"): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: baseHeaders,
  });
}

function forbidden(message = "Forbidden"): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: baseHeaders,
  });
}

/** Require a valid user JWT. Returns the user id. */
export async function requireUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return { ok: false, response: unauthorized() };
  const token = authHeader.slice(7);

  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return { ok: false, response: unauthorized() };
  return { ok: true, userId: data.user.id, token, email: data.user.email ?? null };
}

/** Require a valid user JWT AND that the user has the 'admin' role. */
export async function requireAdmin(req: Request): Promise<AuthResult> {
  const result = await requireUser(req);
  if (!result.ok) return result;

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: roleRow } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", result.userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!roleRow) return { ok: false, response: forbidden("Admin access required") };
  return result;
}

/**
 * Require an internal caller: either the service-role key as Bearer token,
 * or a matching CRON_SECRET in the x-cron-secret header. Used to lock down
 * scheduled cron jobs and internal-only endpoints.
 */
export function requireInternal(req: Request): AuthResult {
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (SUPABASE_SERVICE_ROLE_KEY && bearer === SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: true, userId: "service_role", token: bearer, email: null };
  }
  const cron = req.headers.get("x-cron-secret") ?? "";
  if (CRON_SECRET && cron === CRON_SECRET) {
    return { ok: true, userId: "cron", token: cron, email: null };
  }
  return { ok: false, response: unauthorized("Internal endpoint: service-role or cron secret required") };
}

/** Simple HTML escape for safe interpolation into email/HTML templates. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isBlockedIPv4(ipv4: string): boolean {
  const parts = ipv4.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/** Validate that a URL is https and not pointing at private/internal IP ranges (SSRF guard). */
export function isSafePublicUrl(rawUrl: string, allowedHosts?: string[]): boolean {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  // The WHATWG URL parser (used here via `new URL()`) already canonicalizes
  // alternate IPv4 notations — decimal ("2130706433"), hex ("0x7f000001"),
  // octal ("0177.0.0.1") — into dotted-decimal form, so the plain regex
  // check below catches those without extra work. IPv6 literals come back
  // bracketed and compressed (e.g. "[::ffff:7f00:1]").
  const rawHost = url.hostname.toLowerCase();
  const host = rawHost.replace(/^\[|\]$/g, ""); // strip IPv6 brackets, if present

  // Block obvious internal targets
  const blocked = [
    "localhost",
    "metadata.google.internal",
  ];
  if (blocked.includes(host)) return false;

  // Block IPv4 private/link-local
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isBlockedIPv4(host)) return false;

  // Block IPv6 loopback/unspecified/link-local/unique-local
  if (
    host === "::1" ||
    host === "::" ||
    host.startsWith("fe80:") ||
    host.startsWith("fc") ||
    host.startsWith("fd")
  ) {
    return false;
  }

  // Block IPv4-mapped / IPv4-compatible IPv6 addresses whose embedded IPv4
  // is itself blocked — e.g. "::ffff:127.0.0.1" or its normalized hex form
  // "::ffff:7f00:1". Without this, an attacker can reach a blocked IPv4
  // target through an IPv6-literal host that the IPv4-only checks above
  // never inspect.
  const mappedDotted = host.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mappedDotted && isBlockedIPv4(mappedDotted[1])) return false;
  const mappedHex = host.match(/^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (mappedHex) {
    const hi = parseInt(mappedHex[1], 16);
    const lo = parseInt(mappedHex[2], 16);
    if (!Number.isNaN(hi) && !Number.isNaN(lo)) {
      const embedded = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      if (isBlockedIPv4(embedded)) return false;
    }
  }

  if (allowedHosts && allowedHosts.length > 0) {
    return allowedHosts.some((h) => host === h || host.endsWith(`.${h}`));
  }
  return true;
}
