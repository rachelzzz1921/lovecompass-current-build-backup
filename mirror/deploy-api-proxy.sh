#!/usr/bin/env bash
# 兼容入口：与 install-on-server.sh 相同
exec "$(cd "$(dirname "$0")" && pwd)/install-on-server.sh" "$@"
