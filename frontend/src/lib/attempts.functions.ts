import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { findTest } from "@/data/tests";
import { computeScores, computeROS } from "@/lib/scoring";
import { findArchetype, ARCHETYPES } from "@/data/archetypes";

const SubmitSchema = z.object({
  testId: z.string().min(1).max(40),
  answers: z.record(z.string().min(1).max(40), z.number().int().min(0).max(10)),
  gender: z.enum(["M", "F"]).nullable().optional(),
});

export const submitAttempt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => SubmitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const test = findTest(data.testId);
    if (!test) throw new Error("Test not found");

    const scores = computeScores(test, data.answers);
    const ros = computeROS(scores);
    const archetype = findArchetype(
      { at: scores.at, in: scores.in, co: scores.co, ev: scores.ev, rk: scores.rk },
      data.gender ?? null,
    );
    const riskAlert = scores.rk >= 40;

    // 调用 Lovable AI Gateway 生成报告
    let aiReport = "";
    try {
      aiReport = await generateReport({ test: test.title, scores, archetype, ros, gender: data.gender ?? null });
    } catch (e) {
      console.error("AI report failed", e);
      aiReport = fallbackReport(archetype, scores, ros);
    }

    const { data: row, error } = await supabase
      .from("test_attempts")
      .insert({
        user_id: userId,
        test_id: data.testId,
        answers: data.answers,
        scores: scores as unknown as Record<string, number>,
        archetype_code: archetype.code,
        archetype_gender: archetype.gender,
        ros_index: ros,
        rk_score: scores.rk,
        risk_alert: riskAlert,
        ai_report: aiReport,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    return { attemptId: row.id, archetypeCode: archetype.code, ros };
  });

async function generateReport(args: {
  test: string;
  scores: { at: number; in: number; co: number; ev: number; rk: number };
  archetype: typeof ARCHETYPES[number];
  ros: number;
  gender: "M" | "F" | null;
}): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  const sys = `你是"婚恋画像 AI 分析师"。请用温柔、体面、有共鸣的语言生成一份个人化关系画像报告。
要求：
- 不要让用户感到被打分或被批判
- 不出现"维度/分数/AT/IN/CO/EV/RK"等内部术语
- 输出 Markdown，含 4 个区块: ## 你此刻的样子 / ## 关系里的高光 / ## 可以温柔留意的地方 / ## 给你下一段关系的建议
- 引用画像名称与 tagline，但不暴露代码
- 每段 80-150 字，语气像一位资深婚恋顾问对挚友说话`;

  const user = `当前画像匹配：${args.archetype.emoji} ${args.archetype.name} —— ${args.archetype.tagline}
画像描述：${args.archetype.description}
高光特质：${args.archetype.traits.join("、")}
留意点：${args.archetype.cautions.join("、")}
测试主题：${args.test}
综合关系展望指数（内部参考，不可在报告中提及具体数字）：${args.ros}
请生成报告。`;

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI gateway ${res.status}: ${t}`);
  }
  const json = await res.json();
  return json.choices?.[0]?.message?.content ?? "";
}

function fallbackReport(a: typeof ARCHETYPES[number], _s: { at: number; in: number; co: number; ev: number; rk: number }, _ros: number) {
  return `## 你此刻的样子

你最贴近的画像是 **${a.emoji} ${a.name}** —— ${a.tagline}

${a.description}

## 关系里的高光

${a.traits.map((t) => `- ${t}`).join("\n")}

## 可以温柔留意的地方

${a.cautions.map((t) => `- ${t}`).join("\n")}

## 给你下一段关系的建议

记得，画像是当下，不是定义。带着这份觉察走进下一段相处，你会更轻盈。`;
}

export const listAttempts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("test_attempts")
      .select("id, test_id, archetype_code, archetype_gender, ros_index, completed_at, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { attempts: data ?? [] };
  });

export const getAttempt = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("test_attempts")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", userId)
      .single();
    if (error) throw new Error(error.message);
    return { attempt: row };
  });
