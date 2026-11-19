"""Builds site/<name>.html from .work/pages/<name>.html bodies and the legal
fragments in .work/legal/, wrapped in one shared shell."""
import pathlib, re, html

ROOT = pathlib.Path(__file__).resolve().parents[1]
FAVICON = ("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 64 64%27%3E"
           "%3Crect width=%2764%27 height=%2764%27 rx=%2714%27 fill=%27%2307080b%27/%3E"
           "%3Cpath d=%27M14 52 L29 14%27 stroke=%27%23f2efe9%27 stroke-width=%277%27 stroke-linecap=%27round%27 fill=%27none%27/%3E"
           "%3Cpath d=%27M29 14 C36 13 41 23 44 32 S49 48 53 52%27 stroke=%27%23f2efe9%27 stroke-width=%277%27 stroke-linecap=%27round%27 fill=%27none%27/%3E"
           "%3Ccircle cx=%2743.6%27 cy=%2731%27 r=%275.5%27 fill=%27%23ff3347%27/%3E%3C/svg%3E")

JSONLD = """
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"ProfessionalService","name":"Late Apex","description":"Independent web studio building websites and web apps.","founder":{"@type":"Person","name":"Harshit Chauhan","jobTitle":"Full-stack developer","sameAs":["https://github.com/harsh4k","https://www.linkedin.com/in/harshit-chauhan-17a898364/","https://harshh.pages.dev/"]},"address":{"@type":"PostalAddress","addressLocality":"Mumbai","addressCountry":"IN"},"areaServed":"Worldwide"}</script>"""

PAGES = {
  "index": ("Late Apex — Websites and web apps by Harshit Chauhan", "Late Apex is Harshit Chauhan's independent studio in Mumbai: fast, hand-built websites and web apps for clients in India and abroad, priced by pages and complexity."),
  "services": ("Services — Late Apex", "Websites, web apps, online stores and monthly care, built in a fixed two-week process."),
  "work": ("Work — Late Apex", "Projects built by Harshit Chauhan: Synapical, Coffee Digital, Velsaro and open-source work on GitHub."),
  "pricing": ("Pricing — Late Apex", "How Late Apex prices a website: number of pages times their complexity, with a live estimate in INR or USD."),
  "about": ("About — Late Apex", "Harshit Chauhan, the developer behind Late Apex: how he works and what he builds."),
  "404": ("Page not found — Late Apex", "This page doesn't exist on the Late Apex site."),
  "contact": ("Contact — Late Apex", "Try the Late Apex project brief demo or find the studio’s profile links."),
}
LEGAL = {
  "privacy": ("Privacy Policy", "How Late Apex collects, uses and protects personal data under India's DPDP Act, GDPR and CCPA."),
  "terms": ("Terms of Service", "The terms Late Apex works under with clients in India and abroad."),
  "refunds": ("Refund & Cancellation Policy", "When Late Apex refunds payments, and how cancellations work."),
  "licence": ("Software Licence", "What you may do with code and tools delivered by Late Apex."),
}
STYLES = ["tokens", "base", "sections", "pricing", "footer", "interact", "pages", "legal"]
SCRIPTS = ["brand", "shots", "director", "motion", "interact", "footer", "pieces"]

def shell(name, title, desc, body, extra_scripts=(), loader=False):
    css = "\n".join(f'  <link rel="stylesheet" href="css/{s}.css" />' for s in STYLES)
    js = "\n".join(f'  <script src="js/{s}.js"></script>' for s in [*SCRIPTS, *extra_scripts, "chrome"])
    load = ""
    if loader:
        load = """
  <div class="loader" id="loader" aria-hidden="true">
    <div class="loader__brand"><svg width="44" height="44" viewBox="0 0 64 64" fill="none"><path d="M10 54 L27 12" stroke="#f2efe9" stroke-width="6.5" stroke-linecap="round"/><path d="M27 12 C 35 11, 41 22, 44 32 S 50 50, 55 54" stroke="#f2efe9" stroke-width="6.5" stroke-linecap="round"/><circle cx="43.6" cy="31" r="5.2" fill="#ff3347"/></svg>Late Apex</div>
    <div class="loader__bar"><i id="loaderBar"></i></div>
  </div>
"""
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}" />
  <meta name="theme-color" content="#07080b" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(desc)}" />
  <meta property="og:type" content="website" />
  <link rel="icon" href="{FAVICON}" />{JSONLD if name == "index" else ""}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@500;700;800;900&family=JetBrains+Mono:wght@400;500&family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet" />
{css}
</head>
<body data-page="{name}">
  <canvas id="stage" aria-hidden="true"></canvas>
  <div class="stage-shade" aria-hidden="true"></div>
{load}
  <main id="top">
{body}  </main>

  <footer class="footer" id="footer"></footer>

{js}
</body>
</html>
"""

def build():
    for name, (title, desc) in PAGES.items():
        body = (ROOT / f".work/pages/{name}.html").read_text(encoding="utf-8")
        extra = re.findall(r"<!-- script: (\S+?)\.js -->", body)
        out = shell(name, title, desc, body, extra, loader=(name == "index"))
        (ROOT / f"site/{name}.html").write_text(out, encoding="utf-8")
        print(name, out.count("\n"), "lines")
    for name, (heading, desc) in LEGAL.items():
        frag = (ROOT / f".work/legal/{name}.html").read_text(encoding="utf-8")
        # unfilled placeholders stay visible until the owner fills them in
        frag = re.sub(r"\[([A-Z][A-Z .,%]+[^\]]*)\]", r'<mark class="ph">[\1]</mark>', frag)
        toc = "".join(f'<li><a href="#{i}">{re.sub(r"<.*?>", "", h)}</a></li>'
                      for i, h in re.findall(r'<section id="([^"]+)">\s*<h2>(.*?)</h2>', frag))
        others = " · ".join(f'<a href="{k}.html"{" aria-current=\"page\"" if k == name else ""}>{v[0]}</a>' for k, v in LEGAL.items())
        body = f"""    <section class="chapter page-hero legal-hero" data-chapter data-shot="loop" data-mode="loop" data-label="Legal" data-dim="0.35">
      <p class="page-hero__index mono">Legal</p>
      <h1 data-split="words">{html.escape(heading)}</h1>
      <p class="legal__others">{others}</p>
    </section>
    <div class="legal-wrap" data-busy>
      <nav class="legal__toc" aria-label="On this page"><p class="mono">On this page</p><ol>{toc}</ol></nav>
      <article class="legal">
{frag}
      </article>
    </div>
"""
        out = shell(name, f"{heading} — Late Apex", desc, body)
        (ROOT / f"site/{name}.html").write_text(out, encoding="utf-8")
        print(name, out.count("\n"), "lines")

build()
