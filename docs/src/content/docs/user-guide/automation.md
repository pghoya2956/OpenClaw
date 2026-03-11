---
title: 자동화
description: 크론, 웹훅, 훅을 활용한 에이전트 자동화 가이드
---

OpenClaw은 에이전트를 자동으로 트리거하는 다양한 방법을 제공한다. 주기적 실행, 외부 이벤트 기반 실행, 라이프사이클 훅을 조합하여 자율 에이전트를 구축할 수 있다.

## 크론 핵심 개념

### 스케줄 타입

| 타입 | 설명 | 예시 |
|------|------|------|
| `--cron` | cron 표현식 (반복) | `"0 7 * * *"` (매일 오전 7시) |
| `--at` | 일회성 실행 | 지정 시각에 실행 후 자동 삭제 |
| `--every` | 간격 기반 반복 | 고정 간격으로 반복 실행 |

일회성 잡(`--at`)은 완료 후 자동 삭제된다. `--keep-after-run`으로 유지 가능.

### 실행 모드

| 모드 | 설명 |
|------|------|
| Main Session | 기존 세션 컨텍스트에서 실행 |
| Isolated (`--session isolated`) | 격리된 세션에서 실행. `--light-context`로 경량 부트스트랩 가능 |

### 배달 모드

| 모드 | 설명 |
|------|------|
| `--announce` | 채널에 결과 발표 (`--channel`, `--to` 지정) |
| `--no-deliver` | 외부 출력 억제 |
| Webhook | `cron.webhook` 설정으로 웹훅 전달 |

### 재시도 정책

반복 잡은 연속 에러 시 **지수 백오프**를 적용한다:

`30초 → 1분 → 5분 → 15분 → 60분`

성공 실행 후 정상 스케줄로 복귀.

### 데이터 보존

| 설정 | 기본값 | 설명 |
|------|--------|------|
| `cron.sessionRetention` | `24h` | 완료된 격리 세션 정리 |
| `cron.runLog.maxBytes` | — | 실행 로그 크기 제한 |
| `cron.runLog.keepLines` | — | 유지할 로그 라인 수 |

실행 로그: `~/.openclaw/cron/runs/<jobId>.jsonl`

### CLI 명령어

```bash
openclaw cron list                # 잡 목록
openclaw cron add --cron "0 7 * * *" --session isolated --announce  # 추가
openclaw cron run <jobId>         # 즉시 실행 (큐에 넣기)
openclaw cron runs --id <jobId>   # 실행 이력
openclaw cron enable/disable <id> # 활성/비활성
openclaw cron rm <id>             # 삭제
```

---

## 자동화 방법

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 훅 | [Hooks](https://docs.openclaw.ai/automation/hooks) | 에이전트 라이프사이클 이벤트에 반응하는 콜백 |
| 크론 잡 | [Cron Jobs](https://docs.openclaw.ai/automation/cron-jobs) | 스케줄 기반 주기적 에이전트 실행 |
| 크론 vs 하트비트 | [Cron vs Heartbeat](https://docs.openclaw.ai/automation/cron-vs-heartbeat) | 크론과 하트비트 비교, 선택 가이드 |
| 웹훅 | [Webhook](https://docs.openclaw.ai/automation/webhook) | HTTP 웹훅으로 에이전트 트리거 |
| Gmail Pub/Sub | [Gmail PubSub](https://docs.openclaw.ai/automation/gmail-pubsub) | Gmail 이벤트로 에이전트 트리거 |
| 폴링 | [Poll](https://docs.openclaw.ai/automation/poll) | 주기적 폴링으로 데이터 수집 |
| Auth 모니터링 | [Auth Monitoring](https://docs.openclaw.ai/automation/auth-monitoring) | 인증 상태 자동 감시 |
| 트러블슈팅 | [Troubleshooting](https://docs.openclaw.ai/automation/troubleshooting) | 자동화 문제 해결 |

## 관련 개념

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 하트비트 | [Heartbeat](https://docs.openclaw.ai/gateway/heartbeat) | 주기적 헬스체크와 프롬프트 실행 |
| HEARTBEAT.md | [HEARTBEAT Template](https://docs.openclaw.ai/reference/templates/HEARTBEAT) | 하트비트 실행 시 프롬프트 |
