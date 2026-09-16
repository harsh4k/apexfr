/* Micro-interactions. Pointer effects only run on fine pointers and are
   skipped entirely for reduced-motion users. */
window.Interact = (function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const lerp = (a, b, t) => a + (b - a) * t;

  // ---- Rolling button labels (text duplicates upward on hover) ----
  function rollLabels() {
    document.querySelectorAll(".btn, .to-top").forEach((btn) => {
      if (btn.querySelector(".roll")) return;
      const text = btn.textContent.trim();
      btn.textContent = "";
      const roll = document.createElement("span");
      roll.className = "roll";
      const inner = document.createElement("span");
      inner.textContent = text;
      inner.dataset.t = text;
      roll.append(inner);
      btn.append(roll);
      btn.setAttribute("aria-label", btn.getAttribute("aria-label") || text);
    });
  }

  // ---- Click ripple ----
  function ripples() {
    document.addEventListener("pointerdown", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.left = `${e.clientX - r.left}px`;
      dot.style.top = `${e.clientY - r.top}px`;
      btn.append(dot);
      dot.addEventListener("animationend", () => dot.remove());
    });
  }

  // ---- Custom cursor ----
  function cursor() {
    const dot = document.createElement("div");
    const ring = document.createElement("div");
    const label = document.createElement("span");
    dot.className = "cursor";
    ring.className = "cursor-ring";
    ring.append(label);
    document.body.append(dot, ring);
    document.body.classList.add("has-cursor");

    let mx = -100, my = -100, rx = -100, ry = -100, raf = 0;
    const loop = () => {
      rx = lerp(rx, mx, 0.2);
      ry = lerp(ry, my, 0.2);
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      raf = Math.abs(rx - mx) + Math.abs(ry - my) > 0.1 ? requestAnimationFrame(loop) : 0;
    };
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX; my = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
      const t = e.target;
      const lab = t.closest("[data-cursor]");
      const text = t.closest("input, textarea");
      const hot = t.closest("a, button, [data-spot], .svc__item");
      ring.classList.toggle("is-label", !!lab);
      ring.classList.toggle("is-text", !!text && !lab);
      ring.classList.toggle("is-hover", !!hot && !lab && !text);
      dot.classList.toggle("is-hidden", !!lab || !!text);
      if (lab) label.textContent = lab.dataset.cursor;
    }, { passive: true });
    document.addEventListener("pointerdown", () => ring.classList.add("is-down"));
    document.addEventListener("pointerup", () => ring.classList.remove("is-down"));
    document.documentElement.addEventListener("mouseleave", () => { dot.classList.add("is-hidden"); ring.classList.add("is-hidden"); });
    document.documentElement.addEventListener("mouseenter", () => { dot.classList.remove("is-hidden"); ring.classList.remove("is-hidden"); });
  }

  // ---- Magnetic elements ----
  function magnetic() {
    document.querySelectorAll(".btn, .nav__logo, .to-top, .toggle, .nav__menu").forEach((el) => {
      el.dataset.magnetic = "";
      const strength = el.classList.contains("btn--lg") ? 0.35 : 0.25;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * strength;
        const y = (e.clientY - (r.top + r.height / 2)) * strength;
        el.classList.add("is-magnet");
        el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.classList.remove("is-magnet");
        el.style.transform = "";
      });
    });
  }

  // ---- Spotlight + tilt on glass cards ----
  function spotlight() {
    document.querySelectorAll(".tier, .lap, .lamp, .ledger, .cost, .footer__clock, .stat, .route, .side-card, .brief, .repo").forEach((el) => {
      el.dataset.spot = "";
      const glow = document.createElement("i");
      glow.className = "spot";
      glow.setAttribute("aria-hidden", "true");
      el.prepend(glow);
      const tilt = el.classList.contains("tier");
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        el.style.setProperty("--spot", "1");
        if (tilt) {
          el.classList.add("is-tilting");
          el.style.setProperty("--rx", `${((0.5 - py) * 7).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${((px - 0.5) * 9).toFixed(2)}deg`);
        }
      });
      el.addEventListener("pointerleave", () => {
        el.style.setProperty("--spot", "0");
        if (tilt) {
          el.classList.remove("is-tilting");
          el.style.setProperty("--rx", "0deg");
          el.style.setProperty("--ry", "0deg");
        }
      });
    });
  }

  // ---- Hero depth follows the pointer ----
  function heroDepth() {
    const hero = document.getElementById("hero");
    if (!hero) return;
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--hx", (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
      hero.style.setProperty("--hy", (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--hx", 0);
      hero.style.setProperty("--hy", 0);
    });
  }

  // ---- Marquee: speed and direction follow the scroll ----
  function marquee() {
    const track = document.querySelector(".marquee__track");
    if (!track) return;
    track.style.animation = "none";
    let x = 0, speed = -40, visible = false, last = 0, raf = 0, hover = false;
    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const vel = (window.ScrollState && window.ScrollState.vel) || 0;   // frames of lag
      const want = hover ? 0 : -40 - vel * 55;                            // up-scroll reverses it
      speed = lerp(speed, want, 1 - Math.exp(-dt * 6));
      const half = track.scrollWidth / 2;
      x += speed * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
      raf = visible ? requestAnimationFrame(step) : 0;
    };
    new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    }).observe(track);
    track.parentElement.addEventListener("pointerenter", () => { hover = true; });
    track.parentElement.addEventListener("pointerleave", () => { hover = false; });
  }

  // ---- Copy email + toast ----
  let showToast = () => {};
  function copyEmail() {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = "<i>✓</i><span></span>";
    document.body.append(toast);
    let timer = 0;
    showToast = (text) => {
      toast.querySelector("span").textContent = text;
      toast.classList.add("is-on");
      clearTimeout(timer);
      timer = setTimeout(() => toast.classList.remove("is-on"), 2200);
    };
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-copy], [data-copy-email]");
      if (!btn) return;
      const value = btn.dataset.copy || (window.BRAND && BRAND.email) || "";
      e.preventDefault();
      let msg = "Email copied — talk soon";
      try { await navigator.clipboard.writeText(value); }
      catch { msg = value; }
      showToast(msg);
    });
  }

  function init() {
    rollLabels();
    ripples();
    copyEmail();
    if (reduced) return;
    marquee();
    if (!fine) return;
    cursor();
    magnetic();
    spotlight();
    heroDepth();
  }

  return { init, toast: (t) => showToast(t) };
})();
