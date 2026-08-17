📘 Sketchbook – Coding Agent Ruleset

Design-Regeln, Verbote & Projektziel
Version 2.0 — Februar 2026

Dieses Dokument definiert alle verbindlichen Prinzipien, nach denen Coding-Agents Code für das Sketchbook-Projekt generieren müssen.
Jede Codeausgabe MUSS dieses Regelwerk erfüllen.

## 🏗️ ARCHITEKTUR-PRINZIPIEN

### 1.1 Zentrales Daten-Management
- **DataContext.jsx** ist die einzige Quelle für Projekt-, Team- und Intro-Daten
- Komponenten dürfen NICHT selbst Daten fetchen
- Zugriff nur über `const { projects, teams, isLoading, error } = useData()`
- Caching erfolgt automatisch (SessionStorage + 30s Refresh in DEV)

### 1.2 Utils-Struktur (5 Dateien)
- **seo.js** — Meta-Tags, Schemas, Alt-Texte, Sitemap
- **routing.js** — URL-Parsing, Slug-Conversion, Navigation
- **project.js** — Content-Normalisierung, Media-Pfad-Resolution
- **ui.js** — Animationen, Timer, UI-Konstanten
- **analytics.js** — Google Analytics Integration

**Regel**: Keine neuen Utils-Dateien ohne Abstimmung. Funktionen müssen thematisch in existierende Dateien passen.

### 1.3 Komponenten-Organisation
```
src/
  contexts/          — React Context (DataContext.jsx)
  pages/             — About, Impressum, Privacy
  components/
    layout/          — Header, Footer, Banner, Intro
    media/           — MasterMediaImage, Video, 3D, ButtonText2
    about/           — TimelineViz, SehetzTeaser
    DataView/        — Hauptansicht + Filter + CaseContainer
```

**Regel**: Keine "common/", "shared/" oder "utils/" Komponenten-Ordner. Klare semantische Gruppierung.

🎨 1. DESIGN-PRINZIPIEN
1.1 Minimalismus

Kein UI-Overdesign

Wenige, klare Komponenten

Eine klare Schrift, einfache Linien, viel Weißraum

Jede Entscheidung dient Lesbarkeit & Ruhe

1.2 Konsistenz durch Utilities

Layout, Abstände & Alignment werden NUR über globale Utility-Klassen gesteuert

Typografie wird ausschließlich über .text-1, .text-2, .text-3 kontrolliert

Keine lokalen "Sonderfälle"

Struktur > Optik > Komfort

1.3 Dynamik statt Hardcoding

Höhen, Icons & Layout sollen sich aus Daten ergeben (z.B. "Anzahl Projekte")

Container wachsen organisch

Inhalte bestimmen den Platz, nicht CSS-Willkür

1.4 Komponenten = Bausteine

Kleine, pure Komponenten

Keine Doppelzustände

Logik in DataView, Darstellung in Komponenten

🚫 2. DON’TS / VERBOTE

Alles hier ist streng verboten, wenn nicht explizit als Ausnahme markiert.

❌ 2.1 Kein eigener Typo-Stil

Verboten in jeder Komponente und jedem CSS:

font-size:

font-family:

line-height:

letter-spacing:

➡️ Einzige Erlaubnis: .text-1 / .text-2 / .text-3

❌ 2.2 Kein lokales Flexbox- oder Layout-Styling

Nicht erlaubt:

display: flex

justify-content:

align-items:

➡️ immer Utility-Varianten verwenden:

flex

axis-left

axis-center

axis-right

flex-1

❌ 2.3 Keine freien Abstände

Verboten:

padding: 10px

margin: 12px

Erlaubt:

spacing utilities

spacing tokens

❌ 2.4 Keine eigenen Border-Styles

Nicht erlaubt:

border-top: 3px solid #000;

border-bottom: 1px dashed

Erlaubt sind nur:

.border-top-solid

.border-bottom-solid

.border-top-dotted

❌ 2.5 Keine Hardcoded Farben

Niemals:

#0f0f0f

#ffffff

#efefef (Ausnahme: Placeholder-Bildfarbe)

Erlaubt:

var(--color-*)

❌ 2.6 Präsentationskomponenten dürfen keine Daten fetchen

**Strikte Regel**: Komponenten fetchen NIEMALS selbst Daten aus APIs.

❌ Verboten:
- `fetch()` / `axios` in Komponenten
- `useEffect(() => { fetch(...) }, [])`
- Eigene API-URL-Konstanten in Komponenten
- SessionStorage-Logik in UI-Komponenten

✔ Erlaubt:
- `const { projects, teams } = useData()` (DataContext Hook)
- Props von übergeordneten Komponenten empfangen
- UI-State (open/close, hover, active)

**Ausnahme**: CaseContainer darf `open`-State für Expand/Collapse halten.

Grenzen einhalten:

❌ Nicht erlaubt:
- sortieren (außer in DataView.jsx)
- filtern (außer in DataView.jsx)
- gruppieren (außer in DataView.jsx)
- API-Calls
- Daten aus SessionStorage lesen (außer DataContext)

✔ Erlaubt:
- Props anzeigen
- Layout rendern
- UI-Interaktionen (onClick, onHover)

❌ 2.7 Keine Inline Styles

Ausnahme:

dynamische Höhe eines geschlossenen CaseContainers

height: 64 + (projects.length - 1) * 32

🎯 3. ZIEL DES PROJEKTS

Ein Portfolio, das:

🎯 3.1 extrem ruhig wirkt

Fokus auf Inhalte

Kein UI-Lärm

Nur 3 Schriftgrößen

Wenig Ablenkung

🎯 3.2 mit Daten lebt

Skills → gruppieren Projekte

Gear → gruppieren Projekte

Team → gruppieren Projekte

Alles aus NocoDB

Automatisches Aufklappen des ersten Projekts in jeder Kategorie

🎯 3.3 sauber strukturiert bleibt

Jeder Code soll für weitere Agents verständlich sein

Utility-first, ähnlich wie Tailwind, aber radikal minimal

Kein CSS-Wildwuchs

Keine Duplikation, keine Micro-Sonderfälle

🎯 3.4 skalierbar bleibt

Bald kommen:

Bilder

Videos

SEO-URLs

Detailseiten
**Architektur:**
✔ Daten aus DataContext geholt (useData())?
✔ Keine direkten API-Calls in Komponenten?
✔ Utils korrekt importiert (seo.js, routing.js, project.js)?
✔ Komponente im richtigen Ordner (pages/, layout/, media/, about/, DataView/)?

**Design:**
✔ Typografie nur .text-1/2/3?
✔ Layout nur Utility-Klassen?
✔ Abstände nur Tokens oder Utilities?
✔ Borders NUR global?
✔ Keine Farben außer Tokens?

**Komponenten:**
✔ Komponente pure (keine Daten-Logik)?
✔ CaseContainer einziger UI-State-Container?
✔ Keine SessionStorage-Zugriffe?

**Minimalism:**
✔ Minimalistisch genug?
✔ Entspricht der Ausgabe exakt dem Sketchbook-Designsystem?

## 5. REFACTORING-HISTORIE (Kontext für Agents)

### Januar 2026: Utils-Konsolidierung
- **Vorher**: 9 Utils-Dateien (helpers.js, seoHelpers.js, structuredData.js, useHead.js, sitemapGenerator.js, urlRouting.js, timelineHelpers.js, mediaManifest.js, analytics.js)
- **Nachher**: 5 Utils-Dateien mit klaren Verantwortlichkeiten
- **Grund**: Zu viele kleine Dateien, schwer wartbar

### Januar 2026: Komponenten-Reorganisation
- **Vorher**: Flache Struktur mit "common/", "AboutViz/"
- **Nachher**: Semantische Ordner (pages/, layout/, media/, about/)
- **Grund**: Bessere Orientierung, klare Trennung

### Januar 2026: DataContext-Implementierung
- **Vorher**: Jede Komponente fetched eigene Daten (DataView.jsx, TimelineViz.jsx, Intro.jsx)
- **Nachher**: Zentraler DataContext.jsx mit useData() Hook
- **Grund**: Code-Duplikation, Performance (3 separate Fetches), schlechte Wartbarkeit
- **Effekt**: ~150 Zeilen Code entfernt, Single-Source-of-Truth

**Wichtig für Agents**: Keine Rückfälle in alte Patterns. Wenn neue Komponenten Daten brauchen, IMMER DataContext verwenden.
✔ Typografie nur .text-1/2/3?
✔ Layout nur Utility-Klassen?
✔ Abstände nur Tokens oder Utilities?
✔ Borders NUR global?
✔ Keine Farben außer Tokens?
✔ Komponente pure?
✔ CaseContainer einziger UI-State?
✔ Minimalistisch genug?
✔ Entspricht der Ausgabe exakt dem Sketchbook-Designsystem?