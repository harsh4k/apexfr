# Late Apex

Website for Late Apex, Harshit Chauhan's independent web studio in Mumbai.
Six pages plus four legal pages, with AI-generated night-drift footage that
plays frame by frame as you scroll.

## Run it

```bash
npm install
npm run serve
```

Open http://localhost:5173.

## Check it

```bash
npm run lint
npm test
```

`npm test` runs Playwright across desktop, laptop, tablet and two phone sizes:
page health (errors, clipped text, sideways scroll, broken links), pricing and
form behaviour, legal pages, scroll smoothness, and visual snapshots.

## Change content

| To change | Edit | Then |
|---|---|---|
| Page text | `.work/pages/<page>.html` | `python .work/build_pages.py` |
| Legal text | `.work/legal/<page>.html` | `python .work/build_pages.py` |
| Prices | `RATES` in `site/js/pricing.js` | nothing |
| Name, email, profile links | `site/js/brand.js` | nothing |

## Footage

Frames are generated from the source clips and are not in git (about 350 MB).
To rebuild them, see "Where things live" in `AGENTS.md`.
