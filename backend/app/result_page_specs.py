"""Load result page specs and validate / prompt-build from result_payload."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.semantic_translation import FORBIDDEN_RULES_MARKDOWN

SPECS_PATH = Path(__file__).resolve().parents[1] / "data" / "result_page_specs_v1.json"


def load_result_page_specs() -> dict[str, Any]:
    return json.loads(SPECS_PATH.read_text(encoding="utf-8"))


def get_product_set_spec(product_set: str) -> dict[str, Any]:
    specs = load_result_page_specs()
    key = product_set.upper()
    suite = (specs.get("productSets") or {}).get(key)
    if not suite:
        raise KeyError(f"Unknown productSet: {product_set}")
    return suite


def _get_path(obj: dict[str, Any], dotted: str) -> Any:
    cur: Any = obj
    for part in dotted.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(part)
    return cur


def _has_path(obj: dict[str, Any], dotted: str) -> bool:
    cur: Any = obj
    for part in dotted.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return False
        cur = cur[part]
    if cur is None:
        return False
    if isinstance(cur, str) and not cur.strip():
        return False
    if isinstance(cur, list) and not cur:
        return False
    return True


def validate_result_payload(
    product_set: str,
    payload: dict[str, Any],
    *,
    require_ai_content: bool = False,
) -> list[str]:
    """Return human-readable validation errors (empty = ok)."""
    if not isinstance(payload, dict):
        return ["payload must be a dict"]
    errors: list[str] = []
    spec = get_product_set_spec(product_set)
    specs_root = load_result_page_specs()
    validation_cfg = specs_root.get("validation") or {}

    if validation_cfg.get("requireProductSet"):
        ps = payload.get("productSet")
        if ps and str(ps).upper() != product_set.upper():
            errors.append(f"productSet mismatch: payload={ps} expected={product_set}")

    for section in spec.get("sections") or []:
        sid = section.get("id") or "?"
        for path in section.get("requiredPaths") or []:
            if not _has_path(payload, str(path)):
                errors.append(f"[{sid}] missing required path: {path}")

        array_path = section.get("arrayPath")
        if array_path and _has_path(payload, str(array_path)):
            items = _get_path(payload, str(array_path))
            if isinstance(items, list):
                min_count = section.get("count")
                if min_count and len(items) < int(min_count):
                    errors.append(f"[{sid}] expected>={min_count} items at {array_path}, got {len(items)}")

        ai_slot = section.get("aiSlot")
        if ai_slot and section.get("id") == "insights":
            insights = _get_path(payload, str(ai_slot)) or _get_path(payload, str(section.get("fallbackPath") or ""))
            if not insights:
                errors.append(f"[{sid}] missing insights at {ai_slot}")

    if require_ai_content:
        ai = payload.get("ai_content")
        if isinstance(ai, dict):
            for key in ("status", "mode", "generated_at"):
                if not ai.get(key):
                    errors.append(f"ai_content missing meta: {key}")
        else:
            errors.append("ai_content block missing (Layer B/C not attached)")

    return errors


def list_section_ids(product_set: str) -> list[str]:
    spec = get_product_set_spec(product_set)
    return [str(s.get("id")) for s in (spec.get("sections") or []) if s.get("id")]


def build_ui_copy_prompt(
    product_set: str,
    *,
    summary: dict[str, Any],
    dimension_lines: str,
    extra_context: str = "",
) -> tuple[str, dict[str, Any], str]:
    """Build a structured JSON-output prompt for filling UI copy slots."""
    spec = get_product_set_spec(product_set)
    version = str(spec.get("reportPromptVersion") or f"{product_set.lower()}_ui_v1")
    sections = spec.get("sections") or []
    section_brief = "\n".join(
        f"- {s.get('id')}: {s.get('label')} "
        f"(paths: {s.get('arrayPath') or s.get('objectPath') or s.get('requiredPaths')})"
        for s in sections
    )

    payload_meta = {
        "productSet": product_set.upper(),
        "promptVersion": version,
        "primaryMetric": summary.get("primaryMetric"),
        "sections": list_section_ids(product_set),
    }

    if product_set.upper() == "SELF":
        prompt = f"""
你是 MIRROR 套一 SELF 结果页文案引擎。根据评分摘要生成 UI 文案 JSON，对齐 result_page_specs_v1。

写作规范：
- Hero 主结果是依恋类型，红楼人格仅作 character 区引用
- 禁止 SA 编号与裸分；用描述性档位
- core_traits 3 条，insights 4 条（strength/watch/match/growth），每条 100-140 字

上下文：
依恋类型：{summary.get('attachmentType') or summary.get('primaryMetric')}
红楼人格：{summary.get('archetype')}
tagline：{summary.get('tagline') or '（无）'}
维度线索：
{dimension_lines}
{extra_context}

页面区块：
{section_brief}

只输出 JSON：
{{"core_traits":[{{"icon":"shield|key|eye","title":"","body":"","highlight":false}}],"insights":[{{"kind":"strength|watch|match|growth","title":"","body":""}}],"behaviors":[{{"scene":"","title":"","body":""}}]}}

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
        return prompt, payload_meta, version

    if product_set.upper() == "ROS":
        prompt = f"""
你是 MIRROR 套二 ROS 结果页文案引擎。对象为「一段具体关系」，禁止劝分。

写作规范：
- insights 4 条：strength / watch / advice / action
- prescription：complaint + prescription_text + followup
- 禁止 AT/RK 编号与裸分

上下文：
关系类型：{summary.get('relationshipType') or summary.get('primaryMetric')}
阶段：{summary.get('relationshipStage')}
共鸣：{summary.get('resonanceTier')}
维度线索：
{dimension_lines}
{extra_context}

页面区块：
{section_brief}

只输出 JSON：
{{"insights":[{{"kind":"strength|watch|advice|action","title":"","body":""}}],"prescription":{{"complaint":"","prescription_text":"","followup":"三个月后"}},"blind_spot":""}}

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
        return prompt, payload_meta, version

    prompt = f"""
你是 MIRROR 套三 MATE 结果页文案引擎。清醒、体面、不羞辱。

写作规范：
- 主结果：市场定位 + 四象限；匹配用上限/经济适用区/下限
- matchmaker_records 3 条、ai_lens 3 条、secular_advice 4 条
- 禁止 FS/MS 编号、裸分、颜值/收入裸标签

上下文：
市场定位：{summary.get('matePosition') or summary.get('primaryMetric')}
四象限：{summary.get('quadrant')}
tagline：{summary.get('tagline') or '（无）'}
模块线索：
{dimension_lines}
{extra_context}

页面区块：
{section_brief}

只输出 JSON：
{{"insights":[{{"kind":"strength|watch|match|growth","title":"","body":""}}],"matchmaker_records":[{{"id":"","title":"","narrative":""}}],"ai_lens":[{{"key":"","title":"","tag":"","body":""}}],"secular_advice":[{{"title":"","dont":"","do":"","reason":""}}],"social_quotes":["",""]}}

{FORBIDDEN_RULES_MARKDOWN}
""".strip()
    return prompt, payload_meta, version


def merge_ui_copy_into_payload(
    product_set: str,
    payload: dict[str, Any],
    copy: dict[str, Any],
) -> dict[str, Any]:
    """Apply parsed AI UI copy onto result_payload (non-destructive merge)."""
    out = dict(payload)
    ps = product_set.upper()

    if ps == "SELF":
        if copy.get("insights"):
            ai = dict(out.get("ai_content") or {})
            ai["insights"] = copy["insights"]
            out["ai_content"] = ai
        if copy.get("core_traits"):
            out["core_traits"] = copy["core_traits"]
            ai = dict(out.get("ai_content") or {})
            ai["traits"] = copy["core_traits"]
            out["ai_content"] = ai
        if copy.get("behaviors"):
            static = dict(out.get("static_copy") or {})
            static["behaviors"] = copy["behaviors"]
            out["static_copy"] = static
        return out

    if ps == "ROS":
        if copy.get("insights"):
            out["insights"] = copy["insights"]
            ai = dict(out.get("ai_content") or {})
            ai["insights_list"] = copy["insights"]
            out["ai_content"] = ai
        if copy.get("prescription"):
            ai = dict(out.get("ai_content") or {})
            ai["prescription"] = copy["prescription"]
            out["ai_content"] = ai
        if copy.get("blind_spot"):
            ai = dict(out.get("ai_content") or {})
            ai["blind_spot"] = copy["blind_spot"]
            out["ai_content"] = ai
        return out

    if copy.get("insights"):
        out["insights"] = copy["insights"]
        ai = dict(out.get("ai_content") or {})
        ai["insights"] = copy["insights"]
        out["ai_content"] = ai
    if copy.get("matchmaker_records"):
        out["matchmakerRecords"] = copy["matchmaker_records"]
        ai = dict(out.get("ai_content") or {})
        ai["matchmaker_records"] = copy["matchmaker_records"]
        out["ai_content"] = ai
    if copy.get("ai_lens"):
        out["aiLens"] = copy["ai_lens"]
        ai = dict(out.get("ai_content") or {})
        ai["ai_lens"] = copy["ai_lens"]
        out["ai_content"] = ai
    if copy.get("secular_advice"):
        out["secularAdvice"] = copy["secular_advice"]
        ai = dict(out.get("ai_content") or {})
        ai["secular_advice"] = copy["secular_advice"]
        out["ai_content"] = ai
    if copy.get("social_quotes"):
        out["socialQuotes"] = copy["social_quotes"]
        ai = dict(out.get("ai_content") or {})
        ai["social_quotes"] = copy["social_quotes"]
        out["ai_content"] = ai
    return out
