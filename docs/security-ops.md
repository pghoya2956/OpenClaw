# OpenClaw 보안 운영 가이드

## Gateway Token 로테이션

Gateway Token이 유출되었거나 정기 교체가 필요한 경우.

### 절차

```bash
# 새 토큰 생성
NEW_TOKEN=$(openssl rand -hex 32)

# .env.lab 업데이트 (로컬)
# OPENCLAW_GATEWAY_TOKEN=<새 토큰>

# 방법 A: Pulumi 재배포 (권장, EC2 교체됨)
cd infra && pulumi up --yes

# 방법 B: 수동 교체 (EC2 유지)
ssh ec2-user@<IP>
export OPENCLAW_STATE_DIR=/opt/openclaw

# .env 파일 업데이트
sed -i "s/OPENCLAW_GATEWAY_TOKEN=.*/OPENCLAW_GATEWAY_TOKEN=$NEW_TOKEN/" /opt/openclaw/.env

# openclaw.json 업데이트
node -e "
  const fs = require('fs');
  const p = '/opt/openclaw/openclaw.json';
  const c = JSON.parse(fs.readFileSync(p, 'utf8'));
  c.gateway.auth.token = '$NEW_TOKEN';
  fs.writeFileSync(p, JSON.stringify(c, null, 2));
"

# Gateway 재시작
XDG_RUNTIME_DIR=/run/user/$(id -u) \
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus \
systemctl --user restart openclaw-gateway
```

### 교체 후 확인

- Control UI에서 기존 토큰으로 접속 시 `token_mismatch` 발생하면 정상
- 새 토큰으로 재접속 확인
- 기존에 승인된 Device는 재인증 필요 (`openclaw devices approve`)

---

## Setup Token 만료 관리

Anthropic Setup Token (`sk-ant-oat01-...`)은 만료 기간이 있다. 만료 시 모델 호출이 실패한다.

### 증상

- Slack 메시지에 대한 AI 응답이 없음
- Gateway 로그에 Anthropic 인증 에러
- `openclaw models status`에서 에러 표시

### 갱신 절차

```bash
# 로컬에서 새 Setup Token 발급
claude setup-token
# → sk-ant-oat01-... 복사

# .env.lab 업데이트
# ANTHROPIC_SETUP_TOKEN=<새 토큰>

# 방법 A: Pulumi 재배포 (권장)
cd infra && pulumi up --yes

# 방법 B: SSH 수동 갱신
ssh ec2-user@<IP>
export OPENCLAW_STATE_DIR=/opt/openclaw
openclaw models auth setup-token --provider anthropic
# → 로컬에서 발급한 토큰 붙여넣기
```

### 예방

- Setup Token 발급 날짜를 기록해둔다
- 주기적으로 `openclaw models status` 확인
- 만료 전에 갱신하면 서비스 중단 없음

---

## 정기 보안 점검 체크리스트

`/security-audit` 스킬로 자동 점검 가능. 아래는 수동 확인 시 참고.

### 버전 및 패치

- [ ] `openclaw --version` — 최신 버전인지 확인
- [ ] 알려진 CVE 패치 여부 확인 (CVE-2026-25253: >= 2026.1.29)

### 네트워크

- [ ] Security Group — Pulumi 전용 SG 사용 중인지, 불필요 포트 없는지
- [ ] DNS 레코드 — 현재 EC2 IP와 일치하는지

### Gateway 설정

- [ ] `gateway.auth.mode` = `"token"` (인증 활성)
- [ ] `gateway.trustedProxies` — Traefik 실제 IP와 일치
- [ ] `channels.*.groupPolicy` = `"allowlist"` (open 아닐 것)

### 시크릿

- [ ] `/opt/openclaw/.env` 권한 = `600`
- [ ] `OPENCLAW_DISABLE_BONJOUR=1` 설정됨
- [ ] `.env.lab` — Git에 커밋되지 않았는지 (`git status`로 확인)

### 로깅

- [ ] `logging.redactSensitive` = `"tools"`
- [ ] `logging.redactPatterns` — Slack/Anthropic 토큰 prefix 포함

### 내장 감사

- [ ] `openclaw security audit --deep` — critical 0, warn 0

---

## 인시던트 대응

Gateway Token 또는 Setup Token 유출이 의심되는 경우.

### 즉시 조치

```bash
# Gateway 중지
ssh ec2-user@<IP>
XDG_RUNTIME_DIR=/run/user/$(id -u) \
systemctl --user stop openclaw-gateway
```

### 토큰 교체

- Gateway Token: 위의 "Gateway Token 로테이션" 절차 수행
- Setup Token: 위의 "Setup Token 만료 관리 > 갱신 절차" 수행
- Slack Token: Slack API에서 토큰 재발급 → `.env` 업데이트

### 피해 범위 확인

```bash
# Gateway 로그에서 의심스러운 접근 확인
cat /tmp/openclaw/openclaw-$(date +%Y-%m-%d).log | python3 -c "
import sys, json
for l in sys.stdin:
    d = json.loads(l.strip())
    msg = str(d.get('1','') or d.get('0',''))
    if any(kw in msg.lower() for kw in ['token_mismatch','reject','denied','pairing']):
        print(d.get('time',''), msg)
"

# 승인된 기기 목록 확인
openclaw devices list
# 의심스러운 기기 제거
openclaw devices revoke <deviceId>
```

### 서비스 복구

토큰 교체 완료 후 Gateway 재시작 → Slack 연결 확인 → Control UI 재접속
