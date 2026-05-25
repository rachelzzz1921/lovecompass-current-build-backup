"""Layer 4 — unified AI context assembly. Models see translated worlds, not raw scores."""

from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from typing import Any

from app.dictionary_retrieval import retrieve_dictionary_snippets
from app.profile_center import resolve_product_set
from app.ros_scoring import ROS_LAYER_CODES, ROS_LAYER_LABELS
from app.semantic_translation import (
    product_set_label,
    sanitize_deep,
    score_band_phrase,
    scores_to_user_traits,
    to_model_safe_context,
    translate_display_summaries_from_payload,
    user_label,
)

ROS_LAYER_ORDER = ROS_LAYER_CODES


def resolve_attempt_product_set(attempt: dict[str, Any]) -> str:
    payload = attempt.get("result_payload") or {}
    if isinstance(payload, dict) and payload.get("productSet") in {"SELF", "ROS", "MATE"}:
        return str(payload["productSet"])
    return resolve_product_set(
        attempt.get("suite_slug"),
        attempt.get("suite_name"),
        attempt.get("test_id"),
    )


@dataclass
class AssembledAIContext:
    role: str = "婚恋档案导演"
    product_set: str = "MATE"
    main_type: str = ""
    sub_type: str | None = None
    profile_atoms: dict[str, list[str]] = field(default_factory=dict)
    pair_atoms: dict[str, list[str]] = field(default_factory=dict)
    evidence: list[str] = field(default_factory=list)
    dictionary: list[str] = field(default_factory=list)
    cross_model_summary: list[str] = field(default_factory=list)
    display_summaries: list[str] = field(default_factory=list)
    user_traits: list[str] = field(default_factory=list)
    task: str | None = None

    def to_prompt_dict(self) -> dict[str, Any]:
        data = asdict(self)
        # Drop empty optional sections to keep prompts compact.
        if not data.get("pair_atoms"):
            data.pop("pair_atoms", None)
        if not data.get("cross_model_summary"):
            data.pop("cross_model_summary", None)
        if not data.get("display_summaries"):
            data.pop("display_summaries", None)
        if not data.get("user_traits"):
            data.pop("user_traits", None)
        if not data.get("task"):
            data.pop("task", None)
        return data

    def to_model_safe_prompt_dict(self) -> dict[str, Any]:
        return to_model_safe_context(self.to_prompt_dict())

    def to_compact_block(self, *, max_tokens_hint: int = 1500) -> str:
        """Human-readable block for chat / report injection."""
        lines = [
            "【已装配 AI 上下文 · 禁止重新算分或创造新标签】",
            f"产品：{self.product_set} · 主型：{self.main_type}",
        ]
        if self.sub_type:
            lines.append(f"亚型：{self.sub_type}")
        for bucket, items in self.profile_atoms.items():
            if items:
                lines.append(f"{bucket}：{'、'.join(items)}")
        for bucket, items in self.pair_atoms.items():
            if items:
                lines.append(f"{bucket}：{'、'.join(items)}")
        if self.evidence:
            lines.append("证据：" + "；".join(self.evidence[:5]))
        if self.dictionary:
            lines.append("可用素材：" + "；".join(self.dictionary[:8]))
        if self.cross_model_summary:
            lines.append("跨套摘要：" + "；".join(self.cross_model_summary[:4]))
        if self.user_traits:
            lines.append("画像特征：" + "；".join(self.user_traits[:5]))
        elif self.display_summaries:
            lines.append("模块读法：" + "；".join(self.display_summaries[:5]))
        block = "\n".join(lines)
        if len(block) > max_tokens_hint * 3:
            return block[: max_tokens_hint * 3] + "\n…（上下文已截断）"
        return block


def extract_ros_relationship_atoms(
    result_payload: dict[str, Any],
    layer_scores: dict[str, float] | None = None,
) -> dict[str, list[str]]:
    scores = {str(k).upper(): float(v) for k, v in (layer_scores or {}).items()}
    trait: list[str] = []
    patterns: list[str] = []

    rel = result_payload.get("relationshipType") or {}
    if isinstance(rel, dict) and rel.get("name"):
        trait.append(str(rel["name"]))

    stage = result_payload.get("relationshipStage") or {}
    if isinstance(stage, dict) and stage.get("name"):
        trait.append(f"阶段·{stage['name']}")

    at = scores.get("AT", 50)
    inn = scores.get("IN", 50)
    co = scores.get("CO", 50)
    ev = scores.get("EV", 50)
    rk = scores.get("RK", 50)

    if at >= 65 and inn < 50:
        patterns.append("高吸引低亲密")
    if co >= 65 and ev < 50:
        patterns.append("高协作低成长")
    if rk >= 65:
        patterns.append("风险敏感")
    if at >= 70:
        trait.append("吸引面强")
    if inn >= 70:
        trait.append("亲密投入高")
    if co >= 70:
        trait.append("协作感强")

    resonance = result_payload.get("resonance") or {}
    if isinstance(resonance, dict) and resonance.get("tier"):
        trait.append(str(resonance["tier"]))

    blind = (result_payload.get("ai_content") or {}).get("blind_spot")
    scene: list[str] = []
    if isinstance(blind, dict):
        gap = str(blind.get("gap_summary") or blind.get("title") or "").strip()
        if gap:
            scene.append(gap)

    return {
        "trait_atoms": trait,
        "behavior_atoms": patterns,
        "relationship_atoms": [],
        "scene_atoms": scene,
        "ros_patterns": patterns,
    }


def _display_summary_lines(
    result_payload: dict[str, Any],
    product_set: str,
    *,
    gender: str = "female",
) -> list[str]:
    return translate_display_summaries_from_payload(result_payload, product_set, gender=gender)


def _evidence_from_profile_engine(profile_engine: dict[str, Any]) -> list[str]:
    evidence: list[str] = []
    for key in ("scene_atoms", "trait_atoms", "behavior_atoms"):
        for item in profile_engine.get(key) or []:
            text = str(item).strip()
            if text:
                evidence.append(text)
    return evidence[:6]


def _evidence_from_ros_ai(result_payload: dict[str, Any]) -> list[str]:
    ai = result_payload.get("ai_content") or {}
    if not isinstance(ai, dict):
        return []
    out: list[str] = []
    ev_map = ai.get("evidence") or {}
    if isinstance(ev_map, dict):
        for text in ev_map.values():
            snippet = str(text).strip()
            if snippet:
                out.append(snippet[:120])
    blind = ai.get("blind_spot")
    if isinstance(blind, dict):
        body = str(blind.get("body") or blind.get("gap_summary") or "").strip()
        if body:
            out.append(body[:120])
    return out[:5]


def _evidence_from_self(result_payload: dict[str, Any]) -> list[str]:
    out: list[str] = []
    for card in result_payload.get("core_traits") or []:
        if not isinstance(card, dict):
            continue
        title = str(card.get("title") or "").strip()
        body = str(card.get("body") or card.get("summary") or "").strip()
        if title and body:
            out.append(f"{title}：{body[:80]}")
        elif body:
            out.append(body[:100])
    return out[:4]


def _resolve_module_scores(
    payload: dict[str, Any],
    module_scores: dict[str, float] | None,
) -> dict[str, float]:
    if module_scores:
        return {str(k): float(v) for k, v in module_scores.items()}
    out: dict[str, float] = {}
    for code in ("FS1", "FS2", "FS3", "FS4", "FS5", "MS1", "MS2", "MS3", "MS4", "MS5"):
        if payload.get(code) is not None:
            try:
                out[code] = float(payload[code])
            except (TypeError, ValueError):
                continue
    dims = payload.get("dimension_scores")
    if isinstance(dims, dict):
        for code, value in dims.items():
            if code not in out:
                try:
                    out[str(code)] = float(value)
                except (TypeError, ValueError):
                    continue
    return out


def assemble_mate_context(
    result_payload: dict[str, Any],
    *,
    module_scores: dict[str, float] | None = None,
    cross_model_summary: list[str] | None = None,
    pair_context: dict[str, Any] | None = None,
    task: str | None = None,
    gender: str = "female",
) -> AssembledAIContext:
    payload = result_payload if isinstance(result_payload, dict) else {}
    scores = _resolve_module_scores(payload, module_scores)
    profile_engine = payload.get("profileEngine") or {}
    if not isinstance(profile_engine, dict):
        profile_engine = {}

    pos = payload.get("positionType") or {}
    main_type = str(
        profile_engine.get("main_type")
        or (pos.get("name") if isinstance(pos, dict) else "")
        or payload.get("identityCard", {}).get("title")
        or "择偶定位"
    )
    sub_type = str(profile_engine.get("sub_type") or "") or None

    profile_atoms = {
        "trait_atoms": list(profile_engine.get("trait_atoms") or []),
        "behavior_atoms": list(profile_engine.get("behavior_atoms") or []),
        "relationship_atoms": list(profile_engine.get("relationship_atoms") or []),
        "scene_atoms": list(profile_engine.get("scene_atoms") or []),
    }

    evidence = _evidence_from_profile_engine(profile_engine)
    display = _display_summary_lines(payload, "MATE", gender=gender)
    traits = scores_to_user_traits(scores or module_scores, product_set="MATE", gender=gender)

    pair_atoms: dict[str, list[str]] = {}
    if pair_context:
        pair_atoms["pair_atoms"] = list(pair_context.get("pair_atoms") or [])
        if pair_context.get("problem"):
            evidence.append(f"核心摩擦：{pair_context['problem']}")

    dictionary = retrieve_dictionary_snippets(
        trait_atoms=profile_atoms["trait_atoms"],
        behavior_atoms=profile_atoms["behavior_atoms"],
        relationship_atoms=profile_atoms["relationship_atoms"],
        scene_atoms=profile_atoms["scene_atoms"],
        pair_atoms=pair_atoms.get("pair_atoms"),
    )

    return AssembledAIContext(
        product_set="MATE",
        main_type=main_type,
        sub_type=sub_type,
        profile_atoms=profile_atoms,
        pair_atoms=pair_atoms,
        evidence=evidence,
        dictionary=dictionary,
        cross_model_summary=list(cross_model_summary or []),
        display_summaries=display,
        user_traits=traits,
        task=task,
    )


def assemble_ros_context(
    result_payload: dict[str, Any],
    *,
    layer_scores: dict[str, float] | None = None,
    cross_model_summary: list[str] | None = None,
    task: str | None = None,
) -> AssembledAIContext:
    payload = result_payload if isinstance(result_payload, dict) else {}
    rel = payload.get("relationshipType") or {}
    if not isinstance(rel, dict):
        rel = {}
    stage = payload.get("relationshipStage") or {}
    if not isinstance(stage, dict):
        stage = {}

    main_type = str(rel.get("name") or "这段关系")
    sub_type = str(stage.get("name") or "") or None

    atom_buckets = extract_ros_relationship_atoms(payload, layer_scores)
    profile_atoms = {
        "trait_atoms": atom_buckets["trait_atoms"],
        "behavior_atoms": atom_buckets["behavior_atoms"],
        "relationship_atoms": atom_buckets["relationship_atoms"],
        "scene_atoms": atom_buckets["scene_atoms"],
    }

    evidence = _evidence_from_ros_ai(payload)
    display = _display_summary_lines(payload, "ROS")
    if not display and layer_scores:
        for code in ROS_LAYER_ORDER:
            score = layer_scores.get(code)
            if score is not None:
                label = user_label(code, fallback=ROS_LAYER_LABELS.get(code, code))
                display.append(f"{label}：{score_band_phrase(float(score))}")
    traits = scores_to_user_traits(layer_scores, product_set="ROS")

    dictionary = retrieve_dictionary_snippets(
        trait_atoms=profile_atoms["trait_atoms"],
        behavior_atoms=profile_atoms["behavior_atoms"],
        scene_atoms=profile_atoms["scene_atoms"],
        ros_patterns=atom_buckets.get("ros_patterns"),
    )

    return AssembledAIContext(
        product_set="ROS",
        main_type=main_type,
        sub_type=sub_type,
        profile_atoms=profile_atoms,
        evidence=evidence,
        dictionary=dictionary,
        cross_model_summary=list(cross_model_summary or []),
        display_summaries=display,
        user_traits=traits,
        task=task,
    )


def assemble_self_context(
    result_payload: dict[str, Any],
    *,
    cross_model_summary: list[str] | None = None,
    task: str | None = None,
) -> AssembledAIContext:
    payload = result_payload if isinstance(result_payload, dict) else {}
    profile = payload.get("archetype_profile") or {}
    if not isinstance(profile, dict):
        profile = {}

    main_type = str(payload.get("archetype_code") or profile.get("name") or "关系画像")
    sub_type = str(payload.get("attachment_type") or profile.get("attachment_type") or "") or None

    trait_atoms: list[str] = [sub_type] if sub_type else []
    if profile.get("tagline"):
        trait_atoms.append(str(profile["tagline"])[:40])

    profile_atoms = {
        "trait_atoms": trait_atoms,
        "behavior_atoms": [],
        "relationship_atoms": [],
        "scene_atoms": [],
    }

    evidence = _evidence_from_self(payload)
    display = _display_summary_lines(payload, "SELF")

    return AssembledAIContext(
        product_set="SELF",
        main_type=main_type,
        sub_type=sub_type,
        profile_atoms=profile_atoms,
        evidence=evidence,
        dictionary=retrieve_dictionary_snippets(trait_atoms=trait_atoms),
        cross_model_summary=list(cross_model_summary or []),
        display_summaries=display,
        task=task,
    )


def assemble_pair_context(pair_payload: dict[str, Any], *, product_set: str = "MATE") -> AssembledAIContext:
    ai_ctx = pair_payload.get("ai_context") or {}
    if not isinstance(ai_ctx, dict):
        ai_ctx = {}
    atoms = pair_payload.get("profile_atoms") or {}
    if not isinstance(atoms, dict):
        atoms = {}

    pair_atoms = {
        "pair_atoms": list(ai_ctx.get("pair_atoms") or atoms.get("pair_atoms") or []),
        "common_atoms": list((pair_payload.get("relationship_portrait") or {}).get("common") or []),
        "difference_atoms": list((pair_payload.get("relationship_portrait") or {}).get("difference") or []),
    }

    summary = pair_payload.get("relationship_summary") or {}
    main_type = str(summary.get("relationship_status") or "双人关系")
    spark = str(ai_ctx.get("spark") or summary.get("relationship_spark") or "")

    evidence: list[str] = []
    if spark:
        evidence.append(spark)
    problem = ai_ctx.get("problem")
    if problem:
        evidence.append(f"摩擦点：{problem}")

    dictionary = retrieve_dictionary_snippets(pair_atoms=pair_atoms.get("pair_atoms"))

    return AssembledAIContext(
        product_set=product_set,
        main_type=main_type,
        profile_atoms={},
        pair_atoms=pair_atoms,
        evidence=evidence,
        dictionary=dictionary,
        task="pair-analysis",
    )


def assemble_ros_pair_context(couple_payload: dict[str, Any]) -> AssembledAIContext:
    gap = couple_payload.get("gap") or {}
    if not isinstance(gap, dict):
        gap = {}
    keywords = list(couple_payload.get("keywords") or [])
    rel_type = couple_payload.get("type") or {}
    main_type = str(rel_type.get("name") if isinstance(rel_type, dict) else rel_type or "这段关系")

    difference_atoms: list[str] = []
    if gap.get("dimLabel"):
        difference_atoms.append(f"{gap['dimLabel']}感知差")
    perception = couple_payload.get("perceptionGap") or {}
    if isinstance(perception, dict) and perception.get("label"):
        difference_atoms.append(str(perception["label"]))

    pair_atoms_list = keywords + difference_atoms
    common_atoms: list[str] = []
    for item in couple_payload.get("strengths") or []:
        if isinstance(item, dict) and item.get("text"):
            common_atoms.append(str(item["text"])[:60])

    evidence: list[str] = []
    collision = couple_payload.get("collision") or {}
    if isinstance(collision, dict) and collision.get("body"):
        evidence.append(str(collision["body"])[:120])
    bridge = couple_payload.get("bridge")
    if bridge:
        evidence.append(str(bridge)[:120])

    pair_atoms = {
        "pair_atoms": pair_atoms_list,
        "common_atoms": common_atoms[:3],
        "difference_atoms": difference_atoms,
    }

    stage_id = couple_payload.get("stageId")
    sub_type = f"阶段{stage_id}" if stage_id else None

    return AssembledAIContext(
        product_set="ROS",
        main_type=main_type,
        sub_type=sub_type,
        profile_atoms={},
        pair_atoms=pair_atoms,
        evidence=evidence,
        dictionary=retrieve_dictionary_snippets(pair_atoms=pair_atoms_list),
        task="ros-pair-analysis",
    )


def cross_model_summary_from_portrait(portrait: dict[str, Any] | None) -> list[str]:
    if not portrait or not isinstance(portrait, dict):
        return []
    lines: list[str] = []
    for key in ("SELF", "ROS", "MATE"):
        block = portrait.get(key) or portrait.get(key.lower())
        if not isinstance(block, dict):
            continue
        headline = block.get("headline") or block.get("primaryMetric") or block.get("primary")
        if headline:
            lines.append(f"{product_set_label(key)}·{headline}")
    summary = portrait.get("crossSuiteSummary") or portrait.get("summary")
    if isinstance(summary, list):
        lines.extend(str(x) for x in summary[:3] if x)
    elif isinstance(summary, str) and summary.strip():
        lines.append(summary.strip())
    return lines[:5]


def assemble_from_attempt(
    attempt: dict[str, Any],
    *,
    portrait: dict[str, Any] | None = None,
    task: str | None = None,
) -> AssembledAIContext:
    payload = attempt.get("result_payload") or {}
    if not isinstance(payload, dict):
        payload = {}
    product_set = resolve_attempt_product_set(attempt)
    cross = cross_model_summary_from_portrait(portrait)

    if product_set == "ROS":
        scores = attempt.get("dimension_scores")
        layer_scores = {str(k).upper(): float(v) for k, v in (scores or {}).items()} if isinstance(scores, dict) else None
        return assemble_ros_context(payload, layer_scores=layer_scores, cross_model_summary=cross, task=task)

    if product_set == "SELF":
        return assemble_self_context(payload, cross_model_summary=cross, task=task)

    scores = attempt.get("dimension_scores")
    module_scores = {str(k): float(v) for k, v in (scores or {}).items()} if isinstance(scores, dict) else None
    gender = str(attempt.get("archetype_gender") or payload.get("gender") or "female")
    return assemble_mate_context(payload, module_scores=module_scores, cross_model_summary=cross, task=task, gender=gender)


def context_from_dict(data: dict[str, Any]) -> AssembledAIContext:
    fields = AssembledAIContext.__dataclass_fields__
    kwargs = {key: data[key] for key in fields if key in data}
    return AssembledAIContext(**kwargs)


def format_assembled_context_block(context: AssembledAIContext) -> str:
    return context.to_compact_block()


def attach_assembled_context_to_payload(result_payload: dict[str, Any], context: AssembledAIContext) -> dict[str, Any]:
    payload = dict(result_payload)
    payload["assembledAiContext"] = context.to_model_safe_prompt_dict()
    return payload
