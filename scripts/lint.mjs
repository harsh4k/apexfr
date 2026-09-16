// Static checks for the hand-written site: JS syntax, HTML structure,
// local references that must exist, and the 300-line file budget.
import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { execFileSync } from "node:child_process";

const site = join(process.cwd(), "site");
const problems = [];
const walk = (dir) => readdirSync(dir).flatMap((f) => {
  const p = join(dir, f);
  if (f === "frames") return [];
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(site);

for (const f of files.filter((f) => extname(f) === ".js")) {
  try { execFileSync(process.execPath, ["--check", f], { stdio: "pipe" }); }
  catch (e) { problems.push(`${f}: syntax error\n${e.stderr}`); }
}

for (const f of files.filter((f) => [".js", ".css", ".html"].includes(extname(f)))) {
  const lines = readFileSync(f, "utf8").split("\n").length;
  if (lines > 300) problems.push(`${f}: ${lines} lines (budget 300)`);
}

for (const f of files.filter((f) => extname(f) === ".html")) {
  const html = readFileSync(f, "utf8");
  const name = f.slice(site.length + 1);
  if (!/<title>[^<]+<\/title>/.test(html)) problems.push(`${name}: missing <title>`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) problems.push(`${name}: missing meta description`);
  if (!/<html lang="/.test(html)) problems.push(`${name}: missing lang`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length) problems.push(`${name}: duplicate ids ${[...new Set(dupes)].join(", ")}`);
  const refs = [...html.matchAll(/(?:src|href)="([^"#:?]+)(?:[#?][^"]*)?"/g)].map((m) => m[1]).filter((r) => !r.startsWith("//"));
  for (const r of refs) {
    if (!existsSync(join(dirname(f), r))) problems.push(`${name}: broken local reference ${r}`);
  }
}

// Links written inside JS templates (nav, footer)
for (const f of files.filter((f) => extname(f) === ".js")) {
  const js = readFileSync(f, "utf8");
  for (const m of js.matchAll(/"([a-z0-9-]+\.html)(?:#[^"]*)?"/g)) {
    if (!existsSync(join(site, m[1]))) problems.push(`${f.slice(site.length + 1)}: links to missing page ${m[1]}`);
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  console.error(`\nlint: ${problems.length} problem(s)`);
  process.exit(1);
}
console.log(`lint: ${files.length} files OK`);
