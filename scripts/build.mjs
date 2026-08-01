import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const pagesDir = path.join(root, "pages");
const publicDir = path.join(root, "public");
const refresh = await readFile(path.join(root, "styles", "refresh.css"), "utf8");
const manifest = await readFile(path.join(publicDir, "firstten-v3.webmanifest"), "utf8");
const serviceWorker = await readFile(path.join(publicDir, "sw.js"), "utf8");
const pwaScript = await readFile(path.join(publicDir, "pwa.js"), "utf8");
const binaryAssets = Object.fromEntries(await Promise.all(
  ["firstten-app-icon-96-v3.png", "firstten-app-icon-192-v3.png", "firstten-app-icon-512-v3.png", "firstten-apple-touch-icon-v3.png", "og.png"].map(async name => [name, (await readFile(path.join(publicDir, name))).toString("base64")])
));

await rm(dist, { recursive: true, force: true });
await mkdir(path.join(dist, "server"), { recursive: true });
await mkdir(path.join(dist, ".openai"), { recursive: true });
await mkdir(path.join(dist, "preview"), { recursive: true });

const removeJuly24 = (html) => html.replace(/<a class="archive-item"[^>]*href="(?:\/nap\/2026-07-24|\/en\/day\/2026-07-24)"[\s\S]*?<\/a>/g, "");
const pwaHead = `<link rel="manifest" href="/firstten-v3.webmanifest"><link rel="apple-touch-icon" href="/firstten-apple-touch-icon-v3.png"><link rel="icon" type="image/png" sizes="192x192" href="/firstten-app-icon-192-v3.png"><meta name="application-name" content="FirsTTen"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="FirsTTen"><meta name="mobile-web-app-capable" content="yes"><meta name="theme-color" content="#020716"><meta property="og:type" content="website"><meta property="og:site_name" content="FirsTTen"><meta property="og:title" content="FirsTTen – napi útravaló"><meta property="og:description" content="Napi megérkezés Isten jelenlétébe."><meta property="og:image" content="https://firstten.goodbone.hu/og.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://firstten.goodbone.hu/og.png">`;
const pwaShell = `<a class="new-content-cta" data-new-content-cta href="/nap/2026-08-01" hidden><span>Új</span> Megérkezett a mai útravaló</a><div class="install-note" data-install-note hidden role="status"></div><nav class="pwa-bottom-nav" aria-label="Alkalmazás"><a href="/" data-pwa-nav><img src="/firstten-app-icon-96-v3.png" alt=""><span>Ma</span></a><a href="/archive" data-pwa-nav><span class="pwa-archive-icon" aria-hidden="true">◫</span><span>Archívum</span></a><button type="button" data-install-pwa hidden><span aria-hidden="true">↓</span><span>Telepítés</span></button></nav><script src="/pwa.js" defer></script>`;
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
  .replace("</head>", `${pwaHead}<style>${refresh}</style></head>`)
  .replace("</body>", `${pwaShell}</body>`);

const pages = {
  "/nap/2026-08-01": prepare(await readFile(path.join(pagesDir, "day-hu.html"), "utf8")),
  "/nap/2026-07-31": prepare(await readFile(path.join(pagesDir, "day-hu-2026-07-31.html"), "utf8")),
  "/en/day/2026-07-31": prepare(await readFile(path.join(pagesDir, "day-en.html"), "utf8")),
  "/archive": prepare(await readFile(path.join(pagesDir, "archive-hu.html"), "utf8")),
  "/en/archive": prepare(await readFile(path.join(pagesDir, "archive-en.html"), "utf8"))
};

const worker = `const pages=${JSON.stringify(pages)};
const binaryAssets=${JSON.stringify(binaryAssets)};
const textAssets=${JSON.stringify({"/firstten-v3.webmanifest":manifest,"/sw.js":serviceWorker,"/pwa.js":pwaScript})};
const mime={"firstten-v3.webmanifest":"application/manifest+json; charset=utf-8","sw.js":"text/javascript; charset=utf-8","pwa.js":"text/javascript; charset=utf-8","png":"image/png"};
export default { async fetch(request) {
  const url = new URL(request.url);
  if (url.pathname === "/") return Response.redirect(new URL("/nap/2026-08-01", url), 302);
  if (url.pathname === "/en") return Response.redirect(new URL("/en/day/2026-07-31", url), 302);
  const html = pages[url.pathname];
  if (html) return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "public, max-age=120" } });
  if (textAssets[url.pathname]) return new Response(textAssets[url.pathname], { headers: { "content-type": mime[url.pathname.slice(1)], "cache-control": url.pathname === "/sw.js" ? "no-cache" : "public, max-age=3600" } });
  const assetName=url.pathname.slice(1);
  if (binaryAssets[assetName]) { const raw=atob(binaryAssets[assetName]); const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0)); return new Response(bytes,{headers:{"content-type":mime.png,"cache-control":"public, max-age=31536000, immutable"}}); }
  return new Response("Not found", { status: 404 });
}};`;

await writeFile(path.join(dist, "server", "index.js"), worker, "utf8");
await Promise.all([
  writeFile(path.join(dist, "preview", "hu.html"), pages["/nap/2026-08-01"], "utf8"),
  writeFile(path.join(dist, "preview", "en.html"), pages["/en/day/2026-07-31"], "utf8"),
  writeFile(path.join(dist, "preview", "archive.html"), pages["/archive"], "utf8")
]);
await writeFile(path.join(dist, ".openai", "hosting.json"), await readFile(path.join(root, ".openai", "hosting.json"), "utf8"), "utf8");
