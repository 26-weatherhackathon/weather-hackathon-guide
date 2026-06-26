# DESIGN.md — 기상·기후 AI 해커톤 가이드 리디자인

> 이 문서는 **빌드 전 디자인 스펙**입니다. 구현(HTML/CSS/JS)은 이 문서 컨펌 이후 시작합니다.
> 콘셉트 한 줄: **"날씨 데이터로 짠 네오브루탈리즘 — 키네틱 타이포가 온도를 따라 움직인다."**

---

## 0. 디자인 원칙 요약 (TL;DR)

1. **타이포가 주인공.** 히어로엔 이미지 대신 스크롤·마우스에 반응하는 가변 폰트 키네틱 타이포.
2. **컬러는 발명하지 않는다.** 실제 기온/강수 데이터 스케일(기상청 한파~폭염 기준, Ed Hawkins Warming Stripes)에서 도출.
3. **네오브루탈리즘 골격.** 두꺼운 보더 + 블러 없는 하드 섀도 + 납작한 채도. 그라디언트·소프트 섀도 금지.
4. **의도된 비대칭.** 균일 그리드 반사 금지. 위계에 따라 라운드·간격·정렬을 의도적으로 변주.
5. **모션은 절제.** 전 요소 fade-in 금지. 의미 있는 전환에만.

---

## 1. 레퍼런스 분석 (Awwwards / Godly / 데이터 비주얼 계열)

검색·분석한 4개 레퍼런스와 우리가 **가져올 차별 포인트 / 버릴 점**.

### R1. Ed Hawkins — *Warming Stripes / #ShowYourStripes* (데이터 비주얼)
- **무엇:** 연도별 기온 편차를 축·숫자 없이 **색 띠(stripe)만으로** 표현. 1971–2000 평균을 파랑/빨강 경계로, ±2.6σ 범위를 ColorBrewer **RdBu** 다이버징 스케일에 매핑.
- **차별 포인트(가져올 것):** "색 자체가 데이터." → 우리 팔레트의 **출처이자 정당성**. 장식 색이 아니라 -12°C(한파)~33°C(폭염)에 실제로 매핑된 토큰을 쓴다. 히어로/섹션 구분선에 stripe 모티프를 배경 비주얼로 재사용.
- **버릴 것:** 미니멀 일색 → 우리는 여기에 네오브루탈 골격과 타이포 위계를 더한다.
- 출처: [Warming stripes — Wikipedia](https://en.wikipedia.org/wiki/Warming_stripes), [climate.gov](https://www.climate.gov/news-features/features/climate-stripes-graphics-show-us-trends-state-and-county)

### R2. Gumroad / 네오브루탈리즘 UI 계열 (Awwwards·Behance neobrutalist)
- **무엇:** 2~4px 순흑 보더, **블러 0의 오프셋 하드 섀도**(`box-shadow: 6px 6px 0 #000`), 납작한 고채도 면, 90년대 그래픽 향수 + 살짝 괴짜스러운 서체.
- **차별 포인트(가져올 것):** 카드·버튼의 **물성**. 호버 시 그림자가 줄며 "눌리는" 인터랙션. 화이트스페이스로 균형 → 과하지 않게.
- **버릴 것:** 네온 카와이 톤(스티커·이모지 떡칠)은 기상·공공 데이터 신뢰감과 안 맞음 → 채도는 **데이터 팔레트 안에서만**.
- 출처: [Neubrutalism.com](https://neubrutalism.com/), [Awwwards](https://www.awwwards.com/)

### R3. Obys / Locomotive 류 — 키네틱 스크롤 타이포 (Godly·Awwwards SOTD)
- **무엇:** 초대형 헤드라인을 GSAP **ScrollTrigger** / CSS **Scroll-Driven Animations**로 스크롤 위치에 묶어 weight·width·위치를 모핑. 가변 폰트라 용량은 1KB 미만, LCP 손해 없음.
- **차별 포인트(가져올 것):** 히어로 핵심 단어의 **가변축 모핑**(wght 300↔800)과 스크롤 시 행 슬라이드. "모션이 곧 메시지."
- **버릴 것:** 풀 WebGL/로딩 헤비 연출 → 초보 참가자 가이드 사이트라 **가볍고 빠른** 게 우선. JS 의존 최소화, `prefers-reduced-motion` 필수.
- 출처: [Kinetic Typography — Awwwards](https://www.awwwards.com/inspiration/kinetic-typography-nssc18), [CSS Scroll-Driven Animations 정리](https://www.illustration.app/blog/interactive-typography-systems-designing-text-that-responds)

### R5. K-pop 컴백 마이크로사이트 — 실제 사례 분석 (NCT·aespa·ILLIT·NJZ)

> ⚠️ **방법론 메모:** 이 샌드박스의 egress 정책이 beliftlab.com / smtown.com / hybecorp.com 등을 403으로 차단하고, 아카이브(web.archive.org)도 페치 불가라 **라이브 스크린샷은 뜨지 못했다.** 아래는 각 컴백 era에 대한 분석 + 디자인 보도(검색)를 근거로 한 것이며, 빌드 후 실제 사이트와 대조 검증을 권장한다.

분석한 4개 컴백 era와 **각각의 차별 포인트 / 우리가 가져올 구체 기법**:

**(a) aespa — KWANGYA 세계관 (SM, "Armageddon"/"Whiplash" era)**
- *관찰:* 다크 캔버스 + 단일 애시드/네온 액센트, 글리치·데이터모시 전환, 테크노 모노 라벨·코드(SYNK, æ-), 초대형 컨덴스드 라틴.
- *가져올 것:* ① **단일 액센트 규율**(전 era가 색을 1~2개로 묶음). ② 히어로 타이포에 **글리치/디스토션 전환** → 우리는 이를 **"열 아지랑이(heat-haze) 셰이더"**로 번안: 폭염 단어에 미세 왜곡, 한파 단어엔 정지. *기상 네이티브 재해석.*

**(b) NCT — NEO 산업/유틸리타리안 (SM, NCT 127 / DREAM 코드 시스템)**
- *관찰:* 모노크롬 + 단일 네온, 컨덴스드 볼드, **숫자·코드를 디자인 요소로**(127, 2026), 그리드 + 모노 라벨.
- *가져올 것:* **숫자의 디자인화** — Step 01–05, D-day, 상금을 모노 코드처럼. 우리 트랙리스트 인덱스·`SECTION 01` 라벨의 직접 근거.

**(c) ILLIT — Y2K 소프트 (BELIFT/HYBE, "SUPER REAL ME"/"Magnetic" era)**
- *관찰:* 둥근 버블 로고타입, 파스텔 + 크로뮴, 로어케이스 친근함, 하트·스티커 모티프.
- *가져올 것:* **딱 한 군데의 부드러운 반전** — CTA 하나만 라운드 크게(`--r-lg`)+로어케이스로 친근하게. 나머지 브루탈 골격과 대비. (크로뮴·홀로그램 광택은 **버림** — 공공데이터 신뢰감과 충돌.)

**(d) NJZ(NewJeans) — 2025 레이싱/크롬-메탈 리데뷔**
- *관찰:* 스크래치 메탈 로고, 크로뮴 메탈 요소, 체커드 플래그, 그러면서도 **에디토리얼 여백**(Newtro 미니멀 DNA 유지).
- *가져올 것:* **에디토리얼 여백 규율** — 브루탈리즘이 빽빽해지지 않게 화이트스페이스로 숨통. 컨덴스드 **로어케이스 워드마크** 아이디어.

**공통 차별 포인트(전 era 관통):** ① 컴백마다 **세계관(era)+코드네임+D-day** 프레이밍. ② 한글×라틴 **혼합 컨덴스드 워드마크**. ③ **마퀴 티커**로 키워드 순환. ④ 트랙리스트형 인덱스. ⑤ **era 단위 타이트 팔레트**(무지개 금지) — 우리의 온도 토큰이 곧 "시즌 컬러".

- **버릴 것:** Y2K 크로뮴·메탈릭·홀로그램 광택(Pop Futurism)은 기상·공공 데이터 톤과 충돌 → 질감은 **납작한 네오브루탈(R2)** 유지, *세계관·리듬·레터링·단일액센트*만 차용.
- 출처(접근 가능 보도): [HYBE 웹디자인 분석(allkpop forum)](https://forum.allkpop.com/thread/141933-the-web-design-on-hybe-official-websites-for-bts-enhypen-and-le-sserafim-is-on-t/), [NJZ 크롬-메탈 레이싱 콘셉트(Koreaboo)](https://www.koreaboo.com/news/njz-newjeans-racing-concept-debut-comeback/), [ILLIT SUPER REAL ME 폰트 논의(dafont forum)](https://www.dafont.com/forum/read/547274/illit-super-real-me-fonts), [K-pop 그래픽 디자인 시스템(Wix Studio)](https://www.wix.com/studio/blog/kpop-graphic-design)

### R4. NASA Climate Spiral / "State of AI 2025" (키네틱 × 데이터 모션)
- **무엇:** 시간축 데이터를 **움직임 자체로** 보여줌(나선·증식 애니메이션). 데이터가 모션의 근거.
- **차별 포인트(가져올 것):** 숫자(상금·일정·배점)를 **데이터 모션**으로 — 카운트업·stripe 게이지로 표현해 "데이터 다루는 해커톤"임을 메타적으로 드러냄.
- **버릴 것:** 과한 3D → 2D stripe/게이지로 충분.
- 출처: [NASA Climate Spiral](https://svs.gsfc.nasa.gov/5190/), [Data Visualization — Awwwards](https://www.awwwards.com/inspiration/data-visualization-state-of-ai-2025)

**종합:** R1=색의 정당성, R2=물성/골격, R3=히어로 키네틱, R4=숫자의 데이터화, R5=세계관·레터링·리듬. 다섯 축을 합쳐 *"데이터에서 나온 색 + 브루탈한 물성 + 컴백처럼 연출한 움직이는 타이포"*. 콘셉트 한 줄을 갱신: **"기상·기후 해커톤 2026 = 하나의 컴백 시즌. 온도 팔레트가 시즌 컬러, 키네틱 타이포가 타이틀곡."**

---

## 2. 타이포그래피 — 혼합 페어링

> 제약: Inter/Roboto/Pretendard **단독 금지**. 한글 본문 + 개성 있는 영문 디스플레이를 페어링하고, **헤드라인은 가변 폰트**.

### 2.1 폰트 역할 (3종 + 모노)

| 역할 | 폰트 | 종류 | 가변축 | 쓰는 곳 |
|---|---|---|---|---|
| **영문 디스플레이 (주역)** | **Bricolage Grotesque** | Variable | `wght 200–800`, `opsz 12–96` | 히어로 영문 키워드, 섹션 라벨, 대형 숫자 |
| **한글 디스플레이/본문** | **Wanted Sans Variable** | Variable | `wght 100–900` | 한글 헤드라인 + 본문 |
| **데이터 라벨 / 강조 모노** | **Space Mono** | Static (400/700) | — | stripe 수치, 태그, `SECTION 01` 식 라벨 |
| **코드 블록** | **JetBrains Mono** | Static | — | `<code>`, 코드 예제 |

- **페어링 근거:** 괴짜스러운 영문 그로테스크(Bricolage) × 모던·기하 한글(Wanted Sans)의 대비가 "혼합 타이포"를 만든다. 둘 다 가변 → 헤드라인 모핑 가능. 둘 다 오픈소스(Google Fonts / Wanted).
- **K-pop 혼합 레터링(R5):** 히어로/섹션 타이틀은 **한글 + 라틴을 한 줄에 섞어** 짠다(예: `WEATHER 예보관 MODE`, `날씨를 CODE로`). 라틴은 Bricolage 760, 한글은 Wanted 800으로 weight를 어긋나게 섞어 컴백 로고타입 같은 긴장감을 준다.
- **금지 확인:** Pretendard·Inter·Roboto를 **본문 단독으로 쓰지 않음.** (시스템 폴백 스택에만 마지막 안전망으로 둠.)

### 2.2 타입 스케일 (1.25 Major Third, 변주 허용)

| 토큰 | clamp() | 용도 | 폰트/weight |
|---|---|---|---|
| `--fs-hero` | `clamp(3.5rem, 12vw, 11rem)` | 히어로 키네틱 단어 | Bricolage `wght 760`, opsz 96 |
| `--fs-display` | `clamp(2.2rem, 6vw, 4.5rem)` | 섹션 대제목 | Wanted Sans 800 |
| `--fs-h2` | `clamp(1.6rem, 3vw, 2.5rem)` | 섹션 제목 | Wanted Sans 700 |
| `--fs-h3` | `1.25rem` | 카드 제목 | Wanted Sans 700 |
| `--fs-body` | `1.0625rem` (17px) | 본문 | Wanted Sans 420 |
| `--fs-sm` | `0.8125rem` | 캡션/노트 | Wanted Sans 500 |
| `--fs-mono` | `0.75rem` | 라벨/태그 | Space Mono 700, `letter-spacing .12em`, uppercase |

- 본문 `line-height: 1.7`, 헤드라인 `1.02`, 디스플레이 `letter-spacing: -0.03em`.
- 한글엔 음수 자간 과하면 깨지므로 한글 헤드라인 `-0.01em`까지만.

---

## 3. 컬러 — 실제 기상 데이터에서 도출

> 제약: 보라/파랑 그라디언트 디폴트 금지. **실제 기온·강수 스케일에서 팔레트 도출**, 토큰으로 정의.

### 3.1 기온 스케일 (한파 → 폭염)

기상청 특보 기준에 실제 매핑: **한파주의보 -12°C 이하 / 폭염주의보 33°C 이상**. 색은 추측이 아니라 **IPCC AR6 공식 기온 다이버징 colormap(`temp_div`, 11단계)**의 실측 hex를 그대로 채택([IPCC-WG1/colormaps](https://github.com/IPCC-WG1/colormaps), ColorBrewer/Crameri 기반). 중앙값 `#F8F8F8`을 16°C(쾌적) 중립점에 둠.

```css
:root {
  /* 기온 다이버징 — IPCC AR6 temp_div(11단계) 실측값. -12°C 한파 → 16°C 중립 → 33°C 폭염 */
  --temp-cold:    #053061;  /* ≤ -12°C  한파 (deep blue) */
  --temp-chilly:  #246192;  /*   -7°C   추위 */
  --temp-cool:    #4393C3;  /*    0°C   서늘 */
  --temp-cool-2:  #7FB5D4;  /*    6°C */
  --temp-mild:    #BCD6E6;  /*   11°C   선선 */
  --temp-neutral: #F8F8F8;  /*   16°C   중립 (IPCC 중앙값) */
  --temp-warm:    #EDC5BF;  /*   21°C   따뜻 */
  --temp-warm-2:  #E19286;  /*   25°C */
  --temp-warmer:  #D6604C;  /*   29°C   더움 */
  --temp-hot:     #9E3036;  /*   31°C   무더위 */
  --temp-scorch:  #67001F;  /* ≥ 33°C   폭염 (deep red) */
}
```

> 페이퍼 배경(§3.3 `--paper #f7f4ec`)은 따뜻한 톤 유지를 위해 중립색과 별개로 둔다. 데이터 stripe·게이지엔 위 `--temp-*` 11단계를 순서대로 사용.

### 3.2 강수 스케일 (보조 — 시퀀셜 청록)

기온(다이버징)과 충돌 안 나게 강수는 **별도 청록 시퀀셜**(맑음→호우). **IPCC AR6 `prec_seq`(11단계)** 실측값에서 축약 채택. 데이터 게이지·진행 표시에 사용.

```css
:root {
  /* 강수 시퀀셜 — IPCC AR6 prec_seq 실측값 (크림 → 딥틸) */
  --rain-none:  #FFFFE5;  /* 0mm   맑음 */
  --rain-light: #9ACBBA;  /* ~3mm  약한 비 */
  --rain-mod:   #56A89D;  /* ~15mm 비 */
  --rain-heavy: #278077;  /* ~30mm 강한 비 */
  --rain-storm: #003C30;  /* ≥50mm 호우특보 */
}
```

### 3.3 중립/구조 색 (네오브루탈 골격)

```css
:root {
  --ink:    #14110d;   /* 본문/보더 — 순흑 아닌 따뜻한 먹색 */
  --paper:  #f7f4ec;   /* 배경 — 따뜻한 페이퍼 (순백 #fff 금지) */
  --paper-2:#efe9dc;   /* 섹션 교차 배경 */
  --line:   #14110d;   /* 보더는 ink와 동일, 두께로 위계 */
  --shadow: #14110d;   /* 하드 섀도 색 */

  /* 액션 컬러 = 폭염 레드 (데이터 팔레트에서 차용, 별도 브랜드색 금지) */
  --accent: var(--temp-scorch);
  --accent-ink: #fff;
}
```

- **그라디언트 정책:** UI 장식용 보라/파랑 그라디언트 **금지**. 그라디언트는 오직 **stripe 데이터 비주얼**(temp 토큰들을 순서대로 잇는 것)에만 허용.
- **대비:** 본문 텍스트는 `--ink` on `--paper` (대비 14:1). accent 위 텍스트는 흰색으로 AA 확보.

---

## 4. 간격 & 라운드 — 의도된 변주

> 제약: 전 요소 동일값 금지. 위계에 따라 변주.

### 4.1 스페이싱 스케일 (비선형, 8px 베이스 + 점프)

```css
:root {
  --sp-1: 4px;  --sp-2: 8px;   --sp-3: 12px; --sp-4: 20px;
  --sp-5: 32px; --sp-6: 52px;  --sp-7: 84px; --sp-8: 136px;  /* ≈ 피보나치 점프 */
}
```
- 섹션 간 수직 리듬을 **일부러 불균등**하게: 히어로↔첫 섹션 `--sp-8`, 본문 섹션 간 `--sp-7`, 밀집 정보(체크리스트) 내부 `--sp-3`. 모든 섹션 동일 패딩 **금지**.

### 4.2 라운드 스케일 (요소별 차등)

```css
:root {
  --r-sharp: 0;      /* 네오브루탈 카드·코드블록 — 각진 게 기본 */
  --r-sm:   4px;     /* 태그/뱃지 */
  --r-md:   14px;    /* 노트·인용 박스 */
  --r-lg:   28px;    /* CTA·강조 카드 */
  --r-pill: 999px;   /* 네비 칩, 필터 */
}
```
- 규칙: **구조적 요소(카드·코드)는 `--r-sharp`**, **부드러운 안내(노트·CTA)는 큰 라운드**. 같은 위계라도 강조 카드 하나는 라운드를 깨서 시선 유도. 전부 16px 같은 균일 금지.

### 4.3 보더 & 하드 섀도 (위계 = 두께)

```css
:root {
  --bd-1: 1.5px;  /* 보조 구분선 */
  --bd-2: 2.5px;  /* 일반 카드 */
  --bd-3: 4px;    /* 강조 카드·CTA */
  --shadow-sm: 4px 4px 0 var(--shadow);
  --shadow-md: 7px 7px 0 var(--shadow);
  --shadow-lg: 12px 12px 0 var(--shadow);  /* 히어로 핵심 카드 */
}
```
- **블러 있는 섀도 전면 금지.** 깊이는 오프셋 하드 섀도로만.

---

## 5. 레이아웃 — 안티그리드 / 비대칭

> 제약: 피처카드 3~4칸 균일 그리드 반사 금지. 비대칭·요소 겹침 허용.

- **베이스 그리드:** 12-col, `max-width: 1200px`, gutter `--sp-4`. 하지만 **콘텐츠는 그리드를 일부러 깬다.**
- **섹션별 다른 레이아웃 패턴 강제(반복 금지):**
  - `How It Works`: 좌측 6col 텍스트 + 우측 6col 다이어그램, 다이어그램 노드는 **±12px 수직 오프셋**으로 어긋나게.
  - `용어집(glossary)`: 균일 그리드 아님 → **벽돌(masonry)형** 5칸, 카드 크기/라운드 제각각.
  - `준비물 체크리스트`: 좌 정렬 리스트 + 큰 번호가 본문 위로 **겹침(overlap, z-index)**.
  - `Step 1–5`: **지그재그** — 홀수 스텝 좌측 정렬, 짝수 스텝 우측 정렬, 스텝 번호는 카드 밖으로 삐져나옴.
  - `심사 기준`: 배점을 **stripe 게이지 바**(temp 토큰)로 가로 표현.
- **컴백 모티프(R5):**
  - 히어로 하단 또는 섹션 사이에 **마퀴 티커** 1줄: `총상금 1,000만원 · 모집 ~7.3 · 웹 인터랙티브 · 초보 OK ·` 가 무한 가로 스크롤(`prefers-reduced-motion`에선 정지).
  - 네비/목차를 앨범 **트랙리스트**처럼: `01 — 시작하기 / 02 — 만들기 …` 좌측 트랙번호 + 우측 제목, 모노 폰트.
  - 히어로에 **D-day 카운트다운**(모집 마감 7/3 기준) 카드를 하드섀도로.
- **겹침 규칙:** 큰 배경 타이포/숫자(`--fs-hero`급)를 섹션 뒤에 `opacity: 0.06`로 깔고 콘텐츠가 그 위에 겹치게.
- **모바일(<720px):** 안티그리드 해제 → 1열 스택. 단, 지그재그 정렬과 오프셋은 유지(좌우 살짝). 겹침은 가독성 위해 완화.

---

## 6. 모션 — 의미 있는 곳에만

> 제약: 전 요소 동일 fade-in 금지. 히어로는 스크롤/마우스 반응 키네틱 타이포.

### 6.1 히어로 키네틱 (핵심)
- 영문 키워드(예: **WEATHER / CLIMATE / DEPLOY**)가 마우스 X축을 따라 `font-variation-settings`의 `wght`를 300↔800, `opsz`를 12↔96 모핑.
- 스크롤 시 히어로 헤드라인 행이 **서로 다른 속도로 슬라이드**(패럴랙스)하며 weight 감소 → "식어가는 온도" 은유.
- **열 아지랑이(heat-haze) — aespa 글리치의 기상 번안:** 폭염 컬러(`--temp-scorch`)로 칠해진 단어엔 미세한 수평 왜곡(`filter: url(#heat)` SVG turbulence, 진폭 ≤2px)을 천천히, 한파 단어(`--temp-cold`)엔 정지. 색=데이터=모션이 한 줄에서 일치.
- 기술: CSS **Scroll-Driven Animations**(`animation-timeline: scroll()`) 우선, 미지원 브라우저만 IntersectionObserver/rAF 폴백. GSAP는 정말 필요하면 ScrollTrigger만.

### 6.2 모션 토큰 & 규칙
```css
:root {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);  /* 카드 호버 눌림 */
  --dur-fast: 120ms; --dur-mid: 320ms; --dur-slow: 640ms;
}
```
- **허용:** 히어로 키네틱 / 카드 호버 시 하드섀도 눌림(`translate(3px,3px)` + shadow 축소) / 숫자 카운트업(상금·일정) / stripe 게이지 채워짐(섹션 진입 1회) / **마퀴 티커 무한 스크롤**(CSS `@keyframes` translateX, 속도 일정) / **D-day 카운트다운**(setInterval, 1초).
- **금지:** 모든 섹션·카드 일괄 `fade-in-up`. 의미 없는 스크롤 패럴랙스 남발. 자동재생 무한 루프 배경.
- **접근성:** `@media (prefers-reduced-motion: reduce)` → 키네틱·카운트업·게이지 모두 **즉시 최종 상태**로, 변환만 끔.

---

## 7. 카피 — MZ 타깃 브랜드 보이스

> 제약: AI 보일러플레이트 톤 금지.

- **톤:** 친구가 옆에서 알려주듯, 짧고 단정적. 군더더기·"~할 수 있습니다" 남발 금지. 이모지는 데이터 맥락에서만 절제(🌡️🌧️).
- **금지 표현:** "여러분", "~을 통해 ~할 수 있습니다", "혁신적인", "원활하게", "손쉽게". AI스러운 3박자 나열 금지.
- **좋은 예 / 나쁜 예**

| 위치 | 나쁜 예(AI톤) | 좋은 예(브랜드 보이스) |
|---|---|---|
| 히어로 | "누구나 손쉽게 웹 도구를 만들 수 있습니다" | "터미널? 설치? 노노. 브라우저 하나면 끝." |
| 섹션 도입 | "본 섹션에서는 준비물을 안내합니다" | "시작 전에 계정 3개. 5분이면 끝나요." |
| CTA | "지금 시작하기" | "날씨 데이터, 코드로 굴려보자 →" |
| 에러/주의 | "오류가 발생할 수 있습니다" | "여기서 막히면? 90%는 이 줄임." |

- 단, **숫자·기준(상금·마감·배점)은 정확하게.** 톤은 가볍게, 정보는 정직하게.

---

## 8. 금지 패턴 체크리스트 (PR 셀프리뷰용)

빌드 후 아래 전부 ❌여야 머지.

- [ ] 본문이 Pretendard/Inter/Roboto **단독**인가? → ❌
- [ ] 보라/파랑 **장식 그라디언트**가 있는가? (stripe 데이터 비주얼 제외) → ❌
- [ ] 컬러가 `--temp-*`/`--rain-*` **토큰 없이 하드코딩**됐는가? → ❌
- [ ] 모든 카드 `border-radius`가 **동일값**인가? → ❌
- [ ] 모든 섹션 패딩이 **동일값**인가? → ❌
- [ ] 피처/스텝이 **균일 3~4칸 그리드 반사**인가? → ❌
- [ ] **블러 있는 box-shadow**를 썼는가? → ❌
- [ ] 전 요소 **동일 fade-in**인가? → ❌
- [ ] `prefers-reduced-motion` 처리 **누락**인가? → ❌
- [ ] 카피에 금지 표현("손쉽게/원활하게/여러분")이 있는가? → ❌

---

## 9. 빌드 범위 (컨펌 후)

- 단일 `index.html` 유지(현 구조), 폰트는 Google Fonts(Bricolage Grotesque, Space Mono, JetBrains Mono) + Wanted Sans CDN.
- 기존 섹션(overview/how/glossary/ready/step1–5/pr/copyright/judge/faq) 콘텐츠 보존, **비주얼·레이아웃·카피만 리디자인.**
- JS는 인라인 최소(키네틱 타이포·카운트업·게이지). 외부 라이브러리는 가능하면 0.
- 산출물: 리디자인된 `index.html` + (필요시) `assets/` 정리. 브랜치 `claude/weather-hackathon-redesign-t5t2vz`, 별도 PR.

---

### 출처
- [Warming stripes — Wikipedia](https://en.wikipedia.org/wiki/Warming_stripes)
- [Climate stripes — NOAA Climate.gov](https://www.climate.gov/news-features/features/climate-stripes-graphics-show-us-trends-state-and-county)
- [Neubrutalism guide](https://neubrutalism.com/) · [Awwwards](https://www.awwwards.com/)
- [Kinetic Typography — Awwwards](https://www.awwwards.com/inspiration/kinetic-typography-nssc18)
- [Interactive Typography Systems (Scroll-Driven Animations)](https://www.illustration.app/blog/interactive-typography-systems-designing-text-that-responds)
- [NASA Climate Spiral](https://svs.gsfc.nasa.gov/5190/) · [Data Visualization — Awwwards](https://www.awwwards.com/inspiration/data-visualization-state-of-ai-2025)
