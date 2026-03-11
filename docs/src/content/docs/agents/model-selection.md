---
title: 모델 선택
description: 에이전트가 사용할 LLM 모델을 선택하는 과정과 Auth 프로필 관리
---

## 개요

각 에이전트는 설정에 따라 특정 LLM 모델을 사용한다. 모델 선택은 에이전트 설정, 기본값, 폴백 체인을 거쳐 결정되며, 인증 프로필과 연동된다.

**핵심 파일**: `agents/pi-embedded-runner/model.ts`, `agents/auth-profiles.ts`

## 모델 해석 순서

```
에이전트 설정의 model 필드
  ↓ 없으면
agents.defaults.model
  ↓ 없으면
시스템 기본 모델
```

### model 필드 형식

```yaml
# 문자열 형식
model: "anthropic/claude-sonnet-4-5-20250929"

# 객체 형식 (폴백 포함)
model:
  primary: "anthropic/claude-sonnet-4-5-20250929"
  fallbacks:
    - "anthropic/claude-haiku-4-5-20251001"
```

### provider/modelId 분리

모델 문자열은 `provider/modelId` 형식으로 파싱된다:

```
"anthropic/claude-sonnet-4-5-20250929"
  → provider: "anthropic"
  → modelId: "claude-sonnet-4-5-20250929"
```

## Auth 프로필

Auth 프로필은 LLM API 호출에 사용되는 인증 정보를 관리한다.

### 프로필 순서

`resolveAuthProfileOrder()` 함수가 사용할 프로필의 우선순위를 결정한다:

```
설정에 명시된 프로필 순서
→ 쿨다운 중인 프로필 제외
→ 사용자가 지정한 프로필이 있으면 우선
→ 남은 프로필 목록 반환
```

### 쿨다운

API 호출 실패(rate limit, auth 에러) 시 해당 프로필을 일정 시간 쿨다운:

```
프로필 A: 429 Too Many Requests
→ markAuthProfileCooldown(profileA, 60s)
→ 다음 60초간 프로필 A 사용 불가
→ 프로필 B로 페일오버
```

### 페일오버

```
프로필 순서: [A, B, C]
A 호출 → rate_limit → A 쿨다운
B 호출 → auth 에러 → B 쿨다운
C 호출 → 성공 → C 사용 기록
```

모든 프로필이 실패하면 `FailoverError`가 발생한다.

## 모델 카탈로그

`loadGatewayModelCatalog()`(`gateway/server-model-catalog.ts`)가 사용 가능한 모델 목록을 관리한다. 이 카탈로그는:

- 모델별 컨텍스트 윈도우 정보 제공
- 모델 별칭(alias) 해석
- `/v1/models` HTTP 엔드포인트에서 반환

## 컨텍스트 윈도우

모델의 컨텍스트 윈도우는 다음 순서로 결정된다:

```
설정의 오버라이드 → 모델 카탈로그 → 기본값 (DEFAULT_CONTEXT_TOKENS)
```

`resolveContextWindowInfo()` 함수가 최종 컨텍스트 윈도우 크기를 결정하고, `evaluateContextWindowGuard()`가 최소 기준을 검증한다.
