/* Footer markup + behaviour (newsletter, local clock, back-to-top). */
(function () {
  const B = window.BRAND;
  const cols = [
    ["Studio", [["Home", "index.html"], ["About", "about.html"], ["Work", "work.html"], ["Contact", "contact.html"]]],
    ["Services", [["Websites", "services.html"], ["Web apps", "services.html"], ["Online stores", "services.html"], ["How it works", "services.html#process"]]],
    ["Pricing", [["Plans", "pricing.html"], ["Estimate a project", "pricing.html#estimator"], ["Where the money goes", "pricing.html#cost"], ["FAQ", "pricing.html#faq"]]],
    ["Elsewhere", [["GitHub", B.github], ["LinkedIn", B.linkedin], ["Portfolio", B.site]]],
  ];

  const colHtml = cols.map(([title, links]) => `
    <div class="footer__col" data-reveal>
      <h3>${title}</h3>
      <ul>${links.map(([t, h]) => {
        const ext = h.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
        return `<li><a href="${h}"${ext}>${t}</a></li>`;
      }).join("")}</ul>
    </div>`).join("");

  const word = [..."LATE APEX"].map((c, i) =>
    `<span style="--i:${i}">${c === " " ? "&nbsp;" : c}</span>`).join("") + `<span class="slash" style="--i:9">.</span>`;

  const footer = document.getElementById("footer");
  footer.innerHTML = `
    <div class="footer__top">
      <div class="footer__pitch" data-reveal>
        <h2>Have something<br>worth <span>building?</span></h2>
        <span class="status mono"><i></i>Taking new projects</span>
      </div>
      <form class="news" id="news" data-reveal novalidate>
        <label for="newsEmail">Occasional notes on building fast, honest websites. No spam, unsubscribe anytime.</label>
        <div class="news__field">
          <input id="newsEmail" name="email" type="email" placeholder="you@company.com" autocomplete="email" required />
          <button class="btn btn--brake" type="submit">Subscribe</button>
        </div>
        <p class="news__msg mono" id="newsMsg" role="status"></p>
      </form>
    </div>
    <div class="footer__grid">
      ${colHtml}
      <div class="footer__clock" data-reveal>
        <span class="mono">${B.location} · IST</span>
        <b id="clock">--:--:--</b>
        <span>Replies within a working day.<br><a href="mailto:${B.email}">${B.email}</a></span>
      </div>
    </div>
    <p class="wordmark" aria-hidden="true" data-cursor="Top ↑"><span class="wordmark__in">${word}</span></p>
    <div class="footer__bottom">
      <span class="footer__sign">${B.mark(18)} © ${new Date().getFullYear()} ${B.name} · ${B.person}</span>
      <nav aria-label="Legal"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="refunds.html">Refunds</a><a href="licence.html">Licence</a></nav>
      <button class="to-top mono" id="toTop" type="button">Back to top ↑</button>
    </div>`;

  // Newsletter: demo only — validates and confirms, sends nothing.
  const form = document.getElementById("news");
  const msg = document.getElementById("newsMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.elements.email;
    if (!input.checkValidity()) {
      msg.textContent = "That email looks off — try again.";
      input.focus();
      return;
    }
    msg.textContent = "You're on the grid. First notes land next month.";
    form.reset();
  });

  // Fit the wordmark edge to edge
  const mark = footer.querySelector(".wordmark");
  // Measured at a fixed 100px so the result doesn't depend on the previous
  // size, and re-run whenever the web font swaps in (that changes the width).
  const inner = mark.firstElementChild;
  let fitting = false;
  const fit = () => {
    if (fitting) return;
    fitting = true;
    mark.style.fontSize = "100px";
    const avail = mark.clientWidth;
    const used = inner.getBoundingClientRect().width;
    if (used > 0 && avail > 0) mark.style.fontSize = `${Math.floor((100 * avail / used) * 0.97 * 10) / 10}px`;
    requestAnimationFrame(() => { fitting = false; });
  };
  fit();
  if (document.fonts) {
    document.fonts.load('900 100px "Big Shoulders Display"').then(fit, fit);
    document.fonts.addEventListener("loadingdone", fit);
  }
  window.addEventListener("resize", fit);
  window.addEventListener("load", fit);

  // Live IST clock
  const clock = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 1000);

  const toTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("toTop").addEventListener("click", toTop);
  mark.addEventListener("click", toTop);
})();
