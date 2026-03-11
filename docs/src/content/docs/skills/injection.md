---
title: 프롬프트 주입
description: 스킬이 시스템 프롬프트에 주입되는 방식
---

## 개요

활성화된 스킬은 시스템 프롬프트에 XML 태그로 래핑되어 주입된다. 이 과정은 에이전트 실행 직전에 수행된다.

## 주입 형식

각 스킬은 `<skill>` XML 태그로 래핑된다:

```xml
<skill name="delegate">
이 스킬은 다른 전문가 에이전트에게 작업을 위임합니다.

## 사용법
/delegate [에이전트] [질문]

## 사용 가능한 에이전트
- engineering-lead: 기술 관련
- product-leader: 제품 관련
</skill>
```

여러 스킬이 활성화되면 순서대로 연결된다.

## 주입 순서

시스템 프롬프트에서 스킬 섹션의 위치:

```
[아이덴티티]
[부트스트랩 파일 (AGENTS.md, SOUL.md 등)]
[스킬 섹션]  ← 여기
[메모리 섹션]
[기타 섹션]
```

스킬은 부트스트랩 파일 이후, 메모리 섹션 이전에 위치한다.

## 스킬 필터링

에이전트 설정에서 사용할 스킬을 제한할 수 있다:

```yaml
agents:
  list:
    - id: ceo-advisor
      skills:
        - delegate        # 이 스킬만 허용
        - web-search
```

`skills` 배열을 생략하면 모든 활성 스킬이 사용 가능하다.

채널별로도 스킬을 필터링할 수 있으며, `dispatchPreparedSlackMessage()`에서 채널 설정의 스킬 필터를 적용한다.

## 슬래시 커맨드

스킬이 슬래시 커맨드(`/command`)를 정의하면, 사용자가 해당 명령어를 입력할 때 스킬의 컨텍스트 내에서 처리된다. 커맨드 레지스트리(`auto-reply/commands-registry.ts`)가 이를 관리한다.
