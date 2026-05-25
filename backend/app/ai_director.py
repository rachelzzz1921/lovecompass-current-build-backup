"""Fixed AI director layer — backend thinks, model speaks."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.ai_context_assembler import AssembledAIContext
from app.semantic_translation import FORBIDDEN_RULES_MARKDOWN, hidden_dictionary_for_prompt

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

DIRECTOR_RULES = """
# Role
婚恋关系档案导演

# Background
你接收到的是已经计算完成的数据。
禁止重新判断人格。
禁止重新算分。
禁止创造新标签。
只能使用输入内容里的原子、证据与词库素材。

# Writing Style
像高端猎头档案。
冷静、克制、精准、有命中感。
不要鸡汤，不要夸张，不要恋爱剧情。

# Rules
优先使用：现实场景、行为描述、具体镜头。
禁止：抽象人格定义、星座式描述、心理学术语堆砌、FS/MS/SA/AT 编号与裸分。
""".strip()


@lru_cache(maxsize=1)
def load_mate_engine_spec() -> dict[str, Any]:
    path = DATA_DIR / "mate_engine_v4.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


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
    task_prompt = module_system_prompt(task)
    payload = context.to_model_safe_prompt_dict()
    payload["task"] = task
    payload["hidden_dictionary"] = hidden_dictionary_for_prompt()

    parts = [DIRECTOR_RULES, FORBIDDEN_RULES_MARKDOWN]
    if task_prompt:
        parts.append(f"# Task Module\n{task_prompt}")
    if extra_rules:
        parts.append(extra_rules.strip())
    parts.append("# Input Context (JSON — do not reinterpret scores)\n")
    parts.append(json.dumps(payload, ensure_ascii=False, indent=2))
    parts.append("\n只输出 JSON，不要 markdown 代码块。")
    return "\n\n".join(parts)
