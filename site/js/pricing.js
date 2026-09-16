/* Pricing: one rate card drives the package prices, the rate table and the
   estimator, so a price is only ever written once. Edit RATES to reprice. */
(function () {
  const RATES = {
    inr: { symbol: "₹", locale: "en-IN", setup: 4999, simple: 1500, standard: 3500, advanced: 7500,
      cms: 6000, payments: 8000, accounts: 12000, language: 4000, care: 1999,
      starter: 9999, growth: 34999, custom: 60000 },
    usd: { symbol: "$", locale: "en-US", setup: 79, simple: 25, standard: 55, advanced: 110,
      cms: 90, payments: 120, accounts: 180, language: 60, care: 29,
      starter: 149, growth: 449, custom: 900 },
  };
  const RUSH = 0.25;
  const root = document.getElementById("pricing-page");
  if (!root) return;
  let cur = "inr";

  const money = (n) => {
    const r = RATES[cur];
    return r.symbol + Math.round(n).toLocaleString(r.locale);
  };

  // Every [data-price="key"] shows RATES[cur][key]
  function paintPrices(animate) {
    root.querySelectorAll("[data-price]").forEach((el) => {
      const next = money(RATES[cur][el.dataset.price]);
      if (el.textContent === next) return;
      el.textContent = next;
      if (animate) { el.classList.remove("flip"); void el.offsetWidth; el.classList.add("flip"); }
    });
    root.querySelectorAll("[data-cur-note]").forEach((el) => { el.hidden = el.dataset.curNote !== cur; });
  }

  // ---- Estimator ----
  const form = document.getElementById("estimator-form");
  const out = {
    total: document.getElementById("estTotal"),
    lines: document.getElementById("estLines"),
    send: document.getElementById("estSend"),
  };

  function estimate() {
    const r = RATES[cur];
    const f = form.elements;
    const count = (name) => Math.max(0, Math.min(40, parseInt(f[name].value, 10) || 0));
    const pages = { simple: count("simple"), standard: count("standard"), advanced: count("advanced") };
    const lines = [["Setup", r.setup]];
    for (const k of ["simple", "standard", "advanced"]) {
      if (pages[k]) lines.push([`${pages[k]} × ${k} page${pages[k] > 1 ? "s" : ""}`, pages[k] * r[k]]);
    }
    for (const k of ["cms", "payments", "accounts"]) if (f[k].checked) lines.push([f[k].dataset.label, r[k]]);
    const langs = count("languages");
    if (langs) lines.push([`${langs} extra language${langs > 1 ? "s" : ""}`, langs * r.language]);
    let total = lines.reduce((s, [, v]) => s + v, 0);
    if (f.rush.checked) { lines.push(["Rush delivery (+25%)", total * RUSH]); total *= 1 + RUSH; }
    const pageCount = pages.simple + pages.standard + pages.advanced;
    return { lines, total, pageCount };
  }

  function render() {
    const { lines, total, pageCount } = estimate();
    out.total.textContent = money(total);
    out.lines.innerHTML = lines.map(([k, v]) => `<li><span>${k}</span><b>${money(v)}</b></li>`).join("");
    const summary = `Estimate from the pricing page: ${pageCount} pages, ${lines.slice(1).map(([k]) => k).join(", ")}. Total ${money(total)}.`;
    out.send.href = `contact.html?estimate=${encodeURIComponent(summary)}`;
  }

  if (form) {
    form.addEventListener("input", render);
    form.addEventListener("click", (e) => {
      const b = e.target.closest("[data-step]");
      if (!b) return;
      const input = form.elements[b.dataset.for];
      input.value = Math.max(0, Math.min(40, (parseInt(input.value, 10) || 0) + Number(b.dataset.step)));
      render();
    });
  }

  // ---- Currency ----
  const buttons = root.querySelectorAll(".toggle button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      cur = btn.dataset.cur;
      root.dataset.cur = cur;
      buttons.forEach((b) => {
        const on = b.dataset.cur === cur;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      paintPrices(true);
      if (form) render();
    });
  });

  paintPrices(false);
  if (form) render();
  window.PricingRates = RATES;   // exposed for tests
})();
