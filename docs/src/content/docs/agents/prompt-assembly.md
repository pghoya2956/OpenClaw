---
title: 프롬프트 조립
description: 시스템 프롬프트가 조립되는 과정 — 스킬, 메모리, 도구 컨텍스트의 결합
---

## 개요

에이전트가 LLM에 요청을 보내기 전, 시스템 프롬프트가 여러 소스에서 조립된다. 이 프롬프트에는 에이전트의 지침, 스킬, 메모리, 도구 사용법 등이 포함된다.

**핵심 파일**: `agents/pi-embedded-runner/system-prompt.ts`, `agents/system-prompt.ts`

## 프롬프트 모드

시스템 프롬프트의 상세 수준은 `PromptMode`로 제어된다:

```typescript
type PromptMode = "full" | "minimal" | "none";
```

| 모드 | 용도 | 포함 내용 |
|------|------|----------|
| `full` | 메인 에이전트 | 모든 섹션 |
| `minimal` | 서브에이전트 | 아이덴티티 + 도구/워크스페이스/안전/스킬 (메모리, 응답태그, 메시징 등 제외) |
| `none` | 최소 | 기본 아이덴티티 문장만 (`"You are a personal assistant running inside OpenClaw."`) |

## 조립 순서

`full` 모드에서 시스템 프롬프트는 다음 섹션으로 구성된다:

```
아이덴티티 (항상 포함)
  ↓
부트스트랩 파일 (AGENTS.md, SOUL.md, TOOLS.md 등)
  ↓
스킬 섹션 (활성화된 스킬의 SKILL.md 내용)
  ↓
메모리 섹션 (장기 메모리 리콜)
  ↓
사용자 아이덴티티 섹션
  ↓
날짜/시간 섹션
  ↓
응답 태그 섹션 ([[reply_to_current]] 등)
  ↓
메시징 섹션 (채널별 메시지 전달 규칙)
  ↓
음성 섹션 (TTS 설정이 있을 때)
  ↓
문서 섹션
```

### 아이덴티티

에이전트의 이름, 이모지, 기본 정보:

```
You are {agentName}, an AI assistant.
```

### 부트스트랩 파일

워크스페이스의 마크다운 파일들이 시스템 프롬프트에 주입된다:

| 파일 | 역할 |
|------|------|
| `AGENTS.md` | 에이전트 기본 동작 지침 |
| `SOUL.md` | 성격, 어조, 페르소나 |
| `TOOLS.md` | 도구 사용 관련 지침 |
| `IDENTITY.md` | 아이덴티티 상세 |
| `USER.md` | 사용자 정보 |
| `HEARTBEAT.md` | 하트비트 관련 지침 |
| `BOOT.md` | 부팅 시 실행 지침 |
| `BOOTSTRAP.md` | 부트스트랩 지침 |

### 스킬 섹션

활성화된 스킬의 `SKILL.md` 내용이 XML 태그로 래핑되어 주입된다:

```xml
<skill name="delegate">
  이 스킬은 다른 에이전트에게 작업을 위임합니다...
</skill>
```

스킬의 게이팅 조건(필요한 바이너리, 환경변수 등)을 검사하여 조건을 충족하는 스킬만 포함된다.

### 메모리 섹션

`memory_search`와 `memory_get` 도구로 저장된 장기 메모리를 리콜한다. 이전 세션에서의 결정이나 학습 내용이 포함될 수 있다.

### 응답 태그

채널이 네이티브 응답을 지원하면 `[[reply_to_current]]` 같은 태그가 포함된다.

## 토큰 예산

시스템 프롬프트는 컨텍스트 윈도우의 상당 부분을 차지한다. 토큰 예산은 다음과 같이 관리된다:

```
전체 컨텍스트 윈도우
  - 시스템 프롬프트 (부트스트랩 + 스킬)
  - 컴팩션 예약 토큰
  = 사용 가능한 대화 토큰
```

스킬이 많을수록 사용 가능한 대화 토큰이 줄어든다. 스킬의 토큰 영향은 `skills.list` 명령어로 확인할 수 있다.

## 페이로드 빌드

최종 프롬프트는 `buildEmbeddedRunPayloads()` 함수로 구성된다:

```typescript
{
  system: "시스템 프롬프트...",
  messages: [
    // 세션 히스토리
    { role: "user", content: "이전 질문" },
    { role: "assistant", content: "이전 답변" },
    // 현재 메시지
    { role: "user", content: "새 질문" }
  ],
  tools: [...],  // 사용 가능한 도구 목록
  model: "claude-sonnet-4-5-20250929",
  max_tokens: 8192,
}
```
