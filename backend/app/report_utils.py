from __future__ import annotations

REPORT_PLACEHOLDER_MARKERS = (
    "正式 AI 深度报告可由后台任务继续生成",
    "【AI 占位回复】",
    "【智谱未配置】",
)


def looks_like_placeholder_report(report: str | None) -> bool:
    if not report:
        return True
    return any(marker in report for marker in REPORT_PLACEHOLDER_MARKERS)
