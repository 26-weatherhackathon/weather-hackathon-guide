# 기상·기후 AI 해커톤 2026 — 예보관 의사결정 체험

> **학습자를 기상청 예보관 의자에 앉혀, 진짜 날씨 데이터로 확률적 판단을 내리고
> 실황과 대조해 채점받는 웹 체험 도구.**

---

## 이 레포의 구조

```
weather-hackathon-guide/
├── docs/          기획·설계 문서 (먼저 여기부터)
├── demos/         기존 HTML 프로토타입 (기상 가이드·데모)
├── app/           출품작 Astro 앱 (Stage A1에서 초기화 예정)
├── api/           기존 Vercel serverless (forecast.js)
└── vercel.json
```

---

## 시작하는 법 — 문서 읽는 순서

1. [`docs/개요.md`](docs/개요.md) — 전체 큰 그림 (5분)
2. [`docs/forecaster-dev-sequence.md`](docs/forecaster-dev-sequence.md) — 오늘 어떤 세션 할지
3. 그 세션이 지목하는 `docs/forecaster-build-spec.md` 섹션만 읽고 구현

---

## 출품작 개요

- **핵심**: 3티어 케이스 풀(easy/hard/trap)에서 세션마다 랜덤 추첨 → 암기 방지·재플레이
- **데이터**: 기상청 API허브(위성·레이더) + 공공데이터포털(예보·ASOS) 실데이터 정적 박제
- **채점**: Brier Score — 확신하고 틀리면 크게 감점, 애매하면 적당히
- **AI 활용**: 케이스당 15~20장 비주얼 + 리플렉션 피드백 + WeatherAssistant 챗봇
- **배포**: Vercel (Astro 정적 출력 + Edge Functions)

---

## 기존 데모 (demos/)

| 파일 | 내용 |
|---|---|
| `demos/index.html` | 기상·기후 AI 해커톤 가이드 메인 |
| `demos/demo-forecast.html` | 날씨 예보 프로토타입 |
| `demos/demo-typhoon.html` | 태풍 시각화 프로토타입 |
