from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.report_utils import looks_like_placeholder_report


def test_placeholder_detection() -> None:
    assert looks_like_placeholder_report(None)
    assert looks_like_placeholder_report("")
    assert looks_like_placeholder_report("正式 AI 深度报告可由后台任务继续生成")
    assert not looks_like_placeholder_report("## 你的关系画像\n\n真实内容。")


if __name__ == "__main__":
    test_placeholder_detection()
    print("report_utils tests passed")
