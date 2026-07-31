import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const pagesDir = path.join(root, "pages");
const refresh = await readFile(path.join(root, "styles", "refresh.css"), "utf8");

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "server"), { recursive: true });
await mkdir(path.join(dist, ".openai"), { recursive: true });
await mkdir(path.join(dist, "preview"), { recursive: true });

const removeJuly24 = (html) => html.replace(/<a class="archive-item"[^>]*href="(?:\/nap\/2026-07-24|\/en\/day\/2026-07-24)"[\s\S]*?<\/a>/g, "");
const prepare = (html) => `<!doctype html>${removeJuly24(html)}`
  .replace(/<h1>([^<]+)<\/h1>/, '<h1 data-title="$1" aria-label="$1">$1</h1>')
  .replaceAll('data-theme-choice="light"', 'data-theme-choice="sunrise"')
  .replaceAll('data-theme-choice="dark"', 'data-theme-choice="sunset"')
  .replace(
    'root.dataset.theme = theme;',
    'const canonicalTheme = (theme === "light" || theme === "sunrise") ? "sunrise" : "sunset"; root.dataset.theme = canonicalTheme;'
  )
  .replace(
    'button.dataset.themeChoice === theme',
    '(button.dataset.themeChoice === "light" ? "sunrise" : button.dataset.themeChoice === "dark" ? "sunset" : button.dataset.themeChoice) === canonicalTheme'
  )
  .replace("</head>", `<style>${refresh}</style></head>`);

const pages = {
  "/nap/2026-07-31": prepare(await readFile(path.join(pagesDir, "day-hu.html"), "utf8")),
  "/en/day/2026-07-31": prepare(await readFile(path.join(pagesDir, "day-en.html"), "utf8")),
  "/archive": prepare(await readFile(path.join(pagesDir, "archive-hu.html"), "utf8")),
  "/en/archive": prepare(await readFile(path.join(pagesDir, "archive-en.html"), "utf8"))
};

const worker = `const pages=${JSON.stringify(pages)};
export default { async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === "/") return Response.redirect(new URL("/nap/2026-07-31", url), 302);
  if (url.pathname === "/en") return Response.redirect(new URL("/en/day/2026-07-31", url), 302);
  const html = pages[url.pathname];
  if (!html) return new Response("Not found", { status: 404 });
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
}};`;

await writeFile(path.join(dist, "server", "index.js"), worker, "utf8");
await Promise.all([
  writeFile(path.join(dist, "preview", "hu.html"), pages["/nap/2026-07-31"], "utf8"),
  writeFile(path.join(dist, "preview", "en.html"), pages["/en/day/2026-07-31"], "utf8")
]);
await writeFile(path.join(dist, ".openai", "hosting.json"), await readFile(path.join(root, ".openai", "hosting.json"), "utf8"), "utf8");
