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

> **스코프 결정(확정): 3케이스 난이도 곡선 + 인터랙션·연출 크래프트 집중.**
> 1케이스는 성장 대시보드·난이도 곡선·확률적 사고 반복을 증명하지 못해 "원트릭 장난감"으로 보인다.
> 쉬움→어려움→함정 3개를 갖춰야 학습 설계가 살고 "커리큘럼"으로 보인다. 대신 케이스당 데이터 작업이
> 반복되므로 이것이 4주 공수의 본체다. 크래프트(연출·모션·인터랙션)에 추가 공수를 배분한다.

| 구분 | 포함 (Must) | 제외 (Out of scope, v1.1 이후) |
|---|---|---|
| 케이스 | **3개 난이도 곡선** (§1.5) 모두 실데이터 완전체 | 4번째(태풍)는 빈 슬롯 잠금 UI로 확장성만 |
| 루프 | 온보딩→종관분석→모델검토→불확실성→판단→검증→리플렉션→대시보드 | 멀티플레이어, 리더보드 |
| 데이터 | 위성·레이더·ASOS·예보(2발표시각)·실황 실데이터 ×3케이스 | 실시간 API 호출(전부 정적 사전수집) |
| 채점 | Brier(강수확률) + 형태 + 기온 합산 + **누적 추세** | 풍속·습도 등 추가 변수 |
| 크래프트 | 결과 반전 연출·점수 카운트업·레이더 타임라인 인터랙션·모션 폴리시 | (집중 투자 영역) |
| AI | 이미지 케이스당 15~20장 + Claude 리플렉션 피드백 + **문맥 인식 교육 챗봇** | 음성, 실시간 이미지 생성 |
| 저장 | localStorage 단일 기기, 케이스별 결과 누적 | 서버 계정·로그인 |

### 1.5 3케이스 난이도 곡선 (확정)
| 순서 | caseId | 상황 | 난이도 | 학습 포인트 | 핵심 근거 |
|---|---|---|---|---|---|
| 1 | `easy-highpressure` | 안정적 고기압, 맑고 건조 | easy | 데이터 읽기 기초·성공 경험 | 위성(맑음)·모델 일치 |
| 2 | `20220808-seoul` | 수도권 집중호우 | hard | 모델 불일치·확률적 사고 | 레이더·ASOS |
| 3 | `trap-echo` | 모델은 맑음, 레이더엔 에코 | trap | 관측 vs 모델 충돌·예보관 보정 | 레이더(관측 우선) |
> 난이도 곡선 = 학습 곡선. 1로 성공 경험 → 2에서 갈등 → 3에서 "데이터를 의심하라". 대시보드가 세 점을 잇는다.
> 케이스 1·3의 날짜·지점은 Day 3 데이터 탐색에서 **모델이 실제로 일치/충돌한 날**로 확정한다(실데이터 우선).

### 1.3 타깃 & 디바이스
- 학습자: 중3~고1 + 일반 시민. 전공 지식 0 가정.
- 1순위 디바이스: **데스크톱/태블릿 가로(현장 부스 키오스크)**. 2순위: 모바일 세로(반응형).
- 1회 체험 소요: **케이스당 6~9분 ×3 + 온보딩 1.5분 + 대시보드 1분.** 1케이스만 해도 완결, 3케이스 완주 시 성장 곡선 체감.

### 1.4 성공 기준 (제품 레벨 DoD)
- [ ] 네트워크 차단 상태에서도 전체 루프가 끝까지 작동한다(정적).
- [ ] **3케이스 모두** 위성·레이더·ASOS·예보·실황이 실데이터이고 원본 출처를 확인할 수 있다.
- [ ] 난이도 곡선이 체감된다(1 성공→2 갈등→3 반전). 대시보드가 3개 결과를 추세로 잇는다.
- [ ] 제출 시 1초 이내 Brier 채점 + **결과 반전 연출**(정적 1.2s→실황→점수 카운트업)이 작동한다.
- [ ] Lighthouse Performance ≥ 90, Accessibility ≥ 90 (데스크톱).
- [ ] 첫 방문자가 안내 없이 스스로 완주한다(사용성 테스트 3명 통과).
- [ ] §11(UX) 안티-제너릭 검수 통과 — "AI가 뱉은 웹" 신호 0개.

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
│   │   ├── assistant/
│   │   │   └── WeatherAssistant.tsx       # (island) 문맥 인식 기상 교육 챗봇 (§5-E)
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
│   ├── reflect.js                         # Claude 리플렉션 피드백 (§11)
│   └── chat.js                            # WeatherAssistant 스트리밍 엔드포인트 (§5-E)
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

## 5-C. 크래프트 집중 영역 (Interaction & 연출 — "허접해 보이지 않기"의 핵심)

> 기능 목록은 하루면 만든다. **하루짜리와 수상작을 가르는 건 이 섹션의 디테일이다.**
> 아래 5개는 "있다/없다"가 아니라 "얼마나 공들였나"로 평가되는 항목. 별도 폴리시 일정(§13 Week 4)을 배정한다.

### C1. 결과 반전 연출 (ResultReveal) — 제품의 클라이맥스
실황·점수를 동시에 까지 않는다. **3비트 시퀀스**로 긴장을 만든다.
```
beat 1 (0.0s)  "그날, 실제로는…"  텍스트만, 화면 정적
beat 2 (1.2s)  실황 일러스트 페이드인 + 수치(381.5mm) 타이프온
beat 3 (2.0s)  점수 0→N 카운트업(emphasized easing) + 구간색 채움
beat 4 (2.8s)  반사실 한 줄("50%였다면 75점") 슬라이드업
```
- 카운트업은 `requestAnimationFrame`, 600ms, easeOutBack. 숫자는 mono 폰트.
- 맞혔을 때/틀렸을 때 연출 톤 분기: 고득점=차분한 확정음 느낌의 정지, 저득점=과장 없이 담담하게(§8 보이스).
- `prefers-reduced-motion`: 시퀀스 제거하고 최종 상태 즉시 표시.

### C2. 레이더 타임라인 인터랙션 (LayerViewer) — 몰입의 핵심
단순 이미지 교체가 아니라 **"내가 시간을 돌린다"는 감각**.
- 슬라이더 드래그 시 프레임 즉시 스크럽(6장 프리로드, 디코드 완료 후 활성화).
- 재생(▶) 시 2fps 루프 + 진행 위치 표시. 에코 발달 구간에 옅은 마커.
- 스크럽 중 현재 프레임의 KST 타임스탬프가 mono로 실시간 갱신(관제실 모티프).
- 호버 시 해당 시각 ASOS 강수량 미니 수치 동반(데이터 교차).

### C3. 모델 불일치 하이라이트 (ModelCompare) — 갈등의 시각화
- 두 발표 패널에서 **값이 다른 항목만** 자동 감지해 `--warn`로 강조 + 차이 배지(↑30%).
- 일치 항목은 옅게 가라앉혀 대비. "어디서 갈렸나"가 0.5초 안에 읽히게.
- 선택 시 고른 쪽 패널이 살짝 부상(translateY -4px + 보더 2px), 반대쪽 디밍.

### C4. 슬라이더의 무게감 (ForecastInput) — 결단의 촉감
- 확률 슬라이더에 ConfidenceMeter 연동: 끌수록 라벨 변화(애매함↔확신)와 미세 햅틱(모바일 `navigator.vibrate`).
- 양 끝(0/100) 근처에서 살짝 저항감(스냅 아님, 시각적 강조).
- 제출 버튼: 근거 미체크 시 비활성, 충족 순간 부드럽게 활성화 전이(색·그림자 200ms).

### C5. 단계 전환 & 진행감 (StageStepper)
- 단계 이동은 리로드 없이 가로 슬라이드 전환(enter 320ms, 다음 단계 배경 프리로드).
- StageStepper의 완료 단계는 체크 마이크로 애니메이션. 현재 단계 강조.
- 케이스 완료 시 대시보드로의 전환에 등급 배지 획득 모먼트(절제된 1회 연출).

### 크래프트 DoD
- [ ] C1 시퀀스가 의도한 타이밍으로 재생되고 reduced-motion 폴백 동작
- [ ] C2 스크럽이 끊김 없이(프레임 프리로드) 동작, 타임스탬프 갱신
- [ ] C3 불일치 자동 하이라이트가 3케이스 데이터 모두에서 정확
- [ ] C4 제출 게이팅·전이가 자연스럽고 접근성 유지
- [ ] 60fps 유지(저사양 노트북 기준), 레이아웃 점프 0

---

## 5-D. 누적 대시보드 (3케이스로 비로소 의미를 갖는 화면)
- 케이스 3개 결과를 **점수 추세선**으로 연결(Canvas). x축=풀이 순서, y축=총점.
- 비교 기준선: "안전하게 매번 50%" 가상선과 내 곡선을 겹쳐 표시 → 확률적 사고의 이득 가시화.
- 데이터 유형별 강·약점: 케이스별 `keyEvidence`를 봤는지로 "레이더를 잘 본다/모델 의존이 강하다" 집계.
- 1·2케이스만 풀어도 부분 표시(빈 상태 금지, 진행도에 맞춰 점진 노출).

---

---

## 5-E. WeatherAssistant — 문맥 인식 기상 교육 챗봇

### E0. 목적과 원칙

학습자가 체험 도중 "이 빨간 에코가 뭔가요?", "강수확률을 높게 줘야 하나요?" 같은 자연어 질문을 하면 **현재 케이스·단계·활성 레이어·시각**에 맞게 2~4문장으로 답하는 교육 보조 챗봇.

핵심 제약 (시스템 프롬프트에 하드코딩):
1. **정답·예측값은 절대 알려주지 않는다.** "~이 뜻하므로 ~를 고려해보세요" 수준.
2. **탈문맥 금지.** 현재 활성 레이어·케이스와 연결해서만 설명한다.
3. **중학생 언어.** 전문 용어는 괄호에 한 번만 풀이.
4. **2~4문장 이내.** 초과 시 잘라내고 "더 궁금하면 물어보세요"로 마무리.
5. **출처 자연스럽게.** 기상청 실 관측·예보 데이터임을 1문장 안에 녹인다.

### E1. 컴포넌트 — `src/components/assistant/WeatherAssistant.tsx`

```tsx
// (Preact island — client:visible로 지연 로드)
interface WeatherAssistantProps {
  caseId: string;
  caseTitle: string;
  difficulty: Difficulty;
  // 아래 세 값은 caseStore signals로 구독 (props 아님)
  // activeLayer: Signal<LayerKey>
  // activeTimeIdx: Signal<number>
  // currentStage: Signal<1|2|3|4|5>
}
```

UI 구조:
- **우하단 FAB** 56×56px — 기상 아이콘(사운드웨이브 형태). `--score-mid` 색.
- **클릭 시 패널** 320×480px (position: fixed, bottom-right, z-index: 50)
  - 상단 바: 현재 컨텍스트 태그 `[레이더 / -6h / 종관분석]` + 닫기(×)
  - 빠른 질문 칩 3개 (§E3에서 activeLayer에 따라 교체)
  - 채팅 영역 (스크롤, 최대 10 turn 보관)
  - 텍스트 입력 + 전송 버튼
- **모바일**: 패널 대신 전체화면 bottom-sheet 드로어로 전환
- 패널 열려 있을 때 activeLayer·activeTimeIdx 변경 → 상단 컨텍스트 태그 즉시 갱신

### E2. 서버리스 엔드포인트 — `api/chat.js`

```js
// api/chat.js
// Vercel Edge Function — 스트리밍 응답
import Anthropic from '@anthropic-ai/sdk';

const LAYER_DESC = {
  satellite: '천리안위성 2A호 적외영상 (기상청 API허브). 흰색=두꺼운 구름, 어두울수록 맑음.',
  radar:     '기상청 HSR 레이더 합성영상. dBZ 단위 에코 강도: 35+ = 강한 비, 55+ = 매우 강한 비.',
  asos:      '기상청 ASOS 지상자동관측소 시간자료. 실측 기온·강수량·기압·풍속.',
  model:     '기상청 단기예보(getVilageFcst) 두 발표시각 비교. 같은 날 다른 발표가 예보를 바꾼 이유에 주목.',
};

const STAGE_NAME = {
  1: '종관 기상 분석',
  2: '수치예보 모델 검토',
  3: '불확실성 판단',
  4: '최종 예보 입력',
  5: '결과 확인 및 리플렉션',
};

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { messages, context } = await req.json();
  // context: { caseId, caseTitle, difficulty, stage, activeLayer, timeLabel, kst }

  const systemPrompt = `당신은 기상 예보 교육 보조 도우미입니다.

현재 케이스: "${context.caseTitle}" (난이도: ${context.difficulty})
현재 단계: ${STAGE_NAME[context.stage] ?? '알 수 없음'} 단계
활성 데이터: ${LAYER_DESC[context.activeLayer] ?? context.activeLayer}
현재 시각 프레임: ${context.timeLabel} (KST ${context.kst})

규칙:
1. 예측 정답(강수확률·형태·기온 수치)은 절대 알려주지 않는다. "이 데이터는 X를 시사하므로 Y를 고려해보세요" 수준으로만.
2. 반드시 현재 활성 데이터와 시각에 맞춰 설명한다. 현 맥락과 무관한 일반 설명은 금지.
3. 중학생이 이해할 수 있는 언어로 답한다. 전문 용어는 괄호 안에 한 번만 설명.
4. 2~4문장 이내. 더 길어지면 "더 궁금한 점이 있으면 물어보세요."로 마무리한다.
5. 기상청 실제 관측 또는 예보 데이터임을 자연스럽게 1회 언급한다.`;

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    system: systemPrompt,
    messages: messages.slice(-10),   // 최대 10 turn (오래된 것 버림)
  });

  return new Response(stream.toReadableStream(), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}
```

### E3. 빠른 질문 칩 (activeLayer 교체)

```ts
// src/components/assistant/WeatherAssistant.tsx 내부
const QUICK_CHIPS: Record<LayerKey, [string, string, string]> = {
  satellite: [
    '이 흰 구름은 뭔가요?',
    '비가 올 구름인지 어떻게 알아요?',
    '구름이 이 방향으로 이동하는 게 중요한가요?',
  ],
  radar: [
    '빨간 에코가 뭔가요?',
    '에코 강도가 높으면 비가 얼마나 강한 건가요?',
    '에코가 정체하면 왜 위험한가요?',
  ],
  asos: [
    '강수량이 갑자기 치솟았는데 어떤 의미인가요?',
    '기압이 떨어지면 비가 오나요?',
    '기온 변화가 예보에 왜 중요한가요?',
  ],
  model: [
    '두 발표가 왜 이렇게 달라요?',
    '더 최신 발표를 항상 믿으면 되나요?',
    '강수확률 60%는 높은 건가요?',
  ],
};
```

칩 클릭 → 해당 문자열을 입력창에 채우고 즉시 전송(사용자 메시지로 추가 후 API 호출).

### E4. caseStore 시그널 연동

`src/stores/caseStore.ts`에 추가:
```ts
import { signal } from '@preact/signals';
export const activeLayer  = signal<LayerKey>('satellite');
export const activeTimeIdx = signal<number>(0);
export const currentStage  = signal<1|2|3|4|5>(1);
```

- `LayerViewer.tsx`: 탭 전환 시 `activeLayer.value = newLayer`
- `TimeSlider.tsx`: 스크럽 시 `activeTimeIdx.value = idx`
- `case/[caseId].astro`: 단계 전환 시 `currentStage.value = nextStage`
- `WeatherAssistant.tsx`: 세 시그널을 직접 구독 → `context` 객체 구성 후 `api/chat.js`에 전달

### E5. 디자인 통합 (관제실 에디토리얼 모티프)

| 요소 | 스펙 |
|---|---|
| FAB 색 | `--score-mid` (#f59e0b 계열) — "중립·도움" 감 |
| 패널 배경 | `--bg-surface` + `--border` 1px + `backdrop-blur(4px)` |
| 사용자 버블 | 우측, `--bg-elevated`, 라운드 16px(우하단 4px) |
| 어시스턴트 버블 | 좌측, `--bg-surface`, 라운드 16px(좌하단 4px) |
| 타이핑 효과 | cursor blink (`|`) + 청크 단위 append, sans 폰트 |
| 빠른 질문 칩 | pill, `--border` 1px, hover → `--score-mid` 10% 틴트 |
| 컨텍스트 태그 | mono 폰트, `--fg-muted` 색, `[레이더 · -6h · 종관분석]` |
| 모바일 드로어 | 전체 화면 너비, 화면 높이 70%, 하단 safe area 패딩 |

### E6. 비용·남용 방어

```js
// api/chat.js 추가 가드
const MAX_USER_MSG_LEN = 300;      // 글자 수 초과 시 400 반환
const MAX_TURNS = 10;              // messages.length > 20(turn×2) 시 최근 10만

if (!messages || !context) return new Response('Bad Request', { status: 400 });
const lastUser = messages.at(-1);
if (!lastUser || lastUser.role !== 'user') return new Response('Bad Request', { status: 400 });
if (lastUser.content.length > MAX_USER_MSG_LEN)
  return new Response('메시지가 너무 깁니다.', { status: 400 });
```

- `max_tokens: 300` 으로 응답 길이 캡. 비용 ≈ 케이스당 최대 5~10회 대화 × 300토큰 = 소량.
- 클라이언트에서 ANTHROPIC_API_KEY 노출 없음(edge function에서만).

### E7. DoD (완료 기준)

- [ ] FAB 클릭 → 패널(데스크톱)/드로어(모바일) 열림·닫힘
- [ ] 빠른 질문 칩이 activeLayer 변경 시 즉시 교체됨
- [ ] 스트리밍 응답이 타이핑 효과로 표시됨(청크 단위 append)
- [ ] 컨텍스트 태그가 레이어·시각 변경 시 실시간 갱신됨
- [ ] 정답(예측 수치)이 포함된 응답이 나오지 않음 — 3케이스 × 5질문 수동 QA 통과
- [ ] API 실패 시 "잠시 후 다시 시도해주세요" 표시, 앱 흐름 중단 없음
- [ ] Lighthouse 점수 영향 없음 (`client:visible` island 지연 로드)
- [ ] 패널 열린 채로 단계 이동 → 컨텍스트만 갱신되고 대화 유지

---

*(이어서 §6 채점 엔진 ~ §16 리스크 + 부록이 계속됩니다. 다음 파트에서 작성)*
