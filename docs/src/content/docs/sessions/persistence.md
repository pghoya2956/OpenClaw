---
title: 영속화
description: sessions.json과 JSONL 트랜스크립트를 통한 세션 데이터 저장
---

## 개요

세션 데이터는 두 계층으로 저장된다: 메타데이터를 위한 `sessions.json`과 실제 대화 내용을 위한 JSONL 트랜스크립트 파일.

**핵심 파일**: `config/sessions/store.ts`, `config/sessions/types.ts`

## 저장 구조

```
{stateDir}/agents/{agentId}/
├── sessions.json           # 세션 메타데이터 (모든 세션)
└── sessions/
    ├── {sessionId-1}.jsonl  # 트랜스크립트 1
    ├── {sessionId-2}.jsonl  # 트랜스크립트 2
    └── ...
```

### sessions.json

세션별 메타데이터를 저장하는 JSON 파일:

```typescript
// Record<sessionKey, SessionEntry>
{
  "agent:ceo-advisor:slack:direct:u12345": {
    "sessionId": "abc-123-def",
    "updatedAt": "2026-02-13T00:00:00Z",
    "chatType": "direct",
    "model": "anthropic/claude-sonnet-4-5-20250929",
    "tokenCounters": {
      "input": 15000,
      "output": 3000
    }
  }
}
```

### JSONL 트랜스크립트

실제 대화 내용을 한 줄에 하나의 JSON 엔트리로 저장:

```jsonl
{"role":"user","content":"분기 실적 분석해줘","timestamp":"2026-02-13T00:00:01Z"}
{"role":"assistant","content":"분석 결과를 정리하겠습니다...","timestamp":"2026-02-13T00:00:05Z","usage":{"input_tokens":1500,"output_tokens":500}}
```

트랜스크립트는 트리 구조를 지원한다. 각 엔트리에 `parentId`가 있어 분기(branching)가 가능하다.

## 세션 스토어 캐싱

`loadSessionStore()` 함수는 디스크 I/O를 줄이기 위해 인메모리 캐시를 사용한다:

```typescript
type SessionStoreCacheEntry = {
  store: Record<string, SessionEntry>;  // 세션 맵
  loadedAt: number;                      // 캐시 로딩 시각
  storePath: string;                     // 파일 경로
  mtimeMs?: number;                      // 파일 수정 시각
}
```

### 캐시 TTL

기본 TTL은 **45초** (`OPENCLAW_SESSION_CACHE_TTL_MS` 환경변수로 오버라이드 가능):

```
loadSessionStore() 호출
→ 캐시 존재 + TTL 내 + mtime 변경 없음 → 캐시 반환
→ 캐시 만료 또는 mtime 변경 → 디스크에서 재로딩
```

### 캐시 무효화

파일의 `mtime`(수정 시각)을 비교하여, 외부에서 파일이 변경되었는지 감지한다. mtime이 변경되면 캐시를 무효화하고 다시 로딩한다.

### Deep Copy

캐시에서 반환할 때 `structuredClone()`으로 깊은 복사를 수행한다. 이는 호출자가 반환된 객체를 수정해도 캐시가 오염되지 않도록 보장한다.

## 세션 유지보수

`startGatewayMaintenanceTimers()`가 주기적인 유지보수 작업을 수행한다:

| 작업 | 설명 |
|------|------|
| 오래된 세션 정리 | `pruneAfter` 기간이 지난 세션 삭제 |
| 엔트리 수 제한 | `maxEntries`를 초과하는 오래된 세션 삭제 |
| 파일 크기 로테이션 | `rotateBytes`를 초과하면 오래된 트랜스크립트 삭제 |

설정:

```yaml
session:
  maintenance:
    mode: "warn"            # warn (기본) | auto | off
    pruneAfter: "30d"       # 30일 후 정리
    maxEntries: 500          # 최대 세션 수
    rotateBytes: "10mb"      # 10MB 초과 시 로테이션
```
