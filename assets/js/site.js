/* =====================================================================
   기상·기후 AI 해커톤 2026 — 공유 스크립트 (site.js)
   점진적 향상: JS 없이도 모든 콘텐츠는 읽힌다. JS는 모션/인터랙션만 더한다.
   ===================================================================== */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- 1. 체크박스 토글 (제출/준비물) ---- */
  document.querySelectorAll(".check-box").forEach(function (b) {
    b.setAttribute("role", "checkbox");
    b.setAttribute("tabindex", "0");
    b.setAttribute("aria-checked", "false");
    function toggle() {
      var on = b.classList.toggle("checked");
      b.setAttribute("aria-checked", on ? "true" : "false");
    }
    b.addEventListener("click", toggle);
    b.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(); }
    });
  });

  /* ---- 2. 마퀴: 끊김 없는 루프를 위해 내용 복제 ---- */
  document.querySelectorAll(".marquee-track").forEach(function (t) {
    if (reduce) return;
    var clone = t.querySelector("span");
    if (clone) t.appendChild(clone.cloneNode(true));
  });

  /* ---- 3. 히어로 키네틱 타이포 (마우스 X = wght, 스크롤 = 식어감) ---- */
  var kinetics = document.querySelectorAll(".kinetic");
  if (kinetics.length && !reduce) {
    var hero = document.querySelector("[data-hero]") || document.body;
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var wght = Math.round(250 + x * 550);          // 250 → 800
      var opsz = Math.round(12 + x * 84);             // 12 → 96
      kinetics.forEach(function (k) {
        k.style.fontVariationSettings = '"wght" ' + wght + ', "opsz" ' + opsz;
      });
    });
    // 스크롤하면 weight가 줄며 "식어간다"
    window.addEventListener("scroll", function () {
      var y = Math.min(1, window.scrollY / 600);
      var wght = Math.round(800 - y * 450);
      kinetics.forEach(function (k) {
        if (k.dataset.lockMouse) return;
        k.style.fontVariationSettings = '"wght" ' + wght + ', "opsz" 96';
      });
    }, { passive: true });
  }

  /* ---- 4. D-day 카운트다운 ---- */
  var cd = document.querySelector("[data-countdown]");
  if (cd) {
    var target = new Date(cd.getAttribute("data-countdown")).getTime();
    var elD = cd.querySelector("[data-d]"), elH = cd.querySelector("[data-h]"),
        elM = cd.querySelector("[data-m]"), elS = cd.querySelector("[data-s]");
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var diff = target - Date.now();
      if (diff < 0) diff = 0;
      var d = Math.floor(diff / 864e5),
          h = Math.floor((diff % 864e5) / 36e5),
          m = Math.floor((diff % 36e5) / 6e4),
          s = Math.floor((diff % 6e4) / 1e3);
      if (elD) elD.textContent = d;
      if (elH) elH.textContent = pad(h);
      if (elM) elM.textContent = pad(m);
      if (elS) elS.textContent = pad(s);
    }
    tick();
    if (!reduce) setInterval(tick, 1000);
  }

  /* ---- 5. 숫자 카운트업 (뷰 진입 1회) ---- */
  var counters = document.querySelectorAll("[data-countup]");
  if (counters.length) {
    var io1 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, end = parseFloat(el.getAttribute("data-countup")), dur = 900, t0 = null;
        if (reduce) { el.textContent = end.toLocaleString(); io1.unobserve(el); return; }
        function step(ts) {
          if (!t0) t0 = ts;
          var p = Math.min(1, (ts - t0) / dur);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString();
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
        io1.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { io1.observe(c); });
  }

  /* ---- 6. 게이지 채우기 (뷰 진입 1회) ---- */
  var fills = document.querySelectorAll(".gauge-fill[data-pct]");
  if (fills.length) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.style.width = en.target.getAttribute("data-pct") + "%";
        io2.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    fills.forEach(function (f) { io2.observe(f); });
  }
})();
