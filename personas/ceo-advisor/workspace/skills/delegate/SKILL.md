---
name: delegate
description: 전문가 에이전트에게 질문을 위임하고 사고 결과를 수신합니다
---

# delegate

전문가 에이전트에게 프롬프트를 보내고 응답을 받습니다.
내부 Gateway API (`/v1/chat/completions`)를 사용하여 localhost에서 통신합니다.

## 사용법

```
/delegate to=<agentId> prompt="<질문>"
/delegate to=<id1>,<id2> prompt="<질문>" mode=parallel
```

## 사용 가능한 에이전트

| ID | 역할 | 전문 영역 |
|----|------|----------|
| product-leader | CPO / VP Product | 시장 분석, 제품 전략, 우선순위 |
| engineering-lead | CTO / VP Engineering | 기술 검토, 구현 가능성, 아키텍처 |
| growth-expert | Head of Growth | 성장 전략, 퍼널, 실험 설계 |
| strategy-consultant | 전략 컨설턴트 | 전략 프레임워크, 경쟁 분석 |
| design-director | 디자인 총괄 | UX/UI, 사용자 경험 |
| data-scientist | 데이터 사이언티스트 | 데이터 분석, 메트릭, 통계 |
| marketing-director | 마케팅 총괄 | 브랜드, 캠페인, 포지셔닝 |

## 동작

```bash
set -euo pipefail

# --- 인자 파싱 ---
AGENTS=""
PROMPT=""
MODE="sequential"

for arg in "$@"; do
  case "$arg" in
    to=*) AGENTS="${arg#to=}" ;;
    prompt=*) PROMPT="${arg#prompt=}" ;;
    mode=*) MODE="${arg#mode=}" ;;
  esac
done

if [ -z "$AGENTS" ] || [ -z "$PROMPT" ]; then
  echo "Error: to=<agentId> prompt=\"<질문>\" 필수"
  echo "Usage: /delegate to=product-leader prompt=\"시장 분석해줘\""
  exit 1
fi

GATEWAY_URL="http://localhost:18789/v1/chat/completions"
TOKEN="$OPENCLAW_GATEWAY_TOKEN"
MAX_TIMEOUT=300

# --- 단일 에이전트 위임 함수 ---
delegate_single() {
  local AGENT_ID="$1"
  local AGENT_PROMPT="$2"
  local RESPONSE_FILE="/tmp/delegate-response-${AGENT_ID}.json"
  local STATUS_FILE="/tmp/delegate-status-${AGENT_ID}.txt"

  # payload 생성 (jq로 안전한 JSON 구성)
  jq -n --arg content "$AGENT_PROMPT" \
    '{model: "openclaw", messages: [{role: "user", content: $content}], stream: false}' \
    > "/tmp/delegate-payload-${AGENT_ID}.json"

  # API 호출 → 응답 파일 저장
  curl -sS "$GATEWAY_URL" \
    -H "Authorization: Bearer $TOKEN" \
    -H "x-openclaw-agent-id: $AGENT_ID" \
    -H "Content-Type: application/json" \
    --max-time "$MAX_TIMEOUT" \
    -d @"/tmp/delegate-payload-${AGENT_ID}.json" \
    -o "$RESPONSE_FILE" \
    -w "HTTP_CODE:%{http_code}" > "$STATUS_FILE" 2>/dev/null

  # 상태 코드 확인
  local HTTP_CODE
  HTTP_CODE=$(grep -o '[0-9]*' "$STATUS_FILE" || echo "000")

  if [ "$HTTP_CODE" != "200" ]; then
    echo "--- $AGENT_ID 응답 실패 (HTTP $HTTP_CODE) ---"
    if [ -f "$RESPONSE_FILE" ]; then
      head -c 500 "$RESPONSE_FILE"
    fi
    return 1
  fi

  # 응답 파싱 (파일 기반)
  local RESULT
  RESULT=$(jq -r '.choices[0].message.content // "응답 파싱 실패"' "$RESPONSE_FILE" 2>/dev/null)

  echo "--- $AGENT_ID 응답 ---"
  echo "$RESULT"
  echo ""

  # 정리
  rm -f "/tmp/delegate-payload-${AGENT_ID}.json" "$RESPONSE_FILE" "$STATUS_FILE"
}

# --- 실행 ---
IFS=',' read -ra AGENT_LIST <<< "$AGENTS"

if [ "$MODE" = "parallel" ] && [ ${#AGENT_LIST[@]} -gt 1 ]; then
  echo "=== Parallel 위임: ${AGENTS} ==="
  echo ""

  for AGENT_ID in "${AGENT_LIST[@]}"; do
    delegate_single "$AGENT_ID" "$PROMPT" &
  done
  wait

  echo "=== 모든 위임 완료 ==="
else
  for AGENT_ID in "${AGENT_LIST[@]}"; do
    echo "=== 위임: $AGENT_ID ==="
    echo ""
    delegate_single "$AGENT_ID" "$PROMPT"
  done

  echo "=== 위임 완료 ==="
fi
```
