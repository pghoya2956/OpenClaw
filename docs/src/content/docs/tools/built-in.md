---
title: 내장 도구
description: OpenClaw의 주요 내장 도구 분석
---

## 개요

OpenClaw의 내장 도구들은 에이전트가 외부 세계와 상호작용하는 핵심 수단이다. 각 도구는 특정 영역의 기능을 제공한다.

## web_fetch

**파일**: `agents/tools/web-fetch.ts`

URL에서 콘텐츠를 가져오는 도구. API 키 없이 기본 활성화된다.

**입력**: URL, 헤더 (선택)
**출력**: 응답 본문 (텍스트 또는 JSON)

보안:
- SSRF 보호: 내부 네트워크 주소 차단 (127.0.0.1, 10.0.0.0/8 등)
- 리다이렉트 제한
- 응답 크기 제한

## web_search

**파일**: `agents/tools/web-search.ts`

웹 검색을 수행하는 도구. Brave Search API 또는 Perplexity API 키가 필요하다.

**입력**: 검색 쿼리
**출력**: 검색 결과 목록 (제목, URL, 스니펫)

```yaml
# 활성화 조건
tools:
  web_search:
    provider: "brave"     # 또는 "perplexity"
# + BRAVE_API_KEY 또는 PERPLEXITY_API_KEY 환경변수
```

## message

**파일**: `agents/tools/message-tool.ts`

다른 세션이나 채널에 메시지를 전송하는 도구.

**입력**: 대상 세션 키, 메시지 텍스트
**출력**: 전송 결과

이 도구를 통해 에이전트가 다른 채널이나 사용자에게 사전에 메시지를 보낼 수 있다. `send_policy` 설정으로 전송 범위를 제한한다.

## sessions 도구 그룹

세션 관리를 위한 도구 그룹:

| 도구 | 기능 |
|------|------|
| `sessions_list` | 활성 세션 목록 조회 |
| `sessions_history` | 특정 세션의 대화 히스토리 조회 |
| `sessions_send` | 특정 세션에 메시지 전송 |
| `sessions_spawn` | 새 세션 생성 |

## browser

**파일**: `agents/tools/browser-tool.ts`

Puppeteer 기반 브라우저 자동화 도구. 웹 페이지 방문, 스크린샷, 폼 입력 등을 수행한다.

```yaml
# 활성화
browser:
  enabled: true
```

## cron

**파일**: `agents/tools/cron-tool.ts`

크론 작업을 관리하는 도구. 에이전트가 스스로 스케줄을 설정하여 주기적 작업을 수행할 수 있다.

## 커스텀 도구 추가

플러그인을 통해 커스텀 도구를 추가할 수 있다. 상세 내용은 [플러그인 아키텍처](/plugins/architecture/) 참조.
