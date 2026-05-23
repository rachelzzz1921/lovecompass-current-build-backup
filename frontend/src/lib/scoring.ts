import type { TestDef, Dim } from "@/data/tests";

export type Scores = { at: number; in: number; co: number; ev: number; rk: number; count: Record<Dim, number> };

export function computeScores(test: TestDef, answers: Record<string, number>): Scores {
  const sum: Record<Dim, number> = { at: 0, in: 0, co: 0, ev: 0, rk: 0 };
  const cnt: Record<Dim, number> = { at: 0, in: 0, co: 0, ev: 0, rk: 0 };
  for (const q of test.questions) {
    const choiceIdx = answers[q.id];
    if (choiceIdx == null) continue;
    const opt = q.options[choiceIdx];
    if (!opt) continue;
    for (const [k, v] of Object.entries(opt.weights)) {
      const dim = k as Dim;
      sum[dim] += v ?? 0;
      cnt[dim] += 1;
    }
  }
  const avg = (k: Dim) => (cnt[k] ? Math.round(sum[k] / cnt[k]) : 0);
  return {
    at: avg("at"),
    in: avg("in"),
    co: avg("co"),
    ev: avg("ev"),
    rk: avg("rk"),
    count: cnt,
  };
}

// ROS（Relationship Outlook Score）= 综合体面分（不让用户看到具体维度名称）
export function computeROS(s: Scores): number {
  // 加权：相处与亲密 > 成长 > 吸引；风险扣分
  const base = s.in * 0.32 + s.co * 0.30 + s.ev * 0.20 + s.at * 0.18;
  const penalty = s.rk * 0.45;
  return Math.max(0, Math.min(100, Math.round(base - penalty + 10)));
}
