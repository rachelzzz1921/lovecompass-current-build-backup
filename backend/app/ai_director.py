"""Fixed AI director layer — backend thinks, model speaks."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.ai_context_assembler import AssembledAIContext
from app.semantic_translation import FORBIDDEN_RULES_MARKDOWN

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

INSTRUCTION_PRIORITY = """
# Priority（按顺序遵守，违反即失败）
1. 指令遵循：只使用输入 JSON 里的 profile / pair / traits / dictionary 词条
2. 结构化输出：严格按 Task Module 要求的 JSON 字段输出，不要 markdown
3. 禁止创造：不得新增标签、新人格、新维度、新分数
4. 禁止脑补：不得编造输入中不存在的经历、关系史、家庭背景
5. 文风：猎头档案式，冷静克制，有命中感；不要恋爱剧情、鸡汤、星座式描述
""".strip()

DIRECTOR_RULES = """
# Role
婚恋关系档案导演（分析引擎，不是聊天助手）

# Background
你接收到的是后端已计算完成、已翻译成原子的上下文。
禁止重新判断人格。
禁止重新算分。
禁止创造新标签。
只能使用输入 JSON 中的词条与素材。

# Writing Style
像高端猎头档案。
冷静、克制、精准、有命中感。
不要鸡汤，不要夸张，不要恋爱剧情。

# Rules
优先使用：现实场景、行为描述、具体镜头。
禁止：抽象人格定义、心理学术语堆砌、内部编号与裸分。
""".strip()

TASK_MODULE_HINTS: dict[str, str] = {
    "mate-reverse": "聚焦：别人怎么误解、真实机制、隐藏代价。只用 profile + scene 原子。",
    "mate-observe": "模拟约会对象第一视角：第一眼 → 五分钟后 → 离开以后。只用 profile + scene。",
    "mate-lens": "输出洞察四卡 + 透视镜三格 + 建议。可引用 cross_model_summary。",
    "footer_marquee": "模拟匿名口语评价，20 字以内，2 条。",
    "mate-rehearse": "推演关系阶段：剧情、对方心理、危险信号、红娘动作。",
    "mate-advice": "基于 problem 原子，输出一句 40 字以内的行动建议。",
    "ros-insights": "基于关系原子输出洞察，不要重新判断关系类型。",
    "pair-analysis": "基于 pair / difference 原子输出双人适配分析，不要输出双方分数。",
    "ros-pair-analysis": "基于碰撞后的 pair 原子，写现实适配分析，不要恋爱剧情。",
}


@lru_cache(maxsize=1)
def load_mate_engine_spec() -> dict[str, Any]:
    path = DATA_DIR / "mate_engine_v4.json"
    if not path.exists():
        return {}
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def module_system_prompt(task: str) -> str:
    modules = (
        ((load_mate_engine_spec().get("layers") or {}).get("layer_5_ai_director") or {}).get("modules")
        or {}
    )
    spec = modules.get(task) or {}
    prompt = str(spec.get("system_prompt") or "").strip()
    return prompt


def build_director_prompt(
    *,
    task: str,
    context: AssembledAIContext,
    extra_rules: str | None = None,
) -> str:
    """Assemble director prompt: fixed rules + module slice + compact JSON context."""
    sliced = context.slice_for_task(task)
    payload = sliced.to_director_payload(task)
    hint = TASK_MODULE_HINTS.get(task)
    if hint:
        payload["module_hint"] = hint

    task_prompt = module_system_prompt(task)

    parts = [DIRECTOR_RULES, INSTRUCTION_PRIORITY, FORBIDDEN_RULES_MARKDOWN]
    if task_prompt:
        parts.append(f"# Task Module\n{task_prompt}")
    if extra_rules:
        parts.append(extra_rules.strip())
    parts.append("# Input Context (JSON — atoms only, do not reinterpret)\n")
    parts.append(json.dumps(payload, ensure_ascii=False, separators=(",", ":")))
    parts.append("\n只输出 JSON，不要 markdown 代码块。")
    return "\n\n".join(parts)


def estimate_director_prompt_size(
    *,
    task: str,
    context: AssembledAIContext,
    extra_rules: str | None = None,
) -> int:
    return len(build_director_prompt(task=task, context=context, extra_rules=extra_rules))
