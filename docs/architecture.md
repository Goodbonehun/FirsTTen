# Architektúra

## Alapelvek

- **Egyetlen forrásállapot:** ugyanaz a Git-commit készül el a CI-ben és kerül a Sites kiadásába.
- **Statikus első megközelítés:** a napi oldalak kiszolgálása gyors, kevés hibalehetőséggel jár és jól gyorsítótárazható.
- **Progresszív működés:** az oldal böngészőben teljes értékű, a PWA-funkciók pedig telepítést, offline tartalékot és mobilos alkalmazásélményt adnak.
- **Visszafelé kompatibilis archívum:** minden napi tartalom saját, dátum alapú útvonalat kap.
- **Biztonságos kiadás:** a build ellenőrzése megelőzi a közzétételt; a nyilvános környezet nem buildel futás közben.

## Kérések útja

1. A Cloudflare Worker fogadja a kérést.
2. A gyökérútvonal az aktuális napi oldalra irányít.
3. A dátumozott napi és archív oldalak előre összeállított HTML-ként érkeznek.
4. A manifest, a service worker, az ikonok és a közösségi kép ugyanebből a verzióból szolgálódnak ki.
5. Navigációs hiba esetén a service worker a legutóbb elérhető tartalmat adja vissza.

## Következő bővítési pont

A napi tartalmat érdemes külön, ellenőrizhető adatfájlokba emelni (`content/days/YYYY-MM-DD.hu.json`). A build ezekből generálhatja a napi oldalakat és az archívumot. Így egy új nap hozzáadása nem HTML-szerkesztés, hanem validált tartalmi kiadás lesz.

