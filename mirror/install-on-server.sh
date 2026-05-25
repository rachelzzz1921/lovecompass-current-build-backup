#!/usr/bin/env bash
# LoveCompass 新加坡 API 中转 — 在阿里云 Workbench 粘贴整段执行即可（无需 scp）
set -euo pipefail

SERVER_NAME="${SERVER_NAME:-47-237-68-213.sslip.io}"
BACKEND_HOST="lovecompass-api-backend.vercel.app"
NGINX_SITE="lovecompass-api-proxy"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  exec sudo bash "$0" "$@"
fi

echo "==> LoveCompass API 中转 | ${SERVER_NAME} -> ${BACKEND_HOST}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx curl ca-certificates certbot python3-certbot-nginx

cat >/etc/nginx/snippets/lovecompass-proxy-params.conf <<'EOF'
proxy_ssl_server_name on;
proxy_set_header Host lovecompass-api-backend.vercel.app;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
proxy_set_header Connection "";
EOF

cat >/etc/nginx/sites-available/${NGINX_SITE} <<EOF
upstream lovecompass_vercel_api {
    server ${BACKEND_HOST}:443;
    keepalive 16;
}

server {
    listen 80;
    server_name ${SERVER_NAME} 47.237.68.213;

    client_max_body_size 8m;

    location = /health {
        proxy_pass https://lovecompass_vercel_api/health;
        include /etc/nginx/snippets/lovecompass-proxy-params.conf;
    }

    location /api/ {
        proxy_pass https://lovecompass_vercel_api/;
        include /etc/nginx/snippets/lovecompass-proxy-params.conf;
        proxy_connect_timeout 30s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
    }

    location = / {
        default_type application/json;
        return 200 '{"ok":true,"service":"lovecompass-api-proxy","mirror":"https://${SERVER_NAME}/api"}\n';
    }
}
EOF

ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/${NGINX_SITE}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable nginx
systemctl restart nginx

if command -v ufw >/dev/null 2>&1; then
  ufw allow OpenSSH >/dev/null 2>&1 || true
  ufw allow 80/tcp >/dev/null 2>&1 || true
  ufw allow 443/tcp >/dev/null 2>&1 || true
  ufw --force enable >/dev/null 2>&1 || true
fi

echo "==> 申请 HTTPS 证书 (${SERVER_NAME})..."
if certbot --nginx -d "${SERVER_NAME}" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
  SCHEME="https"
else
  echo "⚠ 证书申请失败，仍可用 HTTP: http://47.237.68.213/api"
  SCHEME="http"
fi

nginx -t && systemctl reload nginx

HEALTH_URL="${SCHEME}://${SERVER_NAME}/api/health"
echo "==> 验收 ${HEALTH_URL}"
if curl -fsS --max-time 20 "${HEALTH_URL}"; then
  echo ""
  echo "✓ 部署成功"
  echo "  镜像 API: ${SCHEME}://${SERVER_NAME}/api"
  echo "  直连 IP:  http://47.237.68.213/api/health"
else
  echo "⚠ 健康检查失败 — 请到阿里云安全组放行入站 TCP 80 和 443"
  exit 1
fi
