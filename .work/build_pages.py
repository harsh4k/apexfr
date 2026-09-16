"""Wraps .work/pages/<name>.html bodies in the shared page shell → site/<name>.html"""
import pathlib, re
ROOT = pathlib.Path("X:/Projects/Websites/Webci")
head = (ROOT / "site/index.html").read_text(encoding="utf-8")
shell_top = head.split("<body")[0]
META = {
  "services": ("Services — Harsh Studio", "Launch sites, web apps, online stores and monthly care, built in a fixed 14-day process."),
  "work": ("Work — Harsh Studio", "Selected launches by Harsh Studio and the numbers they moved."),
  "pricing": ("Pricing — Harsh Studio", "Fixed, public prices for websites and web apps, with a full cost breakdown."),
  "about": ("About — Harsh Studio", "Who runs Harsh Studio, how it works, and what a studio of one earns."),
  "contact": ("Contact — Harsh Studio", "Send a project brief and get a fixed quote within 24 hours."),
}
tail = """
  <footer class="footer" id="footer"></footer>

  <script src="js/shots.js"></script>
  <script src="js/director.js"></script>
  <script src="js/motion.js"></script>
  <script src="js/interact.js"></script>
  <script src="js/footer.js"></script>
  <script src="js/pieces.js"></script>
{extra}  <script src="js/chrome.js"></script>
</body>
</html>
"""
for name, (title, desc) in META.items():
    body = (ROOT / f".work/pages/{name}.html").read_text(encoding="utf-8")
    extra = ""
    for m in re.findall(r"<!-- script: (\S+) -->", body):
        extra += f'  <script src="js/{m}"></script>\n'
    top = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", shell_top)
    top = re.sub(r'<meta name="description" content=".*?" />', f'<meta name="description" content="{desc}" />', top)
    html = (top + f'<body data-page="{name}">\n  <canvas id="stage" aria-hidden="true"></canvas>\n'
            '  <div class="stage-shade" aria-hidden="true"></div>\n\n  <main id="top">\n'
            + body + "  </main>\n" + tail.format(extra=extra))
    (ROOT / f"site/{name}.html").write_text(html, encoding="utf-8")
    print(name, html.count("\n"), "lines")
