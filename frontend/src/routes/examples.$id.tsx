import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { getExampleCharacter, type ExampleSuiteTab } from "@/data/exampleCharacters";
import {
  buildExampleMateResult,
  buildExampleRosCoupleResult,
  buildExampleRosResult,
  buildExampleSelfResult,
} from "@/lib/buildExampleResults";
import { ExampleProfileBanner } from "@/components/example/ExampleProfileBanner";
import { ExampleMateShowcase } from "@/components/example/ExampleMateShowcase";
import { ExampleJourneyBar } from "@/components/example/ExampleJourneyBar";
import { ExampleResultThreshold } from "@/components/example/ExampleResultThreshold";
import { ExampleSuiteHandoff } from "@/components/example/ExampleSuiteHandoff";
import { ExampleFloatingReadingNav } from "@/components/example/ExampleFloatingReadingNav";
import { exampleSuitePath, EXAMPLE_ROS_COUPLE_SECTIONS } from "@/components/example/exampleReadingFlow";
import { SelfResultView } from "@/components/SelfResultView";
import { RosResultView } from "@/components/RosResultView";
import { RosCoupleResultView } from "@/components/RosCoupleResultView";
import {
  EXAMPLE_FLOATING_NAV_OFFSET,
  scrollToSection,
  useScrollPast,
  useScrollSpy,
} from "@/hooks/use-scroll-spy";

const searchSchema = z.object({
  suite: z.enum(["self", "ros", "mate"]).optional(),
});

function exampleNavTone(tab: ExampleSuiteTab): "violet" | "indigo" | "rose" {
  if (tab === "ros") return "indigo";
  if (tab === "mate") return "rose";
  return "violet";
}

function exampleResultSurface(tab: ExampleSuiteTab): string {
  if (tab === "ros") return "bg-[#0c0e11]";
  if (tab === "mate") return "bg-[#0c0e11]";
  return "";
}

export const Route = createFileRoute("/examples/$id")({
  validateSearch: (search) => searchSchema.parse(search),
  ssr: false,
  head: ({ params }) => {
    const character = getExampleCharacter(params.id);
    return {
      meta: [
        { title: character ? `${character.name} · 示范档案 · MIRROR` : "示范档案 · MIRROR" },
        {
          name: "description",
          content: character?.intro ?? "红楼人物 SELF / ROS / MATE 示范档案",
        },
      ],
    };
  },
  component: ExampleProfilePage,
});

function ExampleProfilePage() {
  const { id } = Route.useParams();
  const { suite: searchSuite } = Route.useSearch();
  const navigate = useNavigate();
  const character = getExampleCharacter(id);
  const resultRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<ExampleSuiteTab>(searchSuite ?? "self");
  const [rosView, setRosView] = useState<"single" | "couple">("single");

  useEffect(() => {
    if (searchSuite) setTab(searchSuite);
  }, [searchSuite]);

  const selfResult = useMemo(() => (character ? buildExampleSelfResult(character) : null), [character]);
  const rosResult = useMemo(() => (character ? buildExampleRosResult(character) : null), [character]);
  const rosCoupleResult = useMemo(
    () => (character ? buildExampleRosCoupleResult(character) : null),
    [character],
  );
  const mateResult = useMemo(
    () => (character ? buildExampleMateResult(character, `example-${character.id}`) : null),
    [character],
  );

  const sections = useMemo(() => {
    if (tab === "ros" && rosView === "couple") return EXAMPLE_ROS_COUPLE_SECTIONS;
    return exampleSuitePath(tab);
  }, [tab, rosView]);
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const activeSection = useScrollSpy(sectionIds);
  const showFloatingNav = useScrollPast(280);

  if (!character || !selfResult || !rosResult || !rosCoupleResult || !mateResult) {
    throw notFound();
  }

  const selectTab = (next: ExampleSuiteTab) => {
    const jumpToFirst = () => {
      const first = exampleSuitePath(next)[0]?.id;
      if (!first) {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }

      const tryScroll = (attempt = 0) => {
        const el = document.getElementById(first);
        if (el) scrollToSection(first, EXAMPLE_FLOATING_NAV_OFFSET);
        else if (attempt < 10) window.setTimeout(() => tryScroll(attempt + 1), 60);
        else resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      tryScroll();
    };

    if (next === tab) {
      jumpToFirst();
      return;
    }

    setTab(next);
    void navigate({ to: ".", search: { suite: next }, replace: true });
    window.setTimeout(jumpToFirst, 60);
  };

  return (
    <div className="relative min-h-screen w-full min-w-0 overflow-x-clip">
      <ExampleProfileBanner name={character.name} />

      <ExampleFloatingReadingNav
        visible={showFloatingNav}
        activeTab={tab}
        onSelectTab={selectTab}
        sections={sections}
        activeSectionId={activeSection}
        tone={exampleNavTone(tab)}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto min-w-0 px-4 sm:px-6 md:px-12 py-5 md:py-8">
        <div className="min-w-0 max-w-2xl mb-6">
          <div className="font-mono text-[10px] tracking-[0.35em] text-muted-foreground break-words">
            // {character.epithet}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl mt-2 text-foreground leading-tight">
            {character.name}
            <span className="text-muted-foreground/60 text-xl sm:text-2xl md:text-3xl ml-1.5 sm:ml-2">· 完整推演</span>
          </h1>
          <p className="text-sm text-foreground/70 mt-3 leading-relaxed">{character.intro}</p>
          <p className="text-sm text-foreground/55 mt-2 leading-relaxed italic border-l-2 border-[oklch(0.68_0.18_285/0.4)] pl-3">
            {character.hook}
          </p>
        </div>

        <ExampleJourneyBar
          active={tab}
          onSelect={selectTab}
          characterName={character.name}
          preview={{
            self: {
              headline: character.attachment,
              sub: character.attachmentSummary,
            },
            ros: {
              headline: character.ros.typeName,
              sub: `与 ${character.ros.partner} · ${character.ros.typeOneLiner}`,
            },
            mate: {
              headline: character.mate.positionName,
              sub: character.mate.tagline,
            },
          }}
        />

        <div className="flex items-center justify-center mt-8 mb-2 pb-2">
          <Link
            to="/tests/$id"
            params={{ id: "self" }}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-accent hover:opacity-80 transition"
          >
            做你自己的测评 <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      <div
        ref={resultRef}
        className={`relative w-full min-w-0 pb-28 md:pb-16 ${exampleResultSurface(tab)} ${
          tab === "self" ? "border-t border-border/25" : ""
        }`}
      >
        <ExampleResultThreshold
          tab={tab}
          characterName={character.name}
          surface={tab === "self" ? "light" : "dark"}
        />
        {tab === "self" ? (
          <>
            <SelfResultView
              result={selfResult}
              exampleMode
              exampleSubject={{ name: character.name, gender: character.gender }}
            />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-12">
              <ExampleSuiteHandoff
                current="self"
                characterName={character.name}
                rosPartner={character.ros.partner}
                onNext={selectTab}
              />
            </div>
          </>
        ) : tab === "ros" ? (
          <>
            <div className="max-w-[480px] mx-auto px-5 pt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setRosView("single")}
                className={`flex-1 rounded-xl py-2 text-xs font-mono tracking-wide border transition ${
                  rosView === "single"
                    ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-white"
                    : "border-white/10 text-white/45 hover:text-white/70"
                }`}
              >
                单人报告
              </button>
              <button
                type="button"
                onClick={() => setRosView("couple")}
                className={`flex-1 rounded-xl py-2 text-xs font-mono tracking-wide border transition ${
                  rosView === "couple"
                    ? "border-[#6366f1]/50 bg-[#6366f1]/15 text-white"
                    : "border-white/10 text-white/45 hover:text-white/70"
                }`}
              >
                双人报告
              </button>
            </div>
            {rosView === "single" ? (
              <RosResultView
                result={rosResult}
                attemptId={`example-${character.id}`}
                exampleMode
                exampleSubject={{ name: character.name, gender: character.gender }}
                examplePartner={character.ros.partner}
              />
            ) : (
              <RosCoupleResultView result={rosCoupleResult} />
            )}
            <div className="max-w-[480px] mx-auto px-5">
              <ExampleSuiteHandoff
                current="ros"
                characterName={character.name}
                onNext={selectTab}
              />
            </div>
          </>
        ) : (
          <ExampleMateShowcase
            result={mateResult}
            exampleSubject={{ name: character.name, gender: character.gender }}
          />
        )}
      </div>
    </div>
  );
}
