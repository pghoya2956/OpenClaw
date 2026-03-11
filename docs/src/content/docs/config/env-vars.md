---
title: 환경변수 치환
description: 설정 파일의 ${VAR_NAME} 패턴을 실제 값으로 치환하는 메커니즘
---

## 개요

OpenClaw 설정 파일에서 `${VAR_NAME}` 패턴을 사용하면 런타임에 환경변수 값으로 자동 치환된다. 이를 통해 시크릿을 설정 파일에 직접 포함하지 않고 환경변수로 주입할 수 있다.

## 치환 규칙

### 변수명 규칙

- **대문자**와 **언더스코어**만 허용: `A-Z`, `0-9`, `_`
- 소문자나 하이픈은 치환 대상이 아님 (리터럴로 취급)

```yaml
# 치환됨
botToken: "${SLACK_BOT_TOKEN__CEO}"
apiKey: "${ANTHROPIC_API_KEY}"

# 치환 안 됨 (소문자 포함)
path: "${home_dir}/workspace"        # 리터럴로 남음
```

### 더블 언더스코어 패턴

Named Slack account의 토큰처럼 에이전트별로 다른 값이 필요한 경우, 더블 언더스코어(`__`)로 접미사를 구분한다:

```yaml
# agent.yml에서
slackAccount: ceo

# defaults.yml에서 (모든 에이전트 공유 템플릿)
channels:
  slack:
    botToken: "${SLACK_BOT_TOKEN__CEO}"
    appToken: "${SLACK_APP_TOKEN__CEO}"
```

이 패턴은 OpenClaw이 자체적으로 해석하는 것이 아니라, 인프라 계층(`infra/src/openclaw-config.ts`)에서 에이전트별 설정을 생성할 때 각 에이전트의 `slackAccount`에 맞는 환경변수명을 동적으로 생성한다.

### .env 파일

환경변수는 OpenClaw 프로세스의 `.env` 파일에서 로딩된다:

```bash
# /opt/openclaw/.env
SLACK_BOT_TOKEN__CEO=xoxb-...
SLACK_APP_TOKEN__CEO=xapp-...
SLACK_BOT_TOKEN__PRODUCT=xoxb-...
SLACK_APP_TOKEN__PRODUCT=xapp-...
ANTHROPIC_SETUP_TOKEN=sk-ant-oat01-...
OPENCLAW_GATEWAY_TOKEN=abc123...
```

## OPENCLAW_* 오버라이드

`OPENCLAW_` 접두사가 붙은 환경변수는 설정 파일의 특정 필드를 오버라이드한다. 이는 `${VAR}` 치환과는 별개의 메커니즘으로, 설정 파일 변경 없이 동작을 변경할 수 있다.

주요 오버라이드:

| 환경변수 | 대상 설정 |
|---------|----------|
| `OPENCLAW_GATEWAY_PORT` | `gateway.port` |
| `OPENCLAW_GATEWAY_TOKEN` | `gateway.auth.token` |
| `OPENCLAW_STATE_DIR` | 상태 디렉토리 경로 |
| `OPENCLAW_DISABLE_BONJOUR` | 디스커버리 비활성화 |
| `OPENCLAW_RAW_STREAM` | 원시 스트림 로깅 |
| `OPENCLAW_SESSION_CACHE_TTL_MS` | 세션 캐시 TTL (기본: 45초) |

## 보안 고려사항

- `.env` 파일에는 시크릿이 포함되므로 파일 권한을 `600`으로 설정
- Git에 `.env` 파일을 커밋하지 않도록 `.gitignore`에 포함
- `logging.redactSensitive` 설정으로 로그에서 토큰을 마스킹
