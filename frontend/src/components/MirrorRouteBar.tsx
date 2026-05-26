import { useEffect, useState } from "react";
import {
  getEndpointProfile,
  getSsrEndpointProfile,
  setPreferMirror,
  type EndpointProfile,
} from "@/lib/mirrorEndpoints";

const HAS_MIRROR = Boolean(import.meta.env.VITE_LOVECOMPASS_API_MIRROR_URL);

/** 配置了镜像 API 时，在页面顶部显示当前线路（镜像域或东八区自动切换）。 */
export function MirrorRouteBar() {
  const [profile, setProfile] = useState<EndpointProfile>(getSsrEndpointProfile);

  useEffect(() => {
    setProfile(getEndpointProfile());
  }, []);

  if (!HAS_MIRROR) return null;

  return (
    <div className="relative z-50 border-b border-[oklch(0.68_0.18_285_/_0.35)] bg-[oklch(0.18_0.022_270_/_0.92)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="font-mono text-muted-foreground">
          // ROUTE ·{" "}
          <span className="text-[oklch(0.82_0.14_200)]" suppressHydrationWarning>
            {profile.label}
          </span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPreferMirror(true);
              window.location.reload();
            }}
            className="px-2 py-0.5 rounded-md border border-border/60 hover:border-[oklch(0.68_0.18_285_/_0.5)] transition"
          >
            使用镜像
          </button>
          <button
            type="button"
            onClick={() => {
              setPreferMirror(false);
              window.location.reload();
            }}
            className="px-2 py-0.5 rounded-md border border-border/60 hover:border-[oklch(0.68_0.18_285_/_0.5)] transition text-muted-foreground"
          >
            国际线路
          </button>
        </div>
      </div>
    </div>
  );
}
