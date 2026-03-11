---
title: 훅 시스템
description: 게이트웨이 라이프사이클 이벤트에 개입하는 훅 메커니즘
---

## 개요

훅(Hook)은 게이트웨이의 특정 라이프사이클 이벤트가 발생할 때 실행되는 콜백 함수다. 플러그인이나 설정을 통해 등록할 수 있다.

**핵심 파일**: `plugins/hook-runner-global.ts`

## 훅 타입

### 게이트웨이 훅

| 훅 | 발생 시점 |
|-----|----------|
| `gateway:startup` | 게이트웨이 시작 완료 |
| `gateway:shutdown` | 게이트웨이 종료 시작 |
| `config:loaded` | 설정 파일 로딩/리로딩 |
| `config:reloaded` | 핫 리로드 적용 |

### 에이전트 훅

| 훅 | 발생 시점 |
|-----|----------|
| `agent:run` | 에이전트 실행 시작 |
| `agent:complete` | 에이전트 실행 완료 |
| `agent:error` | 에이전트 실행 에러 |
| `agent:bootstrap` | 에이전트 부트스트랩 |

### 메시지 훅

| 훅 | 발생 시점 |
|-----|----------|
| `message:inbound` | 메시지 수신 |
| `message:outbound` | 응답 전송 |

## 훅 실행

`initializeGlobalHookRunner()`가 모든 등록된 훅을 관리한다:

```
이벤트 발생 → getGlobalHookRunner()
→ 해당 이벤트에 등록된 훅 목록 조회
→ 순서대로 실행
→ 에러 발생 시 로깅 후 다음 훅 계속 실행
```

훅 실행은 **비차단**이다. 하나의 훅이 실패해도 다른 훅과 메인 흐름은 계속 진행된다.

## 설정 기반 훅

설정 파일에서 훅을 정의할 수 있다:

```yaml
hooks:
  agent:run:
    - exec: "echo 'Agent {agentId} started'"
  agent:complete:
    - exec: "echo 'Agent {agentId} completed'"
```

## 플러그인에서 훅 등록

```typescript
export default {
  setup({ gateway }) {
    gateway.hooks.on("agent:run", ({ agentId, sessionKey }) => {
      console.log(`Agent ${agentId} running in ${sessionKey}`);
    });

    gateway.hooks.on("agent:complete", ({ agentId, result }) => {
      // 사용량 추적, 로깅 등
    });
  }
}
```

## 훅 vs 미들웨어

훅은 이벤트 **관찰자**로, 메인 흐름을 변경하지 않는다. 응답을 수정하거나 요청을 차단하는 것은 불가능하다. 이러한 제어가 필요하면 플러그인의 HTTP 미들웨어나 도구 래퍼를 사용해야 한다.
