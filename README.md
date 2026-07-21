# 기상·기후 AI 해커톤 2026 — 개발·배포 가이드

웹 Claude Code(claude.ai/code) + GitHub + Vercel로, **설치·터미널 없이** 인터랙티브 기상 데이터 도구를 만들어 제출하는 **참가자용 가이드**입니다.

- 가이드(배포): https://weather-hackathon-guide.vercel.app
- 본문: `index.html`

## 가이드 구성

- 시작하기 → 만들기 → CLAUDE.md 추가 → 배포(Vercel) → 제출
- 팀 협업 PR (브랜치 → PR → 리뷰 → 머지)
- 심사 기준 · FAQ

## 빠른 시작

1. **GitHub 리포지토리 연결** — [GITHUB-SETUP-GUIDE.md](GITHUB-SETUP-GUIDE.md)를 참고해 Claude Code와 GitHub를 연결합니다.
2. **작업 시작** — 연결 후 해커톤 프로젝트 리포지토리에서 작업을 시작합니다.

## 참가자용 CLAUDE.md

가이드 "Step 3"에 참가자가 자기 저장소에 복사해 넣는 CLAUDE.md 템플릿이 있습니다.
핵심 규칙: **main 직접 푸시 금지**, 브랜치+PR (팀이면 1인 리뷰, 1인 팀이면 셀프 리뷰 후 머지).

## 운영

- 운영팀 저장소입니다. 변경은 PR + 코드오너 리뷰 후 머지 (`.github/CODEOWNERS`, `CLAUDE.md`).
- 출품작 데모(forecaster)는 별도 저장소 `weather-hackathon-demo`에서 관리합니다.

### 콘텐츠 단일 소스 (CLAUDE.md 예시)

`content/claude-md-example.md`가 CLAUDE.md 예시 텍스트의 유일한 소스입니다. `build.html`은 이 파일을 브라우저에서 직접 fetch해 표시합니다. `guide.md`(Notion 편집용 사본)는 텍스트를 복제하지 않고 이 파일을 가리키는 참조만 남겨 두므로, 어긋날 대상 자체가 없습니다. 예시 내용을 고치려면 `content/claude-md-example.md` 한 곳만 수정하면 됩니다.

## 기여

문서 수정은 `main` 대상 PR로만 진행합니다. 자세한 규칙은 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 문의

문제가 발생하면 해커톤 스태프에게 문의하세요.
