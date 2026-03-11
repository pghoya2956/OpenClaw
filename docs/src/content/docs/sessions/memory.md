---
title: 메모리 시스템
description: OpenClaw의 마크다운 기반 메모리, 벡터 검색, 임베딩 프로바이더
---

## 개요

OpenClaw의 메모리 시스템은 **마크다운 파일**을 단일 소스로 사용한다. 에이전트는 두 가지 도구(`memory_search`, `memory_get`)로 메모리를 검색·읽기하고, 파일 쓰기로 기억을 저장한다.

## 메모리 파일 구조

워크스페이스 디렉토리(기본: `~/.openclaw/workspace`)에 두 계층의 파일이 존재한다:

| 파일 | 용도 | 로딩 시점 |
|------|------|----------|
| `memory/YYYY-MM-DD.md` | 일별 로그 (append-only) | 오늘 + 어제 파일 자동 로드 |
| `MEMORY.md` | 장기 기억 (내구성 팩트, 결정, 선호) | private 세션에서만 로드 (그룹 제외) |

> "누군가 '이거 기억해'라고 하면 파일에 쓴다 (RAM에 두지 않는다)."

## 메모리 도구

### memory_search

인덱싱된 스니펫에 대해 **시맨틱 검색**을 수행한다. 표현이 달라도 관련 노트를 찾을 수 있다.

### memory_get

특정 마크다운 파일이나 라인 범위를 **직접 읽기**한다. 파일이 없으면 에러 대신 `{ text: "", path }`를 반환하므로 try/catch 없이 안전하게 사용 가능하다.

## 컴팩션 전 자동 플러시

세션이 자동 컴팩션에 가까워지면, 컨텍스트 압축 전에 **사일런트 에이전틱 턴**을 트리거하여 내구성 메모리를 디스크에 기록한다.

```yaml
agents:
  defaults:
    compaction:
      memoryFlush:
        enabled: true
        softThresholdTokens: 4000
        systemPrompt: "Session nearing compaction. Store durable memories now."
        prompt: "Write any lasting notes to memory/YYYY-MM-DD.md; reply NO_REPLY if nothing."
```

- **Soft threshold**: `contextWindow - reserveTokensFloor - softThresholdTokens` 초과 시 트리거
- **사일런트**: `NO_REPLY` 옵션으로 사용자에게 보이지 않음
- **1회 제한**: `sessions.json`에서 사이클당 1회 추적
- **워크스페이스 필수**: `workspaceAccess: "ro"` 또는 `"none"`이면 건너뜀

## 벡터 메모리 검색

메모리 파일에 대한 벡터 인덱스를 구축하여 시맨틱 쿼리 매칭을 수행한다.

### 기본 동작

- **기본 활성** — 프로바이더 자동 선택:
  1. `local` (모델 경로 존재 시)
  2. `openai` (OpenAI 키 사용 가능)
  3. `gemini` (Gemini 키 사용 가능)
  4. `voyage` (Voyage 키 사용 가능)
  5. `mistral` (Mistral 키 사용 가능)
  6. 모든 프로바이더 불가 시 비활성화

- **인덱스 저장**: 에이전트별 SQLite — `~/.openclaw/memory/<agentId>.sqlite`
- **청킹**: 마크다운 청크, ~400 토큰 + 80 토큰 오버랩
- **갱신**: 파일 워처 (1.5초 디바운스), 세션 시작·검색·주기적 비동기 동기화
- **재인덱스**: 임베딩 프로바이더/모델/엔드포인트 변경 시 자동 전체 재인덱스

### 임베딩 프로바이더

**원격 프로바이더** (API 키 필요):

| 프로바이더 | 기본 모델 | 키 설정 |
|-----------|----------|---------|
| OpenAI | `text-embedding-3-small` | auth profile / `models.providers.*.apiKey` / 환경변수 |
| Gemini | `gemini-embedding-001` | `GEMINI_API_KEY` / `models.providers.google.apiKey` |
| Voyage | — | `VOYAGE_API_KEY` / `models.providers.voyage.apiKey` |
| Mistral | — | `MISTRAL_API_KEY` / `models.providers.mistral.apiKey` |
| Ollama | — | 로컬 `/api/embeddings` (자동 선택 안 됨) |

**로컬 모드**:

```yaml
memorySearch:
  provider: "local"
  local:
    modelPath: "ggml-org/embeddinggemma-300m-qat-q8_0-GGUF"  # ~0.6GB
```

- GGUF 또는 `hf:` URI 지정
- 누락 모델 자동 다운로드 (캐시), `pnpm approve-builds` 필요
- 로컬 실패 시 원격으로 폴백

**커스텀 OpenAI 호환 엔드포인트**:

```yaml
agents:
  defaults:
    memorySearch:
      provider: "openai"
      model: "text-embedding-3-small"
      remote:
        baseUrl: "https://api.example.com/v1/"
        apiKey: "YOUR_API_KEY"
        headers:
          X-Custom-Header: "value"
```

### 배치 인덱싱

OpenAI, Gemini, Voyage에서 지원. 대규모 코퍼스 백필 시 비용 절감.

```yaml
memorySearch:
  remote:
    batch:
      enabled: true  # 기본: false
      # 동시성: 2 병렬 작업 (기본)
```

## 하이브리드 검색 (벡터 + BM25)

시맨틱 유사도와 키워드 관련성을 결합한다.

- **벡터 검색**: 패러프레이즈 매칭 ("Mac Studio 게이트웨이 호스트" vs "게이트웨이 실행 머신")
- **BM25**: 정확한 토큰 매칭 (ID, 코드 심볼, 에러 문자열)

**병합 전략**:
1. 벡터 (top `maxResults × candidateMultiplier`, 코사인) + BM25 (top `maxResults × candidateMultiplier`, 랭크) 후보 풀 검색
2. BM25 랭크 → 0..1 점수 변환: `textScore = 1 / (1 + max(0, bm25Rank))`
3. 가중 최종 점수: `finalScore = vectorWeight × vectorScore + textWeight × textScore`

```yaml
agents:
  defaults:
    memorySearch:
      query:
        hybrid:
          enabled: true
          vectorWeight: 0.7
          textWeight: 0.3
          candidateMultiplier: 4
```

임베딩 불가 시 BM25만, FTS5 불가 시 벡터만 사용하는 **폴백** 내장.

## 후처리 파이프라인

### MMR 재랭킹 (다양성)

**Maximal Marginal Relevance** — 관련성과 다양성 간 균형을 맞춰 중복 결과를 줄인다:

`score = λ × relevance - (1-λ) × max_similarity_to_selected`

- `lambda: 1.0` = 순수 관련성, `0.0` = 최대 다양성
- **기본값: 0.7** (관련성 편향 균형)
- 유사도 측정: 토큰화된 콘텐츠에 대한 Jaccard 유사도

```yaml
memorySearch:
  query:
    hybrid:
      mmr:
        enabled: true
        lambda: 0.7
```

### 시간 감쇠 (Temporal Decay)

나이에 따른 지수 감쇠: `decayedScore = score × e^(-λ × ageInDays)`

| 경과 시간 | 잔존 점수 |
|----------|----------|
| 오늘 | 100% |
| 7일 | ~84% |
| 30일 (반감기) | 50% |
| 90일 | 12.5% |

**에버그린 파일** (감쇠 제외):
- `MEMORY.md` (루트)
- `memory/` 내 비날짜 파일 (예: `memory/projects.md`)

```yaml
memorySearch:
  query:
    hybrid:
      temporalDecay:
        enabled: true
        halfLifeDays: 30
```

## 추가 메모리 경로

기본 워크스페이스 외부의 마크다운 파일도 인덱싱 가능:

```yaml
agents:
  defaults:
    memorySearch:
      extraPaths:
        - "../team-docs"
        - "/srv/shared-notes/overview.md"
```

- 절대 경로 또는 워크스페이스 상대 경로
- 디렉토리는 `.md` 재귀 스캔
- 심링크 무시

## 임베딩 캐시

재인덱싱 시 변경되지 않은 텍스트의 재임베딩 방지:

```yaml
agents:
  defaults:
    memorySearch:
      cache:
        enabled: true
        maxEntries: 50000
```

## QMD 백엔드 (실험적)

SQLite 인덱서를 **QMD**로 대체 — BM25 + 벡터 + 리랭킹을 결합한 로컬 검색 사이드카.

```yaml
memory:
  backend: "qmd"
  citations: "auto"
  qmd:
    command: "qmd"
    searchMode: "search"
    includeDefaultMemory: true
    paths:
      - name: "docs"
        path: "~/notes"
        pattern: "**/*.md"
    update:
      interval: "5m"
      debounceMs: 15000
      onBoot: true
    limits:
      maxResults: 6
      maxSnippetChars: 700
      timeoutMs: 4000
```

- 설치: `bun install -g https://github.com/tobi/qmd`
- QMD 실패 시 내장 SQLite 매니저로 자동 폴백
- 세션 인덱싱 (실험적): 정제된 트랜스크립트를 QMD 컬렉션으로 내보내기

## 메모리 인용

검색 결과 스니펫 푸터 포맷 제어:

| 설정 | 효과 |
|------|------|
| `auto` / `on` | `Source: <path#line>` 푸터 포함 |
| `off` | 푸터 생략 (에이전트는 여전히 `memory_get`용 경로 수신) |
