# 리서치 결과 — 기후 해커톤 사이트 리디자인

> 2026-06-26 · WebSearch + GitHub raw로 수집. 라이브 사이트 직접 캡처는 샌드박스 egress 정책으로 불가(아래 방법론 참고).

## 0. 이 환경에서 무엇이 되고 안 되나 (검증됨)

| 채널 | 결과 |
|---|---|
| `curl`/Playwright → 외부 사이트 | ❌ `000` (egress 정책이 비허용 호스트 CONNECT 거부) |
| `WebFetch` → 일반 사이트 | ❌ 대부분 `403` (사이트 anti-bot이 페처도 차단) |
| `WebSearch` | ✅ 작동 (텍스트 스니펫·요약) |
| `curl` → **raw.githubusercontent.com** | ✅ **작동** (IPCC 공식 데이터 직접 수신) |

→ 그래서 시각 레퍼런스는 **검색 텍스트 분석**으로, 컬러 팔레트는 **GitHub의 권위 있는 데이터셋**으로 확보했다.

---

## 1. 기후 데이터 팔레트 — IPCC AR6 공식 colormap (★ 핵심)

출처: [IPCC-WG1/colormaps](https://github.com/IPCC-WG1/colormaps) (AR6 공식, ColorBrewer/Crameri 기반). RGB 원본을 직접 받아 hex 변환.

### 기온 다이버징 (temp_div, 11단계) — 한파→중립→폭염
```
#053061  #246192  #4393C3  #7FB5D4  #BCD6E6  #F8F8F8  #EDC5BF  #E19286  #D6604C  #9E3036  #67001F
 한파                                          중립(16°C)                                     폭염
```
- 7단계 축약: `#053061 #3882B2 #93C0DB #F8F8F8 #E5A399 #C35045 #67001F`
- 양 끝이 가장 어둡고 중앙이 거의 흰색(#F8F8F8) → 편차(anomaly) 표현에 최적.

### 강수 시퀀셜 (prec_seq, 11단계) — 맑음→호우
```
#FFFFE5  #DDEDD6  #BBDCC8  #9ACBBA  #78B9AB  #56A89D  #34968E  #278077  #1A695F  #0D5247  #003C30
 맑음                                                                                        호우
```
- 크림(#FFFFE5)→딥틸(#003C30). 기온 다이버징과 hue 충돌 없음 → 보조 게이지용으로 안전.

→ **이 값들을 DESIGN.md의 `--temp-*` / `--rain-*` 토큰에 그대로 채택.** "실제 기상 데이터 스케일에서 도출"이라는 제약을 권위 있는 출처로 충족.

---

## 2. K-pop 컴백 디자인 (검색 분석)

### aespa — KWANGYA 세계관 ("Armageddon"/"Whiplash")
- 홀로그래픽 프로젝션, **디지털 글리치**, AR 효과로 "하이퍼리얼" 연출. 현실/가상(KWANGYA) 이중성.
- 다크·하이테크·사이버펑크 톤 + 글리치 타이포. → 우리: 글리치를 **heat-haze(열 아지랑이)**로 번안.
- 출처: [The Verity (Medium)](https://medium.com/@theverityph/entering-the-futuristic-realm-of-aespa-as-they-return-for-a-comeback-7b145a09636d), [aespa — Behance](https://www.behance.net/search/projects/aespa)

### Pop Futurism (K-pop/Y2K 파생 트렌드)
- 팔레트: **라벤더 · 베이비핑크 · 피스타치오 그린 · 스페이스 화이트** + 리퀴드 크롬 텍스처. 버블검 톤.
- 원조 Y2K(아이시 블루/실버/글로시 화이트 + 라임·오렌지 액센트)보다 **부드럽고 위트있게**.
- → 우리: 크롬·홀로그램 광택은 **버림**(공공데이터 신뢰감 충돌). 단, "딱 한 군데 부드러운 반전(CTA)"에만 파스텔 차용 검토.
- 출처: [Pop Futurism (Envato)](https://elements.envato.com/learn/pop-futurism), [Y2K Futurism (Aesthetics Wiki)](https://aesthetics.fandom.com/wiki/Y2K_Futurism)

### K-pop 그래픽 디자인 일반 원칙
- **볼드 타이포 + 기하 도형**(원·사각·삼각)이 시그니처. 한글/라틴 혼합 레터링, 가독성 의도적 변주.
- 최근 트렌드: 도파민 컬러에서 **웜 미니멀리즘**(뮤트·소프트 + 기하 + 산세리프)으로 이동.
- 글로벌 타깃이라 **직관적·플랫 그래픽 시스템**.
- 출처: [Wix Studio](https://www.wix.com/studio/blog/kpop-graphic-design), [It's Nice That](https://www.itsnicethat.com/articles/the-view-from-seoul-k-pop-graphic-design-200225), [Junki Hong 포스터 (TypeRoom)](https://www.typeroom.eu/k-pop-with-typography-junki-hong-posters-jun-playlist)

---

## 3. 키네틱 타이포그래피 (검색 분석)

- **가변 폰트가 백본** — 단일 파일에서 weight/width를 실시간 모핑(2026 best practice).
- **CSS Scroll-Driven Animations**(`animation-timeline: scroll()`)로 JS 없이 스크롤 연동. 키네틱 시퀀스가 1KB 미만 → LCP 유리.
- 호버 가변 폰트 효과 사례: "Piano Trio Fest"(One Page). 모더니즘 가변폰트 키네틱: "Exat" (Awwwards SOTD).
- 도구: GSAP ScrollTrigger(복합), Framer Motion(React), Lottie, Three.js(3D).
- 출처: [Kinetic Typography — Awwwards](https://www.awwwards.com/inspiration/kinetic-typography-nssc18), [Interactive Typography Systems](https://www.illustration.app/blog/interactive-typography-systems-designing-text-that-responds)

---

## 4. 네오브루탈리즘 — 구체 수치 (검색 분석)

- **컬러:** 3~4색. 배경(화이트/오프화이트/페일틴트) + 볼드 액센트(옐로/핫핑크/일렉트릭블루) + 보조 채도색 + 보더·텍스트용 블랙. **그라디언트 없음.**
- **타이포:** 볼드 기하 산세리프 헤드라인 + 모노스페이스 보조. 헤드라인은 "불편할 만큼 크게."
- **하드 섀도:** 오프셋 4~8px, **블러 0**, 솔리드(블랙 100% 또는 액센트). X·Y만.
- **보더:** 모든 주요 요소에 2~4px 솔리드 블랙.
- **사례:** Gumroad — `border: 4px solid #000`, `box-shadow: 8px 8px 0 #000`, "디지털 진(zine)" 레이아웃.
- 출처: [NN/g](https://www.nngroup.com/articles/neobrutalism/), [Neubrutalism.com](https://neubrutalism.com/), [Bejamas](https://bejamas.com/blog/neubrutalism-web-design-trend)

---

## 5. 캡처 대상 URL

→ `references/urls.json` 참고 (K-pop 6 + 키네틱/WebGL 어워드 11, 각 why/source/생사확인 결과 포함).
egress 차단으로 라이브 생사는 `unverified`. 비차단 환경에서 재검증 필요.
