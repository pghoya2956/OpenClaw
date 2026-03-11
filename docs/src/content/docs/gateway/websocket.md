---
title: WebSocket 프로토콜
description: 게이트웨이와 클라이언트 간의 실시간 통신 프로토콜
---

## 개요

게이트웨이는 WebSocket을 통해 클라이언트(Control UI, 원격 노드)와 실시간 통신한다. RPC 기반 요청/응답 패턴과 서버 → 클라이언트 이벤트 스트리밍을 모두 지원한다.

**핵심 파일**: `gateway/server-ws-runtime.ts`
**메서드 목록**: `gateway/server-methods.ts`, `gateway/server-methods-list.ts`

## 프로토콜 구조

### 연결 핸드셰이크

WebSocket 연결은 다음 순서로 설정된다:

```
클라이언트 연결 요청
→ 인증 토큰 검증 (gateway.auth.token)
→ 프로토콜 버전 협상
→ 역할 + 스코프 할당 (operator / node)
→ 디바이스 ID 페어링
→ 연결 수립
```

### 메시지 형식

모든 메시지는 JSON으로 인코딩된다:

**요청 (Request)**:
```json
{
  "id": "req-123",
  "method": "chat.send",
  "params": { "sessionKey": "agent:main:main", "text": "Hello" }
}
```

**응답 (Response)**:
```json
{
  "id": "req-123",
  "result": { "ok": true }
}
```

**이벤트 (Event)**:
```json
{
  "event": "agent:stream",
  "data": { "sessionKey": "...", "delta": "Hello" }
}
```

## RPC 메서드

`coreGatewayHandlers`(`server-methods.ts`)에 100개 이상의 RPC 메서드가 등록되어 있다. 주요 카테고리:

### agents.* — 에이전트 관리

| 메서드 | 설명 |
|--------|------|
| `agents.list` | 등록된 에이전트 목록 |
| `agents.create` | 에이전트 생성 |
| `agents.update` | 에이전트 수정 |
| `agents.delete` | 에이전트 삭제 |

### chat.* — 채팅

| 메서드 | 설명 |
|--------|------|
| `chat.send` | 메시지 전송 (에이전트 실행 트리거) |
| `chat.abort` | 진행 중인 실행 중단 |
| `chat.typing` | 타이핑 상태 업데이트 |

### sessions.* — 세션 관리

| 메서드 | 설명 |
|--------|------|
| `sessions.list` | 세션 목록 |
| `sessions.history` | 세션 히스토리 조회 |
| `sessions.reset` | 세션 리셋 |
| `sessions.compact` | 세션 컴팩션 |

### skills.* — 스킬

| 메서드 | 설명 |
|--------|------|
| `skills.status` | 스킬 활성화 상태 |
| `skills.bins` | 바이너리 의존성 확인 |
| `skills.install` | 스킬 설치 |
| `skills.update` | 스킬 업데이트 |

### cron.* — 스케줄

| 메서드 | 설명 |
|--------|------|
| `cron.list` | 크론 작업 목록 |
| `cron.run` | 수동 실행 |

## 이벤트 스트리밍

서버에서 클라이언트로 푸시되는 이벤트 목록은 `GATEWAY_EVENTS`에 정의된다. 주요 이벤트:

| 이벤트 | 발생 시점 |
|--------|----------|
| `agent:stream` | 에이전트가 응답을 스트리밍할 때 |
| `agent:complete` | 에이전트 실행 완료 |
| `agent:tool` | 도구 실행 시작/완료 |
| `health:update` | 헬스 상태 변경 |
| `config:reloaded` | 설정 핫 리로드 |
| `presence:update` | 에이전트 온라인 상태 변경 |

## 노드 구독

원격 노드(iOS, Android)는 특정 에이전트나 세션의 이벤트만 구독할 수 있다. `createNodeSubscriptionManager()`(`server-node-subscriptions.ts`)가 이를 관리한다.

```
노드 연결
→ 구독 등록 (에이전트 ID 또는 세션 키)
→ 해당 에이전트/세션의 이벤트만 필터링하여 전달
→ 연결 종료 시 구독 해제
```
