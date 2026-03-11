// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import rehypeMermaid from 'rehype-mermaid';

export default defineConfig({
	markdown: {
		rehypePlugins: [
			[rehypeMermaid, { strategy: 'img-svg', dark: true }],
		],
	},
	integrations: [
		starlight({
			title: 'OpenClaw Internals',
			defaultLocale: 'root',
			locales: {
				root: { label: '한국어', lang: 'ko' },
			},
			sidebar: [
				{
					label: '공식 문서 가이드',
					items: [
						{ label: '개요', slug: 'user-guide' },
						{ label: '설치 & 시작', slug: 'user-guide/install' },
						{ label: '채널 연결', slug: 'user-guide/channels' },
						{ label: '에이전트 설정', slug: 'user-guide/agents' },
						{ label: '도구 & 스킬', slug: 'user-guide/tools' },
						{ label: '모델 & 프로바이더', slug: 'user-guide/models' },
						{ label: '자동화', slug: 'user-guide/automation' },
						{ label: '게이트웨이 운영', slug: 'user-guide/gateway' },
						{ label: 'CLI 레퍼런스', slug: 'user-guide/cli' },
					],
				},
				{
					label: '시작하기',
					items: [
						{ label: '소개', slug: 'guides/introduction' },
						{ label: '아키텍처 개요', slug: 'guides/architecture' },
						{ label: '메시지 흐름 조감도', slug: 'guides/message-flow' },
					],
				},
				{
					label: '설정 시스템',
					items: [
						{ label: '설정 로딩 파이프라인', slug: 'config/loading' },
						{ label: '스키마 구조', slug: 'config/schema' },
						{ label: '환경변수 치환', slug: 'config/env-vars' },
						{ label: '핫 리로드', slug: 'config/hot-reload' },
					],
				},
				{
					label: '게이트웨이',
					items: [
						{ label: '서버 초기화', slug: 'gateway/server' },
						{ label: 'WebSocket 프로토콜', slug: 'gateway/websocket' },
						{ label: 'HTTP API', slug: 'gateway/http-api' },
						{ label: '라이프사이클', slug: 'gateway/lifecycle' },
					],
				},
				{
					label: '채널 시스템',
					items: [
						{ label: '채널 추상화', slug: 'channels/abstraction' },
						{ label: 'Slack 구현 상세', slug: 'channels/slack' },
						{ label: '새 채널 추가하기', slug: 'channels/adding-channel' },
					],
				},
				{
					label: '라우팅',
					items: [
						{ label: '에이전트 바인딩', slug: 'routing/agent-binding' },
						{ label: '세션 키', slug: 'routing/session-keys' },
						{ label: '멀티에이전트 라우팅', slug: 'routing/multi-agent' },
					],
				},
				{
					label: '에이전트 런타임',
					items: [
						{ label: '런타임 구조', slug: 'agents/runtime' },
						{ label: '프롬프트 조립', slug: 'agents/prompt-assembly' },
						{ label: '실행 루프', slug: 'agents/execution-loop' },
						{ label: 'Lane 시스템', slug: 'agents/lanes' },
						{ label: '모델 선택', slug: 'agents/model-selection' },
					],
				},
				{
					label: '세션 관리',
					items: [
						{ label: '영속화', slug: 'sessions/persistence' },
						{ label: '메모리 시스템', slug: 'sessions/memory' },
						{ label: 'HTTP API 세션 생명주기', slug: 'sessions/http-session-lifecycle' },
						{ label: '컴팩션', slug: 'sessions/compaction' },
						{ label: '리셋 정책', slug: 'sessions/reset' },
						{ label: '세션 유형', slug: 'sessions/session-types' },
					],
				},
				{
					label: '스킬 시스템',
					items: [
						{ label: '스킬 로딩', slug: 'skills/loading' },
						{ label: 'SKILL.md 포맷', slug: 'skills/skill-format' },
						{ label: '프롬프트 주입', slug: 'skills/injection' },
						{ label: '번들 스킬', slug: 'skills/bundled-skills' },
					],
				},
				{
					label: '도구 시스템',
					items: [
						{ label: '도구 레지스트리', slug: 'tools/registry' },
						{ label: 'exec 도구', slug: 'tools/exec' },
						{ label: '내장 도구', slug: 'tools/built-in' },
					],
				},
				{
					label: '플러그인',
					items: [
						{ label: '플러그인 아키텍처', slug: 'plugins/architecture' },
						{ label: '훅 시스템', slug: 'plugins/hooks' },
					],
				},
				{
					label: '레퍼런스',
					items: [
						{ label: '타입 맵', slug: 'reference/type-map' },
						{ label: '소스 코드 가이드', slug: 'reference/source-map' },
						{ label: '용어 사전', slug: 'reference/glossary' },
					],
				},
				{
					label: '운영 가이드',
					items: [
						{ label: '보안 운영', slug: 'ops/security' },
						{ label: 'Slack App 생성', slug: 'ops/slack-app-setup' },
					],
				},
			],
		}),
	],
});
