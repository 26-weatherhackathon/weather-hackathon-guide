# 「예보관 의사결정 체험」 실행 명세서 (Build Spec v1.0)

> 기상·기후 AI 해커톤 2026 출품작 · **AI 에이전트 실행용 마스터 문서**
> 참조 스택: `booboobook/booboobook` (Astro + Vercel, https://booboobook.aioia.ai)
> 기반 설계: 「예보관 의사결정 체험」 백워드 설계 문서 (UbD 3-Stage)

---

## 0. 이 문서를 읽는 AI 에이전트에게 (How to Execute)

이 문서는 **읽고 바로 구현에 착수할 수 있도록** 작성됐다. 다음 규칙을 따른다.

1. **Single source of truth**: 파일 경로·타입·함수 시그니처·상수는 이 문서가 정답이다. 충돌 시 이 문서 우선.
2. **순서**: §13의 4주 일자별 계획(Day 1→28) 순으로 진행한다. 각 Task에는 **완료 기준(DoD)** 이 붙어 있다. DoD를 만족하지 못하면 다음 Task로 넘어가지 않는다.
3. **데이터의 진실성**: 판단 근거가 되는 수치(위성·레이더·ASOS·예보·실황)는 **반드시 기상청 실데이터**다. AI 생성물은 "분위기·일러스트·해설 문구"에만 쓰고, 화면에 출처 라벨을 단다.
4. **검증 미완 표시**: 본 문서에서 `⚠️검증필요`로 표시된 API 엔드포인트는 실제 호출로 응답 형식을 확인한 뒤 확정한다. 검증된 것은 `✅검증됨`.
5. **스코프 잠금**: §1의 잠금 스코프를 변경하지 않는다. 변경이 필요하면 작업을 멈추고 사람에게 질문한다.

### 확정된 3대 방향 (변경 불가)
- **① 실 API허브 데이터 정면 사용** — 원본 JSON 보존으로 증빙
- **② 화려한 AI 비주얼 대량 투입** — 케이스당 15~20장
- **③ 1케이스 완전체** — 「2022-08-08 수도권 집중호우」를 완성도 100%로

---

## 1. 제품 정의 (Locked Scope)

### 1.1 한 줄 정의
> 학습자를 예보관 의자에 앉혀, 실제 기상청 데이터로 확률적 판단을 내리고 실황과 대조해 채점받는 **단일 페이지 웹 체험 도구**.

### 1.2 잠금 스코프 (MVP = 데모에 반드시 들어가는 것)

| 구분 | 포함 (Must) | 제외 (Out of scope, v1.1 이후) |
|---|---|---|
| 케이스 | 「20220808-seoul」 1개 완전체 | 나머지 3개는 빈 슬롯(잠금 UI)으로만 노출 |
| 루프 | 온보딩→종관분석→모델검토→불확실성→판단→검증→리플렉션→대시보드 | 멀티플레이어, 리더보드 |
| 데이터 | 위성·레이더·ASOS·예보(2발표시각)·실황 실데이터 | 실시간 API 호출(전부 정적 사전수집) |
| 채점 | Brier(강수확률) + 형태 + 기온 합산 | 풍속·습도 등 추가 변수 |
| AI | 이미지 15~20장 + Claude 리플렉션 피드백 | 음성, 실시간 이미지 생성 |
| 저장 | localStorage 단일 기기 | 서버 계정·로그인 |

### 1.3 타깃 & 디바이스
- 학습자: 중3~고1 + 일반 시민. 전공 지식 0 가정.
- 1순위 디바이스: **데스크톱/태블릿 가로(현장 부스 키오스크)**. 2순위: 모바일 세로(반응형).
- 1회 체험 소요: **8~12분** (온보딩 1.5분 + 케이스 6~9분 + 대시보드 1분).

### 1.4 성공 기준 (제품 레벨 DoD)
- [ ] 네트워크 차단 상태에서도 전체 루프가 끝까지 작동한다(정적).
- [ ] 위성·레이더·ASOS·예보·실황이 모두 실데이터이고, 화면에서 원본 출처를 확인할 수 있다.
- [ ] 제출 시 1초 이내 Brier 채점 결과가 나온다.
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 90 (데스크톱).
- [ ] 첫 방문자가 안내 없이 스스로 한 케이스를 완주할 수 있다(사용성 테스트 3명 통과).

---

## 2. 기술 스택 (정확한 버전)

booboobook과 동일 계열. 버전은 2026-06 기준 최신 안정.

| 영역 | 선택 | 버전(권장) | 비고 |
|---|---|---|---|
| 런타임 | Node.js | 20.x LTS | Vercel 빌드/함수 런타임 일치 |
| 프레임워크 | Astro | ^4.x | `output: 'static'` |
| 인터랙션 | Preact (astro islands) | `@astrojs/preact` ^4 | 슬라이더·뷰어 등 상태 컴포넌트만 island |
| 스타일 | Tailwind CSS | `@astrojs/tailwind` ^5 | 디자인 토큰 §12 |
| 타입 | TypeScript | ^5.x | `strict: true` |
| 차트 | 직접 Canvas 또는 `chart.js` ^4 | 대시보드 추세선 | 의존성 최소화 위해 Canvas 우선 |
| 배포 | Vercel | `@astrojs/vercel/static` | 정적 + `api/` 서버리스 |
| AI 텍스트 | Anthropic SDK | `@anthropic-ai/sdk` 최신 | 모델 `claude-sonnet-4-6` (리플렉션 피드백) |
| 폰트 | Pretendard | v1.3.9 CDN | 기존 가이드와 통일 |
| 패키지매니저 | npm | - | booboobook 컨벤션 |

### 2.1 의존성 설치 (Day 1)
```bash
npm create astro@latest forecaster-experience -- --template minimal --typescript strict
cd forecaster-experience
npx astro add preact tailwind vercel       # 대화형 프롬프트는 모두 yes
npm i @anthropic-ai/sdk
npm i -D vitest @types/node
```

### 2.2 환경변수 (.env.local / Vercel Project Settings)
```
KMA_API_KEY=          # 공공데이터포털 serviceKey (단기예보·ASOS) — forecast.js와 동일
KMA_HUB_AUTHKEY=      # 기상청 API허브 authKey (위성·레이더)
ANTHROPIC_API_KEY=    # Claude 리플렉션 피드백용 (서버리스에서만 사용, 클라이언트 노출 금지)
```
> 데이터 수집 스크립트(`scripts/`)는 로컬에서 키를 사용하고, **결과 정적 파일만 커밋**한다. 런타임에는 위성·레이더·예보 키가 필요 없다(정적). `ANTHROPIC_API_KEY`만 런타임 서버리스에서 사용.

---

## 3. 레포지토리 구조 (전체 트리)

```
forecaster-experience/
├── public/
│   ├── data/cases/20220808-seoul/        # 실데이터 (정적)
│   │   ├── meta.json                     # 케이스 메타 + groundTruth (§5.1)
│   │   ├── satellite/ir_{0..5}.png       # 천리안2A 적외 시계열 6장
│   │   ├── radar/hsr_{0..5}.png          # HSR 합성영상 시계열 6장
│   │   ├── asos.json                     # ASOS 시간자료 추세 (§5.2)
│   │   ├── model_A.json                  # 0200 발표 단기예보 (§5.3)
│   │   ├── model_B.json                  # 0800 발표 단기예보 (§5.3)
│   │   └── raw/                           # 원본 API 응답 (증빙용, 빌드 제외)
│   │       ├── sat_raw.json  radar_raw.json  asos_raw.json
│   │       ├── fcst_0200_raw.json  fcst_0800_raw.json  truth_raw.json
│   ├── ai/cases/20220808-seoul/          # AI 비주얼 (§10)
│   │   ├── briefing.webp
│   │   ├── forecaster_{thinking,confident,surprised}.webp
│   │   ├── stage_bg_{1..5}.webp
│   │   ├── result_seoul_flood.webp
│   │   └── overlay_sat.webp  overlay_radar.webp
│   ├── ai/badges/{rookie,junior,senior,expert,chief}.webp
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── ui/                            # 무상태 프리미티브
│   │   │   ├── Card.astro  Button.astro  Badge.astro  Tooltip.astro
│   │   │   └── SourceTag.astro            # "출처: 기상청 API허브" 라벨
│   │   ├── viewer/
│   │   │   ├── LayerViewer.tsx            # (island) 4레이어 토글 + 시간 슬라이더
│   │   │   ├── TimeSlider.tsx             # (island) -24h~now 재생
│   │   │   └── ModelCompare.tsx           # (island) A/B 발표시각 비교
│   │   ├── decision/
│   │   │   ├── ForecastInput.tsx          # (island) 확률·형태·기온 입력
│   │   │   ├── EvidenceChecklist.tsx      # (island) 근거 체크
│   │   │   └── ConfidenceMeter.tsx        # (island) 확률→자신감 시각화
│   │   ├── result/
│   │   │   ├── ResultReveal.tsx           # (island) 실황 공개 + Brier 애니메이션
│   │   │   ├── ScoreBreakdown.tsx         # 점수 3분할(확률/형태/기온)
│   │   │   └── ReflectionInput.tsx        # (island) 리플렉션 + Claude 피드백
│   │   ├── dashboard/
│   │   │   ├── GrowthChart.tsx            # (island) Canvas 추세선
│   │   │   └── BadgeShelf.tsx             # 등급 배지
│   │   ├── onboarding/
│   │   │   ├── ConceptCards.tsx           # (island) 4장 카드 슬라이드
│   │   │   └── ConceptQuiz.tsx            # (island) 3문항 확인 퀴즈
│   │   └── shell/
│   │       ├── StageStepper.astro         # 5단계 진행 표시
│   │       └── ForecasterAvatar.tsx       # 표정 바뀌는 예보관 아바타
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro                    # 랜딩 + 케이스 라이브러리
│   │   ├── onboarding.astro
│   │   └── case/[caseId].astro            # 체험 메인 (단계 상태머신)
│   ├── lib/
│   │   ├── types.ts                       # 전 타입 정의 (§5)
│   │   ├── scoring.ts                     # Brier 채점 (§6, 전체 코드)
│   │   ├── scoring.test.ts                # vitest 단위 테스트
│   │   ├── session.ts                     # localStorage 상태 (§7, 전체 코드)
│   │   ├── caseLoader.ts                  # 케이스 JSON 로더
│   │   └── grade.ts                       # 점수→등급 매핑
│   ├── stores/
│   │   └── caseStore.ts                   # 단계 진행 상태(@preact/signals)
│   └── styles/global.css
├── api/
│   └── reflect.js                         # Claude 리플렉션 피드백 (§11)
├── scripts/
│   ├── fetch-case.ts                      # 실데이터 수집 (§4, 전체 코드)
│   ├── fetch-satellite.ts  fetch-radar.ts # 위성·레이더 영상
│   └── build-meta.ts                      # raw → meta.json 가공
├── tests/
│   └── e2e.spec.ts                        # (선택) Playwright 스모크
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── vercel.json
├── package.json
└── README.md
```

---

## 4. 데이터 계층 — 실 API허브 수집 (코드 포함)

### 4.1 사용 API 정리

| # | 데이터 | 엔드포인트 | 키 | 상태 |
|---|---|---|---|---|
| A | 단기예보(모델 A/B) | `apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst` | serviceKey | ✅검증됨 (forecast.js) |
| B | ASOS 시간자료 | `apis.data.go.kr/1360000/AsosHourlyInfoService/getWthrDataList` | serviceKey | ⚠️검증필요 |
| C | ASOS 일자료(실황) | `apis.data.go.kr/1360000/AsosDalyInfoService/getWthrDataList` | serviceKey | ⚠️검증필요 |
| D | 위성 GK2A 적외 | API허브 위성 영상 API (`apihub.kma.go.kr` 위성 분야) | authKey | ⚠️검증필요 |
| E | 레이더 HSR 합성 | API허브 레이더 영상 API (`apihub.kma.go.kr` 레이더 분야) | authKey | ⚠️검증필요 |

> **Day 3 최우선 Task**: B~E를 실제 1회씩 호출해 응답 형식을 확정하고 이 표를 ✅로 갱신한다.
> 위성·레이더 영상 API가 막히면 §16 리스크 대응(해당 레이어만 AI 재현)으로 전환.

### 4.2 "모델 불일치"를 실데이터로 만드는 방법 (핵심 트릭)

KIM/UM 원시 격자는 일반 참가자가 받기 어렵다. 대신 **동일 날짜를 두 발표시각으로 호출**한다.

- **모델 A** = 2022-08-07 **23시 발표**(전날 밤, 호우 본격화 전) 단기예보 → 강수확률을 낮/보통으로 봄
- **모델 B** = 2022-08-08 **08시 발표**(당일 아침, 호우 진행 중) 단기예보 → 강수확률 급상승

두 발표가 **같은 시점(8/8 오후)을 다르게 예측**한 차이가 곧 "가이던스가 흔들린 순간"이다. 이는 100% 실 기상청 데이터이며, 학습자는 "더 최신 발표 + 레이더 에코 발달"을 근거로 B를 선택하는 판단을 경험한다.

> `getVilageFcst`는 과거 base_date/base_time 조회에 제한이 있을 수 있다(⚠️). Day 3에 2022-08 과거 조회 가능 여부를 먼저 확인하고, 불가 시 **§16-A 대응**: 보존된 당시 예보 캡처/공공 아카이브 또는 최근 유사 호우일로 케이스 날짜 치환(교육 목적상 동등). 어떤 경우든 "실제 발표 예보 2종"이라는 구조는 유지.

### 4.3 수집 스크립트 — `scripts/fetch-case.ts`

```ts
// scripts/fetch-case.ts
// 실행: npx tsx scripts/fetch-case.ts 20220808-seoul
// .env.local 의 KMA_API_KEY(serviceKey), KMA_HUB_AUTHKEY 사용
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SERVICE_KEY = process.env.KMA_API_KEY!;
const HUB_KEY = process.env.KMA_HUB_AUTHKEY!;
const SEOUL = { nx: 60, ny: 127 }; // forecast.js와 동일 격자

const caseId = process.argv[2] ?? '20220808-seoul';
const OUT = join('public/data/cases', caseId);
const RAW = join(OUT, 'raw');

async function getVilageFcst(baseDate: string, baseTime: string) {
  const url =
    `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst` +
    `?serviceKey=${encodeURIComponent(SERVICE_KEY)}` +
    `&pageNo=1&numOfRows=1000&dataType=JSON` +
    `&base_date=${baseDate}&base_time=${baseTime}` +
    `&nx=${SEOUL.nx}&ny=${SEOUL.ny}`;
  const r = await fetch(url);
  const j = await r.json();
  const items = j?.response?.body?.items?.item;
  if (!items) throw new Error('getVilageFcst 응답 오류: ' + JSON.stringify(j).slice(0, 300));
  return { raw: j, items };
}

// 단기예보 items → 모델 요약(POP 강수확률, PTY 강수형태, TMX 최고기온, PCP 강수량)
function summarizeModel(items: any[]) {
  const pick = (cat: string) =>
    items.filter((i) => i.category === cat)
         .map((i) => ({ d: i.fcstDate, t: i.fcstTime, v: i.fcstValue }));
  return {
    pop: pick('POP'),    // 강수확률 %
    pty: pick('PTY'),    // 강수형태 코드(0없음 1비 2비눈 3눈 4소나기)
    tmx: pick('TMX'),    // 일최고기온
    pcp: pick('PCP'),    // 1시간 강수량
    sky: pick('SKY'),    // 하늘상태(1맑음 3구름많음 4흐림)
  };
}

async function main() {
  await mkdir(RAW, { recursive: true });

  // 모델 A: 전날 23시 발표 / 모델 B: 당일 08시 발표
  const A = await getVilageFcst('20220807', '2300');
  const B = await getVilageFcst('20220808', '0800');

  await writeFile(join(RAW, 'fcst_2300_raw.json'), JSON.stringify(A.raw, null, 2));
  await writeFile(join(RAW, 'fcst_0800_raw.json'), JSON.stringify(B.raw, null, 2));
  await writeFile(join(OUT, 'model_A.json'),
    JSON.stringify({ baseDate: '20220807', baseTime: '2300', label: '8/7 23시 발표', ...summarizeModel(A.items) }, null, 2));
  await writeFile(join(OUT, 'model_B.json'),
    JSON.stringify({ baseDate: '20220808', baseTime: '0800', label: '8/8 08시 발표', ...summarizeModel(B.items) }, null, 2));

  console.log('✅ 모델 A/B 저장 완료. 다음: fetch-satellite.ts, fetch-radar.ts, ASOS 수집');
}
main().catch((e) => { console.error(e); process.exit(1); });
```

> ASOS(B·C)와 위성·레이더(D·E)는 응답 형식 확정 후 `fetch-satellite.ts` / `fetch-radar.ts` / ASOS 블록을 동일 패턴으로 채운다. 모든 호출은 **원본을 `raw/`에 먼저 저장**하고 가공본을 만든다(증빙 원칙).

### 4.4 영상 처리 규칙
- 위성·레이더 원본 영상을 받아 **서울 수도권으로 크롭** + **WebP 변환**(품질 80, 폭 ≤ 1024px)으로 용량 최적화.
- 시계열은 6프레임으로 고정(`-24h, -18h, -12h, -6h, -3h, now`), 파일명 인덱스 `0..5`.
- 각 프레임에 촬영 시각(UTC/KST)을 메타에 기록(§5.1 `timeFrames`).

---

## 5. 데이터 스키마 (TypeScript, `src/lib/types.ts`)

### 5.0 전체 타입 정의
```ts
// src/lib/types.ts
export type Difficulty = 'easy' | 'normal' | 'hard' | 'trap';
export type PrecipType = '없음' | '비' | '비/눈' | '눈' | '소나기';

export interface ForecastSeriesPoint { d: string; t: string; v: string; }
export interface ModelForecast {
  baseDate: string; baseTime: string; label: string;
  pop: ForecastSeriesPoint[];  // 강수확률 %
  pty: ForecastSeriesPoint[];  // 강수형태 코드
  tmx: ForecastSeriesPoint[];  // 최고기온
  pcp: ForecastSeriesPoint[];  // 1시간 강수량
  sky: ForecastSeriesPoint[];  // 하늘상태
}

export interface AsosPoint {
  time: string;        // 'YYYY-MM-DD HH:mm'
  ta: number;          // 기온
  rn: number;          // 강수량(mm)
  hm: number;          // 습도(%)
  pa: number;          // 현지기압(hPa)
  ws: number;          // 풍속(m/s)
}

export interface GroundTruth {
  precip: boolean;
  precipType: PrecipType;
  precipAmount_mm: number;
  tMax_C: number;
  source: string;      // 'ASOS 일자료 (서울 108 지점)'
}

export type LayerKey = 'satellite' | 'radar' | 'asos' | 'model';
export interface CaseMeta {
  caseId: string;
  title: string;
  difficulty: Difficulty;
  tags: string[];
  region: { name: string; nx: number; ny: number };
  timeFrames: { idx: number; label: string; kst: string }[];
  layers: {
    satellite: string[];   // ir_0..5.png 경로
    radar: string[];       // hsr_0..5.png 경로
    asosPath: string;      // asos.json
    modelAPath: string; modelBPath: string;
  };
  ai: {
    briefing: string; stageBg: string[];
    avatar: { thinking: string; confident: string; surprised: string };
    result: string; overlays: { sat: string; radar: string };
  };
  keyEvidence: LayerKey[];     // 정답 핵심 근거
  groundTruth: GroundTruth;
  expertNote: string;
  dataSource: Record<string, string>;  // 레이어별 출처 문구(SourceTag)
}

// 학습자 입력 & 결과
export interface Prediction {
  precipProb: number;     // 0~100
  precipType: PrecipType;
  tMax: number;           // °C
}
export interface CaseResult {
  caseId: string;
  timestamp: number;
  prediction: Prediction;
  evidence: LayerKey[];
  chosenModel: 'A' | 'B' | null;
  scores: { precip: number; type: number; temp: number; total: number; brier: number };
  reflection: string;
  aiFeedback?: string;
}
```

### 5.1 `meta.json` 실값 예시 (집중호우)
```json
{
  "caseId": "20220808-seoul",
  "title": "수도권 집중호우",
  "difficulty": "hard",
  "tags": ["장마전선", "정체전선", "모델불일치", "국지호우"],
  "region": { "name": "서울", "nx": 60, "ny": 127 },
  "timeFrames": [
    { "idx": 0, "label": "-24h", "kst": "2022-08-07 18:00" },
    { "idx": 1, "label": "-18h", "kst": "2022-08-08 00:00" },
    { "idx": 2, "label": "-12h", "kst": "2022-08-08 06:00" },
    { "idx": 3, "label": "-6h",  "kst": "2022-08-08 12:00" },
    { "idx": 4, "label": "-3h",  "kst": "2022-08-08 15:00" },
    { "idx": 5, "label": "now",  "kst": "2022-08-08 18:00" }
  ],
  "layers": {
    "satellite": ["/data/cases/20220808-seoul/satellite/ir_0.png", "...ir_5.png"],
    "radar": ["/data/cases/20220808-seoul/radar/hsr_0.png", "...hsr_5.png"],
    "asosPath": "/data/cases/20220808-seoul/asos.json",
    "modelAPath": "/data/cases/20220808-seoul/model_A.json",
    "modelBPath": "/data/cases/20220808-seoul/model_B.json"
  },
  "keyEvidence": ["radar", "asos"],
  "groundTruth": {
    "precip": true, "precipType": "비",
    "precipAmount_mm": 381.5, "tMax_C": 26.0,
    "source": "ASOS 일자료 (서울 108 지점)"
  },
  "expertNote": "8/7 23시 발표는 강수확률을 보통 수준으로 봤으나, 8/8 08시 발표에서 급상승했다. 레이더 에코가 수도권 남부에서 정체·발달하는 추세와 ASOS 시간강수량 급증이 결정적 단서였다.",
  "dataSource": {
    "satellite": "기상청 API허브 · 천리안위성 2A호 적외영상",
    "radar": "기상청 API허브 · 레이더 HSR 합성영상",
    "asos": "공공데이터포털 · ASOS 시간자료(getWthrDataList)",
    "model": "공공데이터포털 · 단기예보(getVilageFcst) 2개 발표시각",
    "groundTruth": "공공데이터포털 · ASOS 일자료"
  }
}
```

### 5.2 `asos.json` 형식
```json
{ "station": "108 서울", "points": [
  { "time": "2022-08-08 12:00", "ta": 24.1, "rn": 12.0, "hm": 95, "pa": 1002.3, "ws": 3.1 }
] }
```

### 5.3 `model_A.json` / `model_B.json` 형식
§4.3 `summarizeModel` 출력과 동일(`pop/pty/tmx/pcp/sky` 시계열 + `label`).

---

*(이어서 §6 채점 엔진 ~ §16 리스크 + 부록이 계속됩니다. 다음 파트에서 작성)*
