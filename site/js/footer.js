/* Footer markup + behaviour (newsletter, local clock, back-to-top). */
(function () {
  const cols = [
    ["Studio", [["Home", "index.html"], ["About", "about.html"], ["Open books", "about.html#numbers"], ["Work", "work.html"]]],
    ["Services", [["Launch sites", "services.html"], ["Web apps", "services.html"], ["Online stores", "services.html"], ["Process", "services.html#process"]]],
    ["Resources", [["Pricing", "pricing.html"], ["Cost breakdown", "pricing.html#cost"], ["FAQ", "pricing.html#cost-chapter"], ["Start a project", "contact.html"]]],
    ["Elsewhere", [["GitHub", "https://github.com"], ["LinkedIn", "https://linkedin.com"], ["Instagram", "https://instagram.com"], ["Dribbble", "https://dribbble.com"]]],
  ];

  const colHtml = cols.map(([title, links]) => `
    <div class="footer__col" data-reveal>
      <h3>${title}</h3>
      <ul>${links.map(([t, h]) => {
        const ext = h.startsWith("http") ? ' target="_blank" rel="noopener"' : "";
        return `<li><a href="${h}"${ext}>${t}</a></li>`;
      }).join("")}</ul>
    </div>`).join("");

  const word = "HARSH/STUDIO".split("").map((c, i) =>
    `<span style="--i:${i}"${c === "/" ? ' class="slash"' : ""}>${c}</span>`).join("");

  const footer = document.getElementById("footer");
  footer.innerHTML = `
    <div class="footer__top">
      <div class="footer__pitch" data-reveal>
        <h2>Got a project that<br>needs to <span>move?</span></h2>
        <span class="status mono"><i></i>Booking October · 2 of 3 slots open</span>
      </div>
      <form class="news" id="news" data-reveal novalidate>
        <label for="newsEmail">Monthly pit notes — one email on speed, design and pricing. No spam.</label>
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
        <span class="mono">Studio time · IST</span>
        <b id="clock">--:--:--</b>
        <span>Replies within 24 hours, Mon–Sat.<br><a href="mailto:hello@harsh.studio">hello@harsh.studio</a></span>
      </div>
    </div>
    <p class="wordmark" aria-hidden="true" data-cursor="Top ↑"><span class="wordmark__in">${word}</span></p>
    <div class="footer__bottom">
      <span>© ${new Date().getFullYear()} Harsh Studio. Built by hand, no templates.</span>
      <nav aria-label="Legal"><a href="pricing.html#cost-chapter">Payment terms</a><a href="contact.html">Privacy</a><a href="contact.html">Terms</a></nav>
      <button class="to-top mono" id="toTop" type="button">Back to start ↑</button>
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
