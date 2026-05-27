#!/usr/bin/env node
/**
 * Print Supabase Auth provider status for the configured frontend project.
 * Usage: node scripts/check-auth-config.mjs [project-ref]
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const refArg = process.argv[2];

function parseEnv(text) {
  const map = new Map();
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    map.set(key, value);
  }
  return map;
}

function readEnvFile(path) {
  if (!existsSync(path)) return new Map();
  return parseEnv(readFileSync(path, "utf8"));
}

const feLocal = readEnvFile(join(root, "frontend/.env.local"));
const fePreview = readEnvFile(join(root, "frontend/.env.preview"));

const url =
  (refArg ? `https://${refArg}.supabase.co` : null) ||
  feLocal.get("NEXT_PUBLIC_SUPABASE_URL") ||
  fePreview.get("NEXT_PUBLIC_SUPABASE_URL") ||
  feLocal.get("VITE_SUPABASE_URL") ||
  fePreview.get("VITE_SUPABASE_URL");

const anon =
  feLocal.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  fePreview.get("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
  feLocal.get("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  fePreview.get("VITE_SUPABASE_PUBLISHABLE_KEY") ||
  feLocal.get("VITE_SUPABASE_ANON_KEY") ||
  fePreview.get("VITE_SUPABASE_ANON_KEY");

if (!url || !anon) {
  console.error("Missing Supabase URL or anon key in frontend/.env.local or .env.preview");
  process.exit(1);
}

const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, {
  headers: { apikey: anon, Authorization: `Bearer ${anon}` },
});
if (!res.ok) {
  console.error("Failed to fetch auth settings:", res.status, await res.text());
  process.exit(1);
}
const settings = await res.json();
const ext = settings.external ?? {};

console.log("Supabase:", url);
console.log("  email signup/login:", ext.email !== false ? "enabled" : "DISABLED");
console.log("  google oauth:", ext.google === true ? "enabled" : "DISABLED ← enable in Dashboard");
console.log("  disable_signup:", settings.disable_signup === true);
console.log("  mailer_autoconfirm:", settings.mailer_autoconfirm === true, settings.mailer_autoconfirm ? "" : "← users must verify email before login");

if (ext.google !== true) {
  console.log("\nFix Google:");
  console.log("  Supabase Dashboard → Authentication → Providers → Google");
  console.log("  Redirect URI: https://<project-ref>.supabase.co/auth/v1/callback");
  console.log("  Also add https://lovecompass-web.vercel.app/auth/callback to Redirect URLs");
}

if (settings.mailer_autoconfirm !== true) {
  console.log("\nFix email signup (optional, dev-friendly):");
  console.log("  Authentication → Providers → Email → Confirm email = OFF");
  console.log("  Or run: SUPABASE_ACCESS_TOKEN=... SUPABASE_SERVICE_ROLE_KEY=... ./scripts/supabase-setup-test-auth.sh");
}
