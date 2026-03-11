---
title: 모델 & 프로바이더
description: LLM 프로바이더 설정과 모델 관리 가이드
---

OpenClaw은 다양한 LLM 프로바이더를 지원한다. 하나의 게이트웨이에서 여러 프로바이더를 동시에 사용하고, 페일오버를 설정할 수 있다.

## 모델 선택 순서

모델은 다음 우선순위로 선택된다:

1. **Primary model** — `agents.defaults.model.primary` 또는 `agents.defaults.model`
2. **Fallbacks** — `agents.defaults.model.fallbacks` (지정 순서대로)
3. **Provider auth failover** — 프로바이더 내부에서 인증 페일오버 후 다음 모델로 이동

### Allowlist 설정

`agents.defaults.models`는 모델 **카탈로그 겸 허용목록**으로 동작한다. 설정 시 `/model` 명령이나 세션 오버라이드에서 선택 가능한 모델이 제한된다.

```yaml
agent:
  model:
    primary: "anthropic/claude-sonnet-4-5"
  models:
    anthropic/claude-sonnet-4-5:
      alias: "Sonnet"
    anthropic/claude-opus-4-6:
      alias: "Opus"
```

허용목록에 없는 모델 선택 시: `"Model 'provider/model' is not allowed. Use /model to list available models."`

### 세션 모델 스위칭

재시작 없이 `/model` 명령으로 전환:

| 명령 | 동작 |
|------|------|
| `/model` | 번호 선택 피커 |
| `/model list` | 사용 가능 모델 표시 |
| `/model <#>` | 번호로 선택 |
| `/model <provider/model>` | 직접 지정 |
| `/model status` | 인증/엔드포인트 상세 |

### CLI 명령어

```bash
openclaw models list [--all|--local|--provider <name>|--json]
openclaw models status [--check|--json]
openclaw models set <provider/model>
openclaw models set-image <provider/model>
openclaw models fallbacks {list|add|remove|clear}
openclaw models aliases {list|add|remove}
openclaw models scan    # OpenRouter 무료 모델 스캔
```

## 개요

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 프로바이더 개요 | [Providers Overview](https://docs.openclaw.ai/providers) | 지원 프로바이더 목록 |
| 사용 가능 모델 | [Available Models](https://docs.openclaw.ai/providers/models) | 프로바이더별 모델 목록 |

## 모델 설정

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 모델 개념 | [Models](https://docs.openclaw.ai/concepts/models) | 모델 설정 구조와 옵션 |
| 프로바이더 설정 | [Model Providers](https://docs.openclaw.ai/concepts/model-providers) | Auth 프로필, 프로바이더 라우팅 |
| 모델 페일오버 | [Model Failover](https://docs.openclaw.ai/concepts/model-failover) | 프로바이더 장애 시 자동 전환 |

## 프로바이더

| 프로바이더 | 공식 문서 | 지원 모델 |
|-----------|----------|----------|
| Anthropic | [Anthropic](https://docs.openclaw.ai/providers/anthropic) | Claude 시리즈 |
| OpenAI | [OpenAI](https://docs.openclaw.ai/providers/openai) | GPT-4o, GPT-5 시리즈 등 |
| OpenRouter | [OpenRouter](https://docs.openclaw.ai/providers/openrouter) | 다중 프로바이더 라우터 |
| LiteLLM | [LiteLLM](https://docs.openclaw.ai/providers/litellm) | LiteLLM 프록시 |
| AWS Bedrock | [Bedrock](https://docs.openclaw.ai/providers/bedrock) | AWS 호스팅 모델 |
| Vercel AI Gateway | [Vercel](https://docs.openclaw.ai/providers/vercel-ai-gateway) | Vercel AI 라우터 |
| Moonshot | [Moonshot](https://docs.openclaw.ai/providers/moonshot) | Kimi 모델 |
| Minimax | [Minimax](https://docs.openclaw.ai/providers/minimax) | Minimax 모델 |
| OpenCode | [OpenCode](https://docs.openclaw.ai/providers/opencode) | OpenCode 모델 |
| GLM | [GLM](https://docs.openclaw.ai/providers/glm) | 智谱 GLM 모델 |
| Zai | [Zai](https://docs.openclaw.ai/providers/zai) | Zai 모델 |
| Synthetic | [Synthetic](https://docs.openclaw.ai/providers/synthetic) | 테스트용 합성 모델 |
| Qianfan | [Qianfan](https://docs.openclaw.ai/providers/qianfan) | 百度 千帆 모델 |
