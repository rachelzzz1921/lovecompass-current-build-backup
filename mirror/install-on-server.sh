#!/usr/bin/env bash
# LoveCompass 新加坡 API 中转 — SSH / Workbench 粘贴整段执行即可
set -euo pipefail

SERVER_IP="${SERVER_IP:-47.237.68.213}"
SERVER_NAME="${SERVER_NAME:-47-237-68-213.sslip.io}"
BACKEND_HOST="lovecompass-api-backend.vercel.app"
NGINX_SITE="lovecompass-api-proxy"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  exec sudo bash "$0" "$@"
fi

echo "==> LoveCompass API 中转 | ${SERVER_NAME} + ${SERVER_IP} -> ${BACKEND_HOST}"

export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq nginx curl ca-certificates certbot python3-certbot-nginx

cat >/etc/nginx/snippets/lovecompass-proxy-params.conf <<'EOF'
proxy_ssl_server_name on;
proxy_ssl_name lovecompass-api-backend.vercel.app;
proxy_set_header Host lovecompass-api-backend.vercel.app;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_http_version 1.1;
EOF

write_site_config() {
  local ssl_block=""
  if [[ -f "/etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem" ]]; then
    ssl_block="
server {
    listen 443 ssl http2;
    server_name ${SERVER_NAME};

    ssl_certificate /etc/letsencrypt/live/${SERVER_NAME}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${SERVER_NAME}/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

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
        return 200 '{\"ok\":true,\"service\":\"lovecompass-api-proxy\",\"mirror\":\"https://${SERVER_NAME}/api\"}\n';
    }
}

server {
    listen 80;
    server_name ${SERVER_NAME};
    return 301 https://\$host\$request_uri;
}
"
  fi

  cat >/etc/nginx/sites-available/${NGINX_SITE} <<EOF
upstream lovecompass_vercel_api {
    server ${BACKEND_HOST}:443;
}

server {
    listen 80;
    server_name ${SERVER_IP};

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
        return 200 '{"ok":true,"service":"lovecompass-api-proxy","mirror":"http://${SERVER_IP}/api"}\n';
    }
}
${ssl_block}
EOF
}

write_site_config
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
if certbot certonly --webroot -w /var/www/html -d "${SERVER_NAME}" \
  --non-interactive --agree-tos --register-unsafely-without-email; then
  write_site_config
  nginx -t && systemctl reload nginx
  SCHEME="https"
else
  echo "⚠ 证书申请失败，仍可用 HTTP: http://${SERVER_IP}/api"
  SCHEME="http"
fi

echo "==> 验收 HTTP http://${SERVER_IP}/api/health"
curl -fsS --max-time 20 "http://${SERVER_IP}/api/health"
echo ""

if [[ "${SCHEME}" == "https" ]]; then
  echo "==> 验收 HTTPS https://${SERVER_NAME}/api/health"
  curl -fsS --max-time 20 "https://${SERVER_NAME}/api/health"
  echo ""
fi

echo "✓ 部署成功"
echo "  镜像 API (IP):    http://${SERVER_IP}/api"
echo "  镜像 API (HTTPS): https://${SERVER_NAME}/api"
