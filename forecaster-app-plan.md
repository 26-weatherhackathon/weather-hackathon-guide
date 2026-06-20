# 「예보관 의사결정 체험」 개발 계획서

> 기상·기후 AI 해커톤 2026 · Vercel 배포 기준
> 참조 레포: `booboobook/booboobook` (Astro + Vercel, https://booboobook.aioia.ai)

---

## 1. 기술 스택

booboobook 레포와 동일한 스택을 채택해 팀 내 배포 경험을 재사용합니다.

| 역할 | 선택 | 근거 |
|---|---|---|
| 프레임워크 | **Astro** | booboobook과 동일, 정적 출력 + Island 인터랙션에 최적 |
| UI 인터랙션 | Astro Islands (Vanilla JS / Preact) | 지도·슬라이더·레이어 토글은 Island로 격리 |
| 스타일 | Tailwind CSS | 빠른 UI 반복, booboobook 컨벤션 유지 |
| 데이터 | 정적 JSON + PNG (사전 수집) | 실시간 API 호출 없음 → 현장 데모 안정성 확보 |
| 배포 | **Vercel** | booboobook과 동일 플랫폼, `vercel.json` 재사용 |
| 도메인 | `forecaster.aioia.ai` (제안) | booboobook.aioia.ai와 동일 패턴 |

---

## 2. 레포지토리 구조

booboobook의 Astro 디렉토리 컨벤션을 그대로 따릅니다.

```
forecaster-experience/
├── public/
│   └── data/
│       └── cases/
│           ├── 20220808-seoul/          # 케이스별 사전 수집 데이터
│           │   ├── meta.json            # 케이스 메타 + 정답(groundTruth)
│           │   ├── sat_ir.png           # 천리안 2A 적외 위성영상
│           │   ├── radar_-24h.png       # 레이더 합성영상 (시계열)
│           │   ├── radar_-12h.png
│           │   ├── radar_-06h.png
│           │   ├── radar_now.png
│           │   ├── asos.json            # ASOS 지상관측 시간자료
│           │   ├── model_kim.json       # KIM 수치모델 예측값
│           │   └── model_um.json        # UM 수치모델 예측값
│           ├── 20230714-daegu/
│           └── 20240915-jeju/
├── src/
│   ├── components/
│   │   ├── CaseCard.astro              # 케이스 선택 카드
│   │   ├── LayerViewer.astro           # 위성·레이더·모델 레이어 토글
│   │   ├── TimeSlider.astro            # -24h ~ 현재 시간 재생 슬라이더
│   │   ├── ModelCompare.astro          # 두 모델 나란히 비교 뷰
│   │   ├── ForecastInput.astro         # 예측 입력 (확률·형태·기온 슬라이더)
│   │   ├── EvidenceChecklist.astro     # 근거 데이터 체크박스
│   │   ├── ResultReveal.astro          # 실황 공개 + Brier 채점
│   │   ├── ReflectionInput.astro       # "무엇을 놓쳤나" 입력
│   │   └── ScoreDashboard.astro        # 누적 성장 대시보드
│   ├── layouts/
│   │   └── BaseLayout.astro            # 공통 헤더·푸터 (booboobook 패턴)
│   ├── pages/
│   │   ├── index.astro                 # 랜딩 + 케이스 라이브러리
│   │   ├── onboarding.astro            # 30초 데이터 유형 설명 + 확인 퀴즈
│   │   └── case/
│   │       └── [caseId].astro          # 동적 라우팅: 케이스별 체험 페이지
│   ├── lib/
│   │   ├── scoring.ts                  # Brier Score 채점 로직
│   │   ├── caseLoader.ts               # 케이스 JSON 로드 헬퍼
│   │   └── sessionStore.ts             # localStorage 기반 진행 상태 관리
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tailwind.config.mjs
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## 3. 개발 단계 (4주 스프린트)

### Phase 0 — 환경 세팅 (Day 1~2)

```bash
# booboobook과 동일한 초기화 패턴
npm create astro@latest forecaster-experience -- --template minimal
cd forecaster-experience
npx astro add tailwind
npx astro add vercel        # @astrojs/vercel 어댑터
git init && git remote add origin <repo-url>
```

`astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/static';

export default defineConfig({
  output: 'static',          // 정적 출력 — Vercel에 HTML/JS/PNG만 올라감
  adapter: vercel(),
  integrations: [tailwind()],
});
```

`vercel.json` (현재 레포 설정 참조):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro"
}
```

---

### Phase 1 — 데이터 수집 + 케이스 큐레이션 (Day 3~7)

교육적으로 의미 있는 4개 케이스를 사전 수집합니다.

| 케이스 ID | 날짜·지역 | 난이도 | 교육 포인트 |
|---|---|---|---|
| `20230714-daegu` | 2023-07-14 대구 | 쉬움 | 안정 고기압, 성공 경험 쌓기 |
| `20240622-seoul` | 2024-06-22 수도권 | 보통 | 오후 소나기, 레이더 vs 모델 |
| `20220808-seoul` | 2022-08-08 수도권 | 어려움 | 집중호우, KIM·UM 모델 불일치 |
| `20230911-jeju` | 2023-09-11 제주 | 함정 | 모델은 맑음, 레이더에 에코 |

**수집 스크립트 흐름** (`scripts/fetch-case.ts`):

```
기상청 API허브 → 위성영상 PNG 다운로드
기상청 API허브 → 레이더 합성영상 PNG (시간대별 6장)
공공데이터포털 → ASOS 시간자료 JSON
공공데이터포털 → 단기예보/수치모델 격자값 JSON
         ↓
public/data/cases/{caseId}/ 에 정적 파일로 저장
```

**케이스 메타 스키마** (`meta.json`):

```json
{
  "caseId": "20220808-seoul",
  "title": "수도권 집중호우",
  "difficulty": "hard",
  "tags": ["장마전선", "모델불일치", "국지호우"],
  "timeFrames": ["-24h", "-12h", "-06h", "-03h", "-01h", "now"],
  "groundTruth": {
    "precip": true,
    "precipType": "비",
    "precipAmount_mm": 381.5,
    "tMax_C": 26.0
  },
  "keyEvidence": ["radar", "asos_trend"],
  "expertNote": "KIM은 강수량 50mm, UM은 300mm 이상 예측으로 크게 엇갈렸고..."
}
```

---

### Phase 2 — 핵심 UI 컴포넌트 구현 (Day 8~16)

#### 2-1. 레이어 뷰어 (`LayerViewer.astro`)

- 위성·레이더·모델·지상관측 4개 탭 토글
- 시간 슬라이더와 연동 → 선택한 시각의 이미지·데이터 표시
- 모바일 대응 (터치 스와이프)

#### 2-2. 모델 비교 뷰 (`ModelCompare.astro`)

- KIM / UM 예측값을 좌·우로 나란히 표시
- 엇갈리는 수치를 빨간 강조색으로 자동 하이라이트
- "어느 모델을 선택하겠습니까?" 라디오 버튼 + 이유 입력

#### 2-3. 예측 입력 패널 (`ForecastInput.astro`)

```
강수 여부:   [ 없음 ──●────── 확실히 비 ]   0%  ~  100%
강수 형태:   ○ 비   ○ 눈   ○ 비·눈   ○ 없음
최고기온:    [ ──────●──── ]   (°C 범위 슬라이더)
```

- 확률 슬라이더 → 0~100% 정수값 → `f` (Brier 채점에 사용)
- 제출 전 근거 체크리스트 1개 이상 선택 필수

#### 2-4. Brier 채점 + 결과 공개 (`ResultReveal.astro`)

```typescript
// src/lib/scoring.ts
export function brierScore(f: number, o: 0 | 1): number {
  return Math.pow(f / 100 - o, 2);
}

export function toPoints(brier: number): number {
  return Math.round((1 - brier) * 100);
}

export function totalScore(precipPoints: number, typeMatch: boolean, tempDiff: number): number {
  const typePoints = typeMatch ? 100 : 0;
  const tempPoints = Math.max(0, 100 - tempDiff * 10); // ±1°C당 10점 감점
  return Math.round(precipPoints * 0.6 + typePoints * 0.2 + tempPoints * 0.2);
}
```

---

### Phase 3 — 학습 루프 + 상태 관리 (Day 17~21)

#### 진행 상태 (`sessionStore.ts`)

`localStorage`에 케이스별 결과를 누적 저장합니다. 서버 불필요, 오프라인 동작.

```typescript
interface CaseResult {
  caseId: string;
  timestamp: number;
  prediction: { precipProb: number; precipType: string; tMax: number };
  evidence: string[];         // 체크한 근거 데이터
  brierScore: number;
  totalScore: number;
  reflection: string;         // "무엇을 놓쳤나" 자유 입력
}
```

#### 성장 대시보드 (`ScoreDashboard.astro`)

- 풀이 순서별 점수 꺾은선 그래프 (Canvas API)
- 강점·약점 데이터 유형 집계 (레이더를 잘 활용하는가? 모델 불일치에 약한가?)
- 누적 Brier 평균 vs 무조건 50% 찍기 비교선

---

### Phase 4 — 온보딩 + 폴리싱 (Day 22~26)

#### 온보딩 (`onboarding.astro`)

30초 카드 슬라이드 (4장) + 확인 퀴즈 (3문항):

```
카드 1: 위성영상 → "구름의 두께와 온도를 봅니다"
카드 2: 레이더   → "지금 당장 비가 내리는 위치를 봅니다"
카드 3: 수치모델 → "앞으로 6~72시간 예측입니다 (불확실)"
카드 4: 지상관측 → "실제 관측소의 현재 수치입니다"
```

퀴즈 통과 → 케이스 라이브러리로 이동. 첫 방문 시 자동 진입.

#### 케이스 라이브러리 (`index.astro`)

```
난이도 필터: [ 전체 | 쉬움 | 보통 | 어려움 | 함정 ]

┌──────────────────┐  ┌──────────────────┐
│ ★☆☆  쉬움        │  │ ★★☆  보통        │
│ 대구 맑음 고기압 │  │ 수도권 오후 소나기│
│ 2023-07-14       │  │ 2024-06-22       │
│ [시작하기]       │  │ [시작하기]       │
└──────────────────┘  └──────────────────┘
```

완료한 케이스는 점수 배지 표시.

---

### Phase 5 — Vercel 배포 + 도메인 연결 (Day 27~28)

```bash
# 빌드 확인
npm run build && npm run preview

# Vercel 배포 (booboobook과 동일 절차)
vercel --prod
```

**Vercel 프로젝트 설정:**

| 항목 | 값 |
|---|---|
| Framework Preset | Astro |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | `.` |
| Node.js Version | 20.x |

**도메인 연결** (booboobook.aioia.ai 패턴):
- Vercel 대시보드 → Domains → `forecaster.aioia.ai` 추가
- DNS: CNAME `forecaster` → `cname.vercel-dns.com`

---

## 4. 데이터 준비 상세

### API 수집 흐름 (개발 시 1회 실행, 이후 정적 파일 사용)

```
기상청 API허브 (apihub.kma.go.kr)
  └── 위성 분야    → 천리안 2A 적외영상 PNG
  └── 레이더 분야  → HSR 합성영상 PNG (시간대별)
  └── 지상관측     → ASOS 시간자료 JSON

공공데이터포털 (data.go.kr)
  └── 단기예보 조회서비스 → JSON (강수·기온 예측격자값)
  └── 수치모델자료(경량화) → KIM / UM 비교용
```

### 사전 수집의 장점 (실현가능성 30점 직결)

- 현장(천안) 네트워크 장애와 무관하게 동작
- Vercel 정적 CDN 캐시로 전 세계 어디서나 빠른 로딩
- API 호출 한도(일 2,000~10,000건) 미소진
- 과거 날짜 → 실황 확정 → 즉각 채점 가능

---

## 5. 채점 로직 요약

```
강수 확률 점수 (60%):  Brier = (f/100 − o)²  →  100 − round(Brier × 100)
강수 형태 점수 (20%):  정답 일치 100점 / 불일치 0점
최고기온 점수 (20%):   차이 ΔT°C당 −10점 (0점 하한)

총점 = 강수점 × 0.6 + 형태점 × 0.2 + 기온점 × 0.2
```

예시:

| 예측 | 실황 | Brier | 강수점 | 총점 |
|---|---|---|---|---|
| 확률 90%, 비, 26°C | 비, 26°C | 0.01 | 99 | ~99 |
| 확률 90%, 비, 26°C | 맑음, 30°C | 0.81 | 19 | ~20 |
| 확률 50%, 비, 26°C | 비, 26°C | 0.25 | 75 | ~75 |

---

## 6. 심사 배점 대응

| 심사 항목 | 배점 | 기술적 구현 |
|---|---|---|
| 실현 가능성 | 30 | 정적 Astro 빌드 → `dist/` 폴더만 Vercel에 올라감, 서버리스 없음 |
| 체험·참여형 | 25 | 5단계 능동 루프, 즉각 Brier 채점, 레이어 토글·시간 재생 |
| 주제 적합성 | 20 | 기상청 4개 분야 실데이터 직접 사용, 실제 예보 5단계 재현 |
| 아이디어 독창성 | 15 | 확률적 의사결정 체험 + Brier Score 채점 (단순 퀴즈 아님) |
| 학습 효과 | 10 | 백워드 설계 목표 정렬, 누적 성장 추세 가시화 |

---

## 7. 작업 체크리스트

### 환경 세팅
- [ ] `npm create astro@latest` + Tailwind + Vercel 어댑터
- [ ] `vercel.json` 설정 (booboobook 참조)
- [ ] GitHub 레포 연결 + Vercel 자동 배포 설정

### 데이터 수집
- [ ] 기상청 API허브 인증키 발급
- [ ] 공공데이터포털 인증키 발급
- [ ] 케이스 4개 위성·레이더·ASOS·모델 데이터 수집
- [ ] `public/data/cases/` 에 정적 파일 배치
- [ ] `meta.json` groundTruth 값 검증 (실측 데이터 대조)

### 컴포넌트 개발
- [ ] `BaseLayout.astro` (헤더·푸터)
- [ ] `LayerViewer.astro` (4개 레이어 + 시간 슬라이더)
- [ ] `ModelCompare.astro` (KIM vs UM 나란히)
- [ ] `ForecastInput.astro` (확률·형태·기온 입력)
- [ ] `EvidenceChecklist.astro` (근거 체크박스)
- [ ] `ResultReveal.astro` (실황 공개 + 채점)
- [ ] `ReflectionInput.astro` (리플렉션 입력)
- [ ] `ScoreDashboard.astro` (누적 성장 그래프)

### 페이지
- [ ] `onboarding.astro` (4장 카드 + 퀴즈)
- [ ] `index.astro` (케이스 라이브러리)
- [ ] `case/[caseId].astro` (체험 메인 페이지)

### 채점·상태
- [ ] `scoring.ts` Brier Score 구현 + 단위 테스트
- [ ] `sessionStore.ts` localStorage 저장·불러오기

### 배포
- [ ] `npm run build` 오류 없이 통과
- [ ] Vercel 프로덕션 배포
- [ ] `forecaster.aioia.ai` 도메인 연결
- [ ] 모바일 반응형 확인
- [ ] 현장 오프라인 동작 확인 (네트워크 차단 상태에서 테스트)

---

## 참조

- booboobook 레포: `booboobook/booboobook` (Astro + Vercel, 동일 스택)
- 기상청 API허브: apihub.kma.go.kr
- 공공데이터포털: data.go.kr
- Astro 공식 Vercel 가이드: docs.astro.build/guides/deploy/vercel
