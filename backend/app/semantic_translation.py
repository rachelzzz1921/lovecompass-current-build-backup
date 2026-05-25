"""Semantic Translation Layer — internal codes stay in code; models and users see human language."""

from __future__ import annotations

import json
import re
from functools import lru_cache
from pathlib import Path
from typing import Any

from app.chat_prompt_layers import score_band_label

DICT_DIR = Path(__file__).resolve().parents[1] / "data" / "semantic_dictionary"

INTERNAL_CODE_RE = re.compile(
    r"(?<![A-Za-z0-9_])(?:FS[1-5]|MS[1-5]|SA[1-6]|P[1-6]|AT|IN|CO|EV|RK|AS|SF)(?:_[A-Z0-9]+)?(?![A-Za-z0-9_])",
    re.IGNORECASE,
)

PRODUCT_SET_LABELS = {
    "SELF": "自我画像",
    "ROS": "关系画像",
    "MATE": "择偶画像",
}


@lru_cache(maxsize=1)
def _load_json(name: str) -> dict[str, Any]:
    path = DICT_DIR / name
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


@lru_cache(maxsize=1)
def load_attribute_map() -> dict[str, Any]:
    return _load_json("attribute_map.json")


@lru_cache(maxsize=1)
def load_scene_map() -> dict[str, Any]:
    return _load_json("scene_map.json")


@lru_cache(maxsize=1)
def load_risk_map() -> dict[str, Any]:
    return _load_json("risk_map.json")


@lru_cache(maxsize=1)
def load_forbidden_config() -> dict[str, Any]:
    return _load_json("forbidden_terms.json")


def attribute_entry(code: str) -> dict[str, Any]:
    return load_attribute_map().get(str(code).upper(), {})


def user_label(code: str, *, fallback: str | None = None) -> str:
    entry = attribute_entry(code)
    label = str(entry.get("user_label") or entry.get("internal") or "").strip()
    if label:
        return label
    return fallback or "这一面"


def user_descriptions(code: str, *, limit: int = 2) -> list[str]:
    entry = attribute_entry(code)
    desc = entry.get("user_desc") or []
    if not isinstance(desc, list):
        return []
    return [str(x).strip() for x in desc[:limit] if str(x).strip()]


def hidden_dictionary_for_prompt(codes: list[str] | None = None) -> dict[str, str]:
    """User-facing names for prompt hints — model must never echo internal keys."""
    attrs = load_attribute_map()
    keys = codes or list(attrs.keys())
    out: dict[str, str] = {}
    for code in keys:
        key = str(code).upper()
        entry = attrs.get(key)
        if not isinstance(entry, dict):
            continue
        label = str(entry.get("user_label") or entry.get("internal") or "").strip()
        if label:
            out[key] = label
    return out


def score_band_phrase(score: float) -> str:
    return score_band_label(score)


def score_to_user_trait(code: str, score: float, *, gender: str = "female") -> str:
    label = user_label(code)
    band = score_band_phrase(score)
    desc = user_descriptions(code, limit=1)
    tail = desc[0] if desc else band
    if score >= 65:
        return f"{label}是你的优势面——{tail}"
    if score <= 45:
        return f"{label}还有提升空间——{tail}"
    return f"{label}{band}——{tail}"


def scores_to_user_traits(
    scores: dict[str, float] | None,
    *,
    product_set: str,
    gender: str = "female",
    limit: int = 5,
) -> list[str]:
    if not scores:
        return []
    product_set = product_set.upper()
    if product_set == "MATE":
        order = ["MS1", "MS2", "MS3", "MS4", "MS5"] if gender == "male" else ["FS1", "FS2", "FS3", "FS4", "FS5"]
    elif product_set == "ROS":
        order = ["AT", "IN", "CO", "EV", "RK"]
    else:
        order = ["SA1", "SA2", "SA3", "SA4", "SA5", "SA6"]

    ranked = sorted(
        (
            (code, float(scores.get(code, scores.get(code.lower(), 50))))
            for code in order
            if code in scores or code.lower() in scores
        ),
        key=lambda item: item[1],
        reverse=True,
    )
    return [score_to_user_trait(code, score, gender=gender) for code, score in ranked[:limit]]


def translate_display_summary_line(code: str, summary: str, *, name: str | None = None) -> str:
    label = name or user_label(code)
    text = str(summary or "").strip()
    if not text:
        return label
    if text.startswith(label):
        return text
    if "·" in text and not name:
        return text
    return f"{label}：{text}"


def translate_display_summaries_from_payload(
    result_payload: dict[str, Any],
    product_set: str,
    *,
    gender: str = "female",
) -> list[str]:
    lines: list[str] = []
    if product_set == "MATE":
        for mod in result_payload.get("modules") or []:
            if not isinstance(mod, dict):
                continue
            code = str(mod.get("code") or "")
            summary = mod.get("displaySummary")
            if not summary:
                continue
            name = str(mod.get("label") or mod.get("name") or user_label(code))
            lines.append(translate_display_summary_line(code, str(summary), name=name))
    elif product_set == "ROS":
        for layer in result_payload.get("layers") or []:
            if not isinstance(layer, dict):
                continue
            code = str(layer.get("code") or "")
            summary = layer.get("displaySummary")
            if not summary:
                continue
            name = str(layer.get("name") or user_label(code))
            lines.append(translate_display_summary_line(code, str(summary), name=name))
    elif product_set == "SELF":
        for dim in result_payload.get("dimensions") or []:
            if not isinstance(dim, dict):
                continue
            code = str(dim.get("code") or "")
            summary = dim.get("displaySummary")
            if not summary:
                continue
            name = str(dim.get("name") or user_label(code))
            lines.append(translate_display_summary_line(code, str(summary), name=name))

    raw = result_payload.get("display_summaries")
    if isinstance(raw, dict):
        for code, text in raw.items():
            if text and not any(str(text) in line for line in lines):
                lines.append(translate_display_summary_line(str(code), str(text)))

    return lines[:6]


def scene_phrases(atom_keys: list[str] | None, *, limit: int = 4) -> list[str]:
    lib = load_scene_map()
    out: list[str] = []
    for key in atom_keys or []:
        phrases = lib.get(key)
        if isinstance(phrases, list) and phrases:
            out.append(str(phrases[0]))
        if len(out) >= limit:
            break
    return out


def product_set_label(code: str) -> str:
    return PRODUCT_SET_LABELS.get(str(code).upper(), str(code))


def forbidden_terms() -> list[str]:
    cfg = load_forbidden_config()
    blocked = cfg.get("blocked") or []
    return [str(x) for x in blocked if x]


def semantic_replace_map() -> dict[str, str]:
    cfg = load_forbidden_config()
    repl = cfg.get("semantic_replace") or {}
    if not isinstance(repl, dict):
        return {}
    return {str(k): str(v) for k, v in repl.items()}


def forbidden_patterns() -> list[re.Pattern[str]]:
    cfg = load_forbidden_config()
    raw = cfg.get("forbidden_patterns") or []
    patterns: list[re.Pattern[str]] = []
    for item in raw:
        try:
            patterns.append(re.compile(str(item), re.IGNORECASE))
        except re.error:
            continue
    return patterns


FORBIDDEN_RULES_MARKDOWN = """
# Forbidden Rules（硬规则）

禁止输出任何内部模型字段、模块编号、数据库字段或算法分值。

禁止出现（含变体）：
- AS / SF / P1–P6 / FS1–FS5 / MS1–MS5 / SA1–SA6 / AT / IN / CO / EV / RK
- 「根据 XX 得分」「在 P2 模块中」「你的 FS1 偏高」
- 裸数字分数、percent、模块代号

如果需要表达同一含义，必须翻译成人类语言，例如：
- 错误：你的 AS 偏高
- 正确：你属于第一眼容易让人记住的人

内部字段仅供理解上下文；只允许输出对应的用户名称与行为描述。
""".strip()


def contains_forbidden(text: str) -> bool:
    if not text:
        return False
    upper = text.upper()
    for term in forbidden_terms():
        if len(term) <= 3 and term.isupper() and term.isalpha():
            if re.search(_code_pattern(term), upper, flags=re.IGNORECASE):
                return True
        elif term.lower() in text.lower():
            return True
    for pattern in forbidden_patterns():
        if pattern.search(text):
            return True
    return bool(INTERNAL_CODE_RE.search(text))


def _code_pattern(code: str) -> str:
    return rf"(?<![A-Za-z0-9_]){re.escape(code)}(?![A-Za-z0-9_])"


def sanitize_text(text: str) -> str:
    """Output Guard — semantic replace, then strip remaining internal tokens."""
    if not text:
        return text
    output = text
    replace_map = semantic_replace_map()
    for key in sorted(replace_map.keys(), key=len, reverse=True):
        value = replace_map[key]
        output = re.sub(_code_pattern(key), value, output, flags=re.IGNORECASE)
    output = INTERNAL_CODE_RE.sub("", output)
    for term in forbidden_terms():
        if len(term) <= 3 and term.isupper():
            output = re.sub(_code_pattern(term), "", output, flags=re.IGNORECASE)
    output = re.sub(r"\s{2,}", " ", output)
    output = re.sub(r"[，。；]\s*[，。；]", "，", output)
    return output.strip()


def sanitize_deep(value: Any) -> Any:
    if isinstance(value, str):
        return sanitize_text(value)
    if isinstance(value, list):
        return [sanitize_deep(item) for item in value]
    if isinstance(value, dict):
        return {str(k): sanitize_deep(v) for k, v in value.items()}
    return value


def scan_violations(text: str) -> list[str]:
    violations: list[str] = []
    if INTERNAL_CODE_RE.findall(text):
        violations.extend(INTERNAL_CODE_RE.findall(text))
    upper = text.upper()
    for term in forbidden_terms():
        if len(term) <= 4 and term.isupper() and re.search(_code_pattern(term), upper, flags=re.IGNORECASE):
            violations.append(term)
    for pattern in forbidden_patterns():
        match = pattern.search(text)
        if match:
            violations.append(match.group(0))
    return list(dict.fromkeys(violations))


def guard_ai_output(text: str, *, resanitize: bool = True) -> str:
    cleaned = sanitize_text(text) if resanitize else text
    if contains_forbidden(cleaned):
        cleaned = sanitize_text(cleaned)
    return cleaned


def guard_ai_json(raw: str) -> str:
    parsed = None
    start, end = raw.find("{"), raw.rfind("}")
    if start >= 0 and end > start:
        try:
            parsed = json.loads(raw[start : end + 1])
        except json.JSONDecodeError:
            parsed = None
    if isinstance(parsed, dict):
        safe = sanitize_deep(parsed)
        return json.dumps(safe, ensure_ascii=False)
    return guard_ai_output(raw)


def to_model_safe_context(data: dict[str, Any]) -> dict[str, Any]:
    """Strip internal codes from context dict before sending to the model."""
    safe = sanitize_deep(data)
    traits = safe.pop("user_traits", None) or safe.get("traits")
    if traits:
        safe["traits"] = traits
    summaries = safe.get("display_summaries")
    if isinstance(summaries, list):
        safe["module_readings"] = summaries
        safe.pop("display_summaries", None)
    cross = safe.get("cross_model_summary")
    if isinstance(cross, list):
        safe["cross_model_summary"] = [
            line.replace("MATE·", "择偶·").replace("ROS·", "关系·").replace("SELF·", "自我·")
            for line in cross
        ]
    return safe
