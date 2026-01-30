# Sketchbook

Kleines persönliches Portfolio / Sketchbook — lokale Entwicklung mit NocoDB (Docker) + Vite (React).

Kurz & schnell
- NocoDB (Docker) läuft lokal auf Port `8080`
- React Dev Server läuft lokal auf Port `5173`
- API-URL, NOCO-Base und Token werden über .env gesteuert

Voraussetzungen
- macOS (oder Linux / Windows mit WSL)
- Node.js (empfohlen >= 18, getestet mit v22)
- npm (>= v8/10)
- Docker Desktop (oder Docker Engine)
- Git

Schnellstart (Kurz)
1. Repo klonen:
   ```bash
   git clone https://github.com/sehetz/sketchbook.git
   cd sketchbook
   ```
2. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
3. Docker Desktop starten (oder Docker Engine).
4. NocoDB starten (im Ordner mit `docker-compose.yml`):
   ```bash
   cd ~/nocodb           # falls du die NocoDB-Compose dort abgelegt hast
   docker-compose up -d
   ```
5. React Dev Server starten (neues Terminal):
   ```bash
   npm run dev
   ```
6. Öffne die Seite:
   - NocoDB: http://localhost:8080
   - App: http://localhost:5173

Lokale Konfiguration (.env)
Lege im Projektverzeichnis eine Datei `.env` an mit mindestens:

```
VITE_NOCO_BASE_URL=http://localhost:8080
VITE_API_TOKEN=<DEIN_API_TOKEN>
VITE_API_URL=http://localhost:8080/api/v2/tables/ma2nz1h01whlpni/records
```

Erläuterung:
- VITE_NOCO_BASE_URL: Basis-URL zu deiner NocoDB-Instanz (wird z. B. für signierte Pfade genutzt)
- VITE_API_TOKEN: API-Token, den NocoDB für API-Aufrufe erwartet
- VITE_API_URL: optional: kann direkt auf eine Tabelle/Records-Route zeigen

NocoDB (Docker) — Hinweise
- Docker Compose muss eine NocoDB-Instanz starten (Port 8080).
- Beispiel-Compose (kurz):
  ```yaml
  version: "3"
  services:
    nocodb:
      image: nocodb/nocodb:latest
      ports:
        - "8080:8080"
      restart: unless-stopped
  ```
- Nach Start: Admin-Setup im Browser durchführen.

Project Data & Media
- Die App normalisiert Projekte beim Laden (siehe `DataView`) und hängt `teaserImage` / `teaserVideo` an.
- Bilder in NocoDB werden als relative Pfade geliefert (z. B. `/storage/...`) — die App prefixt diese mit `VITE_NOCO_BASE_URL`.
- Falls Bilder fehlen: prüfe im NocoDB-UI, wie die Bildfelder strukturiert sind (Array, Objekt mit `url`/`signedPath`, nested formats). Ein kleines Deep-Finder ist eingebaut, kann aber bei exotischen Strukturen angepasst werden.

Fehlersuche (Troubleshooting)
- Blank Page / keine Daten:
  - .env gesetzt? `VITE_API_URL` und `VITE_API_TOKEN` vorhanden?
  - Dev Server neu starten nach .env‑Änderungen.
- CORS / 401 Unauthorized:
  - Prüfe, ob `VITE_API_TOKEN` korrekt ist und in NocoDB gültig.
- Bilder werden nicht geladen:
  - Prüfe `VITE_NOCO_BASE_URL` (muss exakt die Base-URL sein, ohne trailing slash).
  - Öffne eines Project-Objekts in der Browser-Konsole (console.log) und prüfe Bild-Property (z. B. `image[0].formats.small.url`).
- Font lädt nicht (OTS parsing error):
  - Browser meldet oft fehlerhafte WOFF2 → überprüfe Pfad `/fonts/...` oder ersetze lokale Font-Datei.

Entwicklungstipps
- Nach Änderungen an Env-Variablen: `npm run dev` neu starten.
- Komponenten lokal testen: `src/components/...` direkt in der App einbinden.
- Large data sets: erwäge Pagination oder lazy-loading.

Deployment
- `npm run build` erstellt ein statisches Bundle (Vite).
- GitHub Pages: In diesem Repo ist GH‑Pages Deployment konfiguriert (push auf `main` → wird deployed auf `https://sehetz.github.io/sketchbook/`).
- Für öffentliche NocoDB-Instanz: hoste NocoDB (z. B. Render, Railway) und setze `VITE_NOCO_BASE_URL` entsprechend.

Weitere TODOs
- NOCO extern hosten (render.com / railway)
- Domain erwerben und konfigurieren
- Verbesserte mobile UX: Tap‑Tooltips, alternative stacked layout
- Performance: Virtualize long lists, image CDN

Kontakt / Contributing
- Pull Requests willkommen — bitte kleine, fokussierte PRs.
- Issues für Bugs / Feature Requests.

License
- (optional) Add license here.

Favicon
- Lege deine Favicon-Dateien im public‑Ordner ab:
  - /public/favicon.ico
  - optional: /public/favicon-32x32.png, /public/favicon-16x16.png
  - optional: /public/apple-touch-icon.png (iOS), /public/safari-pinned-tab.svg (Safari)
- Empfohlen: generiere verschiedene Größen mit https://realfavicongenerator.net/ und kopiere die Ausgaben ins public-Verzeichnis.
- Nach dem Ersetzen: dev-server neu starten oder Browser-Cache leeren (Strg/Cmd+Shift+R), damit das neue Icon sichtbar wird.


# Timline viz aktualisieren
in der console eingeben, nachdem die sichtbarkeit auf noco eingestellt ist:
npm run fetch-static-data