---
title: exec 도구
description: 시스템 명령어를 실행하는 exec 도구의 보안 모델과 설정
---

## 개요

`exec` 도구는 에이전트가 시스템 명령어를 실행할 수 있게 하는 핵심 도구다. 강력한 만큼 보안 설정이 중요하다.

**핵심 디렉토리**: `agents/tools/exec/`

## 보안 모드

`tools.exec.security` 설정으로 보안 수준을 제어한다:

| 모드 | 설명 |
|------|------|
| `full` | 모든 명령어 허용 (`--dangerously-skip-permissions` 동치) |
| `standard` | 기본 보안 정책 적용 |

### ask 설정

`tools.exec.ask` 설정은 에이전트가 명령어 실행 전 승인을 요청할지 결정한다:

| 값 | 동작 |
|-----|------|
| `off` | 승인 없이 즉시 실행 |
| `always` | 매번 사용자 승인 요청 |

자율 에이전트에서는 반드시 `ask: off`로 설정해야 한다. `always`면 승인을 받을 수 있는 인터페이스가 없어 명령어 실행이 불가능하다.

## 샌드박스

에이전트별로 exec 샌드박스를 설정할 수 있다:

```yaml
agents:
  list:
    - id: lab
      sandbox:
        mode: "workspace"          # 워크스페이스 내에서만 실행
        workspaceAccess: "readwrite"
        scope: "agent"             # 에이전트별 격리
```

### 샌드박스 모드

| 모드 | 설명 |
|------|------|
| `workspace` | 에이전트 워크스페이스 디렉토리 내에서만 실행 |
| `none` | 제한 없음 |

### Docker 샌드박스

Docker 기반 격리도 지원한다:

```yaml
sandbox:
  docker:
    image: "ubuntu:22.04"
    network: "none"              # 네트워크 비활성화
```

## exec 승인 포워딩

WebSocket으로 연결된 클라이언트(Control UI)가 있으면, exec 승인 요청을 클라이언트에 포워딩할 수 있다:

```
에이전트: exec 요청 → 승인 필요
→ ExecApprovalManager → WebSocket으로 클라이언트에 전달
→ 클라이언트에서 승인/거부
→ 결과를 에이전트에 반환
```

`createExecApprovalForwarder()`와 `ExecApprovalManager`가 이를 관리한다.

## 명령어 로깅

exec 도구의 모든 실행은 로깅된다. `logging.redactSensitive` 설정에 따라 민감한 출력이 마스킹된다.
