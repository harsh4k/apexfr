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

## T3 — Motion cleanup: no jerks, soft page transitions, pass-by bloom

Verified 2026-09-16 16:31 against code `adfb63361387`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 16:30
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 16:31
  - routes: /, /about.html, /contact.html, /pricing.html, /services.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 72 assertion(s) · 0 console error(s) · 0 failed request(s)

## T4 — Brand: new name, SVG logo, favicon, de-slop

Verified 2026-09-16 19:04 against code `54ff6915811d`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 19:02
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 19:04
  - routes: /, /about.html, /contact.html, /licence.html, /pricing.html, /privacy.html, /refunds.html, /services.html, /terms.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 120 assertion(s) · 0 console error(s) · 0 failed request(s)

## T6 — Real work + profile data

Verified 2026-09-16 19:23 against code `e4bb43fb6094`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 19:21
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 19:23
  - routes: /, /about.html, /contact.html, /licence.html, /pricing.html, /privacy.html, /refunds.html, /services.html, /terms.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 120 assertion(s) · 0 console error(s) · 0 failed request(s)

Recovery: 1 failed verification(s) over 1 attempt(s).
- #1 code FAIL — TEST: Work page was intentionally redesigned; only the desktop visual baseline was refreshed, so tablet/mobile/laptop baselines were stale → Refresh work-page baselines for all viewports and re-run the suite → PASS

## T7 — Pricing: complexity x pages model + estimator

Verified 2026-09-16 19:33 against code `29a08bb6f85e`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 19:31
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 19:33
  - routes: /, /about.html, /contact.html, /licence.html, /pricing.html, /privacy.html, /refunds.html, /services.html, /terms.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 120 assertion(s) · 0 console error(s) · 0 failed request(s)

## T8 — Legal pages: privacy, terms, refunds, licence

Verified 2026-09-16 19:41 against code `09e31bcc2b83`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 19:39
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 19:41
  - routes: /, /about.html, /contact.html, /licence.html, /pricing.html, /privacy.html, /refunds.html, /services.html, /terms.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 120 assertion(s) · 0 console error(s) · 0 failed request(s)

## T5 — UI glitches: hero clipping, responsive type, overlaps

Verified 2026-09-16 20:58 against code `2234d74a35fe`.

- **code** — PASS via `verify.mjs` · recorded 2026-09-16 20:58
- **ui** — PASS via `playwright-script` · recorded 2026-09-16 20:55
  - routes: /, /about.html, /contact.html, /licence.html, /pricing.html, /privacy.html, /refunds.html, /services.html, /terms.html, /work.html
  - viewports: mobile, desktop
  - states: default
  - 120 assertion(s) · 0 console error(s) · 0 failed request(s)
- **runtime** — PASS via `runtime-verify.mjs` · recorded 2026-09-16 20:54

Recovery: 3 failed verification(s) over 2 attempt(s).
- #1 code FAIL — TEST: Test suite grew to ~5 min after adding the small viewport and new tests; verify.mjs kills npm test at 240s → Cut fixed waits in page sweeps, raise workers, keep full coverage under the gate limit → FAIL
- #2 code FAIL — TEST: Visual settle condition waited for elements only slightly on screen, which by design stay hidden until 20% visible → Match the reveal rule: only require elements at least 25% visible (or tall) to be revealed → FAIL
- #3 code FAIL — TEST: Visual settle wait required barely-visible elements to be revealed; fixed to the 25%-visible rule, suite green twice (127 passed) → Record code evidence on the fixed suite → PASS
