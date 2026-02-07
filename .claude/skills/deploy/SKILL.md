---
name: deploy
description: OpenClaw EC2 인스턴스를 배포하고 Slack + HTTPS 웹 접근까지 구성한다. "/deploy", "배포해줘", "OpenClaw 띄워줘", "인스턴스 생성해줘" 요청 시 사용한다.
---

# Deploy

OpenClaw EC2 인스턴스를 Pulumi IaC로 배포하고, Slack 연동 + HTTPS Control UI 접근까지 완전히 구성한다.

## 전제 조건

이 스킬을 실행하기 전 아래가 준비되어 있어야 한다:

- AWS CLI 프로필 설정 (`AWS_PROFILE`)
- Pulumi CLI 설치
- Node.js 18+
- Anthropic Max 요금제 (Setup Token 발급)
- Slack App (Socket Mode 활성화, Bot Token + App Token)

## Workflow

### Step A: 환경 점검

사전 요구사항을 자동 확인한다:

```bash
# 확인 대상
aws sts get-caller-identity    # AWS 인증
pulumi version                  # Pulumi CLI
node --version                  # Node.js 18+
```

실패 시 사용자에게 누락된 항목을 알려주고 설치 가이드를 제공한다.

`infra/` 디렉토리에 `node_modules`가 없으면 `npm install`을 실행한다.

### Step B: 시크릿 수집

`.env.lab` 파일이 존재하는지 확인한다. 없거나 불완전하면 사용자에게 하나씩 수집한다.

**필수 시크릿 (5개):**

| 키 | 설명 | 생성 방법 |
|-----|------|----------|
| `PERSONA_NAME` | 페르소나 이름 | 기본값 `lab` 사용 가능 |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway 인증 토큰 | `openssl rand -hex 32` |
| `SLACK_BOT_TOKEN` | Slack Bot Token | Slack API 앱 설정에서 복사 (`xoxb-...`) |
| `SLACK_APP_TOKEN` | Slack App Token | Socket Mode 활성화 후 생성 (`xapp-...`) |
| `ANTHROPIC_SETUP_TOKEN` | Anthropic Setup Token | 로컬에서 `claude setup-token` 실행 (`sk-ant-oat01-...`) |

**수집 절차:**

- 이미 `.env.lab`에 값이 있으면 건너뛴다
- `OPENCLAW_GATEWAY_TOKEN`이 없으면 자동 생성을 제안한다
- `ANTHROPIC_SETUP_TOKEN`이 없으면 `claude setup-token` 실행을 안내한다
- `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN`이 없으면 Slack App 설정 체크리스트를 보여준다

**Slack App 체크리스트** (토큰이 없을 때만 표시):

```
Slack API (https://api.slack.com/apps) 에서:
- Socket Mode: Enable
- App-Level Token 생성 (connections:write 스코프) → xapp-...
- Event Subscriptions: Enable
- Subscribe to bot events: message.im, message.channels, app_mention
- Bot Token Scopes: chat:write, im:history, channels:history, app_mentions:read, users:read
- Install to Workspace → Bot Token xoxb-... 복사
- App Home → Messages Tab: Enable
```

### Step C: 시크릿 검증

수집된 토큰 형식을 검증한다:

```
OPENCLAW_GATEWAY_TOKEN — hex, 최소 32자
SLACK_BOT_TOKEN — "xoxb-" prefix
SLACK_APP_TOKEN — "xapp-" prefix
ANTHROPIC_SETUP_TOKEN — "sk-ant-oat01-" prefix, 최소 80자
```

검증 실패 시 어떤 값이 잘못되었는지 명확히 알려준다.

### Step D: 배포

```bash
cd infra
export AWS_PROFILE=sandbox    # CLAUDE.md에서 확인
pulumi preview                # 변경 사항 확인 → 사용자에게 보여줌
```

Preview 결과를 보여주고, **영향 받는 리소스가 이 프로젝트의 openclaw 리소스만인지** 반드시 확인한다. 다른 리소스가 포함되어 있으면 즉시 중단하고 사용자에게 알린다.

사용자 승인 후:

```bash
pulumi up --yes
```

### Step E: User Data 완료 대기

배포 후 SSH로 접속하여 User Data 스크립트 완료를 확인한다:

```bash
ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=no ec2-user@<publicIp>
sudo tail -f /var/log/user-data.log
```

`=== User Data completed ===` 메시지를 확인한다. 최대 5분 대기.

실패 시 로그에서 에러를 찾아 사용자에게 보고한다.

### Step F: 서비스 검증

SSH로 아래를 순차 확인한다:

```bash
export OPENCLAW_STATE_DIR=/opt/openclaw
export XDG_RUNTIME_DIR=/run/user/$(id -u)

# Gateway 프로세스
systemctl --user status openclaw-gateway

# Anthropic 인증
openclaw models status

# Slack 연결
openclaw channels status --probe
```

**성공 기준:**
- Gateway: `active (running)`
- Anthropic: `token` 인증 활성
- Slack: `enabled, configured, running, works`

하나라도 실패하면 로그를 확인하고 문제를 진단한다.

### Step G: HTTPS 접속 확인

```bash
curl -sk -o /dev/null -w "%{http_code}" https://<domain>/
```

HTTP 200이 아니면:
- Traefik 컨테이너 상태 확인 (`sudo docker compose -f /opt/openclaw/docker-compose.yml ps`)
- Traefik 로그 확인 (`sudo docker compose -f /opt/openclaw/docker-compose.yml logs`)
- Let's Encrypt 인증서 발급 대기 (최대 1분)

### Step H: Device Pairing 안내

HTTPS 접속이 가능하면 사용자에게 Control UI 접속을 안내한다:

```
브라우저에서 https://<domain> 접속:
- Gateway Token 필드에 OPENCLAW_GATEWAY_TOKEN 값 입력
- Connect 클릭
- "pairing required" 메시지가 표시됨 (정상)
```

사용자가 접속 시도하면 서버에서 pairing을 승인한다:

```bash
ssh ec2-user@<IP>
export OPENCLAW_STATE_DIR=/opt/openclaw
openclaw devices list          # Pending 요청 확인
openclaw devices approve <requestId>
```

승인 후 브라우저 새로고침 → 연결 완료.

### Step I: 결과 보고

모든 검증이 완료되면 결과를 보고한다:

```
OpenClaw 배포 완료
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Instance: <instanceId>
IP: <publicIp>
Domain: <domain>
OpenClaw: <version>

서비스 상태:
- Gateway: active (running)
- Anthropic: token 인증 활성
- Slack: works
- HTTPS: HTTP 200

접속 방법:
- SSH: ssh -i ~/.ssh/id_ed25519 ec2-user@<IP>
- Web: https://<domain>
- Slack: 봇에게 DM 또는 @멘션
```

## 에러 복구

| 에러 | 진단 | 해결 |
|------|------|------|
| npm install 실패 | git 미설치 | `sudo dnf install -y git` |
| docker compose 실패 | compose 플러그인 미설치 | compose 바이너리 수동 설치 |
| onboard 실패 | 토큰 형식 오류 | `.env.lab` 토큰 값 재확인 |
| Slack 미연결 | 토큰 누락/오류 | `SLACK_BOT_TOKEN`, `SLACK_APP_TOKEN` 재확인 |
| HTTPS 미응답 | Traefik 미시작 | `sudo docker compose up -d` |
| pairing required | 기기 미승인 | `openclaw devices approve` |

## 주의사항

- **다른 EC2 인스턴스를 절대 건드리지 않는다** — Pulumi는 자체 스택 리소스만 관리
- `.env.lab` 파일은 시크릿 포함 — Git 커밋 금지 (`.gitignore`에 이미 포함)
- Setup Token 만료 시: 로컬에서 `claude setup-token` 재실행 → `.env.lab` 업데이트 → `pulumi up`
- 비용 절감: 미사용 시 `aws ec2 stop-instances --instance-ids <id>`
