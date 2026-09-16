# QA — Late Apex site

> **Responsibility:** what was checked, how, and what the result was.
> Append-only, written by the verification gates. This is the evidence trail:
> if a task is marked DONE, the proof is here.
>
> `STATUS.md` says *whether* something is verified. This says *how*.

Each entry records:

- the task and the code state it was verified against
- which classes ran — CODE, RUNTIME, UI
- the verdict per class: PASS / FAIL / UNVERIFIED
- for UI: console errors, failed requests, viewports, screenshots

`UNVERIFIED` is a real result. A check that could not run is never recorded
as passing.

---

## T1 — Test harness: server, lint, Playwright smoke/layout/visual

Verified 2026-09-16 16:04 against code `6203ff71d590`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 16:04
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 16:02
  - routes: /, /about.html, /contact.html, /pricing.html, /services.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 72 assertion(s) · 0 console error(s) · 0 failed request(s)
- **runtime** — PASS via `runtime-verify.mjs` · recorded 2026-09-16 16:04

## T2 — Director v2: interpolated frames, sub-frame blend, push-through transitions

Verified 2026-09-16 16:11 against code `fc0b60d68681`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 16:10

Recovery: 1 failed verification(s) over 1 attempt(s).
- #1 runtime FAIL — ENVIRONMENT
