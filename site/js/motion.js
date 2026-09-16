/* Text + element motion. Every animated element carries data-state:
   "below" (not reached yet), "in" (on screen) or "above" (scrolled past).
   Reveals run forward on the way down and in reverse on the way up. */
window.Motion = (function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Split text into masked words / characters (keeps inline tags) ----
  function split(el) {
    const mode = el.dataset.split;
    let n = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === Node.ELEMENT_NODE) return walk(child);
        if (child.nodeType !== Node.TEXT_NODE) return;
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) return frag.append(" ");
          if (mode === "chars") {
            const word = document.createElement("span");
            word.style.cssText = "display:inline-block;white-space:nowrap";
            [...tok].forEach((ch) => word.append(mask(ch, n++)));
            frag.append(word);
          } else {
            frag.append(mask(tok, n++));
          }
        });
        child.replaceWith(frag);
      });
    };
    walk(el);
  }
  function mask(text, i) {
    const w = document.createElement("span");
    w.className = "w";
    const inner = document.createElement("i");
    inner.textContent = text;
    inner.style.setProperty("--i", i);
    w.append(inner);
    return w;
  }

  // ---- Scramble: letters resolve left to right ----
  const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/#%&";
  function scramble(el) {
    const final = el.dataset.text || (el.dataset.text = el.textContent);
    if (reduced) return;
    const start = performance.now();
    const dur = 700 + final.length * 12;
    cancelAnimationFrame(el._raf);
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const solved = Math.floor(t * final.length);
      let out = final.slice(0, solved);
      for (let i = solved; i < final.length; i++) {
        out += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (t < 1) el._raf = requestAnimationFrame(step);
      else el.textContent = final;
    };
    el._raf = requestAnimationFrame(step);
  }

  // ---- Count-up numbers ----
  function count(el, on) {
    const to = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    cancelAnimationFrame(el._raf);
    if (!on) { el.textContent = (0).toFixed(dec); return; }
    if (reduced) { el.textContent = to.toFixed(dec); return; }
    const start = performance.now();
    const dur = 1600;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      el.textContent = (to * e).toFixed(dec);
      if (t < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  function setState(el, state) {
    if (el.dataset.state === state) return;
    el.dataset.state = state;
    const on = state === "in";
    if (on && el.hasAttribute("data-scramble")) scramble(el);
    el.querySelectorAll("[data-count]").forEach((c) => count(c, on));
    if (el.hasAttribute("data-count")) count(el, on);
  }

  function init() {
    document.querySelectorAll("[data-split]").forEach(split);

    // Stagger siblings that reveal together
    const groups = new Map();
    document.querySelectorAll("[data-reveal]").forEach((el) => {
      const list = groups.get(el.parentElement) || [];
      el.style.setProperty("--d", list.length * 90);
      list.push(el);
      groups.set(el.parentElement, list);
    });

    const targets = document.querySelectorAll("[data-split], [data-reveal], [data-scramble], .wordmark");
    targets.forEach((el) => {
      el.dataset.state = "below";
      if (el.hasAttribute("data-scramble")) el.dataset.text = el.textContent;
    });

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach((el) => setState(el, "in"));
      return;
    }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) setState(en.target, "in");
        else setState(en.target, en.boundingClientRect.top < 0 ? "above" : "below");
      });
    }, { rootMargin: "-6% 0px -6% 0px", threshold: 0 });
    targets.forEach((el) => io.observe(el));
  }

  return { init, reduced };
})();
