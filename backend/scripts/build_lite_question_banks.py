#!/usr/bin/env python3
"""Generate lite (20-question) question bank JSON files from design spec.

After editing this file or full-bank JSON, regenerate committed lite banks:

  cd backend && python3 scripts/build_lite_question_banks.py

CI runs `scripts/check_lite_question_banks.py` to ensure lite JSON stays in sync.
"""

from __future__ import annotations

import json
import sys
from copy import deepcopy
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.question_bank_guidance import (
    enrich_questions_slider_guidance,
    validate_bank_slider_guidance,
)

DATA_DIR = ROOT / "data"


def self_score(raw: float) -> float:
    """Convert 0-100 design scores to SELF 1-5 scale."""
    return round(raw / 20, 2)


def opt(key: str, text: str, score: float, *, self_scale: bool = False) -> dict[str, Any]:
    s = self_score(score) if self_scale else score
    return {"key": key, "text": text, "score": s}


def slider_q(
    qid: str,
    order: int,
    dimension: str,
    text: str,
    weight: float,
    direction: str,
    *,
    min_v: int = 0,
    max_v: int = 100,
    min_label: str = "",
    max_label: str = "",
    extra: dict[str, Any] | None = None,
) -> dict[str, Any]:
    q: dict[str, Any] = {
        "id": qid,
        "order": order,
        "dimension": dimension,
        "type": "slider",
        "weight": weight,
        "direction": direction,
        "text": text,
        "slider": {"min": min_v, "max": max_v, "min_label": min_label, "max_label": max_label},
        "scoring": {"method": "slider_to_5", "formula": f"value / {max_v} * 5"},
    }
    if extra:
        q.update(extra)
    return q


def choice_q(
    qid: str,
    order: int,
    dimension: str,
    text: str,
    weight: float,
    direction: str,
    options: list[tuple[str, str, float]],
    *,
    self_scale: bool = False,
    note: str | None = None,
) -> dict[str, Any]:
    q: dict[str, Any] = {
        "id": qid,
        "order": order,
        "dimension": dimension,
        "type": "choice",
        "weight": weight,
        "direction": direction,
        "text": text,
        "options": [opt(k, t, s, self_scale=self_scale) for k, t, s in options],
        "scoring": {"method": "direct"},
    }
    if note:
        q["note"] = note
    return q


def binary_q(
    qid: str,
    order: int,
    dimension: str,
    text: str,
    weight: float,
    direction: str,
    left: tuple[str, float],
    right: tuple[str, float],
    *,
    self_scale: bool = False,
) -> dict[str, Any]:
    return {
        "id": qid,
        "order": order,
        "dimension": dimension,
        "type": "binary",
        "weight": weight,
        "direction": direction,
        "text": text,
        "options": [
            {"key": "left", "text": left[0], "score": self_score(left[1]) if self_scale else left[1]},
            {"key": "right", "text": right[0], "score": self_score(right[1]) if self_scale else right[1]},
        ],
        "scoring": {"method": "direct"},
    }


def scenario_q(
    qid: str,
    order: int,
    dimension: str,
    text: str,
    weight: float,
    direction: str,
    options: list[tuple[str, str, float]],
    *,
    self_scale: bool = False,
    alt_text: str | None = None,
) -> dict[str, Any]:
    q: dict[str, Any] = {
        "id": qid,
        "order": order,
        "dimension": dimension,
        "type": "scenario",
        "weight": weight,
        "direction": direction,
        "text": text,
        "options": [opt(k, t, s, self_scale=self_scale) for k, t, s in options],
        "scoring": {"method": "direct"},
    }
    if alt_text:
        q["alt_text_secret_crush"] = alt_text
    return q


def layer_q(qid: str, order: int, layer: str, qtype: str, **kwargs: Any) -> dict[str, Any]:
    builders = {"slider": slider_q, "choice": choice_q, "binary": binary_q, "scenario": scenario_q}
    fn = builders[qtype]
    q = fn(qid, order, layer, **kwargs)
    q.pop("dimension", None)
    q["layer"] = layer
    return q


def module_q(qid: str, order: int, module: str, sub: str, qtype: str, **kwargs: Any) -> dict[str, Any]:
    builders = {"slider": slider_q, "choice": choice_q, "binary": binary_q, "scenario": scenario_q}
    fn = builders[qtype]
    q = fn(qid, order, module, **kwargs)
    q.pop("dimension", None)
    q["module"] = module
    q["sub"] = sub
    return q


def self_female_questions() -> list[dict[str, Any]]:
    ss = True
    return [
        slider_q("SA1-F-01", 1, "SA1", "你觉得自己值得被一个很好的人认真对待吗？", 1.5, "positive",
                 min_label="不太确定，觉得自己还不够好", max_label="完全值得，我对自己有信心"),
        choice_q("SA1-F-02", 2, "SA1", "你上一次被人真心喜欢，你的第一反应是？", 1.2, "positive", [
            ("A", "有点意外，觉得对方可能不了解真实的我", 20),
            ("B", "开心，但很快开始担心自己配不上", 45),
            ("C", "感觉还好，挺自然的", 80),
            ("D", "当然了，我值得被喜欢", 90),
        ], self_scale=ss),
        scenario_q("SA2-F-03", 3, "SA2", "你发了一条消息给他，两个小时没有回复。你的状态最接近？", 1.5, "positive", [
            ("A", "没什么，他可能在忙", 90),
            ("B", "有点在意，但能控制住", 70),
            ("C", "开始反复回看自己发的内容，想是不是说错了", 30),
            ("D", "非常不安，忍不住又发了一条", 10),
        ], self_scale=ss),
        binary_q("SA2-F-04", 4, "SA2", "在关系里，你需要对方经常主动确认「我喜欢你/我在这里」才能安心吗？", 1.5, "positive",
                 ("不太需要，我内心比较稳", 85), ("需要，不确认就会开始担心", 20), self_scale=ss),
        scenario_q("SA2-F-05", 5, "SA2", "他今天语气比平时冷淡了一些。你最可能做的是？", 1.3, "positive", [
            ("A", "观察一下，可能他只是今天状态不好", 85),
            ("B", "主动问他怎么了", 70),
            ("C", "开始反思最近是不是自己哪里出了问题", 25),
            ("D", "情绪受影响，开始担心关系出了问题", 10),
        ], self_scale=ss),
        choice_q("SA2-F-06", 6, "SA2", "在一段关系里，你的安全感主要来自？", 1.3, "positive", [
            ("A", "自己内心，他稳不稳定影响不了我太多", 90),
            ("B", "对方稳定的行动，时间久了我会慢慢安心", 70),
            ("C", "对方频繁的回应和表达，他少说一句我就会想太多", 20),
            ("D", "说实话我不知道，可能来自任何地方", 50),
        ], self_scale=ss),
        scenario_q("SA3-F-07", 7, "SA3", "一个你有好感的人突然对你表白了。你的第一反应是？", 1.5, "positive", [
            ("A", "开心，愿意认真考虑", 85),
            ("B", "有些意外，需要时间想一想", 65),
            ("C", "有点慌，本能地想后退一步", 25),
            ("D", "感觉压力很大，想找理由回避", 10),
        ], self_scale=ss),
        binary_q("SA3-F-08", 8, "SA3", "当关系变得很亲密、对方开始非常依赖你的时候，你通常会？", 1.5, "positive",
                 ("感到被珍视，挺好的", 80), ("感到有点窒息，需要一些距离", 20), self_scale=ss),
        choice_q("SA3-F-09", 9, "SA3", "你在关系里愿意让对方真正了解你吗？", 1.3, "positive", [
            ("A", "愿意，我喜欢被真正看见", 85),
            ("B", "愿意，但需要慢慢来，不能太快", 65),
            ("C", "有一些部分我不太想让人看见", 35),
            ("D", "很难，展示真实的自己让我很不舒服", 10),
        ], self_scale=ss),
        scenario_q("SA3-F-10", 10, "SA3", "你们吵架了，他说想冷静一下，今晚不想说话。你会？", 1.3, "positive", [
            ("A", "好，给他时间，我也去做自己的事", 85),
            ("B", "忍着，但心里很不安", 50),
            ("C", "给他发消息确认他还好", 35),
            ("D", "很快就先联系他，不能接受冷战", 55),
        ], self_scale=ss),
        scenario_q("SA4-F-11", 11, "SA4", "他希望你减少跟某个异性朋友的联系，你认为那是正常的朋友。你会？", 1.5, "positive", [
            ("A", "直接告诉他这是我的朋友，不会改变", 90),
            ("B", "跟他解释，但也会稍微减少让他安心", 60),
            ("C", "算了，为了不让他不高兴就少联系了", 20),
            ("D", "嘴上答应，实际没有改变", 30),
        ], self_scale=ss),
        binary_q("SA4-F-12", 12, "SA4", "你在关系里说「没事」的时候，通常是？", 1.3, "positive",
                 ("真的没事，我不会憋着不说", 90), ("有事但不想说，或者说了也没用", 20), self_scale=ss),
        choice_q("SA4-F-13", 13, "SA4", "对方做了一件让你很不舒服的事，但他没有意识到。你通常会？", 1.3, "positive", [
            ("A", "直接告诉他，这件事让我不舒服", 90),
            ("B", "暗示一下，希望他能自己意识到", 55),
            ("C", "忍着，不想因为这个起摩擦", 20),
            ("D", "冷处理，等他自己发现", 30),
        ], self_scale=ss),
        slider_q("SA5-F-14", 14, "SA5", "当你在关系里情绪很差时，你能不能把它说清楚，而不是冷战或者爆发？", 1.3, "positive",
                 min_label="很难，情绪一来就失控或者憋着", max_label="能，我可以直接说出来"),
        scenario_q("SA5-F-15", 15, "SA5", "你工作上受了委屈，回家后他随口说了一句让你不舒服的话（他不是故意的）。你会？", 1.3, "positive", [
            ("A", "告诉他我今天状态不好，那句话让我有点难受", 90),
            ("B", "比平时敏感，但事后知道是自己的问题", 65),
            ("C", "直接爆发，后来才意识到是工作的事", 30),
            ("D", "心里憋着，开始冷战", 20),
        ], self_scale=ss),
        binary_q("SA5-F-16", 16, "SA5", "你委屈了，你更倾向于？", 1.2, "positive",
                 ("直接说出来，我不憋着", 85), ("等他自己发现，或者等我气消了再说", 40), self_scale=ss),
        scenario_q("SA6-F-17", 17, "SA6", "你喜欢一个人，你通常是怎么表达的？", 1.3, "positive", [
            ("A", "主动说出来，直接表达", 75),
            ("B", "用行动表达，记住他说过的事，在细节里", 85),
            ("C", "等他先表达，我再回应", 50),
            ("D", "喜欢但藏着，怕说了被拒绝", 35),
        ], self_scale=ss),
        choice_q("SA6-F-18", 18, "SA6", "你在关系里付出的动力，更多来自？", 1.5, "positive", [
            ("A", "真心喜欢他，想让他好，主动的", 85),
            ("B", "喜欢他，但也怕他离开，两者都有", 55),
            ("C", "害怕孤独，需要有人在", 20),
            ("D", "觉得这是关系里应该做的", 45),
        ], self_scale=ss),
        binary_q("SA6-F-19", 19, "SA6", "如果你全力付出但对方没有同等回应，你会？", 1.5, "positive",
                 ("说出来，或者调整自己的投入程度", 85), ("继续付出，觉得对方总有一天会感受到", 30), self_scale=ss),
        choice_q("SA6-F-20", 20, "SA6", "你在一段关系里最在意的是？", 1.2, "auxiliary", [
            ("A", "对方真的懂我，我们有真实的联结", 80),
            ("B", "对方稳定可靠，我能放心依赖他", 70),
            ("C", "对方很爱我，我能感受到被珍视", 60),
            ("D", "我们在一起，不孤单", 35),
        ], self_scale=ss, note="辅助类型判断"),
    ]


def self_male_questions() -> list[dict[str, Any]]:
    ss = True
    return [
        slider_q("SA1-M-01", 1, "SA1", "你觉得自己值得被一个很好的人认真对待吗？", 1.5, "positive",
                 min_label="不太确定", max_label="完全值得"),
        choice_q("SA1-M-02", 2, "SA1", "有人对你感兴趣，你的第一反应通常是？", 1.2, "positive", [
            ("A", "有点怀疑，觉得对方可能只是一时的", 20),
            ("B", "开心，但很快想「她了解真实的我吗」", 50),
            ("C", "正常接受，觉得自然", 80),
            ("D", "理所当然，我值得被喜欢", 90),
        ], self_scale=ss),
        scenario_q("SA2-M-03", 3, "SA2", "你发消息给她，两小时没回。你最可能做什么？", 1.5, "positive", [
            ("A", "没什么，她可能在忙", 90),
            ("B", "有点在意，但继续做自己的事", 70),
            ("C", "忍不住再发一条确认", 25),
            ("D", "开始觉得是不是哪里出问题了", 10),
        ], self_scale=ss),
        binary_q("SA2-M-04", 4, "SA2", "她今天状态冷淡一些。你通常的反应是？", 1.5, "positive",
                 ("观察一下，可能只是她今天累了", 85), ("情绪受影响，开始担心是不是自己的问题", 15), self_scale=ss),
        choice_q("SA2-M-05", 5, "SA2", "你在关系里的安全感主要来自？", 1.3, "positive", [
            ("A", "自己内心，外部怎么变化影响不了我", 90),
            ("B", "对方稳定的行动，时间长了会安心", 70),
            ("C", "需要她频繁表达，少说一句我就会多想", 20),
            ("D", "说不清，状态好就有，状态差就没有", 50),
        ], self_scale=ss),
        scenario_q("SA2-M-06", 6, "SA2", "你们吵架，她说今晚不想说话。你会？", 1.3, "positive", [
            ("A", "好，给她时间，我也去做自己的事", 85),
            ("B", "表面同意，但一直刷手机等她消息", 40),
            ("C", "过一会儿忍不住发消息确认她还好", 30),
            ("D", "继续找她说，不能接受就这样冷着", 15),
        ], self_scale=ss),
        binary_q("SA3-M-07", 7, "SA3", "当关系变得非常亲密，对方开始高度依赖你，你通常感觉？", 1.5, "positive",
                 ("被珍视，这正是我想要的", 80), ("有点压迫感，需要一些个人空间", 20), self_scale=ss),
        scenario_q("SA3-M-08", 8, "SA3", "她想每天睡前通话。你的真实感受是？", 1.5, "positive", [
            ("A", "挺好的，喜欢这种感觉", 80),
            ("B", "可以接受，但希望不是每天必须", 55),
            ("C", "有点喘不过气，这对我来说太多了", 20),
            ("D", "直接说不太适合我，我需要自己的时间", 65),
        ], self_scale=ss),
        choice_q("SA3-M-09", 9, "SA3", "你愿意让她真正了解你吗？", 1.3, "positive", [
            ("A", "愿意，我喜欢被真正看见", 85),
            ("B", "愿意，但要慢慢来", 65),
            ("C", "有一些部分不想让人看见", 35),
            ("D", "展示真实的自己让我不太自在", 15),
        ], self_scale=ss),
        scenario_q("SA3-M-10", 10, "SA3", "她第一次对你说「我爱你」。你的本能反应是？", 1.3, "positive", [
            ("A", "回应她，我也有同感", 85),
            ("B", "感动，但说不出口，用行动表示", 65),
            ("C", "有点愣，需要一点时间消化", 45),
            ("D", "感到压力，本能地想后退", 15),
        ], self_scale=ss),
        binary_q("SA4-M-11", 11, "SA4", "她对你的某个习惯或朋友有意见，但你觉得没问题。你会？", 1.5, "positive",
                 ("跟她说清楚，这件事我不打算改变", 85), ("为了不让她不高兴，将就一下", 20), self_scale=ss),
        scenario_q("SA4-M-12", 12, "SA4", "她做了一件让你不舒服的事，但她没意识到。你通常会？", 1.3, "positive", [
            ("A", "直接告诉她", 90),
            ("B", "暗示一下，等她自己发现", 55),
            ("C", "忍着，不想因为这个起摩擦", 20),
            ("D", "冷处理，看她什么时候注意到", 30),
        ], self_scale=ss),
        choice_q("SA4-M-13", 13, "SA4", "你在关系里说「没事」的时候，通常真的没事吗？", 1.3, "positive", [
            ("A", "是的，我不说了就是真的没事", 90),
            ("B", "大多数时候是，偶尔有事懒得说", 65),
            ("C", "大多数时候是有事但不想说", 25),
            ("D", "说没事但其实心里记着", 15),
        ], self_scale=ss),
        binary_q("SA5-M-14", 14, "SA5", "当你情绪很差时，你对她的态度会受影响吗？", 1.5, "positive",
                 ("基本不会，我能把情绪管好", 85), ("会有影响，状态差时她能感觉到", 30), self_scale=ss),
        scenario_q("SA5-M-15", 15, "SA5", "工作压力很大，状态很差。回家后她随口说了一句让你不舒服的话。你会？", 1.3, "positive", [
            ("A", "告诉她我今天状态不好，那句话让我有点难受", 85),
            ("B", "语气有点差，但不是故意针对她", 40),
            ("C", "直接发了一顿，事后知道不对", 20),
            ("D", "憋着什么都不说，开始冷战", 25),
        ], self_scale=ss),
        slider_q("SA5-M-16", 16, "SA5", "在关系里发生冲突时，你保持情绪稳定、不失控的能力有多强？", 1.3, "positive",
                 min_label="很难，容易情绪化", max_label="通常能保持相对冷静"),
        scenario_q("SA6-M-17", 17, "SA6", "你喜欢一个人时，你通常是怎么表达的？", 1.3, "positive", [
            ("A", "直接说出来", 75),
            ("B", "用行动，记住她说过的事，在合适的时机出现", 85),
            ("C", "等她先表达，再回应", 50),
            ("D", "喜欢但藏着，不太会说", 40),
        ], self_scale=ss),
        choice_q("SA6-M-18", 18, "SA6", "你在关系里付出的动力，更多来自？", 1.5, "positive", [
            ("A", "真心喜欢她，主动想让她好", 85),
            ("B", "喜欢她，但也有一部分是怕失去", 55),
            ("C", "觉得这是关系里应该做的", 45),
            ("D", "需要有人在，不想一个人", 20),
        ], self_scale=ss),
        binary_q("SA6-M-19", 19, "SA6", "如果你全力付出但对方没有同等回应，你会？", 1.5, "positive",
                 ("说出来，或者调整自己的投入", 85), ("继续付出，觉得多做一点对方会感受到", 30), self_scale=ss),
        choice_q("SA6-M-20", 20, "SA6", "你在一段关系里最在意的是？", 1.2, "auxiliary", [
            ("A", "她真的懂我，我们有真实的联结", 80),
            ("B", "她让我感到轻松，跟她在一起不累", 75),
            ("C", "她很爱我，我能感受到被珍视", 60),
            ("D", "有人陪着，不孤单", 35),
        ], self_scale=ss, note="辅助类型判断"),
    ]


def self_scoring_weights(questions: list[dict[str, Any]]) -> dict[str, dict[str, Any]]:
    dims: dict[str, dict[str, float]] = {}
    for q in questions:
        if q.get("direction") == "auxiliary":
            continue
        dim = q["dimension"]
        dims.setdefault(dim, {})[q["id"]] = q["weight"]
    formula: dict[str, Any] = {}
    labels = {
        "SA1": "自我吸引感知", "SA2": "依恋焦虑", "SA3": "依恋回避",
        "SA4": "自我边界", "SA5": "情绪调节", "SA6": "关系投入模式",
    }
    directions = {"SA2": "reverse", "SA3": "reverse"}
    for dim, weights in dims.items():
        formula[dim] = {
            "label": labels[dim],
            "direction": directions.get(dim, "positive"),
            "formula": "weighted_avg * 20",
            "weights": weights,
            "weight_sum": round(sum(weights.values()), 2),
        }
    return formula


def ros_pre_questions(gender: str) -> list[dict[str, Any]]:
    prefix = "F" if gender == "female" else "M"
    return [{
        "id": f"PRE-{prefix}-00A",
        "type": "choice",
        "text": "在开始之前，先告诉我你们现在处于什么阶段？",
        "note": "此答案影响题目措辞与阶段判断，不计分。",
        "options": [
            {"key": "A", "text": "暗恋/还没在一起", "tag": "secret_crush"},
            {"key": "B", "text": "暧昧中", "tag": "ambiguous"},
            {"key": "C", "text": "在一起不到一年", "tag": "early"},
            {"key": "D", "text": "在一起一到三年", "tag": "mid"},
            {"key": "E", "text": "在一起三年以上", "tag": "long"},
            {"key": "F", "text": "已婚/长期伴侣", "tag": "married"},
        ],
    }]


def ros_female_questions() -> list[dict[str, Any]]:
    crush_alt = "从你对他的了解，你们对未来的设想大概一致吗？"
    return [
        layer_q("AT-F-01", 1, "AT", "slider", text="你现在对他的吸引感，跟最开始相比是什么状态？", weight=1.5, direction="positive",
                min_label="比最开始淡了很多", max_label="还是一样强烈，甚至更深了"),
        layer_q("AT-F-02", 2, "AT", "binary", text="当初让你喜欢上他的那些东西，现在还在吗？", weight=1.5, direction="positive",
                left=("在，而且了解越深越喜欢", 85), right=("有些还在，但有些随着了解淡了", 50)),
        layer_q("AT-F-03", 3, "AT", "scenario", text="如果他现在从你的生活里消失，你的第一反应会是？", weight=1.3, direction="positive", options=[
            ("A", "很难受，他在我生命里有真实的重量", 85),
            ("B", "会有影响，但我能想象没有他的生活", 55),
            ("C", "说不清楚，复杂", 45),
            ("D", "可能会如释重负", 20),
        ]),
        layer_q("AT-F-04", 4, "AT", "choice", text="你喜欢他，最核心的原因是？", weight=1.0, direction="auxiliary", options=[
            ("A", "跟他在一起有真实的安全感", 75),
            ("B", "他让我觉得自己值得被认真对待", 80),
            ("C", "就是被他吸引，说不清楚", 70),
            ("D", "他是我真正欣赏的人", 80),
        ], note="辅助关系类型判断"),
        layer_q("IN-F-05", 5, "IN", "slider", text="你觉得他真正在听你说话的频率有多高？", weight=1.5, direction="positive",
                min_label="他很少真正在听", max_label="他大多数时候都真的在听"),
        layer_q("IN-F-06", 6, "IN", "binary", text="跟他在一起，你大多数时候是？", weight=1.5, direction="positive",
                left=("轻松的，很舒服，不需要表演", 85), right=("需要注意一些东西，有时候会累", 35)),
        layer_q("IN-F-07", 7, "IN", "scenario", text="你们吵架或者有矛盾之后，通常是怎么结束的？", weight=1.5, direction="positive", options=[
            ("A", "真正把问题说清楚了，然后和好", 90),
            ("B", "冷静了就和好，但问题没完全说清楚", 60),
            ("C", "一个人先妥协，然后过去了", 40),
            ("D", "冷处理，假装没发生过", 20),
        ]),
        layer_q("IN-F-08", 8, "IN", "choice", text="你今天心情很差，他看出来了。他通常怎么做？", weight=1.5, direction="positive", options=[
            ("A", "主动问我，然后认真听", 90),
            ("B", "问了一下，然后帮我分析解决", 65),
            ("C", "看出来了，但没主动问", 45),
            ("D", "没特别注意到", 20),
        ]),
        layer_q("IN-F-09", 9, "IN", "slider", text="在你们的关系里，你感觉自己被他真正理解的程度是多少？", weight=1.5, direction="positive",
                min_label="他不太了解真正的我", max_label="他是少数真正懂我的人之一"),
        layer_q("IN-F-10", 10, "IN", "binary", text="他说话算数吗？答应你的事，他做到的概率是？", weight=1.3, direction="positive",
                left=("很高，他说了基本上会做到", 85), right=("不一定，经常有变化或者忘了", 25)),
        layer_q("CO-F-11", 11, "CO", "scenario", text="你们谈到了未来——住哪、要不要孩子、怎么分工。你们的方向是？", weight=1.5, direction="positive",
                options=[
                    ("A", "基本一致，细节可以商量", 90),
                    ("B", "有些不同，但都愿意妥协", 65),
                    ("C", "有一个核心分歧，暂时搁置", 35),
                    ("D", "没认真谈过，或者谈了发现差很多", 20),
                ], alt_text=crush_alt),
        layer_q("CO-F-12", 12, "CO", "binary", text="你们对「关系里各自需要多少空间」这件事，理解一致吗？", weight=1.3, direction="positive",
                left=("一致，我们都知道彼此需要什么", 85), right=("有差距，一个需要更多空间，一个需要更多陪伴", 35)),
        layer_q("CO-F-13", 13, "CO", "slider", text="你们在核心价值观上——对家庭、工作、生活的看法——有多一致？", weight=1.5, direction="positive",
                min_label="差异很大，经常感觉不是一路人", max_label="非常一致，很少在这些事上有分歧"),
        layer_q("CO-F-14", 14, "CO", "choice", text="你觉得他是一个跟你能走很远的人吗？", weight=1.5, direction="positive", options=[
            ("A", "是，我这样觉得", 90),
            ("B", "可能是，但还不确定", 60),
            ("C", "不太确定，有些重要的事还没想清楚", 40),
            ("D", "不太像，但我现在也还好", 25),
        ]),
        layer_q("EV-F-15", 15, "EV", "slider", text="跟他在一起这段时间，你觉得自己有没有在成长？", weight=1.5, direction="positive",
                min_label="这段关系让我反而有点萎缩", max_label="我在这段关系里明显变好了"),
        layer_q("EV-F-16", 16, "EV", "binary", text="这段关系最近的趋势，你感觉是？", weight=1.5, direction="positive",
                left=("在变好，我们越来越懂彼此", 85), right=("有些东西在变淡，或者出现了新的问题", 30)),
        layer_q("EV-F-17", 17, "EV", "choice", text="你想象一年后的你们，第一个浮现的画面是？", weight=1.5, direction="positive", options=[
            ("A", "比现在更好，能清楚想象我们在一起", 90),
            ("B", "差不多，继续现在这样", 60),
            ("C", "有点模糊，不确定", 40),
            ("D", "很难想象，或者想到就有点担心", 20),
        ]),
        layer_q("EV-F-18", 18, "EV", "scenario", text="你回顾你们在一起的这段时间，整体感受是？", weight=1.5, direction="positive", options=[
            ("A", "值得，有很多真实的快乐和成长", 90),
            ("B", "有好有坏，总体还是值得的", 65),
            ("C", "有些累，但还没想清楚要怎样", 35),
            ("D", "如果能重来，可能会做不同的选择", 15),
        ]),
        layer_q("RK-F-19", 19, "RK", "binary", text="在这段关系里，你有没有感觉过一种「我在压抑自己」的时刻？", weight=1.5, direction="reverse",
                left=("很少，我在他面前大多数时候可以做自己", 15), right=("有，有一些东西我不敢说或者不得不压着", 75)),
        layer_q("RK-F-20", 20, "RK", "choice", text="如果你最好的朋友描述一段跟你们很相似的关系，问你怎么看，你会说？", weight=1.5, direction="reverse", options=[
            ("A", "这段关系挺好的，值得珍惜", 10),
            ("B", "有些地方需要注意，但整体健康", 30),
            ("C", "我会有些担心，提醒她注意某些模式", 60),
            ("D", "建议她认真想想值不值得继续", 85),
        ]),
    ]


def ros_male_questions() -> list[dict[str, Any]]:
    return [
        layer_q("AT-M-01", 1, "AT", "slider", text="你现在对她的吸引感，跟最开始相比？", weight=1.5, direction="positive",
                min_label="淡了很多", max_label="还是一样强，甚至更深了"),
        layer_q("AT-M-02", 2, "AT", "binary", text="当初让你喜欢上她的那些东西，现在还在吗？", weight=1.5, direction="positive",
                left=("在，了解越深越喜欢", 85), right=("有些还在，但有些随着了解消退了", 50)),
        layer_q("AT-M-03", 3, "AT", "choice", text="你喜欢她，最核心的原因是？", weight=1.0, direction="auxiliary", options=[
            ("A", "跟她在一起很放松，不需要表演", 75),
            ("B", "她让我想成为更好的自己", 80),
            ("C", "就是被她吸引，说不清楚", 70),
            ("D", "她是我真正欣赏的人", 80),
        ]),
        layer_q("AT-M-04", 4, "AT", "scenario", text="如果她现在从你的生活里消失，你的第一反应会是？", weight=1.3, direction="positive", options=[
            ("A", "很难受，她在我生活里有真实的重量", 85),
            ("B", "会有影响，但能想象没有她的生活", 55),
            ("C", "说不清楚", 45),
            ("D", "可能有点如释重负", 20),
        ]),
        layer_q("IN-M-05", 5, "IN", "slider", text="跟她在一起，你整体的感觉是轻松还是有负担？", weight=1.5, direction="positive",
                min_label="经常感到有压力或消耗", max_label="跟她在一起非常轻松"),
        layer_q("IN-M-06", 6, "IN", "binary", text="她的情绪状态，对你的情绪影响大吗？", weight=1.5, direction="positive",
                left=("不太大，我能把自己的状态和她的情绪分开", 80), right=("比较大，她不高兴我就很难放松", 35)),
        layer_q("IN-M-07", 7, "IN", "scenario", text="你今天心情不好，不想说话。她的反应通常是？", weight=1.5, direction="positive", options=[
            ("A", "感觉到了，给我空间，但让我知道她在", 90),
            ("B", "问我怎么了，想帮我解决问题", 60),
            ("C", "没感觉到，照常说话", 35),
            ("D", "感觉到了，但开始担心是不是自己的问题", 25),
        ]),
        layer_q("IN-M-08", 8, "IN", "choice", text="你们吵架或有矛盾之后，通常怎么结束？", weight=1.5, direction="positive", options=[
            ("A", "真正说清楚，和好，感觉更近了", 90),
            ("B", "冷静了就和好，但没完全说清楚", 60),
            ("C", "一个人先让步，然后过去了", 40),
            ("D", "冷处理，假装没发生过", 20),
        ]),
        layer_q("IN-M-09", 9, "IN", "slider", text="在你们的关系里，你感觉自己被她真正理解的程度是多少？", weight=1.5, direction="positive",
                min_label="她不太了解真正的我", max_label="她是少数真正懂我的人之一"),
        layer_q("IN-M-10", 10, "IN", "binary", text="她说话算数吗？答应你的事，她做到的概率是？", weight=1.3, direction="positive",
                left=("很高，说了基本都会做到", 85), right=("不一定，经常有变化或者忘了", 25)),
        layer_q("CO-M-11", 11, "CO", "scenario", text="你们谈到未来。你们的方向是？", weight=1.5, direction="positive", options=[
            ("A", "基本一致，细节可以商量", 90),
            ("B", "有些不同，但都愿意妥协", 65),
            ("C", "有一个核心分歧，暂时搁置", 35),
            ("D", "没认真谈过，或谈了发现差很多", 20),
        ]),
        layer_q("CO-M-12", 12, "CO", "binary", text="她对你需要的个人空间，理解吗？", weight=1.5, direction="positive",
                left=("理解，不会因为我需要独处而有意见", 85), right=("有时候不理解，我需要空间时会有摩擦", 30)),
        layer_q("CO-M-13", 13, "CO", "slider", text="你们在核心价值观上有多一致？", weight=1.5, direction="positive",
                min_label="差异很大", max_label="非常一致"),
        layer_q("CO-M-14", 14, "CO", "choice", text="你觉得她是一个跟你能走很远的人吗？", weight=1.5, direction="positive", options=[
            ("A", "是", 90),
            ("B", "可能是，但还不确定", 60),
            ("C", "不太确定", 40),
            ("D", "不太像，但现在也还好", 25),
        ]),
        layer_q("EV-M-15", 15, "EV", "slider", text="跟她在一起这段时间，你觉得自己有没有在进步？", weight=1.5, direction="positive",
                min_label="这段关系让我停滞甚至退步", max_label="在这段关系里我明显变好了"),
        layer_q("EV-M-16", 16, "EV", "binary", text="这段关系有没有让你有动力往前走？", weight=1.5, direction="positive",
                left=("有，她让我更想努力", 85), right=("没有特别，或者反而有点消耗", 30)),
        layer_q("EV-M-17", 17, "EV", "choice", text="你想象一年后的你们，第一个浮现的画面是？", weight=1.5, direction="positive", options=[
            ("A", "比现在更好，能清楚想象", 90),
            ("B", "差不多，继续现在这样", 60),
            ("C", "有点模糊，不确定", 40),
            ("D", "很难想象，或者想到就有点担心", 20),
        ]),
        layer_q("EV-M-18", 18, "EV", "scenario", text="你回顾你们在一起的这段时间，整体感受是？", weight=1.5, direction="positive", options=[
            ("A", "值得，有很多真实的快乐，我不后悔", 90),
            ("B", "有好有坏，总体还是值得的", 65),
            ("C", "有些累，但还没想清楚", 35),
            ("D", "如果能重来可能会做不同选择", 15),
        ]),
        layer_q("RK-M-19", 19, "RK", "binary", text="在这段关系里，你有没有感觉过「我在压抑自己」？", weight=1.5, direction="reverse",
                left=("很少，我在她面前大多数时候可以做自己", 15), right=("有，有一些东西不敢说或者不得不压着", 75)),
        layer_q("RK-M-20", 20, "RK", "choice", text="如果最好的哥们描述一段跟你们很相似的关系，问你怎么看，你会说？", weight=1.5, direction="reverse", options=[
            ("A", "挺好的，值得珍惜", 10),
            ("B", "有些地方需要注意，但整体健康", 30),
            ("C", "我会有点担心，提醒他注意某些模式", 60),
            ("D", "建议他认真想想值不值得继续", 85),
        ]),
    ]


def _appearance_slider_from_full(
    gender: str,
    *,
    lite_id: str,
    order: int,
    calibration_signals: list[str],
) -> dict[str, Any]:
    full_path = DATA_DIR / f"suite3_mate_{gender}.json"
    full = json.loads(full_path.read_text(encoding="utf-8"))
    full_id = "FS1-A-F-01" if gender == "female" else "MS4-A-M-49"
    src = next(q for q in full["questions"] if q["id"] == full_id)
    q = deepcopy(src)
    q["id"] = lite_id
    q["order"] = order
    q["scoring"] = {
        **(q.get("scoring") or {}),
        "calibrationSignals": calibration_signals,
    }
    return q


def mate_female_questions() -> list[dict[str, Any]]:
    return [
        _appearance_slider_from_full(
            "female",
            lite_id="FS1-F-01",
            order=1,
            calibration_signals=["FS1-F-03", "FS1-F-02", "FS1-F-04"],
        ),
        module_q("FS1-F-02", 2, "FS1", "FS1_B", "scenario", text="你走进一个聚会，里面大多数是陌生人。通常会发生什么？", weight=1.5, direction="positive", options=[
            ("A", "我进去的时候，通常会有人抬头看", 90),
            ("B", "偶尔会感觉有人看了我一眼，但不确定", 65),
            ("C", "我找个位置坐下，没什么特别", 40),
            ("D", "我主动找角落，尽量不引人注意", 20),
        ]),
        module_q("FS1-F-03", 3, "FS1", "FS1_C", "binary", text="你的吸引力，更接近哪种？", weight=1.3, direction="positive",
                 left=("第一眼型，初见最惊艳", 70), right=("越处越好看型，相处后才出来", 80)),
        module_q("FS1-F-04", 4, "FS1", "FS1_A", "choice", text="你上一次被陌生人主动要联系方式，是什么时候？", weight=1.3, direction="positive", options=[
            ("A", "好几年前，记不太清", 20),
            ("B", "一两年以内", 50),
            ("C", "半年以内", 70),
            ("D", "最近三个月内就有", 90),
        ]),
        module_q("FS1-F-05", 5, "FS1", "FS1_A", "slider", text="你对自己目前外形状态的满意程度？", weight=1.0, direction="positive",
                 min_label="很不满意", max_label="非常满意，状态很好"),
        module_q("FS2-F-06", 6, "FS2", "FS2_A", "scenario", text="他今天工作上遇到了很糟糕的事，回家后一句话不说。你的第一反应是？", weight=1.5, direction="positive", options=[
            ("A", "走过去坐在他旁边，不说话，陪着他", 90),
            ("B", "问他怎么了", 70),
            ("C", "给他倒水或者做点吃的，用行动表达", 80),
            ("D", "等他自己缓过来，不打扰", 45),
        ]),
        module_q("FS2-F-07", 7, "FS2", "FS2_A", "binary", text="对方跟你倾诉烦心事，你的本能反应更接近？", weight=1.5, direction="positive",
                 left=("先听完，给他感受被理解的空间", 85), right=("边听边想，帮他分析问题在哪里", 55)),
        module_q("FS2-F-08", 8, "FS2", "FS2_B", "choice", text="你跟喜欢的人聊天，通常是什么状态？", weight=1.3, direction="positive", options=[
            ("A", "我话多，话题多，对方说跟我聊天不无聊", 80),
            ("B", "双方都挺有话说，很自然", 85),
            ("C", "我不太擅长主动找话题，更多是接话", 40),
            ("D", "看对方，遇到聊得来的我话很多", 65),
        ]),
        module_q("FS2-F-09", 9, "FS2", "FS2_C", "binary", text="你觉得如果你们分开，他会？", weight=1.5, direction="positive",
                 left=("很难找到像我这样的，会想起我很久", 85), right=("慢慢会好，我不确定自己有多难被替代", 40)),
        module_q("FS2-F-10", 10, "FS2", "FS2_B", "slider", text="你觉得跟你在一起，对方会觉得有意思的程度是多少？", weight=1.2, direction="positive",
                 min_label="我可能比较无聊", max_label="跟我在一起很有意思"),
        module_q("FS3-F-11", 11, "FS3", "FS3_A", "choice", text="你目前的经济状态，最接近哪种描述？", weight=1.5, direction="positive", options=[
            ("A", "有稳定工作，收入能覆盖自己，还有余钱", 70),
            ("B", "有收入但不多，偶尔需要家里补贴", 50),
            ("C", "主要靠家里", 25),
            ("D", "我收入很好，明显高于同龄人平均", 90),
        ]),
        module_q("FS3-F-12", 12, "FS3", "FS3_A", "binary", text="如果你们分手，你的生活质量会？", weight=1.5, direction="positive",
                 left=("基本不受影响，我自己过得很好", 85), right=("会有一些影响，我有一部分依赖对方", 35)),
        module_q("FS3-F-13", 13, "FS3", "FS3_B", "choice", text="你的原生家庭在你的感情里，通常扮演什么角色？", weight=1.5, direction="positive", options=[
            ("A", "后盾，需要时支持，不干涉我的选择", 85),
            ("B", "存在感不强，我自己做决定", 75),
            ("C", "偶尔干预，但总体还好", 50),
            ("D", "参与度很高，对我的感情有很多要求", 20),
        ]),
        module_q("FS3-F-14", 14, "FS3", "FS3_C", "binary", text="你一个人生活的话，能过得很好吗？", weight=1.3, direction="positive",
                 left=("完全没问题，我很能照顾自己", 85), right=("还好，但有很多事需要有人帮", 40)),
        module_q("FS4-F-15", 15, "FS4", "FS4_A", "scenario", text="他做了一件让你不舒服的事，但他没意识到。你通常会？", weight=1.5, direction="positive", options=[
            ("A", "直接告诉他", 90),
            ("B", "暗示一下，希望他自己意识到", 55),
            ("C", "忍着，不想闹矛盾", 20),
            ("D", "先冷处理，看他有没有反应", 35),
        ]),
        module_q("FS4-F-16", 16, "FS4", "FS4_B", "choice", text="你在关系里最常用的情绪处理方式是？", weight=1.3, direction="positive", options=[
            ("A", "直接说，当下处理，不拖", 85),
            ("B", "先给自己时间冷静，然后再说", 90),
            ("C", "靠时间消化，不一定会说出来", 45),
            ("D", "用行动表示，比如冷战，让他感觉到", 20),
        ]),
        module_q("FS4-F-17", 17, "FS4", "FS4_C", "binary", text="自从谈恋爱之后，你的个人生活？", weight=1.3, direction="positive",
                 left=("基本没变，我还是我，关系是额外的部分", 85), right=("变了很多，他成了我生活的中心", 25)),
        module_q("FS5-F-18", 18, "FS5", "FS5_A", "scenario", text="新认识一个男生，他问你上一段感情是怎么结束的。你最真实的回答是？", weight=1.5, direction="reverse", options=[
            ("A", "简单说了，双方都有问题，已经过去了", 10),
            ("B", "说了一些，但有些部分还没消化", 35),
            ("C", "说了很多，那段感情对我影响还挺大", 65),
            ("D", "不太想提，提了情绪会有波动", 80),
        ]),
        module_q("FS5-F-19", 19, "FS5", "FS5_B", "binary", text="你在关系里，安全感主要来自？", weight=1.5, direction="reverse",
                 left=("我自己内心比较稳，不太需要对方时刻确认", 10), right=("对方的回应和行动，他不稳定我就不稳定", 80)),
        module_q("FS5-F-20", 20, "FS5", "FS5_C", "choice", text="你父母对你的感情生活，态度是？", weight=1.3, direction="reverse", options=[
            ("A", "你自己决定，他们信任你", 10),
            ("B", "会问问，有意见，但最终尊重你", 35),
            ("C", "有具体要求，不太容易商量", 60),
            ("D", "参与度很高，我的感情他们必须满意", 85),
        ]),
    ]


def mate_male_questions() -> list[dict[str, Any]]:
    income_slider = {
        "id": "MS1-M-01", "order": 1, "module": "MS1", "sub": "MS1_A",
        "type": "slider", "weight": 2.0, "direction": "positive",
        "text": "你目前的经济状况，在你所在城市大概处于什么水平？",
        "note": "这里不需要填具体数字，系统只需要了解你的相对位置。",
        "slider": {
            "min": 1, "max": 6, "step": 1,
            "reference": [
                {"level": "A", "score": 1, "desc": "入门层：收入勉强覆盖基本开销"},
                {"level": "B", "score": 2, "desc": "基础层：收入稳定，有一定储蓄"},
                {"level": "C", "score": 3, "desc": "中等层：高于本城市平均水平"},
                {"level": "D", "score": 4, "desc": "中上层：有资产积累（房/车）"},
                {"level": "E", "score": 5, "desc": "优质层：本城市前20%"},
                {"level": "F", "score": 6, "desc": "顶端层：本城市前5%"},
            ],
        },
        "scoring": {"method": "direct_times_10"},
    }
    return [
        income_slider,
        module_q("MS1-M-02", 2, "MS1", "MS1_A", "choice", text="你现在的住房情况是？", weight=1.5, direction="positive", options=[
            ("A", "自己有房（已付清或按揭中）", 90),
            ("B", "家里有房，住家里或用家里的", 65),
            ("C", "租房，条件不错", 55),
            ("D", "租房，还在积累阶段", 35),
        ]),
        module_q("MS1-M-03", 3, "MS1", "MS1_B", "scenario", text="她问你「你觉得自己五年后会是什么状态」。你的回答最接近？", weight=1.5, direction="positive", options=[
            ("A", "能说出具体的职位、收入目标或方向", 90),
            ("B", "大概知道方向，但具体说不清楚", 65),
            ("C", "比现在好很多，但怎么好说不上来", 40),
            ("D", "没想太多，先过好当下", 20),
        ]),
        module_q("MS1-M-04", 4, "MS1", "MS1_B", "binary", text="你现在的工作，在你看来是？", weight=1.3, direction="positive",
                 left=("在上升通道里，还有很大空间", 80), right=("比较稳定，但天花板也差不多看到了", 50)),
        module_q("MS1-M-05", 5, "MS1", "MS1_C", "choice", text="你的原生家庭在你的感情里，通常扮演什么角色？", weight=1.3, direction="positive", options=[
            ("A", "后盾，需要时支持，不干涉", 85),
            ("B", "存在感不强，我自己扛", 70),
            ("C", "偶尔干预，但总体还好", 50),
            ("D", "参与度很高，有很多想法和要求", 20),
        ]),
        module_q("MS2-M-06", 6, "MS2", "MS2_A", "scenario", text="你答应她周末陪她，但临时朋友约你打球。你通常会？", weight=1.5, direction="positive", options=[
            ("A", "跟朋友说改天，先把跟她的约定兑现", 90),
            ("B", "跟她商量能不能改时间", 60),
            ("C", "去打球，心想下次再补", 20),
            ("D", "两边都不想放弃，最后都不满意", 30),
        ]),
        module_q("MS2-M-07", 7, "MS2", "MS2_B", "binary", text="当你情绪很差时，你对她的态度会受影响吗？", weight=1.5, direction="positive",
                 left=("基本不会，我能把情绪管好", 85), right=("会有影响，状态差时她能感觉到", 30)),
        module_q("MS2-M-08", 8, "MS2", "MS2_C", "choice", text="你跟异性朋友的关系，她清楚吗？", weight=1.5, direction="positive", options=[
            ("A", "清楚，我会主动告诉她谁是谁", 90),
            ("B", "大概清楚，没刻意说但也没隐瞒", 65),
            ("C", "她不太清楚，我不太提", 35),
            ("D", "我觉得没必要每个都说清楚", 20),
        ]),
        module_q("MS2-M-09", 9, "MS2", "MS2_A", "scenario", text="你答应她某件事，但后来因为自己的原因没做到。你通常怎么处理？", weight=1.3, direction="positive", options=[
            ("A", "主动道歉，解释原因，想办法补救", 90),
            ("B", "道歉，但没特别去补救", 65),
            ("C", "等她提起来再说，不主动", 35),
            ("D", "觉得没什么大不了，过了就过了", 15),
        ]),
        module_q("MS2-M-10", 10, "MS2", "MS2_A", "binary", text="你在生活里，算不算一个说到做到的人？", weight=1.3, direction="positive",
                 left=("算，答应的事基本都会做到", 85), right=("不一定，有时候会忘或者变了计划", 30)),
        module_q("MS3-M-11", 11, "MS3", "MS3_B", "scenario", text="她跟你说今天工作上被骂了，很委屈，边说边快哭了。你的第一反应是？", weight=1.5, direction="positive", options=[
            ("A", "先抱她，让她先哭出来，什么都不说", 90),
            ("B", "说「那个领导有问题」，帮她站队", 65),
            ("C", "问她具体怎么回事，帮她分析", 50),
            ("D", "有点不知道怎么办，说「会好的」", 25),
        ]),
        module_q("MS3-M-12", 12, "MS3", "MS3_B", "binary", text="她倾诉烦心事，你的本能反应是？", weight=1.5, direction="positive",
                 left=("先听完，让她感觉被理解", 85), right=("边听边帮她想解决方案", 50)),
        module_q("MS3-M-13", 13, "MS3", "MS3_A", "choice", text="跟她聊天，通常是什么状态？", weight=1.3, direction="positive", options=[
            ("A", "我话多，话题多，她说跟我聊天不无聊", 80),
            ("B", "双方都挺有话说，很自然", 85),
            ("C", "我不太擅长主动找话题", 35),
            ("D", "看她，她起话题我跟着聊", 55),
        ]),
        module_q("MS3-M-14", 14, "MS3", "MS3_A", "slider", text="你觉得跟你在一起，她会不会觉得有意思？", weight=1.2, direction="positive",
                 min_label="我可能比较无聊", max_label="跟我在一起不无聊"),
        _appearance_slider_from_full(
            "male",
            lite_id="MS4-M-15",
            order=15,
            calibration_signals=["MS4-M-16", "MS4-M-17", "MS4-M-14"],
        ),
        module_q("MS4-M-16", 16, "MS4", "MS4_A", "binary", text="你对自己的外形，有没有主动维护的习惯？", weight=1.3, direction="positive",
                 left=("有，我会注意穿搭、健身或者护肤", 80), right=("没有特别，保持基本整洁就行", 40)),
        module_q("MS4-M-17", 17, "MS4", "MS4_B", "scenario", text="你和她一起参加她朋友的聚会，你不认识里面大多数人。你通常是什么状态？", weight=1.3, direction="positive", options=[
            ("A", "很快融入，开始跟大家聊，场子热了", 85),
            ("B", "找几个聊得来的，不冷场但不特别活跃", 75),
            ("C", "基本跟在她旁边，等她来介绍", 40),
            ("D", "有点不自在，需要一段时间放开", 45),
        ]),
        module_q("MS5-M-18", 18, "MS5", "MS5_B", "scenario", text="她今晚跟闺蜜出去，说可能很晚，叫你不用等。你的真实反应是？", weight=1.5, direction="reverse", options=[
            ("A", "好，我也去做自己的事", 10),
            ("B", "嘴上说好，但心里在想她在哪跟谁", 40),
            ("C", "问了一下她去哪几点回", 60),
            ("D", "觉得有点不放心，找理由让她早点回", 85),
        ]),
        module_q("MS5-M-19", 19, "MS5", "MS5_A", "binary", text="你现在跟前任还有联系吗？", weight=1.5, direction="reverse",
                 left=("没有，已经完全断开", 10), right=("偶尔有，关系说复杂也不复杂", 60)),
        module_q("MS5-M-20", 20, "MS5", "MS5_C", "choice", text="她说她希望未来的另一半是一个不断进步的人。你的内心感受是？", weight=1.2, direction="reverse", options=[
            ("A", "有点压力，但这正是我想做的，接受", 20),
            ("B", "挺好的，我本来就有这样的计划", 10),
            ("C", "有点担心，不确定能达到她的期待", 50),
            ("D", "感觉有点被要求，不太喜欢这种压力", 75),
        ]),
    ]


def build_self_bank(gender: str) -> dict[str, Any]:
    full_path = DATA_DIR / f"suite1_{gender}.json"
    full = json.loads(full_path.read_text(encoding="utf-8"))
    other_gender = "female" if gender == "male" else "male"
    other_full = json.loads((DATA_DIR / f"suite1_{other_gender}.json").read_text(encoding="utf-8"))
    questions = self_female_questions() if gender == "female" else self_male_questions()
    questions = enrich_questions_slider_guidance(questions, full["questions"], other_full["questions"])
    suffix = "FEMALE" if gender == "female" else "MALE"
    return {
        "suite": {
            **full["suite"],
            "id": f"S01_SELF_{suffix}_LITE",
            "name": "自我关系模式测试 · 快速版",
            "version": "1.0-lite",
            "total_questions": 20,
            "estimated_minutes": 4,
            "is_free": True,
            "tier": "lite",
            "full_suite_id": f"S01_SELF_{suffix}",
            "question_types_used": ["slider", "scenario", "binary", "choice"],
        },
        "scoring_formula": self_scoring_weights(questions),
        "type_rules": full["type_rules"],
        "result_profiles": full["result_profiles"],
        "questions": questions,
    }


def build_ros_bank(gender: str) -> dict[str, Any]:
    full_path = DATA_DIR / f"suite2_ros_{gender}.json"
    full = json.loads(full_path.read_text(encoding="utf-8"))
    questions = ros_female_questions() if gender == "female" else ros_male_questions()
    suffix = "FEMALE" if gender == "female" else "MALE"
    pre = ros_pre_questions(gender)
    return {
        "suite": {
            **{k: v for k, v in full["suite"].items() if k not in {"id", "name", "total_questions", "pre_questions"}},
            "id": f"S02_ROS_{suffix}_LITE",
            "name": "关系画像测试 · 快速版",
            "version": "1.0-lite",
            "total_questions": 20,
            "pre_questions": 1,
            "estimated_minutes": 5,
            "is_free": False,
            "tier": "lite",
            "full_suite_id": f"S02_ROS_{suffix}",
            "question_types_used": ["slider", "scenario", "binary", "choice"],
        },
        "pre_questions": pre,
        "scoring_formula": full["scoring_formula"],
        "stage_rules": full.get("stage_rules"),
        "relationship_type_rules": full.get("relationship_type_rules"),
        "prescription_rules": full.get("prescription_rules"),
        "attachment_collision_map": full.get("attachment_collision_map"),
        "questions": enrich_questions_slider_guidance(questions, full["questions"]),
    }


def build_mate_bank(gender: str) -> dict[str, Any]:
    full_path = DATA_DIR / f"suite3_mate_{gender}.json"
    full = json.loads(full_path.read_text(encoding="utf-8"))
    questions = mate_female_questions() if gender == "female" else mate_male_questions()
    suffix = "FEMALE" if gender == "female" else "MALE"
    return {
        "suite": {
            **{k: v for k, v in full["suite"].items() if k not in {"id", "name", "total_questions"}},
            "id": f"S03_MATE_{suffix}_LITE",
            "name": "择偶坐标测试 · 快速版",
            "version": "1.0-lite",
            "total_questions": 20,
            "estimated_minutes": 5,
            "is_free": False,
            "tier": "lite",
            "full_suite_id": f"S03_MATE_{suffix}",
            "question_types_used": ["slider", "scenario", "binary", "choice"],
        },
        "scoring_formula": full["scoring_formula"],
        "type_rules": full["type_rules"],
        "result_profiles": full["result_profiles"],
        "score_display_rules": full.get("score_display_rules"),
        "questions": enrich_questions_slider_guidance(questions, full["questions"]),
    }


def all_lite_banks() -> list[tuple[str, dict[str, Any]]]:
    return [
        ("suite1_self_female_lite.json", build_self_bank("female")),
        ("suite1_self_male_lite.json", build_self_bank("male")),
        ("suite2_ros_female_lite.json", build_ros_bank("female")),
        ("suite2_ros_male_lite.json", build_ros_bank("male")),
        ("suite3_mate_female_lite.json", build_mate_bank("female")),
        ("suite3_mate_male_lite.json", build_mate_bank("male")),
    ]


def validate_lite_bank_guidance(banks: list[tuple[str, dict[str, Any]]]) -> list[str]:
    errors: list[str] = []
    for filename, bank in banks:
        errors.extend(validate_bank_slider_guidance(bank, suite_label=filename))
    return errors


def main() -> None:
    banks = all_lite_banks()
    errors = validate_lite_bank_guidance(banks)
    if errors:
        raise SystemExit("slider guidance validation failed:\n" + "\n".join(errors))

    for filename, bank in banks:
        path = DATA_DIR / filename
        path.write_text(json.dumps(bank, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"wrote {path.name} ({len(bank.get('questions', []))} questions)")


if __name__ == "__main__":
    main()
