"""MATE 参数模拟器 · 轴感知 lever 选择（与前端 buildExampleMateSimulator 对齐）。"""

from __future__ import annotations

from typing import Any

from app.semantic_translation import user_label


def _module_action(code: str, evidence: str, label: str) -> str:
    if code in {"FS4", "MS4"}:
        return f"增加可复制的社交触点——{evidence}"
    if code in {"FS3", "MS1"}:
        return f"把「可执行的未来」说清楚——{evidence}"
    if code in {"FS2", "MS3"}:
        return f"稳定输出情感供给信号——{evidence}"
    if code in {"FS1", "MS2"}:
        return f"强化门面与可靠度叙事——{evidence}"
    return f"{label}：{evidence}"


def _gap_diagnosis(gap: float, market_insight: str) -> str:
    if gap >= 10:
        tail = market_insight.split("；")[1].strip() if "；" in market_insight else ""
        if tail:
            return f"瓶颈在「第一眼印象跑在长期托底前面」——{tail}"
        return "第一印象跑在现实托底前面，长期关系容易卡在「好看但难落地」。"
    if gap <= -10:
        return "底牌扎实但曝光不足，需要更多「第一眼证据」。"
    return "坐标相对均衡，优先补最弱模块，比全面加码更有效。"


def _pick_weakest(module_scores: dict[str, float], gender: str) -> tuple[str, float, str]:
    codes = ["FS1", "FS2", "FS3", "FS4"] if gender == "female" else ["MS1", "MS2", "MS3", "MS4"]
    best_code = min(codes, key=lambda c: float(module_scores.get(c, 100)))
    return best_code, float(module_scores.get(best_code, 55)), user_label(best_code)


def build_simulator(
    axis_x: float,
    axis_y: float,
    module_scores: dict[str, float],
    position_name: str,
    gender: str,
    *,
    market_insight: str = "",
) -> dict[str, Any]:
    gap = axis_x - axis_y
    risk_codes = {"FS5", "MS5"}
    non_risk = {k: float(v) for k, v in module_scores.items() if k not in risk_codes}
    weak_code, weak_score, weak_label = _pick_weakest(module_scores, gender)

    display_mod = non_risk.get("FS4") or non_risk.get("MS4") or non_risk.get("FS1")
    reality_mod = non_risk.get("FS3") or non_risk.get("MS1")

    if gap >= 10:
        boost = min(20, max(8, round(gap / 2)))
        baseline = axis_y
        baseline_label = "现实托底感"
        peer = {"label": "第一印象", "value": round(axis_x)}
        mod_code = "FS3" if gender == "female" and "FS3" in module_scores else "MS1"
        evidence = market_insight or f"{user_label(mod_code)}需要更可执行的长期叙事"
        lever_name = "现实支撑叙事"
        method = _module_action(mod_code, evidence, user_label(mod_code))
        outcome = "第一印象更清晰后，不再显得「浪漫但难落地」，误读「只靠情绪价值」的概率下降。"
    elif gap <= -10:
        boost = min(20, max(8, round(-gap / 2)))
        baseline = axis_x
        baseline_label = "第一印象"
        peer = {"label": "现实托底感", "value": round(axis_y)}
        mod_code = "FS4" if gender == "female" else "MS4"
        evidence = market_insight or f"{user_label(mod_code)}需要适度主动曝光"
        lever_name = "门面与社交存在感" if gender == "female" else "门面与情感"
        method = _module_action(mod_code, evidence, user_label(mod_code))
        outcome = f"现实托底感 {round(axis_y)} 不再被「看不见」拖累，匹配效率会明显缩短。"
    else:
        boost = min(18, max(8, round((72 - weak_score) / 2.5)))
        baseline = round(weak_score)
        baseline_label = weak_label
        peer = {"label": "整体坐标", "value": round((axis_x + axis_y) / 2)}
        evidence = market_insight or f"{weak_label}是当前最划算的补强方向"
        lever_name = weak_label.replace("模块", "").replace("资产", "").replace("净值", "").strip() or weak_label
        method = _module_action(weak_code, evidence, weak_label)
        outcome = f"{lever_name}上抬后，整体感知更均衡——更接近「{position_name}」的稳定表达。"

    projected = min(100, round(baseline + boost))
    target = (
        "让人想留下来的人"
        if projected >= 62 and (peer["value"] >= 60 or axis_y >= 60)
        else position_name
    )

    return {
        "title": "档案重组 · 参数模拟",
        "slogan": "若调整一个关键杠杆，你的坐标会怎么动？",
        "diagnosis": (
            f"当前 {peer['label']} {peer['value']} · {baseline_label} {baseline}。"
            f"{_gap_diagnosis(gap, market_insight)}"
        ),
        "slider": {
            "name": lever_name,
            "boostPercent": boost,
            "method": method.split("——")[0] if "——" in method else method,
            "max": 25,
        },
        "dynamicText": (
            f"拉动 {{{{boost}}}}% 后，{baseline_label} 从 {{{{baseline}}}} → 约 {{{{projected}}}}。"
            f"坐标更接近「{target}」——{outcome}"
        ),
        "baselineDisplay": baseline,
        "baselineLabel": baseline_label,
        "projectedDisplay": projected,
        "leverEvidence": evidence,
        "peerAxis": peer,
        "targetArchetype": target,
    }
