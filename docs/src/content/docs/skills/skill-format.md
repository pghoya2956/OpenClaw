---
title: SKILL.md 포맷
description: 스킬 정의 파일의 구조 — YAML 프론트매터와 마크다운 본문
---

## 개요

스킬은 `SKILL.md` 파일로 정의된다. YAML 프론트매터에 메타데이터를, 마크다운 본문에 에이전트 지침을 작성한다.

## 파일 구조

```markdown
---
metadata:
  openclaw:
    requires:
      bins: [curl]
      env: []
    install:
      - kind: brew
        formula: curl
---
# 스킬 이름

이 스킬은 에이전트에게 HTTP 요청 기능을 제공합니다.

## 사용법

`curl` 명령어를 사용하여 HTTP 요청을 수행할 수 있습니다.

## 예시

```bash
curl -s https://api.example.com/data | jq '.results'
```
```

## YAML 프론트매터

### metadata.openclaw.requires

스킬 활성화 조건. 상세 내용은 [스킬 로딩](/skills/loading/) 참조.

```yaml
metadata:
  openclaw:
    requires:
      bins: [python3, pip]      # 필요한 바이너리
      env: [API_KEY]            # 필요한 환경변수
      config: [browser.enabled] # 필요한 설정
      os: [darwin, linux]       # 지원 OS
```

### metadata.openclaw.install

스킬 의존성 자동 설치 지침:

```yaml
metadata:
  openclaw:
    install:
      - kind: brew
        formula: python@3.11
      - kind: npm
        package: typescript
      - kind: pip
        package: requests
```

### metadata.openclaw.tags

스킬 분류 태그:

```yaml
metadata:
  openclaw:
    tags: [development, automation]
```

## 마크다운 본문

프론트매터 이후의 마크다운이 에이전트의 시스템 프롬프트에 주입된다. 이 부분에서:

- 스킬의 목적과 사용 시기를 설명
- 구체적인 사용법과 예시를 제공
- 제약사항이나 주의사항을 명시

### 작성 가이드라인

- **간결하게**: 토큰 예산에 영향. 불필요한 내용은 생략
- **구체적으로**: LLM이 이해할 수 있는 명확한 지침
- **예시 포함**: 사용법 예시가 있으면 LLM의 수행 품질이 향상
- **슬래시 커맨드**: `/command` 형식의 명령어를 정의할 수 있음

### 토큰 영향

스킬 본문의 토큰 수만큼 사용 가능한 대화 토큰이 줄어든다:

```
스킬 토큰 = SKILL.md 본문의 토큰 수
사용 가능 대화 토큰 = 컨텍스트 윈도우 - 시스템 프롬프트 - 스킬 토큰 합계
```

`openclaw skills list` 명령어로 각 스킬의 토큰 영향을 확인할 수 있다.

## 스킬 vs Pi 포맷

OpenClaw은 두 가지 스킬 포맷을 지원한다:

| 포맷 | 프론트매터 | 본문 |
|------|----------|------|
| OpenClaw (AgentSkills) | `metadata.openclaw.*` | 마크다운 |
| Pi 호환 | Pi 형식의 메타데이터 | 마크다운 |

두 포맷 모두 동일하게 시스템 프롬프트에 주입된다.
