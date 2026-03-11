---
title: 세션 키
description: 에이전트, 채널, 대화 상대를 식별하는 세션 키 생성 규칙
---

## 개요

세션 키(Session Key)는 에이전트의 대화 컨텍스트를 고유하게 식별하는 문자열이다. 세션 스토어에서 대화 히스토리를 조회하고, 동시성 제어에서 세션 단위 직렬화를 보장하는 데 사용된다.

**핵심 파일**: `routing/session-key.ts`

## 세션 키 형식

모든 세션 키는 `agent:` 접두사로 시작한다:

```
agent:{agentId}:{sessionContext}
```

### 메인 세션 키

에이전트의 기본 세션:

```
agent:{agentId}:main
```

`buildAgentMainSessionKey()` 함수로 생성된다. 모든 DM이 하나의 세션을 공유하는 `dmScope: "main"` 모드에서 사용된다.

### 피어 세션 키

대화 상대별로 분리된 세션. `buildAgentPeerSessionKey()` 함수로 생성되며, `dmScope` 설정에 따라 구성이 달라진다:

| dmScope | 세션 키 패턴 | 설명 |
|---------|-------------|------|
| `main` | `agent:{id}:main` | 모든 DM을 하나의 세션으로 |
| `per-peer` | `agent:{id}:direct:{peerId}` | 대화 상대별 세션 |
| `per-channel-peer` | `agent:{id}:{channel}:direct:{peerId}` | 채널+대화 상대별 |
| `per-account-channel-peer` | `agent:{id}:{account}:{channel}:direct:{peerId}` | 계정+채널+대화 상대별 |

### 그룹/스레드 세션 키

```
그룹:   agent:{id}:{channel}:group:{groupId}
스레드: agent:{id}:{channel}:group:{groupId}:thread:{threadId}
```

## ID 정규화

세션 키에 포함되는 모든 ID는 정규화된다:

### normalizeAgentId()

```typescript
function normalizeAgentId(value: string): string
```

- 소문자 변환
- `[a-z0-9_-]` 이외 문자는 `-`로 치환
- 선행/후행 `-` 제거
- 최대 64자
- 빈 값은 `"main"` (DEFAULT_AGENT_ID)

### normalizeAccountId()

동일한 규칙. 빈 값은 `"default"` (DEFAULT_ACCOUNT_ID).

## 세션 키 분류

`classifySessionKeyShape()` 함수로 세션 키의 형태를 분류할 수 있다:

```typescript
type SessionKeyShape =
  | "missing"           // 빈 값
  | "agent"             // 정상: agent:... 형식
  | "legacy_or_alias"   // 레거시 또는 별칭
  | "malformed_agent"   // agent:로 시작하지만 파싱 불가
```

## 세션 키 파싱

`parseAgentSessionKey()` 함수(`sessions/session-key-utils.ts`)로 세션 키에서 에이전트 ID와 나머지 부분을 추출한다:

```typescript
type ParsedAgentSessionKey = {
  agentId: string;       // 에이전트 ID
  rest: string;          // agent:{id}: 이후 부분
}

// 예시
parseAgentSessionKey("agent:ceo-advisor:slack:direct:u12345")
// → { agentId: "ceo-advisor", rest: "slack:direct:u12345" }
```

## Identity Links

`session.identityLinks` 설정으로 서로 다른 채널의 동일 사용자를 연결할 수 있다. 예를 들어, Slack의 `U123`과 Discord의 `D456`이 같은 사람이면:

```yaml
session:
  identityLinks:
    user-a: ["slack:U123", "discord:D456"]
```

이 설정이 있으면 `buildAgentPeerSessionKey()`가 동일한 세션 키를 생성하여 채널 간 대화 컨텍스트를 공유한다.

## 상수

```typescript
DEFAULT_AGENT_ID = "main"
DEFAULT_MAIN_KEY = "main"
DEFAULT_ACCOUNT_ID = "default"
```
