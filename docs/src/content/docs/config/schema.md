---
title: 스키마 구조
description: OpenClawConfig 타입의 주요 필드와 Zod 스키마 검증 구조
---

## OpenClawConfig 타입

`OpenClawConfig`(`config/types.openclaw.ts`)은 OpenClaw의 모든 설정을 포함하는 루트 타입이다. 이 타입은 Zod 스키마에서 자동 생성된다.

## 주요 필드

```typescript
type OpenClawConfig = {
  agents?: AgentsConfig;           // 에이전트 목록 + 기본값
  bindings?: AgentBinding[];       // 라우팅 바인딩 규칙
  channels?: ChannelsConfig;       // Slack, Discord 등 채널 설정
  session?: SessionConfig;         // 세션 영속화 + 리셋 정책
  tools?: ToolsConfig;             // 도구 허용목록 + 오버라이드
  skills?: SkillsConfig;           // 스킬 설치 + 번들 허용목록
  plugins?: PluginsConfig;         // 플러그인 레지스트리 + 훅
  models?: ModelsConfig;           // 모델 별칭 + 기본값
  auth?: AuthConfig;               // API 키/토큰 관리
  hooks?: HooksConfig;             // 라이프사이클 훅
  cron?: CronConfig;               // 스케줄 기반 에이전트
  memory?: MemoryConfig;           // 장기 메모리 설정
  gateway?: GatewayConfig;         // HTTP 서버 + 인증
  logging?: LoggingConfig;         // 로깅 설정
  diagnostics?: DiagnosticsConfig; // 진단 설정
  browser?: BrowserConfig;         // 브라우저 자동화
  commands?: CommandsConfig;       // CLI 명령어 설정
}
```

## AgentsConfig

에이전트 목록과 기본 설정을 정의한다.

```typescript
type AgentsConfig = {
  defaults?: {
    model?: string | { primary?: string; fallbacks?: string[] };
    maxConcurrent?: number;  // 동시 실행 제한 (기본: 4)
  };
  list?: AgentConfig[];
}
```

### AgentConfig

개별 에이전트의 설정:

```typescript
type AgentConfig = {
  id: string;                    // 고유 식별자 (예: "ceo-advisor")
  default?: boolean;             // 기본 에이전트 여부
  workspace?: string;            // 워크스페이스 디렉토리 경로
  model?: string | {
    primary?: string;
    fallbacks?: string[];        // 모델 폴백 체인
  };
  identity?: {
    name?: string;
    emoji?: string;
    avatar?: string;
    theme?: string;
  };
  sandbox?: {
    mode?: string;
    workspaceAccess?: string;
    scope?: string;
  };
  tools?: AgentToolsConfig;
  subagents?: {
    allowAgents?: string[];
    model?: string;
  };
}
```

## SessionConfig

세션 관리 정책:

```typescript
type SessionConfig = {
  scope?: "per-sender" | "global";
  dmScope?: "main" | "per-peer" | "per-channel-peer" | "per-account-channel-peer";
  reset?: {
    mode: "daily" | "idle";
    atHour?: number;             // daily 모드: 리셋 시각 (0-23)
    idleMinutes?: number;        // idle 모드: 유휴 시간
  };
  resetByType?: {
    direct?: SessionResetConfig;
    group?: SessionResetConfig;
    thread?: SessionResetConfig;
  };
  store?: string;                // sessions.json 경로
  typingMode?: "never" | "instant" | "thinking" | "message";
  identityLinks?: Record<string, string[]>;
  maintenance?: {
    mode?: string;
    pruneAfter?: string;
    maxEntries?: number;
    rotateBytes?: number;
  };
}
```

## AgentBinding

라우팅 바인딩 규칙:

```typescript
type AgentBinding = {
  agentId: string;               // 대상 에이전트 ID
  match: {
    channel: string;             // 채널 유형 ("slack", "discord" 등)
    accountId?: string;          // 계정 ID ("*"로 와일드카드)
    peer?: {
      kind: ChatType;            // "direct" | "group" | "channel" | "thread"
      id: string;                // 대화 상대 ID
    };
    guildId?: string;            // Discord 서버 ID
    teamId?: string;             // Slack 워크스페이스 ID
  };
}
```

## Zod 스키마 검증

설정 검증은 `config/zod-schema*.ts` 파일들에 정의된 Zod 스키마로 수행된다. 여러 파일에 걸쳐 약 5,300줄로 구성되며, 모든 설정 필드의 타입, 범위, 필수 여부를 정의한다.

검증 실패 시 `ValidationIssue` 배열이 반환된다:

```typescript
type ValidationIssue = {
  path?: string;        // 실패한 필드 경로 (예: "agents.list[0].model")
  message: string;      // 에러 메시지
}
```

게이트웨이는 검증 실패 시 시작을 거부하고, `openclaw doctor` 명령어로 수리를 안내한다.
