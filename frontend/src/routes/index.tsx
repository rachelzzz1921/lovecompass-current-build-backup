import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { PRODUCTS, SUITE_LABELS, type ProductBadge } from "@/data/products";
import { productStartLabel, productEntryPath, productStartLink } from "@/lib/productRoutes";
import { productMarketing } from "@/lib/productTheme";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HintButton } from "@/components/HintButton";
import { Lock, ArrowRight, Sparkles, MessageSquare, Brain, Heart, AlertTriangle, MessageCircle, ChevronLeft, ChevronRight, ChevronDown, Menu, X } from "lucide-react";
import { EXAMPLE_CHARACTERS } from "@/data/exampleCharacters";
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { chatRouteSearch } from "@/lib/chatRouteSearch";
import { COUNSELORS, counselorAvatarGradient, counselorActiveRing, getCounselor } from "@/lib/counselors";
import { PortraitGrowthShowcase } from "@/components/home/PortraitGrowthShowcase";

const HOME_SECTIONS = [
  { id: "products", label: "画像体系" },
  { id: "preview", label: "报告内容" },
  { id: "examples", label: "案例示范" },
  { id: "how", label: "运作方式" },
  { id: "analyst", label: "AI 顾问" },
] as const;

type HomeSectionId = (typeof HOME_SECTIONS)[number]["id"];

const HOME_SWIPE_HINT_KEY = "mirror:home-swipe-hint-dismissed";
const HOME_SWIPE_THRESHOLD = 56;
const HOME_SWIPE_MAX_VERTICAL = 48;

function homeSectionIndex(id: HomeSectionId): number {
  return HOME_SECTIONS.findIndex((s) => s.id === id);
}

function adjacentHomeSection(id: HomeSectionId, direction: 1 | -1): HomeSectionId | null {
  const next = homeSectionIndex(id) + direction;
  if (next < 0 || next >= HOME_SECTIONS.length) return null;
  return HOME_SECTIONS[next]!.id;
}

function homeSectionLabel(id: HomeSectionId): string {
  return HOME_SECTIONS.find((s) => s.id === id)?.label ?? "";
}

function isInsideHorizontalScroller(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>("[data-home-swipe-lock]");
}

function parseHomeSectionHash(): HomeSectionId {
  if (typeof window === "undefined") return "products";
  const hash = window.location.hash.replace("#", "");
  return HOME_SECTIONS.some((s) => s.id === hash) ? (hash as HomeSectionId) : "products";
}

function HomeSectionNav({
  activeSection,
  onSelect,
  onPrev,
  onNext,
  className = "",
}: {
  activeSection: HomeSectionId;
  onSelect: (id: HomeSectionId) => void;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}) {
  const index = homeSectionIndex(activeSection);
  const canPrev = index > 0;
  const canNext = index < HOME_SECTIONS.length - 1;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <button
        type="button"
        aria-label="上一模块"
        disabled={!canPrev}
        onClick={onPrev}
        className="hidden md:grid w-8 h-8 shrink-0 place-items-center rounded-full border border-border/50 bg-background/40 text-muted-foreground transition hover:text-foreground hover:bg-[oklch(0.50_0.20_285/0.1)] disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <nav
        aria-label="首页模块"
        className="flex items-center justify-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden min-w-0"
        style={{ scrollbarWidth: "none" }}
      >
        {HOME_SECTIONS.map((s) => {
          const active = activeSection === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`px-3.5 py-1.5 text-[13px] rounded-full transition whitespace-nowrap shrink-0 ${
                active
                  ? "text-foreground bg-[oklch(0.50_0.20_285/0.18)] ring-1 ring-[oklch(0.68_0.18_285/0.35)]"
                  : "text-foreground/60 hover:text-foreground hover:bg-[oklch(0.50_0.20_285/0.08)]"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        aria-label="下一模块"
        disabled={!canNext}
        onClick={onNext}
        className="hidden md:grid w-8 h-8 shrink-0 place-items-center rounded-full border border-border/50 bg-background/40 text-muted-foreground transition hover:text-foreground hover:bg-[oklch(0.50_0.20_285/0.1)] disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function HomeSwipeHint({
  nextLabel,
  onDismiss,
}: {
  nextLabel: string | null;
  onDismiss: () => void;
}) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.35 }}
      onClick={onDismiss}
      className="absolute bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border/50 bg-[oklch(0.14_0.018_270/0.92)] px-3.5 py-2 text-[11px] text-foreground/80 shadow-lg backdrop-blur-md md:hidden"
      aria-label="左右滑动可切换首页模块"
    >
      <motion.span
        animate={{ x: [0, -4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex"
      >
        <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />
      </motion.span>
      <span className="whitespace-nowrap">
        左右滑动切换
        {nextLabel ? <span className="text-muted-foreground"> · 下一屏 {nextLabel}</span> : null}
      </span>
      <motion.span
        animate={{ x: [0, 4, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="inline-flex"
      >
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </motion.span>
    </motion.button>
  );
}

function HomeDesktopNextCue({
  nextLabel,
  onNext,
}: {
  nextLabel: string;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="hidden md:block fixed bottom-8 right-8 z-40"
    >
      <button
        type="button"
        aria-label={`下一模块：${nextLabel}`}
        onClick={onNext}
        className="group flex items-center gap-3 rounded-full border border-[oklch(0.68_0.18_285/0.32)] bg-[oklch(0.13_0.018_270/0.94)] py-2 pl-4 pr-2 shadow-[0_10px_40px_oklch(0.10_0.02_270/0.55)] backdrop-blur-xl transition hover:border-[oklch(0.68_0.18_285/0.55)] hover:bg-[oklch(0.50_0.20_285/0.10)]"
      >
            <div className="text-left">
              <div className="text-[10px] font-mono tracking-[0.22em] text-muted-foreground">继续浏览</div>
              <div className="text-xs text-foreground/90 mt-0.5">{nextLabel}</div>
            </div>
            <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-[oklch(0.12_0.018_270)] shadow-[0_0_20px_oklch(0.68_0.18_285/0.35)] transition-transform group-hover:scale-105">
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border border-white/25"
                animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-flex"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
              </motion.span>
            </div>
          </button>
    </motion.div>
  );
}

function HomeStartTestCue() {
  const start = productStartLink("self");
  const cta = productStartLabel("self", "lite");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="fixed bottom-5 left-4 md:bottom-8 md:left-8 z-40"
    >
      <Link
        {...start}
        className="group flex max-w-[min(18rem,calc(100vw-2rem))] items-center gap-3 rounded-full border border-[oklch(0.68_0.18_285/0.45)] bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] py-2 pl-3 pr-2 text-primary-foreground shadow-[0_10px_40px_oklch(0.50_0.20_285/0.45)] transition hover:opacity-95 hover:shadow-[0_14px_48px_oklch(0.50_0.20_285/0.55)]"
      >
        <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[oklch(0.12_0.018_270/0.22)]">
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full border border-white/30"
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sparkles className="relative h-4 w-4" />
        </div>
        <div className="min-w-0 text-left">
          <div className="text-[10px] font-mono tracking-[0.18em] opacity-90">SELF · 自我画像</div>
          <div className="text-[13px] font-medium leading-tight truncate">{cta}</div>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[oklch(0.12_0.018_270/0.18)] transition-transform group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" />
        </div>
      </Link>
    </motion.div>
  );
}

function ProductBadgeChip({
  badge,
  withLock,
  className = "",
}: {
  badge: ProductBadge;
  withLock?: boolean;
  className?: string;
}) {
  return (
    <span className={`chip font-mono text-[10px] py-1.5 ${className}`}>
      {withLock ? <Lock className="h-2.5 w-2.5 shrink-0" /> : null}
      <span className="flex flex-col items-center gap-0.5 leading-[1.15] text-center">
        <span className="tracking-[0.12em]">{badge.primary}</span>
        <span className="tracking-[0.06em] normal-case">{badge.secondary}</span>
      </span>
    </span>
  );
}

/** 首页模块共用排版 */
const HOME_PANEL = "relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-12 min-w-0";
const HOME_EYEBROW = "font-mono text-[10px] tracking-[0.35em] text-muted-foreground";
const HOME_SECTION_TITLE = "font-display text-2xl md:text-3xl mt-2 text-foreground leading-tight";
const HOME_SECTION_DESC = "text-sm text-foreground/65 mt-2 max-w-xl leading-relaxed";
const HOME_CARD = "bg-glass rounded-2xl p-6 min-w-0";
const HOME_CARD_TITLE = "font-display text-lg text-foreground/95";
const HOME_CARD_BODY = "text-sm text-foreground/65 leading-relaxed mt-2";
const HOME_CARD_LIFT =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[oklch(0.68_0.18_285/0.32)] hover:shadow-[0_22px_58px_-18px_oklch(0.10_0.02_270/0.58)]";
const HOME_TILE_HOVER =
  "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-[oklch(0.68_0.18_285/0.32)] hover:shadow-[0_14px_40px_-16px_oklch(0.10_0.02_270/0.48)]";

function HomeSectionHeader({
  eyebrow,
  title,
  description,
  chip,
  chipClass = "",
  actions,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  chip?: string;
  chipClass?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
      <div className="min-w-0">
        <div className={HOME_EYEBROW}>{eyebrow}</div>
        <h2 className={HOME_SECTION_TITLE}>{title}</h2>
        {description ? <p className={HOME_SECTION_DESC}>{description}</p> : null}
      </div>
      {(chip || actions) && (
        <div className="hidden md:flex items-center gap-2 shrink-0">
          {actions}
          {chip ? <span className={`chip font-mono ${chipClass}`}>{chip}</span> : null}
        </div>
      )}
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "MIRROR · AI 关系画像系统" },
    { name: "description", content: "多套测评 · 一份持续更新的人格档案。AI 关系分析师为你生成可对话、可深挖的关系画像。" },
    { property: "og:title", content: "MIRROR · AI 关系画像系统" },
    { property: "og:description", content: "多套测评 · 一份持续更新的人格档案。" },
  ] }),
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<HomeSectionId>("products");
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; target: EventTarget | null } | null>(null);

  useEffect(() => {
    setActiveSection(parseHomeSectionHash());
    if (!window.sessionStorage.getItem(HOME_SWIPE_HINT_KEY)) {
      setShowSwipeHint(true);
    }
    const onHash = () => setActiveSection(parseHomeSectionHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if (!showSwipeHint || !isMobile) return;
    const timer = window.setTimeout(() => dismissSwipeHint(), 9000);
    return () => window.clearTimeout(timer);
  }, [showSwipeHint, isMobile]);

  const dismissSwipeHint = () => {
    setShowSwipeHint(false);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(HOME_SWIPE_HINT_KEY, "1");
    }
  };

  const selectSection = (id: HomeSectionId) => {
    setActiveSection(id);
    setMenuOpen(false);
    dismissSwipeHint();
    window.history.replaceState(null, "", `#${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToAdjacentSection = (direction: 1 | -1) => {
    const next = adjacentHomeSection(activeSection, direction);
    if (next) selectSection(next);
  };

  const nextSectionId = adjacentHomeSection(activeSection, 1);
  const nextSectionLabel = nextSectionId ? homeSectionLabel(nextSectionId) : null;
  const canSwipeNext = nextSectionId !== null;
  const canSwipePrev = adjacentHomeSection(activeSection, -1) !== null;

  useEffect(() => {
    if (isMobile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable=true]")) {
        return;
      }
      if (event.key === "ArrowLeft") goToAdjacentSection(-1);
      if (event.key === "ArrowRight") goToAdjacentSection(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeSection, isMobile]);

  const handlePanelTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, target: event.target };
  };

  const handlePanelTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dy) > HOME_SWIPE_MAX_VERTICAL || Math.abs(dx) < HOME_SWIPE_THRESHOLD) return;

    const lockedScroller = isInsideHorizontalScroller(start.target);
    if (lockedScroller) {
      const atLeft = lockedScroller.scrollLeft <= 2;
      const atRight =
        lockedScroller.scrollLeft >= lockedScroller.scrollWidth - lockedScroller.clientWidth - 2;
      if (dx < 0 && !atRight) return;
      if (dx > 0 && !atLeft) return;
    }

    dismissSwipeHint();
    goToAdjacentSection(dx < 0 ? 1 : -1);
  };

  return (
    <main className="relative min-h-screen flex flex-col w-full min-w-0">
      {/* Top bar — logo / account on row 1, centered module nav on row 2 */}
      <div className="sticky top-0 z-40 border-b border-border/40 bg-[oklch(0.12_0.018_270/0.88)] backdrop-blur-xl">
        <div className={`${HOME_PANEL} pt-4 md:pt-5`}>
          <header className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] flex items-center justify-center text-[oklch(0.12_0.018_270)] font-bold text-sm">M</div>
              <span className="font-display tracking-wide text-foreground/95">MIRROR<span className="text-muted-foreground/60 ml-1">/v1</span></span>
            </Link>

            <nav className="hidden md:flex items-center gap-4 text-sm shrink-0">
              <Link to="/chat" search={chatRouteSearch()} className="text-foreground/80 hover:text-foreground transition inline-flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" /> AI 咨询
              </Link>
              {user ? (
                <>
                  <Link to="/history" className="text-foreground/80 hover:text-foreground transition">我的档案</Link>
                  <button onClick={() => supabase.auth.signOut()} className="text-muted-foreground hover:text-foreground transition">退出</button>
                </>
              ) : (
                <Link to="/auth" className="text-accent hover:opacity-80 transition">登录</Link>
              )}
            </nav>

            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="菜单"
              className="md:hidden w-9 h-9 rounded-lg bg-glass border border-border/60 grid place-items-center"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </header>

          <HomeSectionNav
            activeSection={activeSection}
            onSelect={selectSection}
            onPrev={() => goToAdjacentSection(-1)}
            onNext={() => goToAdjacentSection(1)}
            className="mt-3 pb-3"
          />
        </div>
      </div>

      {/* Mobile menu sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="md:hidden fixed top-[108px] left-4 right-4 z-30 bg-glass-strong rounded-2xl border border-border/60 p-4 backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1 text-sm">
              <Link to="/chat" search={chatRouteSearch()} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-[oklch(0.50_0.20_285/0.1)]">
                <MessageSquare className="h-4 w-4" /> AI 咨询
              </Link>
              {user ? (
                <>
                  <Link to="/history" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg hover:bg-[oklch(0.50_0.20_285/0.1)]">我的档案</Link>
                  <button onClick={() => { supabase.auth.signOut(); setMenuOpen(false); }} className="text-left px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-[oklch(0.50_0.20_285/0.1)]">退出</button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMenuOpen(false)} className="px-3 py-2.5 rounded-lg text-accent hover:bg-[oklch(0.50_0.20_285/0.1)]">登录</Link>
              )}
              <div className="my-1 h-px bg-border/50" />
              <div className="px-3 pt-1 pb-0.5 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">首页模块</div>
              {HOME_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => selectSection(s.id)}
                  className={`text-left px-3 py-2.5 rounded-lg transition ${
                    activeSection === s.id
                      ? "text-foreground bg-[oklch(0.50_0.20_285/0.12)]"
                      : "text-foreground/80 hover:bg-[oklch(0.50_0.20_285/0.1)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compact hero */}
      <section className={`${HOME_PANEL} pt-8 md:pt-10 pb-6 md:pb-8 text-center`}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="chip chip-cyan font-mono text-[10px]">AI · INTIMACY · LIVE PROFILE</span>
          <h1 className="font-display text-4xl md:text-5xl mt-5 leading-[1.08] tracking-tight">
            <span className="text-gradient-violet">一面会进化的</span>
            <span className="text-foreground/90 ml-2 md:ml-3">关系镜子</span>
          </h1>
          <p className="mt-4 max-w-lg mx-auto text-sm md:text-base text-foreground/70 leading-relaxed">
            多套测评 · 一份持续更新的人格档案。
            <span className="md:hidden">点上方标签或左右滑动，一次只看一块内容。</span>
            <span className="hidden md:inline">点上方模块标签切换，一次只看一块内容。</span>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => nav({ to: "/tests/$id", params: { id: "self" } })}
              className="bg-gradient-to-r from-[oklch(0.68_0.18_285)] to-[oklch(0.82_0.14_200)] text-primary-foreground hover:opacity-90 px-6 h-10 rounded-full font-medium text-sm"
            >
              开始 SELF 测试 <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => nav({ to: user ? "/history" : "/auth" })}
              className="rounded-full h-10 px-5 border-border/60 bg-glass text-sm"
            >
              {user ? "查看我的档案" : "登录"}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Single active panel — no long scroll stack */}
      <div
        className={`${HOME_PANEL} pb-10 md:pb-14 flex-1 relative min-w-0${isMobile ? " touch-pan-y" : ""}`}
        {...(isMobile
          ? { onTouchStart: handlePanelTouchStart, onTouchEnd: handlePanelTouchEnd }
          : {})}
      >
        {isMobile && canSwipeNext && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-6 right-0 z-10 w-10 bg-gradient-to-l from-[oklch(0.12_0.018_270/0.75)] to-transparent md:hidden"
          />
        )}
        {isMobile && canSwipePrev && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-6 left-0 z-10 w-6 bg-gradient-to-r from-[oklch(0.12_0.018_270/0.55)] to-transparent md:hidden"
          />
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0 w-full"
          >
            {activeSection === "products" && <ProductsPanel />}
            {activeSection === "preview" && <ResultPreview />}
            {activeSection === "examples" && <ExampleProfiles />}
            {activeSection === "how" && <HowItWorksPanel />}
            {activeSection === "analyst" && <AnalystShowcase />}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showSwipeHint && isMobile && nextSectionLabel ? (
            <HomeSwipeHint nextLabel={nextSectionLabel} onDismiss={dismissSwipeHint} />
          ) : null}
        </AnimatePresence>
      </div>

      {!isMobile && canSwipeNext && nextSectionLabel ? (
        <HomeDesktopNextCue
          nextLabel={nextSectionLabel}
          onNext={() => goToAdjacentSection(1)}
        />
      ) : null}

      <HomeStartTestCue />

      <footer className={`${HOME_PANEL} py-8 text-center font-mono text-[10px] tracking-[0.35em] text-muted-foreground border-t border-border/30`}>
        © MIRROR · A LIVE RELATIONSHIP PROFILE
      </footer>
    </main>
  );
}

function ProductsPanel() {
  const nav = useNavigate();

  return (
    <>
      <HomeSectionHeader
        eyebrow="// PRODUCTS"
        title="三层递进的画像系统"
        description="从「你是谁」到「这段关系怎么样」，再到「你在市场上的位置」——SELF、ROS、MATE 层层叠加。"
        chip="SELF → ROS → MATE"
      />
      <div className="grid w-full min-w-0 md:grid-cols-3 gap-4 md:gap-5">
        {PRODUCTS.map((p, i) => {
          const m = productMarketing(p.id);
          const isComingSoon = p.status === "coming-soon";
          const isPaid = p.status === "locked";
          const ctaLabel = productStartLabel(p.id, p.status);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <div className={`relative ${HOME_CARD} h-full overflow-hidden group border border-border/35 ${HOME_CARD_LIFT} ${m.cardGlow}`}>
                <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${m.ringGradient} opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-45 group-hover:scale-110`} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{p.code}</span>
                    <ProductBadgeChip badge={p.badge} withLock={isPaid} className={m.chipClass} />
                  </div>
                  <h3 className={`font-display text-xl mt-4 ${m.titleClass}`}>{p.title}</h3>
                  <p className="text-sm text-foreground/75 mt-1">{p.subtitle}</p>
                  <p className={`${HOME_CARD_BODY} mt-3 min-h-[4rem]`}>{p.description}</p>
                  <div className="divider-line my-4" />
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.dimensions.slice(0, 4).map((d) => (
                      <span key={d} className="text-[10px] font-mono px-2 py-0.5 rounded border border-border/50 text-foreground/60">
                        {d}
                      </span>
                    ))}
                    {p.dimensions.length > 4 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 text-muted-foreground">+{p.dimensions.length - 4}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-4">
                    <span>{p.duration}</span>
                    <span>{p.questionCount}</span>
                  </div>
                  <HintButton
                    onClick={() => nav({ to: productEntryPath(p.id) })}
                    blocked={isComingSoon}
                    blockedHint="该测试尚未开放，请关注后续更新"
                    className={`w-full inline-flex items-center justify-center bg-gradient-to-r ${m.buttonGradient} text-primary-foreground hover:opacity-90 rounded-xl h-10 font-medium text-sm`}
                  >
                    {isComingSoon ? (
                      <>
                        <Lock className="mr-1.5 h-3.5 w-3.5" />
                        即将开放
                      </>
                    ) : (
                      <>
                        {ctaLabel} <ArrowRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </HintButton>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

function HowItWorksPanel() {
  return (
    <>
      <HomeSectionHeader
        eyebrow="// HOW IT WORKS"
        title='画像是如何"长出来"的'
        description="点选左侧步骤，看画像从作答、算分、报告到档案与顾问对话如何一层层叠上去——也可拖下方滑杆快速浏览。"
        chip="6 STEPS · LIVE"
      />
      <PortraitGrowthShowcase />
    </>
  );
}

/* ---------------- Result Preview Card ---------------- */

type PreviewDetail = { title: string; desc: string };

type PreviewItem = {
  id: string;
  icon: typeof Brain;
  label: string;
  sub: string;
  tag: string;
  summary: string;
  details: PreviewDetail[];
};

const PREVIEW_ITEMS: PreviewItem[] = [
  {
    id: "personality",
    icon: Brain,
    label: "人格模式",
    sub: "Personality Pattern",
    tag: SUITE_LABELS.self.tag,
    summary: "关系底片——从真实题项与选项长出来，三幕结构而非一张总分卡。",
    details: [
      { title: "序幕 · ScoreOrb", desc: "依恋类型 + 综合分，六维子分悬停可见" },
      { title: "Act I 三 Tab", desc: "核心特质三卡（带题项证据）· 六维雷达 · 冲突/亲密/分离场景行为" },
      { title: "Act II 红楼揭晓", desc: "人格谱系与 Act I 特质分开——文学对照 + 镜像理由，点击揭晓" },
      { title: "Act III 分析师", desc: "优势 / 留意 / 合拍 / 成长四类洞察，可深聊某维度" },
    ],
  },
  {
    id: "relationship",
    icon: Heart,
    label: "关系风格",
    sub: "Relationship Style",
    tag: SUITE_LABELS.ros.tag,
    summary: "针对「心里有一个具体的人」——阶段曲线 + 五维证据 + 关系处方。",
    details: [
      { title: "关系天气 + 类型", desc: "如难舍难分、温水同行…配合 9 阶段曲线定位当前位置" },
      { title: "五维透视镜", desc: "吸引基础、互动质量、兼容程度、关系走向、风险信号——每层可展开子维度、答题证据与问诊追问" },
      { title: "心跳线 + 盲区", desc: "五维合成的关系节律图；AI 点出容易忽视的感知差" },
      { title: "双人报告（完整版）", desc: "双方均用完整版作答后，可邀请对方解锁感知差、碰撞点与共同行动建议" },
    ],
  },
  {
    id: "match",
    icon: Sparkles,
    label: "匹配洞察",
    sub: "Compatibility Insights",
    tag: SUITE_LABELS.mate.tag,
    summary: "择偶市场档案室——显示度 × 支撑力，用区间而不是「你只配谁」。",
    details: [
      { title: "五维得分 + 蜂巢结构", desc: "进入结果先看到 FS/MS 五模块分数，再展开作答证据与市场映射" },
      { title: "档案首页 + 坐标站", desc: "六种市场定位、资产徽章、四象限坐标与波纹动画、市场估值" },
      { title: "观察室 + 恋爱预演", desc: "三视角目击者证词、误读解密、Netflix 式三集时间线预演" },
      { title: "匹配温度带", desc: "红娘气泡建议、出场策略、三区匹配卡与推荐信" },
    ],
  },
  {
    id: "communication",
    icon: MessageCircle,
    label: "沟通倾向",
    sub: "Communication Tendencies",
    tag: "跨测评联动",
    summary: "测试结论注入 AI 顾问对话——问具体场景，拿基于你数据的回答。",
    details: [
      { title: "四位 AI 顾问", desc: "祖师爷 / 进化论 / Haven / 学者——风格与语气各不相同" },
      { title: "绑定测试画像", desc: "聊天自动带入 SELF / ROS / MATE 结果，不必重头介绍自己" },
      { title: "关系层追问", desc: "从结果页进入，可深聊某一层关系的依据与盲区" },
      { title: "画像进化", desc: "对话要点写入档案，下一次对话更懂你" },
    ],
  },
  {
    id: "blindspots",
    icon: AlertTriangle,
    label: "认知盲区",
    sub: "Blind Spots",
    tag: "三项测评均覆盖",
    summary: "那些你自以为如此、但作答呈现另一面的地方——温柔点破，不羞辱。",
    details: [
      { title: "自我测试留意项", desc: "过渡型依恋、相对薄弱维度，正向表述不说「你有问题」" },
      { title: "关系感知差", desc: "自陈感受与作答呈现之间的落差，帮你看清误读" },
      { title: "择偶透视镜", desc: "隐形长处、相处盲区，以及与依恋模式的联动解读" },
      { title: "双人误读点", desc: "各自容易误解对方的触发点，以及打破循环的提示" },
    ],
  },
];

function ResultPreview() {
  const [openId, setOpenId] = useState<string | null>("personality");

  return (
    <>
      <HomeSectionHeader
        eyebrow="测完能得到什么"
        title="做完，你会拿到这些"
        description="点击每一层展开，看报告与 AI 对话里会出现的内容。"
        chip="5 个维度"
        chipClass="chip-cyan"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="max-w-3xl mx-auto w-full min-w-0"
      >
        <div className={`${HOME_CARD} p-2 md:p-3`}>
          <ul className="space-y-1">
            {PREVIEW_ITEMS.map((it, i) => {
              const open = openId === it.id;
              return (
                <motion.li
                  key={it.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`group rounded-xl border border-transparent ${HOME_TILE_HOVER} ${
                    open
                      ? "bg-[oklch(0.50_0.20_285/0.08)] ring-1 ring-[oklch(0.68_0.18_285/0.25)]"
                      : "hover:bg-[oklch(0.50_0.20_285/0.05)]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : it.id)}
                    aria-expanded={open}
                    className="w-full flex items-start gap-3 p-3 md:p-3.5 text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br from-[oklch(0.50_0.20_285/0.4)] to-[oklch(0.55_0.16_200/0.3)] grid place-items-center shrink-0 transition-all duration-300 group-hover:shadow-[0_0_18px_oklch(0.68_0.18_285/0.35)] ${
                        open ? "ring-1 ring-[oklch(0.68_0.18_285/0.35)]" : ""
                      }`}
                    >
                      <it.icon className="h-4 w-4 text-[oklch(0.90_0.06_240)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-sm font-medium text-foreground/95">{it.label}</span>
                        <span className="text-[11px] text-muted-foreground shrink-0 hidden sm:inline">{it.sub}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">{it.tag}</div>
                      {!open ? (
                        <p className="text-[11px] text-foreground/55 leading-relaxed mt-2 line-clamp-2">{it.summary}</p>
                      ) : null}
                    </div>
                    <ChevronDown
                      className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                        open ? "rotate-180 text-[oklch(0.82_0.14_200)]" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-3 pb-4 md:px-4 md:pb-5 ml-[52px] md:ml-[58px] border-t border-border/30 pt-3">
                        <p className="text-xs text-foreground/70 leading-relaxed mb-3">{it.summary}</p>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {it.details.map((d) => (
                            <div
                              key={d.title}
                              className={`rounded-lg bg-[oklch(0.18_0.02_270/0.55)] border border-border/40 px-3 py-2.5 ${HOME_TILE_HOVER}`}
                            >
                              <div className="text-xs font-medium text-foreground/90">{d.title}</div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">{d.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4 leading-relaxed">
          完成更多测评，画像逐步叠加；与 AI 对话时也会更贴你。
        </p>
      </motion.div>
    </>
  );
}

/* ---------------- Example Profiles ---------------- */

function ExampleCharacterCard({ character: c, index }: { character: (typeof EXAMPLE_CHARACTERS)[number]; index: number }) {
  const suiteRows = [
    { suite: SUITE_LABELS.self.code, label: c.attachment, sub: "自我依恋画像" },
    { suite: SUITE_LABELS.ros.code, label: c.ros.typeName, sub: `与 ${c.ros.partner}` },
    { suite: SUITE_LABELS.mate.code, label: c.mate.positionName, sub: "择偶市场坐标" },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="h-full"
    >
      <Link
        to="/examples/$id"
        params={{ id: c.id }}
        className={`group flex h-full min-h-[22rem] flex-col ${HOME_CARD} relative overflow-hidden border border-border/35 ${HOME_CARD_LIFT}`}
      >
        <div
          className="absolute -top-16 -right-16 h-44 w-44 rounded-full blur-3xl opacity-35 transition-all duration-500 group-hover:opacity-80 group-hover:scale-125"
          style={{ background: `oklch(0.55 0.20 ${c.hue} / 0.55)` }}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 1px 0 oklch(0.55 0.20 ${c.hue} / 0.55), 0 0 0 1px oklch(0.55 0.20 ${c.hue} / 0.38)`,
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-px opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: `linear-gradient(90deg, transparent, oklch(0.55 0.20 ${c.hue} / 0.65), transparent)` }}
        />

        <div className="relative flex flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className={`${HOME_CARD_TITLE} text-xl leading-tight transition-colors duration-300 group-hover:text-foreground`}>
                {c.name}
              </h4>
              <p className="mt-1.5 text-[11px] font-mono tracking-[0.14em] text-muted-foreground leading-snug">
                {c.epithet}
              </p>
            </div>
            <span className="chip chip-violet shrink-0 font-mono text-[9px] px-2 py-0.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_14px_oklch(0.68_0.18_285/0.35)]">
              案例
            </span>
          </div>

          <p className={`${HOME_CARD_BODY} mt-4 line-clamp-3 min-h-[3.75rem]`}>{c.hook}</p>

          <div className="mt-4 space-y-2">
            {suiteRows.map((row) => (
              <div
                key={row.suite}
                className="rounded-xl border border-border/35 bg-[oklch(0.16_0.02_270/0.45)] px-3 py-2.5 transition-all duration-300 group-hover:border-[oklch(0.68_0.18_285/0.22)] group-hover:bg-[oklch(0.18_0.02_270/0.62)]"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[oklch(0.82_0.14_200)] shrink-0">
                    {row.suite}
                  </span>
                  <span className="text-xs font-medium text-foreground/90 truncate">{row.label}</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{row.sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/30 pt-4">
            <span className="font-mono text-[10px] tracking-[0.22em] text-muted-foreground/75">
              SELF · ROS · MATE
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[oklch(0.82_0.14_200)] transition-all group-hover:gap-2">
              查看完整推演
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function ExampleProfiles() {
  return (
    <>
      <HomeSectionHeader
        eyebrow="// EXAMPLES"
        title="看看别人的画像"
        description={
          <>
            若红楼人物来做我们的测评，画像会是什么样？
            <br />
            点进案例，查看 SELF / ROS / MATE 完整推演。
          </>
        }
        chip="6 ARCHETYPES"
        chipClass="chip-violet"
      />

      <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {EXAMPLE_CHARACTERS.map((c, i) => (
          <ExampleCharacterCard key={c.id} character={c} index={i} />
        ))}
      </div>
    </>
  );
}

/* ---------------- AI Counselors showcase ---------------- */

function AnalystShowcase() {
  const nav = useNavigate();
  const [activeId, setActiveId] = useState(COUNSELORS[0].id);
  const active = getCounselor(activeId);

  return (
    <>
      <HomeSectionHeader
        eyebrow="// MIRROR · AI COUNSELORS"
        title={<span className="text-gradient-violet">四位 AI 关系顾问</span>}
        description="做完测试，画像自动注入对话。问具体场景——每位顾问各用一种方式接住你。"
        chip="4 PERSONAS · LIVE"
        chipClass="chip-violet"
      />

      <div className="grid w-full min-w-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-5 md:gap-6">
        {/* Counselor picker */}
        <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
          {COUNSELORS.map((c, i) => {
            const selected = c.id === activeId;
            return (
              <motion.button
                key={c.id}
                type="button"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.06 }}
                onClick={() => setActiveId(c.id)}
                className={`text-left p-4 md:p-5 rounded-2xl border transition-all duration-300 group min-w-0 ${
                  selected
                    ? `${counselorActiveRing(c.accent)} shadow-[0_12px_40px_-16px_oklch(0.55_0.20_285/0.55)]`
                    : `border-border/60 bg-glass ${HOME_TILE_HOVER}`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${counselorAvatarGradient(c.accent)} grid place-items-center text-xl shrink-0 shadow-inner transition-transform duration-300 group-hover:scale-110`}
                  >
                    {c.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-display text-base text-foreground/95">{c.name}</span>
                      <span className="text-[10px] font-mono text-muted-foreground">{c.englishName}</span>
                    </div>
                    <p className="text-[11px] text-[oklch(0.82_0.14_200)] mt-0.5">{c.title}</p>
                    <p className="text-xs text-foreground/65 mt-2 leading-relaxed line-clamp-2">{c.tagline}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed line-clamp-2 group-hover:text-foreground/60 transition">
                  {c.description}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Active counselor spotlight */}
        <motion.div
          key={active.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="relative bg-glass-strong rounded-3xl p-6 md:p-7 overflow-hidden border border-border/50 min-h-[320px] flex flex-col"
        >
          <div className="absolute inset-0 ring-grid opacity-25 pointer-events-none" />
          <div
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gradient-to-br ${counselorAvatarGradient(active.accent)} opacity-20 blur-3xl`}
          />

          <div className="relative flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${counselorAvatarGradient(active.accent)} grid place-items-center text-2xl shrink-0`}
            >
              {active.emoji}
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground">// ACTIVE COUNSELOR</div>
              <h3 className="font-display text-2xl mt-1 text-foreground leading-tight">
                {active.name}
                <span className="text-muted-foreground/70 text-lg ml-2">{active.englishName}</span>
              </h3>
              <p className="text-sm text-[oklch(0.82_0.14_200)] mt-1">{active.title}</p>
            </div>
          </div>

          <p className="relative text-sm text-foreground/75 leading-relaxed mt-5">{active.description}</p>

          <div className="relative mt-5 flex-1">
            <div className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground mb-2">可以这样问</div>
            <div className="space-y-2">
              {active.prompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => nav({ to: "/chat", search: chatRouteSearch(undefined, active.id) })}
                  className="w-full text-left text-xs text-foreground/80 leading-relaxed px-3 py-2.5 rounded-xl border border-border/50 bg-[oklch(0.18_0.02_270/0.45)] hover:border-[oklch(0.68_0.18_285/0.45)] hover:bg-[oklch(0.50_0.20_285/0.08)] transition"
                >
                  「{prompt}」
                </button>
              ))}
            </div>
          </div>

          <div className="relative mt-6 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => nav({ to: "/chat", search: chatRouteSearch(undefined, active.id) })}
              className={`rounded-full h-11 px-6 flex-1 bg-gradient-to-r ${counselorAvatarGradient(active.accent)} text-[oklch(0.10_0.018_270)] hover:opacity-90 font-medium border-0`}
            >
              和 {active.name} 聊聊 <MessageSquare className="ml-1.5 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => nav({ to: "/chat", search: chatRouteSearch() })}
              className="rounded-full h-11 px-5 border-border/60 bg-glass shrink-0"
            >
              不确定找谁
            </Button>
          </div>

          <p className="relative mt-4 text-[11px] text-muted-foreground leading-relaxed">
            完成 SELF / ROS / MATE 任一项后，对话会自动带入你的测评画像；也可以先聊，再补测试。
          </p>
        </motion.div>
      </div>
    </>
  );
}
