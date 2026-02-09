# Persona Registry

## Available Personas

| name | subdomain | identity.name | identity.emoji | identity.creature | identity.vibe | source |
|------|-----------|---------------|----------------|-------------------|---------------|--------|
| lab | lab.openclaw | Lab | beaker | AI Lab Assistant | curious and helpful | -- |
| product-leader | product.openclaw | Product Leader | compass | AI Product Advisor | sharp and strategic | expert-team |
| engineering-lead | eng.openclaw | Engineering Lead | wrench | AI Engineering Advisor | precise and pragmatic | expert-team |
| growth-expert | growth.openclaw | Growth Expert | chart_with_upwards_trend | AI Growth Advisor | data-driven and iterative | expert-team |
| ceo-advisor | ceo.openclaw | CEO Advisor | briefcase | AI CEO Advisor | visionary and decisive | expert-team |
| strategy-consultant | strategy.openclaw | Strategy Consultant | chess_pawn | AI Strategy Advisor | analytical and long-term | expert-team |
| design-director | design.openclaw | Design Director | art | AI Design Advisor | user-centric and detail-oriented | expert-team |
| data-scientist | data.openclaw | Data Scientist | bar_chart | AI Data Advisor | rigorous and evidence-based | expert-team |
| marketing-director | marketing.openclaw | Marketing Director | loudspeaker | AI Marketing Advisor | clear and audience-focused | expert-team |

## Infrastructure Mapping

| Field | Value |
|-------|-------|
| Instance Type | t3.medium (all) |
| Volume Size | 30 GB (all) |
| SSH Key | `${AWS_KEY_NAME}` (`${SSH_KEY_PATH}`) |
| Domain | `{subdomain}.${BASE_DOMAIN}` |
| State Dir | /opt/openclaw |
| Gateway Port | 18789 |
| Workspace | /home/ec2-user/.openclaw/workspace/ |

## Adding a New Persona

1. `personas/{name}/` 디렉토리 생성 (`mkdir -p personas/{name}/workspace`)
2. `personas/{name}/persona.yml` 작성 (최소: subdomain + openclaw.channels)
3. `personas/{name}/workspace/SOUL.md` 작성 (Core Truths/Boundaries/Vibe/Continuity, 20K자 이내)
4. `personas/{name}/workspace/IDENTITY.md` 작성 (마크다운 key-value: `- **Name:** value`)
5. `personas/{name}/workspace/AGENTS.md` 작성 (운영 규칙)
6. 이 테이블에 행 추가
7. `infra/.env.{name}` 시크릿 파일 생성
8. 별도 Slack App 생성 (Socket Mode 필수)

persona.yml 설정 가능 항목은 `personas/SETTINGS.md` 참조.

## IDENTITY.md Format

OpenClaw 파서(`src/agents/identity-file.ts`)는 마크다운 key-value 형식만 인식:

```markdown
- **Name:** Display Name
- **Emoji:** emoji_name
- **Creature:** AI Role Description
- **Vibe:** tone description
```

인식 필드: name, emoji, creature, vibe, theme, avatar
YAML 형식 불가. 플레이스홀더 텍스트("pick something you like" 등) 자동 무시.

Identity 해석 우선순위:
1. `ui.assistant` config
2. `agents.list[].identity` config
3. IDENTITY.md 파일
4. 기본값 ("Assistant")

## SOUL.md Template

OpenClaw 공식 구조:

```markdown
# SOUL.md - {Role Name}

## Core Truths
{역할 정체성, 전문 영역, 핵심 프레임워크}

## Boundaries
{전문 영역 경계, 다른 전문가 안내 규칙}

## Vibe
{소통 스타일, Slack 메시지 적합한 톤}

## Continuity
{세션 간 일관성 유지}
```

제한: 시스템 프롬프트 주입 시 20,000자 truncation (`agents.defaults.bootstrapMaxChars`).
