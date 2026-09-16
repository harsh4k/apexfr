/* Project brief form — demo only: validates and confirms, sends nothing. */
(function () {
  const form = document.getElementById("brief");
  if (!form) return;
  const msg = document.getElementById("briefMsg");

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
      msg.textContent = `Add your ${list} to send the brief.`;
      bad[0].focus();
      return;
    }
    const type = form.elements.type.value;
    const name = form.elements.name.value.trim().split(" ")[0];
    msg.textContent = `Thanks, ${name}. Your ${type.toLowerCase()} brief is in; expect a quote within 24 hours.`;
    if (window.Interact) Interact.toast("Brief received");
    form.reset();
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  });
})();
