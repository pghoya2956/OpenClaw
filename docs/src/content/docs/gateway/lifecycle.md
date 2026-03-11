---
title: 라이프사이클
description: 게이트웨이의 시작, 종료, 재시작 라이프사이클 관리
---

## 개요

게이트웨이 프로세스는 명확한 라이프사이클을 가진다: 시작 → 실행 → 종료. 각 단계에서 서브시스템들이 순서대로 초기화되고 정리된다.

## 시작 (Startup)

상세 초기화 시퀀스는 [서버 초기화](/gateway/server/)를 참조. 시작 시 주요 이벤트:

```
startGatewayServer()
→ 설정 로딩 + 검증
→ 서비스 초기화
→ logGatewayStartup(): 시작 로그 출력
→ 채널 모니터 시작 (Slack Socket Mode 연결 등)
→ 크론 서비스 시작
→ 헬스체크 초기화
→ 업데이트 체크 스케줄링
```

시작 성공 시 `logGatewayStartup()`(`server-startup-log.ts`)이 바인딩 주소, 활성 채널, 에이전트 수 등을 로그에 출력한다.

## 실행 중 (Runtime)

게이트웨이가 실행 중일 때 주기적으로 수행되는 작업:

| 작업 | 간격 | 파일 |
|------|------|------|
| 헬스 스냅샷 갱신 | `refreshGatewayHealthSnapshot()` | `server/health-state.ts` |
| 설정 변경 감지 | `startGatewayConfigReloader()` | `config-reload.ts` |
| 세션 유지보수 | `startGatewayMaintenanceTimers()` | `server-maintenance.ts` |
| 진단 하트비트 | `startDiagnosticHeartbeat()` | `logging/diagnostic.ts` |

### 헬스 버전

게이트웨이는 두 가지 버전 카운터를 유지한다:

- **Health Version**: 전체 헬스 상태 변경 시 증가
- **Presence Version**: 에이전트 온라인 상태 변경 시 증가

클라이언트는 이 버전을 폴링하여 변경이 있을 때만 상세 상태를 요청할 수 있다.

## 종료 (Shutdown)

`close()` 함수가 정리 작업을 수행한다:

```typescript
type CloseOptions = {
  reason?: string;               // 종료 사유
  restartExpectedMs?: number;    // 재시작 예상 시간 (밀리초)
}
```

종료 순서 (`createGatewayCloseHandler`):

```
WebSocket 클라이언트에 종료 알림 전송
→ restartExpectedMs가 있으면: 재시작 예정 알림
→ 채널 모니터 종료 (Slack 연결 해제)
→ 크론 서비스 중지
→ WebSocket 연결 종료
→ HTTP 서버 종료
→ 플러그인 정리
→ 진단 하트비트 중지
→ TLS 리소스 해제
```

## 재시작 (Restart)

### SIGUSR1 재시작

`SIGUSR1` 시그널을 받으면 게이트웨이가 재시작된다:

```bash
kill -USR1 <gateway-pid>
```

`setGatewaySigusr1RestartPolicy()`에서 외부 재시작 허용 여부를 설정한다. `commands.restart` 설정이 `true`일 때만 허용된다.

### systemd 재시작

systemd 서비스로 운영할 때:

```bash
XDG_RUNTIME_DIR=/run/user/$(id -u) \
DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$(id -u)/bus \
systemctl --user restart openclaw-gateway
```

### 핫 리로드

설정 변경 시에는 전체 재시작 대신 [핫 리로드](/config/hot-reload/)를 사용할 수 있다. 핫 리로드는 프로세스를 유지하면서 설정만 갱신한다.

## 에러 복구

게이트웨이 시작 중 에러가 발생하면:

| 에러 유형 | 처리 |
|----------|------|
| 설정 파일 없음 | 온보딩 위자드 실행 |
| 설정 검증 실패 | `openclaw doctor` 명령어 안내 후 종료 |
| 레거시 설정 감지 | 자동 마이그레이션 시도 |
| 포트 충돌 | 에러 로그 + 종료 |
| 채널 연결 실패 | 경고 로그, 다른 채널은 계속 시작 |
