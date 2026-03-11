---
title: 플러그인 아키텍처
description: OpenClaw 플러그인의 디스커버리, 로딩, 라이프사이클
---

## 개요

플러그인은 OpenClaw의 기능을 npm 패키지 형태로 확장하는 메커니즘이다. 게이트웨이 라이프사이클 훅, HTTP 라우트, 커스텀 도구를 추가할 수 있다.

**핵심 파일**: `plugins/loader.ts`, `plugins/registry.ts`

## 플러그인 구조

```typescript
// 플러그인 패키지의 진입점
export default {
  name: "my-plugin",
  setup({ gateway, config }) {
    // 훅 등록
    gateway.hooks.on("agent:run", (params) => { ... });
    // HTTP 라우트 추가
    gateway.http.route("/plugin/my-plugin/status", handler);
    // 커스텀 도구 추가
    gateway.tools.register({ name: "my_tool", ... });
  },
  teardown() {
    // 정리 작업
  }
}
```

## 디스커버리

`loadGatewayPlugins()` 함수가 플러그인을 발견하고 로딩한다:

```
npm 패키지 스캔: @openclaw/plugin-* 패턴
→ 각 패키지의 manifest 로딩: loadPluginsManifests()
→ 플러그인 모듈 import
→ plugin.setup() 호출
→ 훅, HTTP 라우트, 도구 등록
```

### 자동 활성화

`applyPluginAutoEnable()` 함수가 환경변수 기반으로 플러그인을 자동 활성화한다. 플러그인에 필요한 환경변수가 설정되어 있으면 자동으로 활성화된다.

## 플러그인 레지스트리

`pluginRegistry`가 모든 플러그인의 메타데이터와 등록된 확장을 관리한다:

| 항목 | 설명 |
|------|------|
| 훅 | 라이프사이클 이벤트 핸들러 |
| HTTP 라우트 | 커스텀 HTTP 엔드포인트 |
| 도구 | 에이전트용 커스텀 도구 |
| 게이트웨이 메서드 | WebSocket RPC 메서드 |

## 설정

```yaml
plugins:
  my-plugin:
    enabled: true
    config:
      apiKey: "${MY_PLUGIN_API_KEY}"
```

플러그인은 OpenClaw 설정 파일에서 활성화/비활성화하며, 플러그인별 설정을 전달할 수 있다.

## 라이프사이클

```
게이트웨이 시작 → 플러그인 디스커버리 → setup() 호출
→ 게이트웨이 실행 중 → 훅 이벤트 발생 시 핸들러 호출
→ 게이트웨이 종료 → teardown() 호출
```

핫 리로드 시 플러그인은 재로딩되지 않는다. 플러그인 변경에는 게이트웨이 재시작이 필요하다.
