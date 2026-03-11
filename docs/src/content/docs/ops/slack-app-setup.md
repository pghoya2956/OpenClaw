---
title: Slack App 생성
description: OpenClaw 페르소나 배포를 위한 Slack App 생성 절차
---

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

## .env.secrets 파일 저장

수집한 토큰을 `infra/.env.secrets` 파일에 추가:

```bash
# infra/.env.secrets (해당 에이전트 섹션)
SLACK_BOT_TOKEN__{ACCOUNT}=xoxb-...
SLACK_APP_TOKEN__{ACCOUNT}=xapp-...
```

`{ACCOUNT}`는 agent.yml의 `slackAccount` 대문자 변환 (예: `ceo` → `CEO`).

## 검증

토큰 저장 후 필수 키 존재 확인:

```bash
for key in SLACK_BOT_TOKEN__CEO SLACK_APP_TOKEN__CEO; do
  grep -q "^${key}=" "infra/.env.secrets" && echo "  $key: OK" || echo "  $key: MISSING"
done
```

## 참고

- OpenClaw Slack 채널 공식 문서: https://docs.openclaw.ai/channels/slack
- Socket Mode는 Webhook URL 없이 WebSocket으로 이벤트를 수신하므로, EC2에 별도 인바운드 포트가 필요 없다
- 하나의 Slack App을 여러 EC2 인스턴스에서 동시 사용하면 이벤트가 랜덤 분배되어 메시지 유실이 발생한다
