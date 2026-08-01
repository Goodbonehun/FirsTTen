# FirsTTen

Telepíthető, mobilra optimalizált napi lelki útravaló. A napi oldal az Igétől az elcsendesedésen és önátadáson át a Szentháromság dicsőítéséig vezet.

## Felépítés

- `pages/` – magyar és angol napi, illetve archív oldalak
- `styles/refresh.css` – közös reszponzív és PWA-megjelenés
- `public/` – alkalmazásikonok, manifest, service worker és PWA-kliens
- `scripts/build.mjs` – determinisztikus, Cloudflare Worker-kompatibilis összeállítás
- `.openai/hosting.json` – a ChatGPT Sites projektkapcsolata

## Fejlesztés

```bash
npm ci
npm run build
```

A build eredménye a `dist/` könyvtárba kerül. A GitHub Actions minden változtatásnál ellenőrzi, hogy a telepíthető Worker és a Sites-konfiguráció elkészült-e.

## Kiadási elv

1. A napi tartalom forráshű ellenőrzése.
2. Helyi build és PWA-validáció.
3. GitHub-ellenőrzés.
4. Verziómentés és közzététel ChatGPT Sites-on.

Az élő oldal: [firstten.goodbone.hu](https://firstten.goodbone.hu)
