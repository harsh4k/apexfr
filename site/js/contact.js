/* Project brief preview. */
(function () {
  const form = document.getElementById("brief");
  if (!form) return;
  const msg = document.getElementById("briefMsg");
  form.querySelector('button[type="submit"]').disabled = false;

  // Arriving from the pricing estimator: carry the estimate into the brief
  const est = new URLSearchParams(location.search).get("estimate");
  if (est) form.elements.message.value = `${est.slice(0, 400)}

`;

  const check = (el) => {
    const ok = el.checkValidity() && el.value.trim() !== "";
    el.setAttribute("aria-invalid", String(!ok));
    return ok;
  };
  form.querySelectorAll("[required]").forEach((el) => {
    el.addEventListener("blur", () => check(el));
    el.addEventListener("input", () => { if (el.getAttribute("aria-invalid") === "true") check(el); });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll("[required]")].filter((el) => !check(el));
    if (bad.length) {
      const words = { name: "name", email: "email", message: "project details" };
      const names = bad.map((el) => words[el.name] || el.name);
      const list = names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0];
      msg.textContent = `Add your ${list} to complete the brief.`;
      bad[0].focus();
      return;
    }
    msg.textContent = "The required fields are complete. This demo keeps the details on this page.";
  });
})();
