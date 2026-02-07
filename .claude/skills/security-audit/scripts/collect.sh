#!/bin/bash
# OpenClaw 보안 데이터 수집 스크립트
# EC2에서 실행하여 점검에 필요한 모든 정보를 한 번에 출력한다.
# 사용: ssh ec2-user@<IP> "bash -s" < collect.sh
set -uo pipefail
export OPENCLAW_STATE_DIR=/opt/openclaw

echo "=== VERSION ==="
openclaw --version 2>/dev/null || echo "UNAVAILABLE"

echo "=== OPENCLAW_JSON ==="
cat "$OPENCLAW_STATE_DIR/openclaw.json" 2>/dev/null || echo "{}"

echo "=== TRAEFIK_IP ==="
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' \
  $(docker ps -q --filter ancestor=traefik:v3.0 2>/dev/null) 2>/dev/null || echo "UNAVAILABLE"

echo "=== ENV_PERMISSIONS ==="
stat -c '%a %U:%G' "$OPENCLAW_STATE_DIR/.env" 2>/dev/null || echo "UNAVAILABLE"

echo "=== ENV_BONJOUR ==="
grep -c 'OPENCLAW_DISABLE_BONJOUR=1' "$OPENCLAW_STATE_DIR/.env" 2>/dev/null || echo "0"

echo "=== CHANNELS ==="
openclaw config get channels --json 2>/dev/null || echo "NOT_SET"

echo "=== LOGGING ==="
openclaw config get logging --json 2>/dev/null || echo "NOT_SET"

echo "=== SECURITY_AUDIT ==="
openclaw security audit --deep 2>&1

echo "=== GATEWAY_WARNINGS ==="
LOG="/tmp/openclaw/openclaw-$(date +%Y-%m-%d).log"
if [ -f "$LOG" ]; then
  python3 -c "
import sys, json
for l in sys.stdin:
    l = l.strip()
    if not l: continue
    try:
        d = json.loads(l)
        msg = str(d.get('1','') or d.get('0',''))
        if any(kw in msg.lower() for kw in ['bonjour','open','warn','error','reject','denied','auth']):
            print(d.get('time',''), msg)
    except: pass
" < "$LOG"
else
  echo "NO_LOG"
fi

echo "=== END ==="
