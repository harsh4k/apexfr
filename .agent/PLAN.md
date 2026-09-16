# Plan — Phase 2: polish, real content, legal

Owner brief (16 Sep 2026, owner asleep, autonomous run): fix shot transitions,
laggy scrubbing, jerky page/text transitions, the red wipe motion, clipped hero
headline, remove "AI slop", rename the studio + new logo, real work from GitHub
(harsh4k) and LinkedIn, real projects (Synapical, Coffee Digital, Velsaro),
complexity × page-count pricing with a lower starter, legal pages for Indian and
foreign clients, Playwright visual + scalable tests. Agreements are next phase.

| ID | Task | Depends | Done when |
|----|------|---------|-----------|
| T1 | Test harness: static server, lint script, Playwright smoke + layout + visual tests across pages × viewports | — | `npm test` runs green against the current site |
| T2 | Director v2: 2× interpolated frames, sub-frame blending, blur-free "push-through" shot transitions, smoother inertia | T1 | scrubbing plays like video; no blur filter per frame; tests green |
| T3 | Motion cleanup: remove skew/jerk, reveal exits only off-screen, soft page transitions, pass-by bloom instead of bar wipe | T1 | no visible pop/jerk in pinned or page transitions; tests green |
| T4 | Brand: new studio name + SVG logo + favicon; de-slop copy and decoration | T1 | logo in nav, loader, footer; puns/gimmicks trimmed |
| T5 | UI glitches: hero headline clipping, responsive type, overlaps found by tests | T3, T4 | layout tests assert no clipped/overflowing text at 5 viewports |
| T6 | Real work + profile: GitHub repos, LinkedIn, Synapical / Coffee Digital / Velsaro | T4 | Work page shows only real projects with sources |
| T7 | Pricing: complexity × pages model, lower starter, INR/USD, live estimator | T4 | estimator works and is tested |
| T8 | Legal pages: privacy (DPDP + GDPR/CCPA), terms, refunds, licence; footer links | T4 | 4 pages live, linked, tested |
| T9 | Full visual pass: screenshots across pages × viewports, fix what's found | T2–T8 | visual suite green, QA notes written |
