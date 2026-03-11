---
title: CLI 레퍼런스
description: OpenClaw CLI 명령어 가이드
---

OpenClaw CLI는 게이트웨이 관리, 에이전트 제어, 세션 조회 등 모든 운영 작업을 명령줄에서 수행할 수 있게 한다.

- [CLI 개요](https://docs.openclaw.ai/cli) — 전체 명령어 목록과 공통 옵션

## 글로벌 플래그

| 플래그 | 설명 |
|--------|------|
| `--dev` | `~/.openclaw-dev` 아래에 격리된 상태 + 포트 시프트 |
| `--profile <name>` | `~/.openclaw-<name>` 아래에 격리된 상태 |
| `--no-color` | ANSI 컬러 비활성화 |
| `--update` | `openclaw update` 약칭 (소스 설치 전용) |
| `-V`, `--version` | 버전 출력 |
| `--json` | 머신 리더블 JSON 출력 |
| `--plain` | 스타일링 없는 플레인 텍스트 출력 |

## 에이전트 & 세션

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `agent` | [agent](https://docs.openclaw.ai/cli/agent) | 에이전트 상세 정보 조회 |
| `agents` | [agents](https://docs.openclaw.ai/cli/agents) | 에이전트 목록 조회 |
| `sessions` | [sessions](https://docs.openclaw.ai/cli/sessions) | 세션 목록 및 관리 |
| `reset` | [reset](https://docs.openclaw.ai/cli/reset) | 세션 리셋 |
| `memory` | [memory](https://docs.openclaw.ai/cli/memory) | 에이전트 메모리 관리 |
| `message` | [message](https://docs.openclaw.ai/cli/message) | 에이전트에게 메시지 전송 |

## 게이트웨이 관리

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `gateway` | [gateway](https://docs.openclaw.ai/cli/gateway) | 게이트웨이 시작/중지/상태 |
| `status` | [status](https://docs.openclaw.ai/cli/status) | 게이트웨이 상태 요약 |
| `health` | [health](https://docs.openclaw.ai/cli/health) | 헬스체크 실행 |
| `doctor` | [doctor](https://docs.openclaw.ai/cli/doctor) | 자가 진단 |
| `logs` | [logs](https://docs.openclaw.ai/cli/logs) | 게이트웨이 로그 조회 |
| `system` | [system](https://docs.openclaw.ai/cli/system) | 시스템 정보 |

## 설정 & 설치

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `configure` | [configure](https://docs.openclaw.ai/cli/configure) | 설정 편집 |
| `setup` | [setup](https://docs.openclaw.ai/cli/setup) | 초기 설정 |
| `onboard` | [onboard](https://docs.openclaw.ai/cli/onboard) | 온보딩 마법사 |
| `update` | [update](https://docs.openclaw.ai/cli/update) | 버전 업데이트 |
| `uninstall` | [uninstall](https://docs.openclaw.ai/cli/uninstall) | 삭제 |

## 채널 & 디바이스

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `channels` | [channels](https://docs.openclaw.ai/cli/channels) | 채널 목록 및 관리 |
| `pairing` | [pairing](https://docs.openclaw.ai/cli/pairing) | 채널 페어링 |
| `nodes` | [nodes](https://docs.openclaw.ai/cli/nodes) | 노드(디바이스) 관리 |
| `dns` | [dns](https://docs.openclaw.ai/cli/dns) | DNS 설정 |
| `directory` | [directory](https://docs.openclaw.ai/cli/directory) | 디렉토리 서비스 |

## 도구 & 스킬

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `skills` | [skills](https://docs.openclaw.ai/cli/skills) | 스킬 목록 및 관리 |
| `plugins` | [plugins](https://docs.openclaw.ai/cli/plugins) | 플러그인 관리 |
| `browser` | [browser](https://docs.openclaw.ai/cli/browser) | 브라우저 도구 관리 |
| `sandbox` | [sandbox](https://docs.openclaw.ai/cli/sandbox) | 샌드박스 설정 |

## 모니터링 & 자동화

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `models` | [models](https://docs.openclaw.ai/cli/models) | 모델 목록 및 상태 |
| `cron` | [cron](https://docs.openclaw.ai/cli/cron) | 크론 잡 관리 |
| `hooks` | [hooks](https://docs.openclaw.ai/cli/hooks) | 훅 관리 |
| `approvals` | [approvals](https://docs.openclaw.ai/cli/approvals) | 승인 대기 항목 |
| `security` | [security](https://docs.openclaw.ai/cli/security) | 보안 설정 |

## 기타

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `dashboard` | [dashboard](https://docs.openclaw.ai/cli/dashboard) | 대시보드 열기 |
| `tui` | [tui](https://docs.openclaw.ai/cli/tui) | 터미널 UI 실행 |
| `docs` | [docs](https://docs.openclaw.ai/cli/docs) | 문서 검색 |
| `config` | [config](https://docs.openclaw.ai/cli/config) | 비대화형 설정 (get/set/unset/validate) |
| `backup` | [backup](https://docs.openclaw.ai/cli/backup) | 백업 생성/검증 |
| `secrets` | [secrets](https://docs.openclaw.ai/cli/secrets) | 시크릿 관리 (reload/migrate) |
| `devices` | [devices](https://docs.openclaw.ai/cli/devices) | 디바이스 페어링/토큰 관리 |
| `completion` | [completion](https://docs.openclaw.ai/cli/completion) | 쉘 자동완성 생성 |
| `acp` | [acp](https://docs.openclaw.ai/cli/acp) | IDE 브릿지 (게이트웨이 연결) |
| `node` | [node](https://docs.openclaw.ai/cli/node) | 헤드리스 노드 호스트 실행 |
| `webhooks` | [webhooks](https://docs.openclaw.ai/cli/webhooks) | 웹훅 통합 (Gmail Pub/Sub) |
| `qr` | [qr](https://docs.openclaw.ai/cli/qr) | QR 코드 생성 |

## 플러그인 명령어

플러그인 설치 시에만 사용 가능한 명령어:

| 명령어 | 공식 문서 | 설명 |
|--------|----------|------|
| `voicecall` | [voicecall](https://docs.openclaw.ai/cli/voicecall) | 음성 통화 관리 |
