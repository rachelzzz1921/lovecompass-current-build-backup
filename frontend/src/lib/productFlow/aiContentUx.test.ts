import { describe, expect, it } from "vitest";
import { primeAiEnhancementEnabled } from "@/lib/aiCapabilities";
import { showAiEnhancementPending } from "@/lib/aiContentUx";

describe("showAiEnhancementPending", () => {
  it("never pulses when AI enhancement is disabled", () => {
    primeAiEnhancementEnabled(false);
    expect(showAiEnhancementPending({ mode: "deterministic" }, 3, false)).toBe(false);
  });

  it("pulses only with insights and zhipu enabled", () => {
    primeAiEnhancementEnabled(true);
    expect(showAiEnhancementPending({ mode: "deterministic" }, 2, true)).toBe(true);
    expect(showAiEnhancementPending({ mode: "deterministic" }, 0, true)).toBe(false);
    expect(showAiEnhancementPending({ mode: "ai" }, 2, true)).toBe(false);
  });
});
