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

### 콘텐츠 동기화 (CLAUDE.md 예시)

`content/claude-md-example.md`가 CLAUDE.md 예시 텍스트의 단일 소스입니다. `build.html`은 이 파일을 브라우저에서 직접 fetch하고, `guide.md`는 `node scripts/generate-guide.js`로 생성합니다.

로컬에서 한 번만 아래를 실행해 두면, 커밋할 때마다 guide.md가 자동으로 갱신됩니다.

```
git config core.hooksPath .githooks
```

깜빡하고 그냥 커밋해도 PR에서 CI(`guide.md sync check`)가 어긋남을 잡아냅니다.

## 기여

문서 수정은 `main` 대상 PR로만 진행합니다. 자세한 규칙은 [CLAUDE.md](CLAUDE.md)를 참고하세요.

## 문의

문제가 발생하면 해커톤 스태프에게 문의하세요.
