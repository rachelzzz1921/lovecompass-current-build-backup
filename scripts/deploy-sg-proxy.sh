#!/usr/bin/env bash
# 本地一键：复制部署命令到剪贴板 + 打开阿里云 ECS 控制台
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INSTALL="${ROOT}/mirror/install-on-server.sh"

if [[ ! -f "${INSTALL}" ]]; then
  echo "找不到 ${INSTALL}" >&2
  exit 1
fi

if command -v pbcopy >/dev/null 2>&1; then
  cat "${INSTALL}" | pbcopy
  echo "✓ 部署脚本已复制到剪贴板"
else
  echo "请手动复制以下文件内容到服务器 Workbench："
  echo "  ${INSTALL}"
fi

echo ""
echo "接下来（约 30 秒）："
echo "  1. 浏览器打开 ECS 控制台（若未自动打开）"
echo "  2. 找到 47.237.68.213 这台实例 → 远程连接 → Workbench"
echo "  3. 粘贴 (⌘V) → 回车，等脚本跑完"
echo ""
echo "若健康检查失败：安全组入站放行 TCP 80、443"
echo ""

if command -v open >/dev/null 2>&1; then
  open "https://ecs.console.aliyun.com/server/region/cn-singapore" 2>/dev/null || \
    open "https://ecs.console.aliyun.com/" 2>/dev/null || true
fi
