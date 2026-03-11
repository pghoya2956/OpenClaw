---
title: 세션 유형
description: DM, 그룹, 스레드 등 대화 유형별 세션 동작 차이
---

## 개요

세션은 대화 유형(ChatType)에 따라 다른 동작을 보인다. DM은 개인 컨텍스트를, 그룹은 공유 컨텍스트를, 스레드는 격리된 하위 컨텍스트를 사용한다.

## 대화 유형

```typescript
type ChatType = "direct" | "group" | "channel";
```

| 유형 | Slack 매핑 | 세션 키 패턴 |
|------|-----------|-------------|
| `direct` | DM (im) | `agent:{id}:direct:{userId}` |
| `group` | MPIM, 채널 | `agent:{id}:{ch}:group:{groupId}` |
| `channel` | 공개/비공개 채널 | `agent:{id}:{ch}:group:{channelId}` |

스레드는 별도 ChatType이 아니라 세션 키에 `:thread:{threadTs}` 접미사를 붙여 처리한다.

## DM 세션

1:1 대화. `dmScope` 설정에 따라 세션 분리 수준이 결정된다:

### dmScope: main

모든 DM이 하나의 메인 세션을 공유:

```
사용자 A → agent:ceo:main
사용자 B → agent:ceo:main  (같은 세션!)
```

한 사용자와의 대화 맥락이 다른 사용자에게도 영향을 준다. 개인 에이전트에 적합.

### dmScope: per-peer

사용자별 독립 세션:

```
사용자 A → agent:ceo:direct:ua123
사용자 B → agent:ceo:direct:ub456  (다른 세션)
```

가장 일반적인 설정. 각 사용자가 독립적인 대화 컨텍스트를 가진다.

### dmScope: per-channel-peer

채널 + 사용자별 독립 세션:

```
Slack 사용자 A → agent:ceo:slack:direct:ua123
Discord 사용자 A → agent:ceo:discord:direct:ua123  (다른 세션)
```

같은 사용자라도 채널이 다르면 다른 세션을 사용한다.

## 그룹 세션

여러 사람이 참여하는 대화. 그룹 ID로 세션이 결정되므로, 같은 그룹의 모든 참여자가 같은 세션을 공유한다.

```
#general에서 사용자 A → agent:ceo:slack:group:c0123
#general에서 사용자 B → agent:ceo:slack:group:c0123  (같은 세션)
```

멘션 정책(`requireMention`)이 그룹에서 중요하다. 멘션 없이는 에이전트가 응답하지 않도록 설정할 수 있다.

## 스레드 세션

스레드는 부모 메시지의 세션에서 파생된 **격리된 하위 세션**이다:

```
#general 메시지 → agent:ceo:slack:group:c0123
  └─ 스레드 → agent:ceo:slack:group:c0123:thread:1234567890.123456
```

스레드 세션의 특징:
- 부모 세션과 독립적인 대화 히스토리
- 스레드 내 대화만 히스토리에 포함
- 부모 채널의 바인딩을 상속 (`binding.peer.parent`)

## Identity Links

서로 다른 채널의 동일 사용자를 연결하여 세션을 공유할 수 있다:

```yaml
session:
  identityLinks:
    heeho:
      - "slack:U12345"
      - "discord:D67890"
```

이 설정으로 Slack의 `U12345`와 Discord의 `D67890`이 같은 세션 키를 생성한다. 채널을 넘나들어도 대화 컨텍스트가 유지된다.

## 유형별 설정

각 대화 유형에 독립적인 설정을 적용할 수 있다:

```yaml
session:
  # DM은 2시간 유휴 후 리셋
  resetByType:
    direct:
      mode: idle
      idleMinutes: 120
    # 그룹은 매일 자정 리셋
    group:
      mode: daily
      atHour: 0
    # 스레드는 1시간 유휴 후 리셋
    thread:
      mode: idle
      idleMinutes: 60

  # 타이핑 표시도 유형별 다르게
  typingMode: instant       # DM/그룹에서는 즉시 표시
```
