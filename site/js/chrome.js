/* Shared page shell: nav, page-to-page curtain, loader, HUD, progress rail,
   and the one render loop that drives the Director. Every page loads this. */
(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const page = document.body.dataset.page || "home";

  // ---- Nav ----
  const links = [["services", "Services"], ["work", "Work"], ["pricing", "Pricing"], ["about", "About"], ["contact", "Contact"]];
  const href = (p) => (p === "home" ? "index.html" : `${p}.html`);
  const header = document.createElement("header");
  header.className = "nav";
  header.id = "nav";
  header.innerHTML = `
    <a class="nav__logo" href="index.html" aria-label="Harsh Studio home">HARSH<span>/</span>STUDIO</a>
    <nav class="nav__links" id="navLinks" aria-label="Primary">
      ${links.map(([p, t], i) => `<a href="${href(p)}"${p === page ? ' class="is-active" aria-current="page"' : ""}><small class="mono">0${i + 1}</small>${t}</a>`).join("")}
    </nav>
    <a class="btn btn--brake nav__cta" href="contact.html">Book a slot</a>
    <button class="nav__menu" id="menuBtn" type="button" aria-expanded="false" aria-controls="navLinks">Menu</button>`;
  document.body.prepend(header);

  const hud = document.createElement("aside");
  hud.className = "hud mono";
  hud.setAttribute("aria-hidden", "true");
  hud.innerHTML = `
    <div class="hud__row"><b>SHOT</b><span id="hudShot">—</span></div>
    <div class="hud__row"><b>FRM</b><span id="hudFrame">001</span></div>
    <div class="hud__row"><b>SPD</b><span id="hudSpd">000 km/h</span></div>
    <div class="hud__row"><b>DIR</b><span id="hudDir" class="hud__dir">■ IDLE</span></div>`;
  const rail = document.createElement("div");
  rail.className = "progress";
  rail.innerHTML = '<i id="progressBar"></i>';
  const curtain = document.createElement("div");
  curtain.className = "curtain";
  curtain.innerHTML = `<span class="curtain__label">${document.title.split("—")[0].trim()}</span>`;
  document.body.append(hud, rail, curtain);

  // ---- Mobile menu ----
  const menuBtn = $("menuBtn");
  const setMenu = (open) => {
    header.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // ---- Page curtain: wipes up on load, drops down before leaving ----
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || !url.pathname.endsWith(".html") && url.pathname !== "/") return;
    if (url.pathname === location.pathname) return;
    e.preventDefault();
    setMenu(false);
    if (reduced) { location.href = url.href; return; }
    curtain.querySelector(".curtain__label").textContent = (a.textContent || "").replace(/^\d+/, "").trim();
    curtain.classList.add("is-in");
    setTimeout(() => { location.href = url.href; }, 650);
  });
  window.addEventListener("pageshow", (e) => { if (e.persisted) curtain.classList.remove("is-in"); });

  // ---- Boot ----
  const loader = $("loader");
  const bar = $("loaderBar");
  document.body.classList.add("is-loading");
  let loaded = 0;
  const { first } = Director.init(() => {
    loaded++;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, loaded / 80)})`;
    kick();
  });
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([first, fonts, new Promise((r) => setTimeout(r, 500))]).then(() => {
    Motion.init();
    Director.measure();
    if (loader) loader.classList.add("is-done");
    curtain.classList.add("is-out");
    document.body.classList.remove("is-loading");
    kick();
  });
  window.ScrollState = { vel: 0 };
  Interact.init();

  // ---- Loop (sleeps when idle) ----
  const root = document.documentElement;
  const shade = document.querySelector(".stage-shade");
  const hudShot = $("hudShot"), hudFrame = $("hudFrame"), hudSpd = $("hudSpd"), hudDir = $("hudDir");
  const barEl = $("progressBar");
  const footer = $("footer");
  const cache = {};
  const set = (el, key, name, val) => { if (cache[key] !== val) { cache[key] = val; el.style.setProperty(name, val); } };
  let last = performance.now(), lastY = window.scrollY, prevY = -1, running = false, dir = "";

  function kick() {
    if (running) return;
    running = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }

  function tick(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    const y = window.scrollY, vh = window.innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    const s = Director.update(y, dt, reduced);
    const v = s.velocity || 0;
    window.ScrollState.vel = v;

    hudShot.textContent = s.shot || "—";
    hudFrame.textContent = String((s.frame || 0) + 1).padStart(3, "0");
    hudSpd.textContent = `${String(Math.min(299, Math.round(Math.abs(v) * 14))).padStart(3, "0")} km/h`;
    const d = v > 0.05 ? "fwd" : v < -0.05 ? "rev" : "idle";
    if (d !== dir) {
      dir = d;
      hudDir.textContent = d === "fwd" ? "▼ FORWARD" : d === "rev" ? "▲ REVERSE" : "■ IDLE";
      hudDir.className = "hud__dir" + (d === "fwd" ? " is-fwd" : d === "rev" ? " is-rev" : "");
    }
    set(barEl, "bar", "transform", `scaleY(${max > 0 ? (y / max).toFixed(4) : 0})`);
    if (!reduced) {
      set(root, "skew", "--skew", `${Math.max(-2.5, Math.min(2.5, v * 0.18)).toFixed(2)}deg`);
      set(shade, "vel", "--vel", Math.min(1, Math.abs(v) / 25).toFixed(2));
    }

    if (Math.abs(y - lastY) > 4) {
      header.classList.toggle("is-hidden", !header.classList.contains("is-open") && y > lastY && y > vh * 0.6);
      lastY = y;
    }
    header.classList.toggle("is-scrolled", y > 40);

    document.querySelectorAll("[data-scene]").forEach((sc, i) => {
      const r = sc.getBoundingClientRect();
      if (r.bottom < -vh * 0.2 || r.top > vh * 1.2) return;
      const p = (vh / 2 - (r.top + r.height / 2)) / vh;
      set(sc, "sc" + i, "--p", Math.max(-1, Math.min(1, p)).toFixed(3));
    });

    // Centre scrim for centred chapters, side scrim otherwise
    let centre = 0;
    document.querySelectorAll("[data-center]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      const inView = Math.min(r.bottom, vh) - Math.max(r.top, 0);
      centre = Math.max(centre, Math.min(1, inView / vh));
    });
    set(shade, "side", "--side", (1 - centre * 0.7).toFixed(2));
    set(shade, "center", "--center", centre.toFixed(2));
    const busy = (footer && footer.getBoundingClientRect().top < vh * 0.9) ||
      [...document.querySelectorAll("[data-busy]")].some((el) => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > vh - 120; });
    set(hud, "hud", "opacity", busy ? "0" : "1");

    const moving = Math.abs(v) > 0.002 || y !== prevY;
    prevY = y;
    if (moving) requestAnimationFrame(tick);
    else running = false;
  }
  window.addEventListener("scroll", kick, { passive: true });
  window.addEventListener("resize", kick);
  kick();
})();
