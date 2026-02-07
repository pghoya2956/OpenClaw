# Slack App 생성 가이드

OpenClaw 페르소나 배포를 위한 Slack App 생성 절차. 각 페르소나는 별도 Slack App이 필요하다 (Socket Mode 이벤트가 동일 App Token의 여러 연결에 라운드 로빈 분배되므로 공유 불가).

## 사전 준비

- Slack 워크스페이스 관리자 권한
- 페르소나별 봇 이름 결정 (예: "Product Leader", "Engineering Lead")

## App 생성

### Manifest 방식 (권장)

https://api.slack.com/apps 접속 → **Create New App** → **From a manifest** → 워크스페이스 선택

아래 JSON manifest를 붙여넣고, `name`과 `display_name`을 페르소나에 맞게 수정:

```json
{
  "display_information": {
    "name": "Product Leader",
    "description": "OpenClaw AI Product Advisor"
  },
  "features": {
    "bot_user": {
      "display_name": "Product Leader",
      "always_online": false
    },
    "app_home": {
      "messages_tab_enabled": true,
      "messages_tab_read_only_enabled": false
    }
  },
  "oauth_config": {
    "scopes": {
      "bot": [
        "chat:write",
        "channels:history",
        "channels:read",
        "groups:history",
        "groups:read",
        "groups:write",
        "im:history",
        "im:read",
        "im:write",
        "mpim:history",
        "mpim:read",
        "mpim:write",
        "users:read",
        "app_mentions:read",
        "reactions:read",
        "reactions:write",
        "pins:read",
        "pins:write",
        "emoji:read",
        "commands",
        "files:read",
        "files:write"
      ]
    }
  },
  "settings": {
    "socket_mode_enabled": true,
    "event_subscriptions": {
      "bot_events": [
        "app_mention",
        "message.channels",
        "message.groups",
        "message.im",
        "message.mpim",
        "reaction_added",
        "reaction_removed",
        "member_joined_channel",
        "member_left_channel",
        "channel_rename",
        "pin_added",
        "pin_removed"
      ]
    }
  }
}
```

**Create** 클릭 → **Install to Workspace** 클릭.

### 수동 방식

Manifest가 안 되는 경우 아래 순서로 수동 설정:

**Socket Mode 활성화**
- Basic Information → Socket Mode → **Enable**

**App-Level Token 생성**
- Basic Information → App-Level Tokens → **Generate Token and Scopes**
- Token Name: `socket` (아무 이름)
- Scope: `connections:write` 추가
- **Generate** → `xapp-...` 토큰 복사

**Bot Token Scopes 추가**
- OAuth & Permissions → Scopes → Bot Token Scopes
- 위 manifest의 22개 scope 전부 추가

**워크스페이스에 설치**
- OAuth & Permissions → **Install to Workspace** → **Allow**
- `xoxb-...` 토큰 복사

**Event Subscriptions 설정**
- Event Subscriptions → **Enable Events** 토글
- Subscribe to bot events → 위 manifest의 12개 이벤트 전부 추가
- **Save Changes**

**App Home 설정**
- App Home → Show Tabs → **Messages Tab** 활성화

## 토큰 수집

App 생성 후 2개 토큰을 수집:

| 토큰 | 위치 | 형식 |
|------|------|------|
| Bot Token | OAuth & Permissions → Bot User OAuth Token | `xoxb-...` |
| App Token | Basic Information → App-Level Tokens | `xapp-...` |

## .env 파일 저장

수집한 토큰을 `infra/.env.{persona-name}` 파일에 저장:

```bash
# infra/.env.product-leader
PERSONA_NAME=product-leader
OPENCLAW_GATEWAY_TOKEN=<openssl rand -hex 32 로 생성>
SLACK_BOT_TOKEN=xoxb-...
SLACK_APP_TOKEN=xapp-...
ANTHROPIC_SETUP_TOKEN=sk-ant-oat01-...
```

Gateway 토큰 생성:

```bash
openssl rand -hex 32
```

Anthropic Setup Token은 모든 페르소나가 동일한 값을 공유한다 (lab의 `.env.lab`에서 복사).

## 페르소나별 체크리스트

Phase 1 초기 배포 대상 (lab 제외, 이미 존재):

```
○ product-leader  → Slack App: "Product Leader"  → .env.product-leader
○ engineering-lead → Slack App: "Engineering Lead" → .env.engineering-lead
○ growth-expert   → Slack App: "Growth Expert"    → .env.growth-expert
```

각 App에 대해:

```
○ Manifest로 App 생성
○ Install to Workspace 완료
○ Bot Token (xoxb-) 복사
○ App Token (xapp-) 복사
○ .env.{name} 파일 생성
○ Gateway Token 생성 (openssl rand -hex 32)
○ Anthropic Setup Token 복사
```

## 검증

.env 파일 생성 후 필수 키 존재 확인:

```bash
for persona in product-leader engineering-lead growth-expert; do
  echo "--- $persona ---"
  for key in PERSONA_NAME OPENCLAW_GATEWAY_TOKEN SLACK_BOT_TOKEN SLACK_APP_TOKEN ANTHROPIC_SETUP_TOKEN; do
    grep -q "^${key}=" "infra/.env.${persona}" && echo "  $key: OK" || echo "  $key: MISSING"
  done
done
```

## 참고

- OpenClaw Slack 채널 공식 문서: https://docs.openclaw.ai/channels/slack
- Socket Mode는 Webhook URL 없이 WebSocket으로 이벤트를 수신하므로, EC2에 별도 인바운드 포트가 필요 없다
- 하나의 Slack App을 여러 EC2 인스턴스에서 동시 사용하면 이벤트가 랜덤 분배되어 메시지 유실이 발생한다
