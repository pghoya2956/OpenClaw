---
title: 번들 스킬
description: OpenClaw에 내장된 52개 번들 스킬의 카탈로그와 분류
---

## 개요

번들 스킬은 OpenClaw npm 패키지에 내장된 스킬이다. 의존성이 충족되면 자동으로 활성화되며, 별도 설치가 필요 없다.

**위치**: `skills/` (프로젝트 루트)

## 스킬 카테고리

OpenClaw에는 52개의 번들 스킬이 있으며, 다음과 같이 분류된다:

### 개발 도구

| 스킬 | 의존성 | 설명 |
|------|--------|------|
| git | `git` | Git 저장소 관리 |
| github | `gh` | GitHub API 연동 |
| npm | `npm` | npm 패키지 관리 |
| docker | `docker` | Docker 컨테이너 관리 |
| python | `python3` | Python 스크립트 실행 |

### 웹 + 데이터

| 스킬 | 의존성 | 설명 |
|------|--------|------|
| web-search | Brave/Perplexity API 키 | 웹 검색 |
| web-fetch | (없음) | URL에서 데이터 가져오기 |
| browser | browser 설정 | 브라우저 자동화 |

### 커뮤니케이션

| 스킬 | 의존성 | 설명 |
|------|--------|------|
| message | 채널 설정 | 다른 세션/채널에 메시지 전송 |
| sessions | (없음) | 세션 관리 (목록, 히스토리) |

### 시스템

| 스킬 | 의존성 | 설명 |
|------|--------|------|
| exec | exec 도구 활성화 | 시스템 명령어 실행 |
| cron | cron 설정 | 스케줄 기반 작업 |

## 스킬 비활성화

특정 번들 스킬을 비활성화하려면 `skills.entries`에서 개별적으로 끈다:

```yaml
skills:
  entries:
    exec:
      enabled: false       # exec 스킬 비활성화
    browser:
      enabled: false       # browser 스킬 비활성화
```

번들 스킬 전체를 비활성화하려면:

```yaml
skills:
  allowBundled: false      # 모든 번들 스킬 비활성화
```

## 스킬 상태 확인

CLI로 현재 활성 스킬과 게이팅 상태를 확인할 수 있다:

```bash
openclaw skills list
```

각 스킬의 활성 상태, 의존성 충족 여부, 토큰 영향을 표시한다.
