---
title: 스킬 로딩
description: 번들, 관리형, 워크스페이스 스킬의 로딩 과정과 게이팅 메커니즘
---

## 개요

스킬은 에이전트의 능력을 확장하는 마크다운 기반 모듈이다. 시스템 프롬프트에 주입되어 에이전트가 특정 작업을 수행할 수 있게 한다.

**핵심 파일**: `agents/skills/workspace.ts`, `agents/skills/config.ts`

## 스킬 위치와 우선순위

스킬은 세 곳에서 로딩되며, 같은 이름의 스킬이 있을 때 우선순위가 적용된다:

| 우선순위 | 위치 | 설명 |
|---------|------|------|
| 최고 | 워크스페이스 | `{workspace}/skills/{name}/SKILL.md` |
| | 관리형 | ClawHub에서 설치된 스킬 |
| 최저 | 번들 | OpenClaw 패키지에 내장 |

워크스페이스 스킬이 동일한 이름의 번들 스킬을 오버라이드한다.

## 로딩 과정

`loadWorkspaceSkillEntries()` 함수가 스킬을 로딩한다:

```
워크스페이스의 skills/ 디렉토리 스캔
→ 각 skills/{name}/SKILL.md 파일 읽기
→ YAML 프론트매터 파싱 (메타데이터 추출)
→ 게이팅 평가 (의존성 확인)
→ 통과한 스킬만 활성화 목록에 추가
```

### 번들 스킬

`skills/` (프로젝트 루트) 디렉토리에 내장된 스킬. npm 패키지에 포함되어 별도 설치 없이 사용할 수 있다. OpenClaw에는 52개의 번들 스킬이 있다.

### 워크스페이스 스킬

에이전트의 워크스페이스 디렉토리에 직접 배치한 스킬:

```
personas/{name}/workspace/skills/
└── delegate/
    └── SKILL.md
```

이 스킬은 해당 에이전트에서만 사용 가능하다.

## 게이팅 (Gating)

스킬이 활성화되려면 의존성 조건을 모두 충족해야 한다. `metadata.openclaw.requires`에 정의된 조건:

### bins — 바이너리 의존성

```yaml
metadata:
  openclaw:
    requires:
      bins:
        - python3
        - git
```

시스템에 해당 바이너리가 설치되어 있어야 스킬이 활성화된다.

### env — 환경변수 의존성

```yaml
metadata:
  openclaw:
    requires:
      env:
        - BRAVE_API_KEY
```

해당 환경변수가 설정되어 있어야 활성화된다.

### config — 설정 의존성

```yaml
metadata:
  openclaw:
    requires:
      config:
        - browser.enabled
```

OpenClaw 설정에서 해당 키가 활성화되어 있어야 한다.

### os — 운영체제 의존성

```yaml
metadata:
  openclaw:
    requires:
      os:
        - darwin
        - linux
```

현재 운영체제가 목록에 포함되어야 한다.

## 스킬 워처

`registerSkillsChangeListener()`가 스킬 파일의 변경을 감시한다:

```
SKILL.md 파일 변경 감지
→ 해당 에이전트의 스킬 재로딩
→ 다음 에이전트 실행부터 새 스킬 적용
```

진행 중인 에이전트 실행에는 영향을 주지 않는다.

## 스킬 스냅샷

에이전트 실행 시 현재 활성 스킬 목록의 스냅샷이 세션에 기록된다. 이를 통해 세션별로 어떤 스킬이 사용 가능했는지 추적할 수 있다.
