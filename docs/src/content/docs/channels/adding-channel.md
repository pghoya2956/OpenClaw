---
title: 새 채널 추가하기
description: OpenClaw에 새로운 메시징 플랫폼 채널을 추가하는 방법
---

## 개요

OpenClaw의 채널 시스템은 플러그인 아키텍처로 설계되어 있어, 새로운 메시징 플랫폼을 추가할 수 있다. 이 문서에서는 채널 추가의 핵심 구성 요소를 설명한다.

## 구성 요소

새 채널을 추가하려면 다음 요소가 필요하다:

### ChannelDock 구현

`channels/plugins/` 디렉토리에 새 채널 플러그인을 생성한다:

```typescript
// channels/plugins/my-channel.ts
import type { ChannelDock } from "../dock.js";

export const myChannelDock: ChannelDock = {
  id: "my-channel",
  capabilities: {
    chatTypes: ["direct", "group"],
    nativeCommands: false,
    blockStreaming: true,
    reactions: false,
    threads: false,
  },
};
```

### 채널 모니터

플랫폼 SDK를 사용하여 메시지를 수신하는 모니터:

```
플랫폼 SDK 초기화
→ 이벤트 리스너 등록
→ 메시지 수신 시:
  → 채널 정보 추출
  → FinalizedMsgContext 생성
  → dispatchInboundMessage() 호출
```

### 설정 타입

`config/types.{channel}.ts`에 채널 고유 설정 타입을 정의한다.

### 응답 전달

에이전트 응답을 플랫폼 API로 전달하는 `ReplyDispatcher` 구현이 필요하다.

## 채널 플러그인 등록

`channels/plugins/index.ts`에 새 플러그인을 등록한다. `listChannelPlugins()` 함수가 이를 반환하며, 게이트웨이 시작 시 자동으로 초기화된다.

## 주요 고려사항

| 항목 | 설명 |
|------|------|
| 인증 | 플랫폼 API 토큰 관리 (환경변수 치환 활용) |
| 스레딩 | 플랫폼이 스레딩을 지원하지 않으면 시뮬레이션 가능 |
| 미디어 | 이미지, 파일 첨부 처리 로직 |
| 레이트 리밋 | 플랫폼 API의 속도 제한 처리 |
| 재연결 | 네트워크 끊김 시 자동 재연결 |

## 기존 채널 참조

새 채널 구현 시 가장 좋은 참고 자료는 기존 채널의 소스 코드다:

- **Slack** (`slack/`) — 가장 풍부한 구현, 스레딩/리액션/미디어 모두 지원
- **Discord** — 길드/채널 기반 라우팅 예시
- **Telegram** — 경량 구현 참고용
