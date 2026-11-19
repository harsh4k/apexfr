# Late Apex

**Late Apex** is an independent web studio concept by **Harshit Chauhan**, based in Mumbai.

The site is built around a cinematic, automotive-inspired visual language, with AI-generated night-drift footage that progresses frame-by-frame as the user scrolls. The experience combines motion, typography, and interaction to create a studio website that feels more like a digital piece than a conventional agency template.

## About

Late Apex explores how a small independent studio can present itself through:

* Scroll-driven visual storytelling
* Frame-by-frame video animation
* Motion-focused interactions
* Minimal editorial typography
* Automotive-inspired art direction
* Responsive layouts across desktop, tablet, and mobile

The project includes **six primary pages** alongside **four legal pages**.

## Project Structure

| Area             | Location                        |
| ---------------- | ------------------------------- |
| Page content     | `.work/pages/<page>.html`       |
| Legal content    | `.work/legal/<page>.html`       |
| Pricing          | `RATES` in `site/js/pricing.js` |
| Brand details    | `site/js/brand.js`              |
| Page generation  | `.work/build_pages.py`          |
| Project guidance | `AGENTS.md`                     |

## Visual System

The visual direction is intentionally restrained, focusing on:

* Dark cinematic environments
* High-contrast typography
* Large editorial layouts
* Smooth scrolling
* Scroll-synchronized motion
* AI-generated night driving footage

The hero experience uses generated footage broken into individual frames, allowing the animation to react directly to scroll position rather than behaving like a conventional autoplay video.

## Footage

The scroll-driven footage is generated from source clips and stored separately from the repository due to its size.

The complete frame sequence is approximately **350 MB**.

Instructions for rebuilding the footage are documented in `AGENTS.md`.

## Run locally

```sh
npm ci
npm run serve
```

Open `http://localhost:5173`. The pages work from a fresh checkout. The frame-by-frame animation needs the separately stored footage. The project brief and newsletter are demos that validate input in the browser. Use the studio’s profile links for real enquiries.

```sh
npm run lint
npx playwright install chromium
npm test
```

Motion tests use a small generated frame sequence when `site/frames/` is absent. Put the original frame pack there to test the actual footage.

## Project Notes

Late Apex was created as an experimental independent studio website, primarily exploring **art direction, motion design, interaction, and frontend implementation** rather than representing a traditional production agency.

It is intentionally treated as a standalone creative project.

## License

The original site code and development tools are available under the [MIT License](LICENSE). Brand assets, copy, footage, legal templates, screenshots, fonts, and third-party components retain their respective terms.
