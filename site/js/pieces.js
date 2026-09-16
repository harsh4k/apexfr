/* Set pieces driven by Director "chapter:progress" events (p = 0..1).
   Every chapter also gets --cp so CSS can react to its progress. */
(function () {
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const range = (p, a, b) => clamp((p - a) / (b - a), 0, 1);

  document.querySelectorAll("[data-chapter]").forEach((el) => {
    let last = "";
    el.addEventListener("chapter:progress", (e) => {
      const v = e.detail.p.toFixed(3);
      if (v !== last) { last = v; el.style.setProperty("--cp", v); }
    });
  });

  // A — Services orbit: one service per quarter of the orbit
  document.querySelectorAll("[data-piece='orbit']").forEach((el) => {
    const cards = [...el.querySelectorAll(".orbit__card")];
    const ticks = [...el.querySelectorAll(".orbit__tick")];
    let active = -1;
    el.addEventListener("chapter:progress", (e) => {
      const i = clamp(Math.floor(e.detail.p * cards.length), 0, cards.length - 1);
      if (i === active) return;
      const dir = i > active ? "up" : "down";
      active = i;
      cards.forEach((c, k) => {
        c.dataset.state = k === i ? "in" : k < i ? "above" : "below";
        c.dataset.dir = dir;
        c.setAttribute("aria-hidden", String(k !== i));
      });
      ticks.forEach((t, k) => t.classList.toggle("is-on", k <= i));
    });
  });

  // B — Lamp run: each lamp pass lights one lap card; the track follows the car
  document.querySelectorAll("[data-piece='lamps']").forEach((el) => {
    const cards = [...el.querySelectorAll(".lamp")];
    const track = el.querySelector(".lamps__track");
    const marks = (el.dataset.lamps || "0.12,0.36,0.6,0.84").split(",").map(Number);
    el.addEventListener("chapter:progress", (e) => {
      const p = e.detail.p;
      cards.forEach((c, k) => {
        const lit = p >= marks[k];
        if (c.classList.contains("is-lit") !== lit) c.classList.toggle("is-lit", lit);
        c.style.setProperty("--glow", range(p, marks[k] - 0.04, marks[k] + 0.06).toFixed(3));
      });
      if (track) {
        const maxShift = Math.max(0, track.scrollWidth - track.parentElement.clientWidth);
        track.style.transform = `translate3d(${(-maxShift * range(p, 0.05, 0.95)).toFixed(1)}px,0,0)`;
      }
    });
  });

  // C — Pass-by: headline lands on the pass, red frames wipe into the footer
  document.querySelectorAll("[data-piece='passby']").forEach((el) => {
    // a pass-by that closes the page hands its red straight to the footer
    const footer = document.getElementById("footer");
    if (footer && !el.nextElementSibling) footer.classList.add("footer--from-red");
    const slam = el.querySelector("[data-slam]");
    const wipe = el.querySelector(".wipe");
    const at = parseFloat(el.dataset.pass || "0.5");
    el.addEventListener("chapter:progress", (e) => {
      const p = e.detail.p;
      if (slam) slam.classList.toggle("is-slammed", p >= at);
      el.classList.toggle("is-approach", p > 0.08);
      if (wipe) wipe.style.transform = `scaleY(${range(p, 0.8, 0.98).toFixed(3)})`;
      el.classList.toggle("is-wiped", p > 0.9);
    });
  });
})();
