---
title: 설치 & 시작
description: OpenClaw 설치 방법과 초기 설정 가이드
---

## 시스템 요구사항

- **Node.js 22+** (인스톨러가 없으면 자동 설치)
- **운영체제**: macOS, Linux, Windows (WSL2 권장)

## 빠른 설치

### 인스톨러 스크립트 (권장)

```bash
# macOS / Linux / WSL2
curl -fsSL https://openclaw.ai/install.sh | bash

# Windows PowerShell
iwr -useb https://openclaw.ai/install.ps1 | iex
```

온보딩 건너뛰기: `--no-onboard` 플래그 추가.

### npm

```bash
npm install -g openclaw@latest
openclaw onboard --install-daemon
```

### pnpm

```bash
pnpm add -g openclaw@latest
pnpm approve-builds -g
openclaw onboard --install-daemon
```

## 환경변수

| 변수 | 설명 |
|------|------|
| `OPENCLAW_HOME` | 내부 디렉토리 경로 |
| `OPENCLAW_STATE_DIR` | 가변 상태 저장소 |
| `OPENCLAW_CONFIG_PATH` | 설정 파일 위치 |

## 설치 후 확인

```bash
openclaw doctor      # 설정 문제 진단
openclaw status      # 게이트웨이 상태
openclaw dashboard   # 웹 UI 실행
```

명령어가 인식되지 않으면 npm 글로벌 bin 디렉토리를 PATH에 추가하고 터미널을 재시작한다.

---

## 처음 시작하기

OpenClaw을 처음 사용한다면 아래 순서로 진행한다.

| 단계 | 공식 문서 | 설명 |
|------|----------|------|
| 개요 | [Showcase](https://docs.openclaw.ai/start/showcase) | OpenClaw의 핵심 기능과 데모 |
| 핵심 기능 | [Features](https://docs.openclaw.ai/concepts/features) | 주요 기능 목록 |
| 빠른 시작 | [Getting Started](https://docs.openclaw.ai/start/getting-started) | 설치부터 첫 메시지까지 |
| 온보딩 개요 | [Onboarding Overview](https://docs.openclaw.ai/start/onboarding-overview) | 온보딩 프로세스 전체 흐름 |
| 설정 마법사 | [Wizard](https://docs.openclaw.ai/start/wizard) | 대화형 초기 설정 |
| 온보딩 상세 | [Onboarding](https://docs.openclaw.ai/start/onboarding) | 온보딩 설정 항목 상세 |
| OpenClaw 가이드 | [OpenClaw Guide](https://docs.openclaw.ai/start/openclaw) | 셀프호스팅 에이전트 가이드 |

## 설치 방법

| 방법 | 공식 문서 | 설명 |
|------|----------|------|
| 설치 개요 | [Install Overview](https://docs.openclaw.ai/install) | 설치 옵션 비교 |
| 인스톨러 | [Installer](https://docs.openclaw.ai/install/installer) | 공식 인스톨러 스크립트 |
| Docker | [Docker](https://docs.openclaw.ai/install/docker) | Docker 컨테이너로 실행 |
| Nix | [Nix](https://docs.openclaw.ai/install/nix) | Nix 패키지 매니저 |
| Ansible | [Ansible](https://docs.openclaw.ai/install/ansible) | Ansible 자동화 |
| Bun | [Bun](https://docs.openclaw.ai/install/bun) | Bun 런타임으로 직접 실행 |

## 호스팅 & 배포

| 플랫폼 | 공식 문서 | 설명 |
|--------|----------|------|
| Fly.io | [Fly](https://docs.openclaw.ai/install/fly) | Fly.io에 배포 |
| Hetzner | [Hetzner](https://docs.openclaw.ai/install/hetzner) | Hetzner VPS에 배포 |
| GCP | [GCP](https://docs.openclaw.ai/install/gcp) | Google Cloud에 배포 |
| macOS VM | [macOS VM](https://docs.openclaw.ai/install/macos-vm) | macOS VM으로 실행 |
| Railway | [Railway](https://docs.openclaw.ai/install/railway) | Railway PaaS에 배포 |
| Render | [Render](https://docs.openclaw.ai/install/render) | Render에 배포 |
| Northflank | [Northflank](https://docs.openclaw.ai/install/northflank) | Northflank에 배포 |
| VPS 일반 | [VPS](https://docs.openclaw.ai/vps) | 일반 VPS 배포 가이드 |

## 유지보수

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 업데이트 | [Updating](https://docs.openclaw.ai/install/updating) | 버전 업데이트 방법 |
| 마이그레이션 | [Migrating](https://docs.openclaw.ai/install/migrating) | 데이터 마이그레이션 |
| 삭제 | [Uninstall](https://docs.openclaw.ai/install/uninstall) | 완전 삭제 방법 |

## 개발자 설정

| 항목 | 공식 문서 | 설명 |
|------|----------|------|
| 개발 환경 | [Setup](https://docs.openclaw.ai/start/setup) | 개발 환경 구성 |
| 개발 채널 | [Development Channels](https://docs.openclaw.ai/install/development-channels) | 개발/테스트용 채널 |
| 부트스트래핑 | [Bootstrapping](https://docs.openclaw.ai/start/bootstrapping) | 에이전트 부트스트랩 파일 |
