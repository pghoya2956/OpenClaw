---
title: 멀티에이전트 라우팅
description: 여러 에이전트가 동시에 운영될 때의 라우팅, 격리, 세션 관리
---

## 개요

OpenClaw은 단일 게이트웨이에서 여러 에이전트를 동시에 운영할 수 있다. 각 에이전트는 독립적인 워크스페이스, 세션, 스킬을 가지며, 바인딩 규칙에 따라 메시지가 적절한 에이전트로 라우팅된다.

## 라우팅 우선순위 (8단계)

메시지는 다음 우선순위에 따라 결정론적으로 라우팅된다:

| 우선순위 | 매칭 기준 | 설명 |
|---------|----------|------|
| 1 | Peer match | 정확한 DM/그룹/채널 ID 매칭 |
| 2 | Parent peer match | 스레드 상속 규칙 |
| 3 | Guild ID + roles | Discord 역할 기반 라우팅 |
| 4 | Guild ID | Discord 서버 매칭 |
| 5 | Team ID | Slack 워크스페이스 매칭 |
| 6 | Account ID match | 특정 채널 계정 |
| 7 | Channel-level match | `accountId: "*"` 사용 |
| 8 | Fallback | 기본 에이전트 또는 첫 번째 항목 |

같은 티어에서 여러 바인딩이 매칭되면 **설정 순서상 첫 번째**가 우선한다.

> `accountId`를 생략한 바인딩은 **기본 계정만** 매칭한다. 모든 계정에 대한 폴백은 `accountId: "*"`를 사용한다.

## 에이전트 격리

각 에이전트는 다음이 완전히 격리된다:

| 리소스 | 격리 방식 |
|--------|----------|
| 워크스페이스 | `agents/{agentId}/workspace/` 별도 디렉토리 |
| 세션 | 세션 키에 `agentId` 포함, 별도 JSONL 파일 |
| 스킬 | 에이전트별 `skills/` 디렉토리 |
| 인증 프로필 | 에이전트별 auth store |
| 도구 설정 | `AgentToolsConfig`로 개별 제어 |

## 라우팅 패턴

### 계정 기반 라우팅

각 Slack 계정(App)을 별도 에이전트에 바인딩하는 가장 일반적인 패턴:

```yaml
# 각 Slack App이 별도 에이전트에 매핑
bindings:
  - agentId: ceo-advisor
    match: { channel: slack, accountId: ceo }
  - agentId: engineering-lead
    match: { channel: slack, accountId: engineering }
  - agentId: data-scientist
    match: { channel: slack, accountId: data }
```

이 패턴에서 각 에이전트는 자체 Slack App을 통해 메시지를 수신하므로, 자연스럽게 계정별로 라우팅된다.

### 채널 기반 라우팅

같은 Slack App 내에서 채널별로 에이전트를 분리:

```yaml
bindings:
  - agentId: engineering-lead
    match:
      channel: slack
      accountId: main
      peer: { kind: channel, id: C0123456789 }  # #engineering
  - agentId: product-leader
    match:
      channel: slack
      accountId: main
      peer: { kind: channel, id: C9876543210 }  # #product
```

### 기본 에이전트

어떤 바인딩에도 매칭되지 않는 메시지는 기본 에이전트가 처리한다:

```yaml
agents:
  list:
    - id: main
      default: true    # 기본 에이전트
    - id: ceo-advisor
    - id: engineering-lead
```

`resolveDefaultAgentId()` 함수가 `default: true`인 에이전트를 찾거나, 없으면 `"main"` ID를 사용한다.

## 동시성 제어

멀티에이전트 환경에서 동시성은 Lane 시스템으로 관리된다:

```
agents.defaults.maxConcurrent: 4  # 전체 동시 실행 수
```

각 에이전트의 요청은 세션 단위로 직렬화되지만, 서로 다른 에이전트/세션의 요청은 병렬로 실행된다. `maxConcurrent`를 초과하는 요청은 대기열에서 기다린다.

상세 내용은 [Lane 시스템](/agents/lanes/) 참조.

## 세션 키 격리

세션 키에 `agentId`가 포함되어 에이전트 간 세션이 자동으로 격리된다:

```
agent:ceo-advisor:slack:direct:U12345      # CEO Advisor의 세션
agent:engineering-lead:slack:direct:U12345  # Engineering Lead의 세션
```

같은 사용자가 두 에이전트와 대화해도 세션이 완전히 분리된다.

## per-agent 샌드박스 & 도구 (v2026.1.6+)

개별 에이전트에 격리된 샌드박스 모드와 도구 제한을 설정할 수 있다:

```json5
{
  agents: {
    list: [
      {
        id: "restricted",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read"],
          deny: ["exec", "write", "edit"]
        }
      },
      {
        id: "unrestricted",
        sandbox: { mode: "off" }
      }
    ]
  }
}
```

> `tools.elevated`는 **글로벌 + 발신자 기반**이며, per-agent 설정 불가.

### 에이전트별 도구 프로파일 예시

**읽기 전용 에이전트**:

```json5
{
  id: "family",
  sandbox: { mode: "all", scope: "agent", workspaceAccess: "ro" },
  tools: {
    allow: ["read"],
    deny: ["write", "edit", "apply_patch", "exec", "process", "browser"]
  }
}
```

**메시징 전용 에이전트**:

```json5
{
  id: "public",
  sandbox: { mode: "all", scope: "agent", workspaceAccess: "none" },
  tools: {
    sessions: { visibility: "tree" },
    allow: ["sessions_list", "sessions_history", "whatsapp", "telegram", "slack", "discord"],
    deny: ["read", "write", "exec", "process", "browser", "cron", "gateway"]
  }
}
```

## 멀티 계정 채널 지원

멀티 계정 채널(WhatsApp, Telegram, Discord, Slack, Signal, iMessage, IRC, Line 등)은 `accountId`로 식별한다. `accountId` 생략 시 채널의 `defaultAccount`를 사용:

```yaml
channels:
  slack:
    defaultAccount: "main"
```

## 크로스 에이전트 통신

에이전트 간 직접적인 통신 채널은 없다. 대신 두 가지 방식으로 간접 통신이 가능하다:

### HTTP API를 통한 호출

delegate 스킬처럼, 한 에이전트가 게이트웨이의 HTTP API(`/v1/chat/completions`)를 호출하여 다른 에이전트에 질문을 보낼 수 있다:

```bash
curl -X POST http://localhost:18789/v1/chat/completions \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"model": "engineering-lead", "messages": [...]}'
```

`user` 필드 값으로 세션 키가 생성되므로(`agent:{agentId}:openai-user:{user}`), 같은 `user` 값을 사용하면 세션 컨텍스트가 유지된다.

### 에이전트 간 통신 (tools.agentToAgent)

에이전트 설정에서 `tools.agentToAgent`를 정의하여 다른 에이전트와 통신할 수 있다:

```yaml
tools:
  agentToAgent:
    enabled: false           # 기본: 비활성
    allow:
      - "engineering-lead"
      - "product-leader"
```

> 기본 비활성 — 에이전트 간 메시징은 명시적으로 활성화 + 허용목록 지정이 필요하다.

## CLI 셋업 명령어

```bash
# 에이전트 추가
openclaw agents add <agentId>

# 바인딩 포함 에이전트 목록
openclaw agents list --bindings

# 채널 계정 로그인
openclaw channels login --channel <channel> --account <accountId>

# 게이트웨이 재시작
openclaw gateway restart

# 채널 상태 프로브
openclaw channels status --probe
```
