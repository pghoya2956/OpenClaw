---
title: 설정 로딩 파이프라인
description: YAML 파일에서 OpenClawConfig 객체까지 — 설정 로딩의 전체 과정
---

## 개요

OpenClaw의 모든 동작은 `OpenClawConfig` 타입의 설정 객체에 의해 결정된다. 이 설정은 YAML/JSON5 파일에서 시작하여 여러 변환 단계를 거쳐 최종 객체가 된다.

**핵심 파일**: `config/config.ts`, `config/io.ts`

## 로딩 파이프라인

```mermaid
flowchart TD
    A["YAML/JSON5 파일"] --> B["readConfigFileSnapshot()"]
    B --> C["JSON5 파싱"]
    C --> D["환경변수 치환<br/>${VAR_NAME}"]
    D --> E["include 처리"]
    E --> F["경로 정규화"]
    F --> G["오버라이드 적용<br/>OPENCLAW_* 환경변수"]
    G --> H["플러그인 자동 활성화"]
    H --> I["Zod 검증"]
    I --> J["기본값 병합"]
    J --> K["ConfigFileSnapshot"]
    K --> L["loadConfig()"]
    L --> M["OpenClawConfig"]
```

### 파일 읽기

`readConfigFileSnapshot()` 함수가 설정 파일을 디스크에서 읽는다. 기본 경로는 `~/.openclaw/config.yml`이며, `CONFIG_PATH` 환경변수로 오버라이드할 수 있다.

지원하는 형식:
- **YAML** (`.yml`, `.yaml`) — 권장
- **JSON5** (`.json`, `.json5`) — 주석과 trailing comma 허용

### 환경변수 치환

`${VAR_NAME}` 패턴을 감지하여 실제 환경변수 값으로 치환한다. 대문자와 언더스코어만 허용된다.

```yaml
# 원본
channels:
  slack:
    botToken: "${SLACK_BOT_TOKEN__CEO}"

# 치환 후
channels:
  slack:
    botToken: "xoxb-1234567890-..."
```

상세 내용은 [환경변수 치환](/config/env-vars/) 참조.

### include 처리

설정 파일에서 다른 파일을 포함할 수 있다:

```yaml
include:
  - ./agents.yml
  - ./channels.yml
```

include된 파일의 내용이 메인 설정에 딥 머지된다.

### Zod 검증

파싱된 설정 객체는 Zod 스키마로 검증된다. 유효하지 않은 설정은 `configSnapshot.valid = false`와 함께 상세 에러 메시지를 반환한다:

```
Invalid config at ~/.openclaw/config.yml.
agents.list[0].model: Expected string, received number
```

### 결과: ConfigFileSnapshot

```typescript
type ConfigFileSnapshot = {
  config: OpenClawConfig;     // 파싱된 설정 (유효하지 않을 수 있음)
  exists: boolean;            // 파일 존재 여부
  valid: boolean;             // 검증 통과 여부
  issues: ValidationIssue[];  // 검증 실패 상세
  warnings: string[];         // 경고 목록
  hash: string;               // 설정 해시 (변경 감지용)
  path: string;               // 설정 파일 경로
  legacyIssues: string[];     // 레거시 항목 감지
}
```

## loadConfig()

`loadConfig()` 함수는 검증을 통과한 최종 설정 객체를 반환한다. 게이트웨이 시작 시 한 번 호출되며, 이후에는 캐시된 값을 사용한다.

핫 리로드 시에는 `readConfigFileSnapshot()`으로 새 스냅샷을 만들어 기존 설정과 비교한다.

## 게이트웨이 시작 시퀀스에서의 설정

`startGatewayServer()` 함수(`gateway/server.impl.ts`)에서 설정은 다음 순서로 처리된다:

```
readConfigFileSnapshot()
→ 레거시 항목 감지 시: migrateLegacyConfig()으로 자동 마이그레이션
→ 다시 readConfigFileSnapshot()
→ 유효성 검증 실패 시: 에러와 함께 종료
→ applyPluginAutoEnable(): 플러그인 환경변수 감지 → 자동 활성화
→ loadConfig(): 최종 OpenClawConfig 생성
```

레거시 마이그레이션은 이전 버전의 설정 스키마를 현재 버전으로 자동 변환한다. 실패하면 `openclaw doctor` 명령어를 안내한다.
