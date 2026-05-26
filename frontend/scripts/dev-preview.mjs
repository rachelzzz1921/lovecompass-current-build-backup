#!/usr/bin/env node
/**
 * One command: fix env, free port, start Vite dev with hot reload.
 */
import { spawnSync, spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const host = process.env.PREVIEW_HOST || "localhost";
const port = process.env.PREVIEW_PORT || "5173";

function parseEnv(path) {
  if (!existsSync(path)) return new Map();
  const map = new Map();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let value = m[2].trim().replace(/^"|"$/g, "");
    map.set(m[1], value);
  }
  return map;
}

function killPort(targetPort) {
  const probe = spawnSync("lsof", ["-ti", `:${targetPort}`], { encoding: "utf8" });
  const pids = (probe.stdout || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!pids.length) return;
  console.warn(`[dev:preview] Stopping old process on port ${targetPort}: ${pids.join(", ")}`);
  for (const pid of pids) {
    spawnSync("kill", ["-9", pid], { stdio: "ignore" });
  }
}

const sync = spawnSync(process.execPath, [join(root, "scripts/sync-preview-env.mjs")], {
  cwd: root,
  stdio: "inherit",
});
if (sync.status !== 0) process.exit(sync.status ?? 1);

const env = parseEnv(join(root, ".env.local"));
for (const key of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "VITE_LOVECOMPASS_API_BASE_URL"]) {
  if (!env.get(key)?.trim()) {
    console.error(`[dev:preview] ${key} is empty — run: npm run env:sync`);
    process.exit(1);
  }
}

killPort(port);

const url = `http://${host}:${port}/`;
console.log("");
console.log("──────────────────────────────────────────────");
console.log(`  本地预览地址:  ${url}`);
console.log("  套一 lite 示例: /tests/s01_self_female_lite/run?devFill=1");
console.log("  注意: 必须用上面 localhost，不是 lovecompass-web.vercel.app");
console.log("  改代码保存 → 浏览器自动刷新，无需 deploy");
console.log("──────────────────────────────────────────────");
console.log("");

const child = spawn("npm", ["run", "dev", "--", "--host", host, "--port", port], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
child.on("exit", (code) => process.exit(code ?? 0));
