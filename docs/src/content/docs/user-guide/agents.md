---
title: 에이전트 설정
description: AI 에이전트 정의, 세션, 멀티에이전트 설정 가이드
---

에이전트는 OpenClaw의 핵심 단위다. 각 에이전트는 독립적인 워크스페이스, 세션, 도구를 가지며, 메시징 채널을 통해 사용자와 대화한다.

## 기초

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 아키텍처 | [Architecture](https://docs.openclaw.ai/concepts/architecture) | 게이트웨이-에이전트 전체 구조 |
| 에이전트 | [Agent](https://docs.openclaw.ai/concepts/agent) | 에이전트 정의와 설정 옵션 |
| 에이전트 루프 | [Agent Loop](https://docs.openclaw.ai/concepts/agent-loop) | LLM 호출 → 도구 실행 반복 루프 |
| 시스템 프롬프트 | [System Prompt](https://docs.openclaw.ai/concepts/system-prompt) | 시스템 프롬프트 구성과 커스터마이징 |
| 컨텍스트 | [Context](https://docs.openclaw.ai/concepts/context) | 컨텍스트 윈도우 관리 |
| 워크스페이스 | [Agent Workspace](https://docs.openclaw.ai/concepts/agent-workspace) | 에이전트 작업 디렉토리 구조 |
| OAuth | [OAuth](https://docs.openclaw.ai/concepts/oauth) | OAuth 인증 설정 |

## 부트스트랩 파일

에이전트 워크스페이스에 배치하는 마크다운 파일로, 시스템 프롬프트에 자동 주입된다.

| 템플릿 | 공식 문서 | 용도 |
|--------|----------|------|
| AGENTS.md | [AGENTS Template](https://docs.openclaw.ai/reference/templates/AGENTS) | 에이전트 동작 지침 |
| SOUL.md | [SOUL Template](https://docs.openclaw.ai/reference/templates/SOUL) | 에이전트 성격/페르소나 |
| BOOT.md | [BOOT Template](https://docs.openclaw.ai/reference/templates/BOOT) | 부팅 시 초기 컨텍스트 |
| BOOTSTRAP.md | [BOOTSTRAP Template](https://docs.openclaw.ai/reference/templates/BOOTSTRAP) | 세션 초기화 컨텍스트 |
| HEARTBEAT.md | [HEARTBEAT Template](https://docs.openclaw.ai/reference/templates/HEARTBEAT) | 하트비트 트리거 시 프롬프트 |
| IDENTITY.md | [IDENTITY Template](https://docs.openclaw.ai/reference/templates/IDENTITY) | 에이전트 신원 정보 |
| TOOLS.md | [TOOLS Template](https://docs.openclaw.ai/reference/templates/TOOLS) | 도구 사용 지침 |
| USER.md | [USER Template](https://docs.openclaw.ai/reference/templates/USER) | 사용자별 컨텍스트 |
| 기본 AGENTS | [AGENTS.default](https://docs.openclaw.ai/reference/AGENTS.default) | 기본 AGENTS.md 내용 |

## 세션 & 메모리

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 세션 개요 | [Session](https://docs.openclaw.ai/concepts/session) | 세션 개념과 라이프사이클 |
| 세션 관리 | [Sessions](https://docs.openclaw.ai/concepts/sessions) | 다중 세션 관리 |
| 세션 프루닝 | [Session Pruning](https://docs.openclaw.ai/concepts/session-pruning) | 오래된 세션 정리 |
| 세션 도구 | [Session Tool](https://docs.openclaw.ai/concepts/session-tool) | 세션 관련 내장 도구 |
| 메모리 | [Memory](https://docs.openclaw.ai/concepts/memory) | 장기 메모리 시스템 |
| 컴팩션 | [Compaction](https://docs.openclaw.ai/concepts/compaction) | 대화 요약으로 컨텍스트 절약 |

## 멀티에이전트

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 멀티에이전트 | [Multi-agent](https://docs.openclaw.ai/concepts/multi-agent) | 여러 에이전트 협업 구성 |
| 프레즌스 | [Presence](https://docs.openclaw.ai/concepts/presence) | 에이전트 온라인 상태 관리 |

## 메시지 & 전달

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 메시지 | [Messages](https://docs.openclaw.ai/concepts/messages) | 메시지 형식과 처리 |
| 스트리밍 | [Streaming](https://docs.openclaw.ai/concepts/streaming) | 실시간 응답 스트리밍 |
| 재시도 | [Retry](https://docs.openclaw.ai/concepts/retry) | 실패 시 재시도 정책 |
| 큐 | [Queue](https://docs.openclaw.ai/concepts/queue) | 메시지 큐 관리 |
