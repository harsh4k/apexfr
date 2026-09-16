// Minimal static server for site/ (no dependencies). PORT env, default 5173.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "site");
const port = Number(process.env.PORT) || 5173;
const types = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png",
  ".jpg": "image/jpeg", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8", ".xml": "application/xml",
};

createServer(async (req, res) => {
  try {
    let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[\\/]+/, "");
    if (path.includes("..")) throw Object.assign(new Error("bad path"), { code: 400 });
    let file = join(root, path || "index.html");
    if ((await stat(file).catch(() => null))?.isDirectory()) file = join(file, "index.html");
    const body = await readFile(file);
    const long = file.includes(`${join("site", "frames")}`);
    res.writeHead(200, {
      "Content-Type": types[extname(file)] || "application/octet-stream",
      "Cache-Control": long ? "public, max-age=31536000, immutable" : "no-cache",
    });
    res.end(body);
  } catch (e) {
    const code = e.code === 400 ? 400 : 404;
    const page = await readFile(join(root, "404.html")).catch(() => null);
    res.writeHead(code, { "Content-Type": "text/html; charset=utf-8" });
    res.end(page || "Not found");
  }
}).listen(port, () => console.log(`serving site/ on http://localhost:${port}`));
