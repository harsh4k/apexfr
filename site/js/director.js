/* Director — plays a different shot behind each chapter of a page.
   Chapters are elements with data-chapter and data-shot. A pinned chapter
   (.chapter--pin) scrubs its whole shot while it is stuck to the screen; a free
   chapter scrubs as it passes through. data-mode="loop" scrubs a looping
   clip continuously instead. Neighbouring shots cross-fade with a short blur
   so every cut reads as a whip-pan. Frames load in two tiers: a light preview
   set for every shot on the page, then sharp frames for the current and next
   chapter only. */
window.Director = (function () {
  const SHOTS = window.SHOTS || {};
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d", { alpha: false });
  const store = {};           // shot -> tier -> { imgs, ready }
  let chapters = [];
  let w = 0, h = 0, cssW = 0, cssH = 0, portrait = false;
  let sy = 0, lastKey = "", lastInfo = { p: 0, frame: 0 }, onProgress = () => {};

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const src = (shot, tier, i) => `frames/${shot}/${tier}/f${String(i + 1).padStart(3, "0")}.webp`;

  function slot(shot, tier) {
    const n = SHOTS[shot].count;
    store[shot] = store[shot] || {};
    return (store[shot][tier] = store[shot][tier] || { imgs: new Array(n), ready: new Uint8Array(n), started: false });
  }

  function loadOne(shot, tier, i) {
    const s = slot(shot, tier);
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => img.decode().catch(() => {}).then(() => {
        s.imgs[i] = img; s.ready[i] = 1; lastKey = ""; onProgress(); resolve();
      });
      img.onerror = () => resolve();
      img.src = src(shot, tier, i);
    });
  }

  // Coarse-to-fine order so scrubbing works before the set is complete
  function order(n) {
    const out = [], seen = new Set();
    for (const s of [8, 4, 2, 1]) for (let i = 0; i < n; i += s) if (!seen.has(i)) { seen.add(i); out.push(i); }
    return out;
  }
  function loadShot(shot, tier, workers = 4) {
    const s = slot(shot, tier);
    if (s.started) return s.done;
    s.started = true;
    const queue = order(SHOTS[shot].count);
    const first = queue.splice(0, Math.ceil(queue.length / 8));
    s.first = Promise.all(first.map((i) => loadOne(shot, tier, i)));
    s.done = s.first.then(() => Promise.all(Array.from({ length: workers }, async () => {
      while (queue.length) await loadOne(shot, tier, queue.shift());
    })));
    return s.first;
  }

  const tiersOf = (shot) => SHOTS[shot].tiers;
  const previewTier = (shot) => tiersOf(shot)[0];
  function sharpTier(shot) {
    const tiers = tiersOf(shot);
    const need = Math.max(w, (h * SHOTS[shot].aspect)) * (cssW < 900 ? 0.75 : 1);
    const pick = tiers.find((t) => t >= need * 0.9) || tiers[tiers.length - 1];
    return cssW < 900 ? Math.min(pick, tiers[1]) : pick;   // phones stop at the middle tier
  }

  function frame(shot, i) {
    for (const tier of [sharpTier(shot), previewTier(shot)]) {
      const s = store[shot] && store[shot][tier];
      if (!s) continue;
      if (s.ready[i]) return s.imgs[i];
    }
    for (const tier of [sharpTier(shot), previewTier(shot)]) {
      const s = store[shot] && store[shot][tier];
      if (!s) continue;
      for (let d = 1; d < s.ready.length; d++) {
        if (s.ready[i - d]) return s.imgs[i - d];
        if (s.ready[i + d]) return s.imgs[i + d];
      }
    }
    return null;
  }

  function measure() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    cssW = r.width; cssH = r.height;
    w = Math.round(cssW * dpr); h = Math.round(cssH * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    portrait = cssH > cssW * 1.1;
    chapters.forEach((c) => {
      const b = c.el.getBoundingClientRect();
      c.top = b.top + window.scrollY;
      c.height = b.height;
      const alt = c.el.dataset.shotPortrait;
      c.shot = portrait && alt && SHOTS[alt] ? alt : c.el.dataset.shot;
    });
    lastKey = "";
  }

  function cover(img, alpha, focal) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const k = Math.max(w / iw, h / ih);
    const dw = iw * k, dh = ih * k;
    const dx = clamp(w / 2 - dw * focal, w - dw, 0);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, (h - dh) / 2, dw, dh);
  }

  // Frame index (float) for a chapter at scroll position y
  function position(c, y, vh) {
    const shot = SHOTS[c.shot];
    if (c.el.dataset.mode === "loop") {
      const lap = shot.count - (shot.fade || 0);
      const q = (((y / (vh * 3.2)) * lap) % lap + lap) % lap;
      return { q, p: q / lap };
    }
    const pinned = c.el.classList.contains("chapter--pin");
    const p = pinned
      ? clamp((y - c.top) / Math.max(1, c.height - vh), 0, 1)
      : clamp((y - (c.top - vh)) / (c.height + vh), 0, 1);
    return { q: p * (shot.count - 1), p };
  }

  function paint(c, y, vh, alpha, blur) {
    const shot = SHOTS[c.shot];
    const { q, p } = position(c, y, vh);
    const focal = parseFloat(c.el.dataset.focal || (portrait ? 0.42 : 0.5));
    const dim = parseFloat(c.el.dataset.dim || 1);
    let base = Math.round(q), over = -1, oa = 0;
    if (c.el.dataset.mode === "loop" && shot.fade) {
      const b = shot.fade + q, start = shot.count - shot.fade;
      base = Math.min(shot.count - 1, Math.floor(b));
      if (b >= start) { over = Math.floor(b - start); oa = (b - start) / shot.fade; }
    }
    const img = frame(c.shot, base);
    if (!img) return { p, frame: base };
    ctx.filter = blur > 0.3 ? `blur(${blur.toFixed(1)}px)` : "none";
    cover(img, alpha, focal);
    if (over >= 0 && oa > 0.01) { const o = frame(c.shot, over); if (o) cover(o, alpha * oa, focal); }
    ctx.filter = "none";
    if (dim < 1) { ctx.globalAlpha = alpha * (1 - dim); ctx.fillStyle = "#07080b"; ctx.fillRect(0, 0, w, h); }
    ctx.globalAlpha = 1;
    return { p, frame: oa > 0.5 ? over : base };
  }

  function update(y, dt, reduced) {
    const vh = cssH || window.innerHeight;
    sy = reduced ? y : sy + (y - sy) * (1 - Math.exp(-dt * 9));
    if (Math.abs(y - sy) < 0.3) sy = y;
    if (!chapters.length) return { velocity: 0 };

    // Chapter under the middle of the screen, plus the one sliding in
    const mid = sy + vh / 2;
    let idx = chapters.findIndex((c) => mid >= c.top && mid < c.top + c.height);
    if (idx < 0) idx = mid < chapters[0].top ? 0 : chapters.length - 1;
    const next = chapters.find((c) => c.top > sy && c.top < sy + vh);
    let from = chapters[idx], to = null, t = 0;
    if (next) {
      t = clamp((sy + vh - next.top - vh * 0.15) / (vh * 0.55), 0, 1);
      if (t > 0 && t < 1) { from = chapters[chapters.indexOf(next) - 1] || from; to = next; }
    }

    const key = `${from.shot}|${to ? to.shot : ""}|${sy.toFixed(1)}|${w}x${h}`;
    let info = lastInfo;
    if (key !== lastKey) {
      lastKey = key;
      const k = to ? smooth(t) : 0;
      const blur = to ? Math.sin(k * Math.PI) * 14 * (w / 1440) : 0;
      info = paint(from, sy, vh, 1, blur);
      if (to) info = k > 0.5 ? paint(to, sy, vh, k, blur) : (paint(to, sy, vh, k, blur), info);
      lastInfo = info;
    }

    // Progress events for set pieces, and sharp frames around the viewer
    chapters.forEach((c, i) => {
      if (c.top > sy + vh * 1.5 || c.top + c.height < sy - vh * 0.5) return;
      c.el.dispatchEvent(new CustomEvent("chapter:progress", { detail: position(c, sy, vh) }));
      if (Math.abs(i - idx) <= 1) loadShot(c.shot, sharpTier(c.shot), 3);
    });

    const cur = to && t > 0.5 ? to : from;
    return {
      velocity: (y - sy) / (vh / 48),
      shot: cur.el.dataset.label || cur.shot,
      frame: info.frame,
    };
  }

  function init(progressCb) {
    onProgress = progressCb || onProgress;
    chapters = [...document.querySelectorAll("[data-chapter]")]
      .filter((el) => SHOTS[el.dataset.shot])
      .map((el) => ({ el }));
    measure();
    sy = window.scrollY;
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(document.body);
    const shots = [...new Set(chapters.map((c) => c.shot))];
    const previews = shots.map((s) => loadShot(s, previewTier(s), 4));
    const firstSharp = chapters.length ? loadShot(chapters[0].shot, sharpTier(chapters[0].shot), 4) : Promise.resolve();
    return { first: Promise.all([...previews, firstSharp]), shots };
  }

  return { init, update, measure };
})();
