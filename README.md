# 예보관 의사결정 체험 (Forecaster Decision Experience)

> 기상·기후 AI 해커톤 2026 출품작 · Astro + Vercel

학습자를 예보관 의자에 앉혀, 실제 기상청 데이터로 확률적 판단을 내리고 실황과 대조해 채점받는 **단일 페이지 웹 체험 도구**입니다.

## 핵심 방향

1. **실데이터 정면 사용** — 기상청 API허브 + 공공데이터포털의 위성·레이더·ASOS·예보를 직접 수집·보존
2. **AI 비주얼** — 케이스 브리핑 일러스트·예보관 캐릭터·해설을 AI로 생성 (화면에 출처 라벨)
3. **난이도 곡선 3케이스** — easy → hard → trap 으로 "데이터를 의심하라"까지 설계

## 케이스

| 순서 | caseId | 상황 | 난이도 |
|---|---|---|---|
| 1 | `easy-highpressure` | 안정적 고기압, 맑음 | easy |
| 2 | `20220808-seoul` | 수도권 집중호우 | hard |
| 3 | `trap-echo` | 모델 맑음·레이더 에코 | trap |

태풍 케이스는 확장 슬롯(잠금 UI).

## 기술 스택

- **프레임워크**: Astro (정적 출력 + Islands)
- **스타일**: Tailwind CSS
- **데이터**: 정적 JSON + PNG (사전 수집 — 현장 데모 안정성)
- **채점**: Brier(강수확률) + 형태 + 기온 + 누적 추세 · `localStorage` 저장
- **배포**: Vercel (`vercel.json`, `api/*.js`)

## 데이터 출처

- **기상청 API허브** (apihub.kma.go.kr): GK2A 위성(IR/VIS/WV), HSR 레이더, ASOS/AWS, 레윈존데
- **공공데이터포털** (data.go.kr): 단기예보·초단기실황/예보·ASOS 시간자료

## 문서 · 데모

| 파일 | 내용 |
|---|---|
| `forecaster-app-plan.md` | 개발 계획·수상 전략 |
| `forecaster-build-spec.md` | 실행 명세 (AI 에이전트 실행용 SSOT) |
| `forecaster-ux-spec.md` | UX 명세 |
| `forecaster-data-utilization.md` | 데이터 활용·인터랙션 |

데모: `index.html` · `demo-forecast.html` · `demo-typhoon.html`

## 기여

변경은 `main` 대상 PR로만 진행하며, 코드오너 2인 승인 후 머지됩니다 (`.github/CODEOWNERS`).

## 라이선스

[MIT](LICENSE)
