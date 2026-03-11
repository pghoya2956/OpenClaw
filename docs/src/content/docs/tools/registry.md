---
title: 도구 레지스트리
description: 에이전트가 사용하는 도구의 등록, 관리, 실행 구조
---

## 개요

도구(Tool)는 에이전트가 LLM 실행 중에 호출할 수 있는 함수다. 웹 검색, 파일 읽기, 명령어 실행 등 외부 세계와 상호작용하는 능력을 제공한다.

**핵심 디렉토리**: `agents/tools/`

## 도구 구조

각 도구는 이름, 설명, 파라미터 스키마, 실행 함수로 구성된다:

```typescript
type AgentTool = {
  name: string;                    // 도구 이름 (예: "web_fetch")
  description: string;             // LLM에 보여줄 설명
  input_schema: JSONSchema;        // 입력 파라미터 JSON Schema
  execute: (input) => Promise<ToolResult>;  // 실행 함수
}
```

## 도구 목록

OpenClaw에는 15개 이상의 내장 도구가 있다:

### 핵심 도구

| 도구 | 파일 | 설명 |
|------|------|------|
| `exec` | `agents/tools/exec/` | 시스템 명령어 실행 |
| `web_fetch` | `web-fetch.ts` | URL에서 콘텐츠 가져오기 |
| `web_search` | `web-search.ts` | 웹 검색 (Brave/Perplexity) |
| `message` | `message-tool.ts` | 다른 세션에 메시지 전송 |

### 파일/메모리 도구

| 도구 | 설명 |
|------|------|
| `read_file` | 파일 읽기 |
| `write_file` | 파일 쓰기 |
| `memory_search` | 장기 메모리 검색 |
| `memory_get` | 장기 메모리 조회 |

### 브라우저 도구

| 도구 | 설명 |
|------|------|
| `browser` | Puppeteer 기반 브라우저 자동화 |

### 채널별 도구

| 도구 | 설명 |
|------|------|
| `discord_actions` | Discord API 작업 |
| `cron` | 크론 작업 관리 |
| `sessions_list` | 세션 목록 조회 |
| `sessions_history` | 세션 히스토리 조회 |
| `sessions_send` | 세션에 메시지 전송 |
| `sessions_spawn` | 새 세션 생성 |

## 도구 레지스트리 구성

에이전트 실행 시 사용 가능한 도구 목록이 구성된다:

```
에이전트 설정의 tools 필드 확인
→ 허용된 도구만 필터링
→ 스킬에서 정의한 도구 추가
→ 플러그인이 추가한 도구 포함
→ 최종 도구 목록 → LLM에 전달
```

### 도구 필터링

```yaml
agents:
  list:
    - id: ceo-advisor
      tools:
        allow: [web_fetch, web_search, exec, message]
        deny: [browser]
```

## 도구 실행 흐름

```
LLM 응답: tool_use(name="web_fetch", input={url: "..."})
→ 도구 레지스트리에서 "web_fetch" 함수 조회
→ 입력 파라미터 검증
→ 도구 함수 실행
→ 결과를 tool_result로 포맷
→ 히스토리에 추가
→ LLM 재호출
```

## SSRF 보호

`web_fetch` 도구에는 SSRF(Server-Side Request Forgery) 보호가 내장되어 있어, 내부 네트워크 주소로의 요청을 차단한다.
