#!/usr/bin/env node
/**
 * Fail Vercel builds when required public env vars are missing or still point at localhost.
 * Invoked from frontend/vercel.json buildCommand (not local `npm run dev`).
 */
const isVercel = process.env.VERCEL === "1";

function read(name) {
  return (process.env[name] ?? "").trim();
}

function fail(message) {
  console.error(`[check-env] ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`[check-env] WARN ${message}`);
}

const supabaseUrl = read("NEXT_PUBLIC_SUPABASE_URL") || read("VITE_SUPABASE_URL");
const supabaseKey =
  read("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  read("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  read("VITE_SUPABASE_ANON_KEY");
const apiBase = read("VITE_LOVECOMPASS_API_BASE_URL").replace(/\/$/, "");

if (!supabaseUrl) {
  fail("missing NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL)");
}
if (!supabaseKey) {
  fail("missing NEXT_PUBLIC_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY)");
}

if (isVercel) {
  if (!apiBase) {
    fail("missing VITE_LOVECOMPASS_API_BASE_URL — set to backend Vercel URL without trailing slash");
  }
  if (/localhost|127\.0\.0\.1/i.test(apiBase)) {
    fail("VITE_LOVECOMPASS_API_BASE_URL must not point at localhost on Vercel");
  }
  if (!/^https:\/\//i.test(apiBase)) {
    fail("VITE_LOVECOMPASS_API_BASE_URL should use https:// in production");
  }
} else if (!apiBase) {
  warn("VITE_LOVECOMPASS_API_BASE_URL unset — API calls will fail until configured");
}

console.log("[check-env] ok", {
  supabaseUrl,
  apiBase: apiBase || "(unset)",
  vercel: isVercel,
});
