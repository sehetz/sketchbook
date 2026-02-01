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

Architektur
- **React Context API**: Zentrales Daten-Management über `DataContext.jsx` — lädt alle Projekte, Teams und Intro-Texte einmal und teilt sie mit allen Komponenten
- **Utils konsolidiert**: 5 Utility-Dateien (seo.js, routing.js, project.js, ui.js, analytics.js) statt vorher 9 — klare Verantwortlichkeiten
- **Komponenten-Struktur**:
  - `pages/` — About, Impressum, Privacy
  - `layout/` — Header, Footer, Banner, Intro
  - `media/` — MasterMediaImage, MasterMediaVideo, MasterMedia3D
  - `about/` — TimelineViz, SehetzTeaser
  - `DataView/` — Haupt-Portfolio-Ansicht mit Filtern
- **Caching**: SessionStorage für schnelle Ladezeiten, 30s Auto-Refresh in DEV-Mode
- **Build-Pipeline**: Static JSON für Production, dynamisches Laden in Development

Lokale Konfiguration (.env)
Lege im Projektverzeichnis eine Datei `.env` an mit mindestens:

```
VITE_NOCO_BASE_URL=http://localhost:8080
VITE_API_TOKEN=<DEIN_API_TOKEN>
```

Erläuterung:
- VITE_NOCO_BASE_URL: Basis-URL zu deiner NocoDB-Instanz (lokal oder gehostet)
- VITE_API_TOKEN: API-Token für NocoDB-API-Zugriff

**Wichtig**: Die App lädt Daten automatisch über DataContext.jsx:
- In **Development**: NocoDB API (mit 30s Auto-Refresh) + SessionStorage-Cache
- In **Production**: Statische JSON-Dateien aus `/public/data/` (generiert via `npm run fetch-static-data`)

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
- **DataContext.jsx** lädt und verwaltet alle Daten zentral:
  - `loadProjects()`: SessionStorage → `/data/projects.json` → NocoDB API (DEV only)
  - `loadTeams()`: SessionStorage → `/data/teams.json` → NocoDB API (DEV only)
  - `loadIntroTexts()`: SessionStorage → NocoDB API (immer, kleine Datenmenge)
- Die App normalisiert Projekte mit `project_normalize()` und hängt `teaserImage` / `teaserVideo` an.
- Bilder in NocoDB werden als relative Pfade geliefert (z. B. `/storage/...`) — die App prefixt diese mit `VITE_NOCO_BASE_URL`.
- **Media-Download**: `nNOCO_BASE_URL` und `VITE_API_TOKEN` vorhanden?
  - Dev Server neu starten nach .env‑Änderungen
  - Browser-Konsole prüfen: DataContext loggt "[DataContext] ✅ Loaded X projects"
  - SessionStorage leeren (F12 → Application → Storage → Clear)
- CORS / 401 Unauthorized:
  - Prüfe, ob `VITE_API_TOKEN` korrekt ist und in NocoDB gültig
  - In Production: Statische JSON-Dateien mit `npm run fetch-static-data` aktualisieren
- Bilder werden nicht geladen:
  - Prüfe `VITE_NOCO_BASE_URL` (muss exakt die Base-URL sein, ohne trailing slash)
  - Führe `npm run check-noco-media` aus um fehlende Bilder zu finden
  - Downloade mit `npm run download-noco-media`
- "Lade Projekte..." bleibt stehen:
- Komponenten lokal testen: `src/components/...` direkt in der App einbinden
- Daten in Komponenten nutzen: `const { projects, teams, isLoading, error } = useData()` aus DataContext
- SessionStorage-Cache manuell leeren bei Test-Daten: Browser DevTools → Application → Storage
- Large data sets: DataContext cached bereits effizient, bei Bedarf Virtualisierung erwägenen
- Font lädt nicht (OTS parsing error):
  - Browser meldet oft fehlerhafte WOFF2 → überprüfe Pfad `/fonts/...` oder ersetze lokale Font-Datei
- Vite Import Errors nach Refactoring:
  - Cache löschen: `rm -rf node_modules/.vite`
  - Dev Server neu starten
- **Standard-Build**: `npm run build` (lädt Daten, prerendert Content, generiert Sitemap)
- **Full-Build**: `npm run build:full` (zusätzlich: OG-Images, Apple-Icons)
- **GitHub Pages**: Push auf `main` → automatisches Deployment auf `https://sehetz.ch`
- **Wichtig vor Deploy**: Immer `npm run fetch-static-data` ausführen für aktuelle Projekt-Daten in Production

Build-Pipeline (`npm run build`):
1. `fetch-static-data` → lädt NocoDB-Daten → `/public/data/projects.json` + `teams.json`
2. `prerender-content` → SSR-Vorbereitung
3. `vite build` → erstellt statisches Bundle
4. `inline-critical-css` → Performance-Optimierung
5. `generate-static-pages` → erstellt statische HTML-Seiten mit OG-Meta-Tags
6. `generate-sitemap` → erstellt `sitemap.xml`

Für öffentliche NocoDB-Instanz: hoste NocoDB (z. B. Render, Railway) und setze `VITE_NOCO_BASE_URL` in .envts.small.url`).
- Font lädt nicht (OTS parsing error):
  - Browser meldet oft fehlerhafte WOFF2 → überprüfe Pfad `/fonts/...` oder ersetze lokale Font-Datei.

Entwicklungstipps
- Nach Änderungen an Env-Variablen: `npm run dev` neu starten.
- Komponenten lokal testen: `src/components/...` direkt in der App einbinden.
- Large data sets: erwäge Pagination oder lazy-loading.

Deployment
- `npm run build` erstellt ein statisches Bundle (Vite).
- GitHub Pages: In diesem Repo ist GH‑Pages Deployment konfiguriert (push auf `main` → wird deployed auf `https://sehetz.github.io/sketchbook/`).
## Workflow: Neues Projekt erstellen

### 1. Projekt in NocoDB anlegen
- Neues Projekt in NocoDB-Tabelle erstellen
- Skills, Gears, Teams zuweisen
- Teaser-Bild/Video hochladen
- Content-Blocks hinzufügen

### 2. Daten & Media synchronisieren
```bash
# Daten von NocoDB holen
npm run fetch-static-data

# Prüfen ob Bilder fehlen
npm run check-noco-media

# Fehlende Bilder downloaden
npm run download-noco-media

# OG-Images für Social Media generieren
npm run generate-og-images
```

### 3. Testen
```bash
npm run dev
# → Neues Projekt sollte in der App erscheinen
# → Filter testen (Skills/Gears/Teams)
# → Projekt-Detail öffnen
```

### 4. Deployment
```bash
# Standard (schnell)
npm run build

# Full (mit Icon-Generation)
npm run build:full

# Alles auf einmal (empfohlen)
npm run fetch-static-data && npm run download-noco-media && npm run build:full
```

### 5. Git & Deploy
```bash
git add .
git commit -m "Add new project: [Projektname]"
git push origin main
# → GitHub Actions deployed automatisch
```

## Scripts Referenz

### Kritisch (bei jedem neuen Projekt)
- `npm run fetch-static-data` — Lädt aktuelle Daten aus NocoDB
- `npm run check-noco-media` — Zeigt fehlende Bilder
- `npm run download-noco-media` — Lädt fehlende Bilder
- `npm run generate-og-images` — Erstellt Social Media OG-Images

### Build
- `npm run build` — Standard Production Build
- `npm run build:full` — Build mit Icon-Generation

### Optional
- `npm run generate-icons` — Generiert Apple-Icons und Favicons
- `npm run lint` — ESLint Code-Prüfung
- `npm run preview` — Preview des Production Builds


*Vor neuem Projekt deploy*


# 1. Daten von NocoDB holen
npm run fetch-static-data

# 2. Prüfen ob Bilder fehlen
npm run check-noco-media

# 3. Fehlende Bilder downloaden
npm run download-noco-media

# 4. OG-Images für Social Media generieren
npm run generate-og-images

# 5. Testen
npm run dev

# 6. Deployen
npm run build

alles auf einmal:
npm run fetch-static-data && npm run download-noco-media && npm run build:full