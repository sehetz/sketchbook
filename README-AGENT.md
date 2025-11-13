📘 Sketchbook – Coding Agent Ruleset

Design-Regeln, Verbote & Projektziel
Version 1.0 — 2026

Dieses Dokument definiert alle verbindlichen Prinzipien, nach denen Coding-Agents Code für das Sketchbook-Projekt generieren müssen.
Jede Codeausgabe MUSS dieses Regelwerk erfüllen.

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

#000000

#ffffff

#efefef (Ausnahme: Placeholder-Bildfarbe)

Erlaubt:

var(--color-*)

❌ 2.6 Präsentationskomponenten dürfen keine Daten verarbeiten

Grenzen einhalten:

❌ Nicht erlaubt:

sortieren

filtern

gruppieren

API-Calls

Zustand halten (außer open/close in CaseContainer)

✔ Erlaubt:

Props anzeigen

Layout rendern

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

SSR / prerender

Dieses Regelwerk soll dafür bereits die Grundlage schaffen

🧪 4. AUTO-CHECKLISTE (für den Agent)

Vor jeder Codeausgabe:

✔ Typografie nur .text-1/2/3?
✔ Layout nur Utility-Klassen?
✔ Abstände nur Tokens oder Utilities?
✔ Borders NUR global?
✔ Keine Farben außer Tokens?
✔ Komponente pure?
✔ CaseContainer einziger UI-State?
✔ Minimalistisch genug?
✔ Entspricht der Ausgabe exakt dem Sketchbook-Designsystem?