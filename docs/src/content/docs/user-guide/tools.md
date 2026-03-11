---
title: 도구 & 스킬
description: 에이전트 기능 확장을 위한 도구, 스킬, 플러그인 가이드
---

도구(Tool)는 에이전트가 LLM 실행 중 호출하는 함수이고, 스킬(Skill)은 SKILL.md 파일로 에이전트의 능력을 확장하는 모듈이다.

- [도구 개요](https://docs.openclaw.ai/tools) — 도구 시스템 전체 구조

## 내장 도구

| 도구 | 공식 문서 | 설명 |
|------|----------|------|
| Lobster | [Lobster](https://docs.openclaw.ai/tools/lobster) | 핵심 에이전트 도구 |
| LLM Task | [LLM Task](https://docs.openclaw.ai/tools/llm-task) | 서브 LLM 호출 (요약, 분석 등) |
| Exec | [Exec](https://docs.openclaw.ai/tools/exec) | 시스템 명령어 실행 |
| Web | [Web](https://docs.openclaw.ai/tools/web) | URL 페치, 웹 검색 |
| Apply Patch | [Apply Patch](https://docs.openclaw.ai/tools/apply-patch) | 코드 패치 적용 |
| Elevated | [Elevated](https://docs.openclaw.ai/tools/elevated) | 권한 상승 도구 |
| Thinking | [Thinking](https://docs.openclaw.ai/tools/thinking) | 추론 과정 표시 |
| Reactions | [Reactions](https://docs.openclaw.ai/tools/reactions) | 메시지 이모지 리액션 |

## 브라우저 도구

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 브라우저 | [Browser](https://docs.openclaw.ai/tools/browser) | 웹 브라우저 자동화 |
| 브라우저 로그인 | [Browser Login](https://docs.openclaw.ai/tools/browser-login) | 인증이 필요한 사이트 접근 |
| Chrome 확장 | [Chrome Extension](https://docs.openclaw.ai/tools/chrome-extension) | Chrome 확장 프로그램 연동 |
| 트러블슈팅 | [Browser Troubleshooting](https://docs.openclaw.ai/tools/browser-linux-troubleshooting) | Linux 브라우저 문제 해결 |

## 에이전트 협업 도구

| 도구 | 공식 문서 | 설명 |
|------|----------|------|
| Agent Send | [Agent Send](https://docs.openclaw.ai/tools/agent-send) | 다른 에이전트에게 메시지 전송 |
| 서브에이전트 | [Subagents](https://docs.openclaw.ai/tools/subagents) | 서브에이전트 생성과 관리 |
| 멀티에이전트 샌드박스 | [Multi-agent Sandbox](https://docs.openclaw.ai/tools/multi-agent-sandbox-tools) | 멀티에이전트 샌드박스 도구 |

## 스킬

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 슬래시 커맨드 | [Slash Commands](https://docs.openclaw.ai/tools/slash-commands) | `/reset`, `/compact` 등 내장 커맨드 |
| 스킬 | [Skills](https://docs.openclaw.ai/tools/skills) | SKILL.md 작성과 사용법 |
| 스킬 설정 | [Skills Config](https://docs.openclaw.ai/tools/skills-config) | 스킬 활성화/비활성화 설정 |
| ClawHub | [ClawHub](https://docs.openclaw.ai/tools/clawhub) | 스킬 마켓플레이스 |
| 플러그인 | [Plugin](https://docs.openclaw.ai/tools/plugin) | npm 패키지 기반 확장 |

## 미디어 & 디바이스

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 노드 개요 | [Nodes Overview](https://docs.openclaw.ai/nodes) | 미디어 노드 시스템 |
| 이미지 | [Images](https://docs.openclaw.ai/nodes/images) | 이미지 처리 |
| 오디오 | [Audio](https://docs.openclaw.ai/nodes/audio) | 오디오 녹음/재생 |
| 카메라 | [Camera](https://docs.openclaw.ai/nodes/camera) | 카메라 캡처 |
| 대화 (Talk) | [Talk](https://docs.openclaw.ai/nodes/talk) | 음성 대화 |
| 음성 깨우기 | [Voicewake](https://docs.openclaw.ai/nodes/voicewake) | 음성 인식 트리거 |
| 위치 명령 | [Location Command](https://docs.openclaw.ai/nodes/location-command) | 위치 기반 명령 |
| 노드 트러블슈팅 | [Node Troubleshooting](https://docs.openclaw.ai/nodes/troubleshooting) | 노드 문제 해결 |
