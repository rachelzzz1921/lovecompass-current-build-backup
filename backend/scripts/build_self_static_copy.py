#!/usr/bin/env python3
"""Generate backend/data/self_static_copy_v1.json from suite1 JSON + supplemental copy."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

TYPE_CODES: dict[str, str] = {
    "薛宝钗": "SELF-01 · SECURE ANCHOR",
    "林黛玉": "SELF-02 · SENSITIVE LOVER",
    "妙玉": "SELF-03 · DISTANT IDEALIST",
    "史湘云": "SELF-04 · FREE SPIRIT",
    "王熙凤": "SELF-05 · BOUNDED POWER",
    "袭人": "SELF-06 · DEVOTED WARMTH",
    "贾探春": "SELF-07 · CLEAR INDEPENDENT",
    "贾宝玉": "SELF-08 · DEVOTED HEART",
    "柳湘莲": "SELF-09 · PROUD LOYALIST",
    "贾雨村": "SELF-10 · COMPLEX SELF",
    "北静王": "SELF-11 · MEASURED MATURE",
    "蒋玉菡": "SELF-12 · QUIET DEPTH",
}

ARCHETYPE_LINES: dict[str, str] = {
    "林黛玉": "她不是不够好——她只是把感情看得比任何人都重。",
    "薛宝钗": "她不是没有情绪，她只是把锋利收了起来——给关系一个不会碎的底。",
    "妙玉": "她的距离不是拒绝世界，是在等一个配得上她标准的人。",
    "史湘云": "她的热烈和撤回都是真的——复杂，才是完整的她。",
    "王熙凤": "她的强势里藏着对关系的责任——只是很少让人看见柔软。",
    "袭人": "她的爱不在宣言里，在每一天具体而温热的在场里。",
    "贾宝玉": "他的认真不是软弱——是把感情当成唯一值得较真的事。",
    "贾探春": "她的清醒不是冷——是不把人生浪费在不对等的关系里。",
    "柳湘莲": "他的孤高里藏着极深的情义——只是不轻易交给不对的人。",
    "贾雨村": "他的多面不是算计——是在真实与自保之间找平衡。",
    "北静王": "他的分寸不是距离——是成熟到不必用表演证明爱。",
    "蒋玉菡": "他的温柔有重量——只是常常忘了把自己放进被照顾的位置。",
}

SCENES_BY_ATTACHMENT: dict[str, dict[str, dict[str, str]]] = {
    "安全型": {
        "第一次见面": {
            "title": "你会先观察，再稳稳打开自己",
            "body": "你不急着证明什么，更在意对方是否可靠、是否同频。确认安全后，你才愿意把真实的自己交出去。",
            "resonance": "感知优先，安全再开放",
        },
        "发生冲突时": {
            "title": "你会先把火降下来，再谈事情",
            "body": "你倾向保护关系不被情绪烧坏，先冷却、再沟通。这不是回避，而是你在用成熟的方式守住关系的底盘。",
            "resonance": "先降温，再谈清楚",
        },
        "喜欢一个人时": {
            "title": "你的喜欢落在细节和节奏里",
            "body": "你不会用夸张表演证明爱，而是稳定在场、边界清晰、能给也能收。你的安全感是真实的，不是演给任何人看的。",
            "resonance": "细节里藏着的稳定",
        },
    },
    "焦虑型": {
        "第一次见面": {
            "title": "你会比表面看起来更认真",
            "body": "你在意对方的一举一动，因为你是把感情当真的人。你不是「太多」，而是比多数人更早进入「这段关系对我很重要」的状态。",
            "resonance": "认真，是从第一次见面就开始的",
        },
        "发生冲突时": {
            "title": "沉默或距离容易触发你的不安全感",
            "body": "你可能嘴上说没事，心里却在找证据。练习直接说「我需要一点确认」，比反复求证更有效——你的敏感是天赋，不是缺陷。",
            "resonance": "需要被看见，而不是被敷衍",
        },
        "喜欢一个人时": {
            "title": "你的喜欢浓度高、细节多",
            "body": "你会记得对方说过的话，也在意回应的频率。你值得一个同样认真的人，而不是让你不断缩小需求的人。",
            "resonance": "细节里藏着的深情",
        },
    },
    "回避型": {
        "第一次见面": {
            "title": "你会保持观察距离",
            "body": "你不是慢热，而是对平庸的亲密没有兴趣。你在筛选「是否值得靠近」，精神标准高是你的骨气，不是冷漠。",
            "resonance": "标准高，不是冷漠",
        },
        "发生冲突时": {
            "title": "你倾向先撤回，再决定是否回来谈",
            "body": "距离是你整理情绪的方式。需要注意的是：撤回之后，记得用一句话告诉对方「我还在，只是需要先冷静」。",
            "resonance": "撤回是为了整理，不是放弃",
        },
        "喜欢一个人时": {
            "title": "你的表达克制，但认定后会很深",
            "body": "你不擅长大张旗鼓的告白，但一旦确认对方懂你的节奏，你会给出很纯粹的投入。",
            "resonance": "克制表面，深度在内",
        },
    },
    "混合型": {
        "第一次见面": {
            "title": "你有时开放，有时保留",
            "body": "这不是不稳定，而是足够真实——你在不同场合会呈现不同面。懂你的人，会被这种生命力吸引。",
            "resonance": "真实比一致更动人",
        },
        "发生冲突时": {
            "title": "你的反应取决于当时的状态与信任度",
            "body": "有时想谈，有时想走。关键不是压制波动，而是识别「我现在需要的是空间还是连接」。",
            "resonance": "波动里藏着真实",
        },
        "喜欢一个人时": {
            "title": "你会热烈，也需要呼吸口",
            "body": "你能在靠近与独立之间切换，这不是表演，是复杂而真实的你。",
            "resonance": "热烈也需要呼吸口",
        },
    },
    "高边界安全型": {
        "第一次见面": {
            "title": "你会快速判断对方是否尊重你的标准",
            "body": "你清楚自己要什么，不会被一时氛围带跑。边界不是冷漠，是你对关系和自己的尊重。",
            "resonance": "边界是尊重，不是拒绝",
        },
        "发生冲突时": {
            "title": "你不容易被情绪裹挟",
            "body": "你会把问题拉回可讨论的范围，而不是在拉扯里失去方向。记得偶尔也暴露一点柔软，不等于示弱。",
            "resonance": "清醒，但不等于没有心",
        },
        "喜欢一个人时": {
            "title": "你爱得现实，也绝对忠诚",
            "body": "你的投入有分寸、有重量。你适合同样清醒的人，而不是用混乱证明爱的人。",
            "resonance": "有分寸的重量",
        },
    },
    "低自我高投入型": {
        "第一次见面": {
            "title": "你会优先照顾对方的感受",
            "body": "你很容易感知别人需要什么，并先给出温度。你的善意是礼物，但也别忘了把自己的需求放进关系里。",
            "resonance": "温暖先行，也别忘了自己",
        },
        "发生冲突时": {
            "title": "你可能先妥协，再内耗",
            "body": "你习惯把关系放在第一位，甚至牺牲自己的边界。下一段关系里，练习先说感受，而不是先道歉。",
            "resonance": "妥协之前，先听见自己",
        },
        "喜欢一个人时": {
            "title": "你的爱具体、日常、落在细节里",
            "body": "你会用行动表达在乎，这是很多人学不会的。你也值得被同样具体地珍视。",
            "resonance": "具体，是你爱的语言",
        },
    },
}


def load_profiles() -> dict[str, dict]:
    types: dict[str, dict] = {}
    for path in (DATA / "suite1_female.json", DATA / "suite1_male.json"):
        raw = json.loads(path.read_text(encoding="utf-8"))
        gender = "female" if "female" in path.name else "male"
        for name, profile in (raw.get("result_profiles") or {}).items():
            attachment = profile.get("attachment_type", "")
            types[name] = {
                "gender": gender,
                "attachment_type": attachment,
                "code": TYPE_CODES.get(name, f"SELF · {name}"),
                "tagline": profile.get("tagline", ""),
                "archetype_line": ARCHETYPE_LINES.get(name, profile.get("description", "")[:60]),
                "quote": profile.get("description", ""),
                "gift_desc": profile.get("description", ""),
                "matching_logic": profile.get("matching_logic", ""),
                "radar_baseline": profile.get("radar_baseline", {}),
            }
    return types


def character_reasons(name: str, attachment: str, description: str) -> list[dict]:
    return [
        {
            "title": f"同样的「{attachment}」人格底色",
            "body": description[:120] + ("…" if len(description) > 120 else ""),
            "highlight": True,
        },
        {
            "title": "同样的感知密度",
            "body": f"{name}在红楼人格谱系里，代表的是把关系当真、能被识别的那一类人。你的答题模式与这种底色同频。",
        },
        {
            "title": "你并不是课本式复刻",
            "body": "体系给你方向，不是牢笼。真人比标签更生动——你的六维曲线里也有只属于你自己的变体。",
        },
    ]


def match_combos(types: dict[str, dict]) -> dict[str, dict]:
    from app.self_ai_content import MATCH_BY_ATTACHMENT  # noqa: WPS433

    combos: dict[str, dict] = {}
    for character, meta in types.items():
        attachment = meta["attachment_type"]
        matches = MATCH_BY_ATTACHMENT.get(attachment) or []
        if not matches:
            continue
        top = matches[0]
        partner = top["name"].split("型")[0] + "型"
        key = f"{character}×{partner}"
        combos[key] = {
            "title": "最稳定的组合之一" if top["pct"] >= 88 else "同体系里的高匹配方向",
            "body": f"{partner}的{top['tagline']}。{top['name']}与{character}型在相处节奏上最容易形成互补。",
            "pct": top["pct"],
        }
    return combos


def main() -> None:
    types = load_profiles()
    reasons = {
        name: character_reasons(name, meta["attachment_type"], meta.get("quote", ""))
        for name, meta in types.items()
    }
    out = {
        "version": "1.0",
        "purpose": "套一 SELF 结果页 Layer A 静态词库",
        "types": types,
        "scenes_by_attachment": SCENES_BY_ATTACHMENT,
        "character_reasons": reasons,
        "match_combos": match_combos(types),
    }
    target = DATA / "self_static_copy_v1.json"
    target.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {target} ({len(types)} types, {len(out['match_combos'])} match combos)")


if __name__ == "__main__":
    import sys

    sys.path.insert(0, str(ROOT))
    main()
