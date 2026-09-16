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

  // object-fit: cover, with a focal point, an extra zoom and a vertical nudge
  function cover(img, alpha, focal, zoom = 1, nudge = 0) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const k = Math.max(w / iw, h / ih) * zoom;
    const dw = iw * k, dh = ih * k;
    const dx = clamp(w / 2 - dw * focal, w - dw, 0);
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, dx, (h - dh) / 2 + nudge * h, dw, dh);
  }

  // Warm horizontal lens streak with a soft core, added over the picture
  function flare(g) {
    if (g < 0.01) return;
    const cx = w * 0.5, cy = h * 0.52;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, h * 0.55);
    core.addColorStop(0, `rgba(255,236,214,${0.75 * g})`);
    core.addColorStop(0.35, `rgba(255,170,110,${0.28 * g})`);
    core.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);
    const band = h * (0.006 + 0.02 * g);
    const streak = ctx.createLinearGradient(0, 0, w, 0);
    streak.addColorStop(0, "rgba(120,160,255,0)");
    streak.addColorStop(0.5, `rgba(235,240,255,${0.9 * g})`);
    streak.addColorStop(1, "rgba(120,160,255,0)");
    ctx.fillStyle = streak;
    ctx.fillRect(0, cy - band / 2, w, band);
    ctx.restore();
  }

  // Frame position (float) for a chapter at scroll position y
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

  // Draws frame q with its neighbour blended in by the fractional part, so
  // slow scrolling glides between frames instead of stepping.
  function drawAt(shot, q, alpha, focal, zoom, nudge) {
    const i = Math.floor(q), f = q - i;
    const a = frame(shot, i);
    if (!a) return false;
    cover(a, alpha, focal, zoom, nudge);
    if (f > 0.04 && i + 1 < SHOTS[shot].count) {
      const b = frame(shot, i + 1);
      if (b && b !== a) cover(b, alpha * f, focal, zoom, nudge);
    }
    return true;
  }

  function paint(c, y, vh, alpha, zoom, nudge) {
    const shot = SHOTS[c.shot];
    const { q, p } = position(c, y, vh);
    const focal = parseFloat(c.el.dataset.focal || (portrait ? 0.42 : 0.5));
    const dim = parseFloat(c.el.dataset.dim || 1);
    let shown = Math.round(q);
    if (c.el.dataset.mode === "loop" && shot.fade) {
      // the loop's tail dissolves into its head, so the lap never cuts
      const b = shot.fade + q, start = shot.count - shot.fade;
      drawAt(c.shot, Math.min(shot.count - 1, b), alpha, focal, zoom, nudge);
      if (b >= start) drawAt(c.shot, b - start, alpha * ((b - start) / shot.fade), focal, zoom, nudge);
      shown = Math.round(b >= start + shot.fade / 2 ? b - start : b);
    } else if (!drawAt(c.shot, q, alpha, focal, zoom, nudge)) {
      return { p, frame: shown };
    }
    if (dim < 1) { ctx.globalAlpha = alpha * (1 - dim); ctx.fillStyle = "#07080b"; ctx.fillRect(0, 0, w, h); }
    ctx.globalAlpha = 1;
    return { p, frame: shown };
  }

  function update(y, dt, reduced) {
    const vh = cssH || window.innerHeight;
    sy = reduced ? y : sy + (y - sy) * (1 - Math.exp(-dt * 7));
    if (Math.abs(y - sy) < 0.2) sy = y;
    if (!chapters.length) return { velocity: 0 };

    // Chapter under the middle of the screen, plus the one sliding in
    const mid = sy + vh / 2;
    let idx = chapters.findIndex((c) => mid >= c.top && mid < c.top + c.height);
    if (idx < 0) idx = mid < chapters[0].top ? 0 : chapters.length - 1;
    const next = chapters.find((c) => c.top > sy && c.top < sy + vh);
    let from = chapters[idx], to = null, t = 0;
    if (next) {
      t = clamp((sy + vh - next.top - vh * 0.1) / (vh * 0.75), 0, 1);
      if (t > 0 && t < 1) { from = chapters[chapters.indexOf(next) - 1] || from; to = next; }
    }

    const key = `${from.shot}|${to ? to.shot : ""}|${sy.toFixed(2)}|${w}x${h}`;
    let info = lastInfo;
    if (key !== lastKey) {
      lastKey = key;
      if (to) {
        // Flare cut: the outgoing shot pushes forward and fades out, the
        // incoming one settles in behind an anamorphic headlight flare that
        // peaks at the moment of the cut, so the two never double-expose.
        const k = smooth(t);
        const out = clamp(1 - k / 0.56, 0, 1), inn = clamp((k - 0.44) / 0.56, 0, 1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#07080b";
        ctx.fillRect(0, 0, w, h);
        const a = out > 0 ? paint(from, sy, vh, smooth(out), 1 + 0.08 * k, -0.03 * k) : lastInfo;
        const b = inn > 0 ? paint(to, sy, vh, smooth(inn), 1.08 - 0.08 * k, 0.03 * (1 - k)) : a;
        flare(Math.pow(Math.sin(k * Math.PI), 3));
        info = k > 0.5 ? b : a;
            } else {
        info = paint(from, sy, vh, 1, 1, 0);
      }
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
      shot: cur.el.dataset.label || "",
      frame: info.frame,
      progress: position(cur, sy, vh).p,
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
    const previewsDone = Promise.all(previews).then(() => Promise.all(shots.map((s) => store[s][previewTier(s)].done)));
    return { first: Promise.all([...previews, firstSharp]), full: previewsDone, shots };
  }

  return { init, update, measure };
})();
