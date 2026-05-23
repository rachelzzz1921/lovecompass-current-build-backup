// @lovable.dev/vite-tanstack-config already includes TanStack Start, React,
// TailwindCSS, path aliases and Lovable development helpers. For Vercel,
// we explicitly disable the default Cloudflare build adapter and add Nitro,
// which is the deployment path recommended by TanStack Start and Vercel.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    server: { entry: "server" },
  },
  plugins: [nitro()],
  vite: {
    envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  },
});
