---
title: 보안 운영
description: OpenClaw 보안 모델, 경화 기준, 샌드박싱, 자격증명 관리, 인시던트 대응
---

## 보안 모델

OpenClaw은 **"개인 비서" 모델**로 운영된다. 멀티테넌트 격리가 아닌 단일 신뢰 경계(trust boundary)를 전제한다.

> "게이트웨이당 하나의 신뢰된 운영자 경계 (single-user/personal assistant model)"

- `~/.openclaw` 또는 설정을 수정할 수 있는 사람은 신뢰된 운영자로 간주
- 상호 비신뢰 사용자를 위한 단일 게이트웨이 운영은 **지원하지 않음**
- 공유 에이전트에서 허용된 발신자는 에이전트 정책 내에서 도구 호출(`exec`, 브라우저, 파일) 유도 가능

## 경화 기준 설정 (Hardened Baseline)

60초 안에 적용하는 보안 기본 구성:

```json5
{
  gateway: {
    mode: "local",
    bind: "loopback",
    auth: { mode: "token", token: "replace-with-long-random-token" },
  },
  session: {
    dmScope: "per-channel-peer",
  },
  tools: {
    profile: "messaging",
    deny: [
      "group:automation", "group:runtime", "group:fs",
      "sessions_spawn", "sessions_send"
    ],
    fs: { workspaceOnly: true },
    exec: { security: "deny", ask: "always" },
    elevated: { enabled: false },
  },
  channels: {
    whatsapp: {
      dmPolicy: "pairing",
      groups: { "*": { requireMention: true } }
    },
  },
}
```

이 설정은 게이트웨이를 로컬 전용으로 유지하고, DM을 피어별 격리하며, 제어 플레인/런타임 도구를 비활성화하고, 그룹에서 멘션을 요구한다.

## 프롬프트 인젝션 대응

> "프롬프트 인젝션은 해결되지 않았다. 시스템 프롬프트 가드레일은 소프트 가이던스일 뿐."

### 공격 벡터

직접 DM뿐 아니라 다양한 경로로 주입 가능:
- 웹 검색/페치 결과, 브라우저 스크래핑 페이지
- 이메일 및 첨부파일, 붙여넣기된 로그/코드

### 방어 전략 (우선순위 순)

**접근 제어 (최우선)**:
- DM 잠금: `dmPolicy: "pairing"` 또는 `"allowlist"`
- 그룹에서 멘션 요구
- 공개 표면에 명시적 허용목록

**콘텐츠 격리**:
- 비신뢰 콘텐츠용 읽기 전용 에이전트 사용
- 요약만 메인 에이전트에 전달
- 도구 에이전트에서 `web_search`/`web_fetch` 비활성화

**도구 샌드박싱**:
- 샌드박스 모드 활성화, 파일시스템 접근 제한
- 최소 도구 허용목록, 제어 플레인 도구 차단

**모델 강도**:
- 구형/소형 모델은 현저히 취약 — 최신 instruction-hardened 세대 사용
- 소형 모델: 샌드박스 필수 + 웹 도구 금지

## 샌드박싱

### 두 가지 접근 방식

| 방식 | 설명 |
|------|------|
| 전체 컨테이너 샌드박스 | 게이트웨이 전체를 Docker에서 실행. 완전한 호스트/앱 경계 |
| 도구 레벨 샌드박스 | 호스트 게이트웨이 + Docker 격리 도구. 에이전트/세션별 스코프 |

### 도구 레벨 샌드박스 설정

```yaml
agents:
  defaults:
    sandbox:
      mode: "all"              # "off" | "all"
      scope: "agent"           # "agent" | "session" | "shared"
      workspaceAccess: "rw"    # "none" | "ro" | "rw"
```

### 워크스페이스 접근 수준

| 수준 | 동작 |
|------|------|
| `none` | 워크스페이스 접근 불가. `~/.openclaw/sandboxes`에서 실행 |
| `ro` | `/agent`에 읽기 전용 마운트. write/edit/apply_patch 비활성화 |
| `rw` | `/workspace` 전체 접근. 신뢰된 에이전트용 기본값 |

### 크로스 에이전트 격리

| scope | 효과 | 권장 |
|-------|------|------|
| `agent` | 에이전트당 별도 컨테이너 | 기본 권장 |
| `session` | 세션당 별도 컨테이너 (에이전트 내 격리) | 더 엄격 |
| `shared` | 모든 에이전트가 단일 컨테이너 | 비권장 |

## 자격증명 저장 맵 (Credential Storage Map)

```yaml
WhatsApp: ~/.openclaw/credentials/whatsapp/<accountId>/creds.json
Telegram: channels.telegram.tokenFile (일반 파일, 심링크 거부)
Discord/Slack: config/env 또는 SecretRef
페어링 허용목록: ~/.openclaw/credentials/<channel>-allowFrom.json
  (비기본 계정: <channel>-<accountId>-allowFrom.json)
모델 인증: ~/.openclaw/agents/<agentId>/agent/auth-profiles.json
파일 기반 시크릿: ~/.openclaw/secrets.json (선택)
세션 트랜스크립트: ~/.openclaw/agents/<agentId>/sessions/*.jsonl
  (비공개 메시지와 도구 출력 포함 — 디스크 접근 = 신뢰 경계)
```

## `dangerously*` 플래그

모든 `dangerously*` 설정 키는 경화를 비활성화한다. 프로덕션에서는 모두 미설정/false 유지.

### Gateway Control UI

- `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback`
- `gateway.controlUi.dangerouslyDisableDeviceAuth`
- `gateway.controlUi.allowInsecureAuth`

### 브라우저 SSRF

- `browser.ssrfPolicy.dangerouslyAllowPrivateNetwork`

### 채널 이름 매칭 (DNS 리바인딩 위험)

- `channels.discord.dangerouslyAllowNameMatching`
- `channels.slack.dangerouslyAllowNameMatching`
- `channels.googlechat.dangerouslyAllowNameMatching`
- `channels.msteams.dangerouslyAllowNameMatching`

### 샌드박스 이탈 벡터

- `agents.*.sandbox.docker.dangerouslyAllowReservedContainerTargets`
- `agents.*.sandbox.docker.dangerouslyAllowExternalBindSources`
- `agents.*.sandbox.docker.dangerouslyAllowContainerNamespaceJoin`

### 외부 콘텐츠 우회

- `hooks.mappings[].allowUnsafeExternalContent`
- `tools.exec.applyPatch.workspaceOnly: false`

### 파일시스템 이탈

- `fs.workspaceOnly: false` (더 넓은 파일 도구 접근)

## `openclaw security audit`

```bash
# 표준 점검
openclaw security audit

# 확장 검증
openclaw security audit --deep

# 자동 수정
openclaw security audit --fix

# 머신 리더블 출력
openclaw security audit --json
```

### 주요 발견 사항 우선순위

| 심각도 | 카테고리 | 핵심 설정 | 조치 |
|--------|---------|----------|------|
| critical | 파일 권한 | `~/.openclaw` world-writable | `chmod 700` |
| critical | 파일 권한 | `openclaw.json` world-readable | `chmod 600` |
| critical | 게이트웨이 인증 | 원격 바인드 + 토큰 없음 | `gateway.auth.token` 추가 |
| critical | 도구 + 접근 | open 그룹 + elevated 도구 | `groupPolicy` 제한 |
| warn | 모델 | 레거시/소형 모델 + 도구 | 모델 티어 업그레이드 |

## DM 접근 모델

| 모드 | 동작 |
|------|------|
| `pairing` (기본, 권장) | 미인식 발신자에게 페어링 코드 제공. 1시간 만료, 보류 상한 3개 |
| `allowlist` | 미인식 발신자 차단 (페어링 핸드셰이크 없음) |
| `open` (명시적 옵트인) | 모든 발신자 허용. 다른 제어 없이는 고위험 |
| `disabled` | 인바운드 DM 무시 |

## 네트워크 노출 경화

### 바인드 모드

| 모드 | 설명 | 보안 |
|------|------|------|
| `loopback` (기본) | 로컬 클라이언트만 연결 | 가장 안전 |
| `lan` / `tailnet` | 공격 표면 확장 | 토큰/패스워드 + 방화벽 필요 |
| `custom` | 수동 바인딩 | 최고 위험, 드물게 정당화 |

### 리버스 프록시

```yaml
gateway:
  trustedProxies:
    - "127.0.0.1"
  allowRealIpFallback: false
```

- 프록시는 `X-Forwarded-For`를 **덮어쓰기** 해야 함 (append 아님)
- `trustedProxies` 없이: 프록시됨 = 비로컬 → 인증 없으면 거부

## 파일 권한 경화

| 경로 | 권한 | 이유 |
|------|------|------|
| `~/.openclaw/` | `700` | 전체 상태 디렉토리 |
| `~/.openclaw/openclaw.json` | `600` | 토큰, 허용목록, 설정 노출 |
| `~/.openclaw/credentials/` | `700` | 채널 토큰, 페어링 허용목록 |
| `~/.openclaw/agents/<id>/sessions/` | `700` | 비공개 메시지와 도구 출력 |

`openclaw doctor`로 검증 및 자동 수정 가능.

---

## Gateway Token 로테이션

Gateway Token이 유출되었거나 정기 교체가 필요한 경우.

### 절차

```bash
# 새 토큰 생성
NEW_TOKEN=$(openssl rand -hex 32)

# .env.secrets 업데이트 (로컬)
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

# .env.secrets 업데이트
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

- `openclaw --version` — 최신 버전인지 확인
- 알려진 CVE 패치 여부 확인

### 네트워크

- Security Group — Pulumi 전용 SG 사용 중인지, 불필요 포트 없는지
- DNS 레코드 — 현재 EC2 IP와 일치하는지

### Gateway 설정

- `gateway.auth.mode` = `"token"` (인증 활성)
- `gateway.trustedProxies` — Traefik 실제 IP와 일치
- `channels.*.groupPolicy` = `"allowlist"` (open 아닐 것)

### 시크릿

- `/opt/openclaw/.env` 권한 = `600`
- `OPENCLAW_DISABLE_BONJOUR=1` 설정됨
- `.env.secrets` — Git에 커밋되지 않았는지 (`git status`로 확인)

### 로깅

- `logging.redactSensitive` = `"tools"`
- `logging.redactPatterns` — Slack/Anthropic 토큰 prefix 포함

### 내장 감사

- `openclaw security audit --deep` — critical 0, warn 0

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
