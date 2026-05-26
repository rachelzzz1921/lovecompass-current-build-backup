"""RAG-lite dictionary retrieval — inject only snippets matched by atoms, not whole libraries."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

DATA_DIR = Path(__file__).resolve().parents[1] / "data"

# Per-task caps keep prompts in the ~1000–1500 token band.
TASK_DICT_MAX: dict[str, int] = {
    "mate-reverse": 6,
    "mate-observe": 4,
    "mate-lens": 8,
    "footer_marquee": 3,
    "mate-rehearse": 6,
    "mate-simulator": 4,
    "mate-advice": 5,
    "ros-insights": 8,
    "ros-pair-analysis": 6,
    "pair-analysis": 6,
}


@lru_cache(maxsize=1)
def load_atom_dictionary() -> dict[str, Any]:
    path = DATA_DIR / "atom_dictionary_v1.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def _lookup_bucket(bucket: str, keys: list[str], *, limit_per_key: int = 2) -> list[str]:
    lib = load_atom_dictionary()
    section = lib.get(bucket) or {}
    if not isinstance(section, dict):
        return []
    out: list[str] = []
    seen: set[str] = set()
    for key in keys:
        phrases = section.get(key)
        if not isinstance(phrases, list):
            continue
        for phrase in phrases[:limit_per_key]:
            text = str(phrase).strip()
            if text and text not in seen:
                seen.add(text)
                out.append(text)
    return out


def retrieve_dictionary_snippets(
    *,
    trait_atoms: list[str] | None = None,
    behavior_atoms: list[str] | None = None,
    relationship_atoms: list[str] | None = None,
    scene_atoms: list[str] | None = None,
    pair_atoms: list[str] | None = None,
    ros_patterns: list[str] | None = None,
    max_total: int = 12,
) -> list[str]:
    """Return compact phrase snippets for the current atom hit set."""
    snippets: list[str] = []
    snippets.extend(_lookup_bucket("trait_atoms", trait_atoms or []))
    snippets.extend(_lookup_bucket("behavior_atoms", behavior_atoms or []))
    snippets.extend(_lookup_bucket("relationship_atoms", relationship_atoms or []))
    snippets.extend(_lookup_bucket("scene_atoms", scene_atoms or []))
    snippets.extend(_lookup_bucket("pair_atoms", pair_atoms or []))
    snippets.extend(_lookup_bucket("ros_layer_patterns", ros_patterns or []))

    deduped: list[str] = []
    seen: set[str] = set()
    for item in snippets:
        if item in seen:
            continue
        seen.add(item)
        deduped.append(item)
        if len(deduped) >= max_total:
            break
    return deduped


def dictionary_limit_for_task(task: str | None, *, default: int = 8) -> int:
    if not task:
        return default
    return TASK_DICT_MAX.get(task, default)
