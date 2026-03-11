---
title: 게이트웨이 운영
description: 게이트웨이 설정, 보안, 프로토콜, 웹 인터페이스 가이드
---

게이트웨이는 OpenClaw의 컨트롤 플레인이다. 채널 연결, 에이전트 라우팅, 세션 관리를 담당하는 단일 프로세스다.

- [게이트웨이 개요](https://docs.openclaw.ai/gateway) — 게이트웨이 아키텍처와 역할

## 설정 & 운영

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 설정 | [Configuration](https://docs.openclaw.ai/gateway/configuration) | YAML/JSON5 설정 파일 작성법 |
| 설정 레퍼런스 | [Configuration Reference](https://docs.openclaw.ai/gateway/configuration-reference) | 전체 설정 항목 레퍼런스 |
| 설정 예제 | [Configuration Examples](https://docs.openclaw.ai/gateway/configuration-examples) | 실전 설정 예제 모음 |
| 인증 | [Authentication](https://docs.openclaw.ai/gateway/authentication) | 게이트웨이 API 인증 설정 |
| 헬스체크 | [Health](https://docs.openclaw.ai/gateway/health) | 게이트웨이 상태 모니터링 |
| 하트비트 | [Heartbeat](https://docs.openclaw.ai/gateway/heartbeat) | 주기적 에이전트 실행 |
| 닥터 | [Doctor](https://docs.openclaw.ai/gateway/doctor) | 자가 진단 도구 |
| 로깅 | [Logging](https://docs.openclaw.ai/gateway/logging) | 로그 설정과 레벨 관리 |
| 게이트웨이 잠금 | [Gateway Lock](https://docs.openclaw.ai/gateway/gateway-lock) | 단일 인스턴스 보장 |
| 백그라운드 프로세스 | [Background Process](https://docs.openclaw.ai/gateway/background-process) | 데몬 모드 실행 |
| 다중 게이트웨이 | [Multiple Gateways](https://docs.openclaw.ai/gateway/multiple-gateways) | 여러 게이트웨이 운영 |
| 트러블슈팅 | [Troubleshooting](https://docs.openclaw.ai/gateway/troubleshooting) | 게이트웨이 문제 해결 |

## 보안 & 샌드박스

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 보안 개요 | [Security](https://docs.openclaw.ai/gateway/security) | 보안 아키텍처 개요 |
| 샌드박싱 | [Sandboxing](https://docs.openclaw.ai/gateway/sandboxing) | 에이전트 실행 환경 격리 |
| 샌드박스 vs 정책 | [Sandbox vs Policy](https://docs.openclaw.ai/gateway/sandbox-vs-tool-policy-vs-elevated) | 샌드박스, 도구 정책, 권한 상승 비교 |
| 형식 검증 | [Formal Verification](https://docs.openclaw.ai/security/formal-verification) | 보안 형식 검증 |

## 프로토콜 & API

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 프로토콜 | [Protocol](https://docs.openclaw.ai/gateway/protocol) | 게이트웨이 통신 프로토콜 |
| 브릿지 프로토콜 | [Bridge Protocol](https://docs.openclaw.ai/gateway/bridge-protocol) | 외부 시스템 연결 프로토콜 |
| OpenAI HTTP API | [OpenAI HTTP API](https://docs.openclaw.ai/gateway/openai-http-api) | OpenAI 호환 HTTP 엔드포인트 |
| 도구 호출 API | [Tools Invoke API](https://docs.openclaw.ai/gateway/tools-invoke-http-api) | HTTP로 도구 직접 호출 |
| CLI 백엔드 | [CLI Backends](https://docs.openclaw.ai/gateway/cli-backends) | CLI 도구의 백엔드 설정 |
| 로컬 모델 | [Local Models](https://docs.openclaw.ai/gateway/local-models) | 로컬 LLM 연동 (Ollama 등) |

## 네트워크 & 디스커버리

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 네트워크 모델 | [Network Model](https://docs.openclaw.ai/gateway/network-model) | 네트워크 아키텍처 |
| 페어링 | [Pairing](https://docs.openclaw.ai/gateway/pairing) | 게이트웨이-노드 페어링 |
| 디스커버리 | [Discovery](https://docs.openclaw.ai/gateway/discovery) | 자동 게이트웨이 탐색 |
| Bonjour | [Bonjour](https://docs.openclaw.ai/gateway/bonjour) | mDNS 기반 로컬 디스커버리 |

## 원격 접속

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 원격 게이트웨이 | [Remote](https://docs.openclaw.ai/gateway/remote) | 원격 게이트웨이 접속 설정 |
| 원격 설정 가이드 | [Remote Gateway README](https://docs.openclaw.ai/gateway/remote-gateway-readme) | 원격 게이트웨이 상세 가이드 |
| Tailscale | [Tailscale](https://docs.openclaw.ai/gateway/tailscale) | Tailscale VPN으로 안전한 원격 접속 |

## 웹 인터페이스

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 웹 UI 개요 | [Web Overview](https://docs.openclaw.ai/web) | 웹 인터페이스 종류 |
| Control UI | [Control UI](https://docs.openclaw.ai/web/control-ui) | 게이트웨이 관리 대시보드 |
| Dashboard | [Dashboard](https://docs.openclaw.ai/web/dashboard) | 실시간 모니터링 대시보드 |
| Webchat | [Webchat](https://docs.openclaw.ai/web/webchat) | 웹 기반 채팅 인터페이스 |
| TUI | [TUI](https://docs.openclaw.ai/web/tui) | 터미널 UI |
