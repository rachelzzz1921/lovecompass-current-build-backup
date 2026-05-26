"""画像原子 → 自然语言（聊天注入前转换，不消耗 LLM token）。"""

from __future__ import annotations

ATOM_NATURAL_MAP: dict[str, str] = {
    "高吸引低亲密": "彼此有吸引力，但情感亲密还没跟上",
    "阶段·磨合阵痛": "正处于从热恋进入磨合的转折点",
    "冲突后各自消化": "吵完之后两个人都倾向于自己消化，不主动修复",
    "共鸣·温柔磨合": "整体关系基调是温柔的，但有摩擦在消化中",
    "依恋底色偏焦虑": "在关系里容易担心失去连接，需要更多确认",
    "高协作低成长": "日常合拍不错，但对未来的共识还在搭建",
    "风险敏感": "关系里有些触发点需要温柔留意",
    "吸引面强": "初见与相处时的化学反应比较明显",
    "亲密投入高": "你愿意在互动里投入真实情感",
    "协作感强": "价值观与节奏上比较容易对齐",
}


def naturalize_atom(raw: str) -> str:
    text = (raw or "").strip()
    if not text:
        return ""
    return ATOM_NATURAL_MAP.get(text, text)


def naturalize_atoms(atoms: list[str] | None, *, limit: int = 8) -> str:
    if not atoms:
        return "（暂无结构化线索，以 profile_block 为准）"
    lines: list[str] = []
    for item in atoms[:limit]:
        line = naturalize_atom(str(item))
        if line and line not in lines:
            lines.append(f"- {line}")
    return "\n".join(lines) if lines else "（暂无结构化线索）"
