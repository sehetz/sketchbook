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

## Architektur
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

## Dataflow
1. Inhalte, Relationen und Media-Referenzen werden in NocoDB gepflegt.
2. `fetch-static-data` lädt Projekte, Teams, Intro-Texte und Sehetz-Daten aus der NocoDB-API nach `/public/data/`.
3. `check-noco-media` und `download-noco-media` prüfen, welche Noco-Medien lokal fehlen, und spiegeln sie nach `/public/media/`.
4. `vite build` verarbeitet die App mit diesen statischen Daten und Assets zu einem deploybaren Bundle.
5. Im Browser lädt `DataContext.jsx` zuerst Cache oder statische JSON-Dateien für einen schnellen First Paint.
6. Danach erfolgt im Hintergrund ein Live-Fetch gegen NocoDB, damit lokale oder frisch geänderte Inhalte nachgeladen werden können.
7. Komponenten wie `DataView`, About-Seiten und Media-Renderer konsumieren die normalisierten Daten aus dem Context.

## Lokale Konfiguration (.env)
Lege im Projektverzeichnis eine Datei `.env` an mit mindestens:

```
VITE_NOCO_BASE_URL=http://localhost:8080
VITE_API_TOKEN=<DEIN_API_TOKEN>
```

Erläuterung:
- VITE_NOCO_BASE_URL: Basis-URL zu deiner NocoDB-Instanz (lokal oder gehostet)
- VITE_API_TOKEN: API-Token für NocoDB-API-Zugriff
- VITE_API_URL: optional für Scripts wie `check-noco-media` und `prerender-content`

**Wichtig**: Die App lädt Daten automatisch über DataContext.jsx:
- Beim Start zuerst aus SessionStorage oder statischen JSON-Dateien aus `/public/data/`
- Danach im Hintergrund per Live-Fetch aus der NocoDB-API, wenn Base-URL und Token verfügbar sind

## NocoDB (Docker) — Hinweise
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

## Project Data & Media
- **DataContext.jsx** lädt und verwaltet alle Daten zentral:
  - `loadProjects()`: SessionStorage → `/data/projects.json` → NocoDB API
  - `loadTeams()`: SessionStorage → `/data/teams.json` → NocoDB API
  - `loadIntroTexts()`: SessionStorage → `/data/intro.json` → NocoDB API
  - `loadSehetz()`: SessionStorage → `/data/sehetz.json` → NocoDB API
- Die App normalisiert Projekte mit `project_normalize()` und hängt `teaserImage` / `teaserVideo` an.
- Bilder in NocoDB werden als relative Pfade geliefert (z. B. `/storage/...`) — die App prefixt diese mit `VITE_NOCO_BASE_URL`.
- **Media-Download**: Sind `VITE_NOCO_BASE_URL`, `VITE_API_TOKEN` und bei Bedarf `VITE_API_URL` vorhanden?
  - Dev Server neu starten nach .env‑Änderungen
  - SessionStorage leeren (F12 → Application → Storage → Clear)
- CORS / 401 Unauthorized:
  - Prüfe, ob `VITE_API_TOKEN` korrekt ist und in NocoDB gültig
  - In Production: Statische JSON-Dateien mit `npm run fetch-static-data` aktualisieren
- Bilder werden nicht geladen:
  - Prüfe `VITE_NOCO_BASE_URL` (muss exakt die Base-URL sein, ohne trailing slash)
  - Führe `npm run check-noco-media` aus um fehlende Bilder zu finden
  - Downloade mit `npm run download-noco-media`
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
1. `fetch-static-data` → lädt NocoDB-Daten → `/public/data/projects.json`, `teams.json`, `intro.json`, `sehetz.json`
2. `prerender-content` → aktualisiert `projects.json` für den Pre-Render-Fall
3. `vite build` → erstellt statisches Bundle
4. `inline-critical-css` → Performance-Optimierung
5. `generate-static-pages` → erstellt statische HTML-Seiten mit OG-Meta-Tags
6. `generate-sitemap` → erstellt `sitemap.xml`

Für eine öffentliche NocoDB-Instanz: hoste NocoDB z. B. auf Render oder Railway und setze `VITE_NOCO_BASE_URL` in deiner `.env`.

## Entwicklungstipps
- Nach Änderungen an Env-Variablen: `npm run dev` neu starten.
- Komponenten lokal testen: `src/components/...` direkt in der App einbinden.
- Large data sets: erwäge Pagination oder lazy-loading.

## Deployment
- `npm run build` erstellt ein statisches Bundle (Vite).
- GitHub Pages: In diesem Repo ist GH‑Pages Deployment konfiguriert; die Seite wird über `main` gebaut und unter `https://sehetz.ch` ausgeliefert.
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


# Mission Iris – Neue Pages hochladen

## Kurzanleitung

1. Bild als `.webp` exportieren (Seitenverhältnis **3:4**, empfohlen 900×1200px)
2. Bild in `public/media/iris/` ablegen, Namensschema: `mission-iris-page-004.webp` (dreistellig, nullen vorne)
3. Eintrag in `src/pages/MissionIris.jsx` im `PAGES`-Array ergänzen
4. `git add -A && git commit -m "add page 004" && git push`  
   → GitHub Actions baut und deployt automatisch, fertig.

---

## 1. Bildformat

| Eigenschaft | Wert |
|---|---|
| Format | `.webp` |
| Seitenverhältnis | 3 : 4 (Hochformat) |
| Empfohlene Grösse | 900 × 1200 px |
| Farbprofil | sRGB |

Exportiere aus Procreate/Photoshop as **WebP** direkt, oder konvertiere mit:
```bash
# macOS – einmaliges Konvertieren mit sips
sips -s format webp deinbild.png --out mission-iris-page-004.webp
```

---

## 2. Datei ablegen

Ort: `public/media/iris/`

Namensschema: `mission-iris-page-NNN.webp`  
Immer **dreistellig mit führenden Nullen**:

```
public/
  media/
    iris/
      mission-iris-page-001.webp   ← schon vorhanden
      mission-iris-page-002.webp
      mission-iris-page-003.webp
      mission-iris-page-004.webp   ← neu
```

---

## 3. Eintrag in MissionIris.jsx

Öffne `src/pages/MissionIris.jsx` und ergänze das `PAGES`-Array **am Ende** mit deiner neuen Seite:

```jsx
const PAGES = [
  { number: 1, title: "Page title", date: "Feb 2026", imageSrc: "/media/iris/mission-iris-page-001.webp" },
  { number: 2, title: "Page title", date: "Feb 2026", imageSrc: "/media/iris/mission-iris-page-002.webp" },
  { number: 3, title: "Page title", date: "Feb 2026", imageSrc: "/media/iris/mission-iris-page-003.webp" },
  // ↓ neue Page einfach anhängen
  { number: 4, title: "Dein Seitentitel", date: "Mär 2026", imageSrc: "/media/iris/mission-iris-page-004.webp" },
];
```

**Wichtig:**
- `imageSrc` muss mit `/` beginnen (absoluter Pfad), sonst bricht der Link auf der Live-Site
- `number` entspricht der Reihenfolge in der Geschichte
- Die neueste Seite wird automatisch zuerst angezeigt

---

## 4. Deployen

```bash
git add -A
git commit -m "add mission iris page 4"
git push
```

GitHub Actions startet den Build automatisch. Nach ca. 2–4 Minuten ist die neue Seite auf [sehetz.ch/mission-iris](https://sehetz.ch/mission-iris) live.

---

## Lore-Bilder (World / Characters)

Bilder für die Lore-Drawer (Raumschiff, Charaktere) folgen demselben Prinzip:

| Datei | Verwendet für |
|---|---|
| `mission-iris-world-iris-spaceship.webp` | World → Iris Spaceship |
| `mission-iris-characters-verda.webp` | Characters → Verda-Star-WI |
| `mission-iris-characters-kat.webp` | Characters → Kat-Shar-OR |

Neue Lore-Items ergänzt du in `MissionIris.jsx` innerhalb des jeweiligen `<IrisDrawer>`:

```jsx
<IrisSubItem
  index={1}
  title="Neues Element"
  description="Beschreibung hier."
  imageSrc="/media/iris/mission-iris-characters-neuername.webp"
/>
```

---

## Troubleshooting

**Bild wird auf der Live-Site nicht angezeigt**  
→ Prüfe, ob `imageSrc` mit `/` beginnt  
→ Prüfe, ob der Dateiname exakt stimmt (case-sensitive)

**Seite nicht unter /mission-iris erreichbar**  
→ Passiert nur nach einem komplett fehlgeschlagenen Build. GitHub Actions Log prüfen unter: `github.com/[dein-repo]/actions`
