/* Currency toggle on the pricing page. */
(function () {
  const pricing = document.getElementById("pricing");
  if (!pricing) return;
  const buttons = pricing.querySelectorAll(".toggle button");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cur = btn.dataset.cur;
      pricing.dataset.cur = cur;
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-on", on);
        b.setAttribute("aria-pressed", String(on));
      });
      pricing.querySelectorAll("[data-inr]").forEach((el) => {
        el.textContent = el.dataset[cur];
        el.classList.remove("flip");
        void el.offsetWidth;
        el.classList.add("flip");
      });
    });
  });
})();
