# Roller Skate Dataviz – Microsite

Eingebettet als `<iframe>` in die übergeordnete Website.

---

## Ziel

Eine interaktive Dataviz, die Rollschuhe verschiedener Anbieter auf einer Preisskala (0–500 USD) vergleicht. Jeder Schuh wird als **Datenbild** dargestellt, das mehrere Eigenschaften gleichzeitig kodiert.

---

## Projektstruktur

```
/
├── index.html              ← Einstiegspunkt
├── README.md
├── styles/
│   └── main.css            ← Master-Styles, CSS-Variablen, Typografie-Tokens
├── components/
│   ├── rows.js             ← Zeilen-Komponente (Brands + Preisskala)
│   ├── rows.css
│   ├── skates.js           ← SVG-Symbole, Badges, Touch-Interaktion
│   └── skates.css
└── data/
    └── skates_v2.csv       ← Masterdaten (s. Datenstruktur)
```

---

## Design-System

### Farben

| Variable             | Wert                           | Beschreibung                            |
|----------------------|--------------------------------|-----------------------------------------|
| `--color-brand`      | `#ff5d4b`                      | Basisfarbe – für Text, Linien, Symbole  |
| `--color-bg-1`       | `rgba(255, 93, 75, 0.10)`      | Hintergrundstreifen (10% Basis auf Weiß)|
| `--color-bg-2`       | `rgba(255, 93, 75, 0.15)`      | Hintergrundstreifen (15% Basis auf Weiß)|
| `--color-highlight`  | `#ffeb0a`                      | Highlight / Modell-Badges               |
| `--color-white`      | `#ffffff`                      |                                         |

### Schrift

Via **Google Fonts**:
- **National Park** (400–700) → UI-Text, Badges, Labels
- **DM Mono** → Preisangaben

### Layout-Prinzip

- Jede Zeile = ein **Anbieter** (Brand), volle Breite
- X-Achse = Preis 0–500 USD
- Hintergrund wechselt alle **50 USD** zwischen `bg-1` und `bg-2`
- Skala-Markierungen oben (50er-Schritte, auf Mobile nur 100er)
- Brand-Label links, fixiert

### Responsive Verhalten

- **Desktop ≥ 1400 px**: Badges immer sichtbar
- **Desktop < 1400 px**: Badges erscheinen auf Hover
- **Touch-Geräte**: Erster Tap = Badges zeigen; zweiter Tap auf Badge = Link öffnen; Tap außerhalb = schließen

---

## Datenkodierung (Datenbild)

Jeder Schuh = ein zusammengesetztes SVG-Symbol, positioniert an seiner Preisstelle.

| Eigenschaft          | Visuelles Encoding                                                                        |
|----------------------|-------------------------------------------------------------------------------------------|
| **Boot-Material**    | Form: Quadrat = Leather, Raute = Vegan Leather, Kreis = Suede, 5-Zack-Stern = Sneaker    |
| **Farb-Optionen**    | Diagonale 45°-Farbstreifen in der Boot-Form: Weiß → Schwarz → Hex-Farben aus CSV         |
| **Wheelbase**        | Position des Rades auf der Linie (höher = Eng, tiefer = Weit)                            |
| **Wheel Hardness**   | Radiale Striche im Rad: mehr Striche = härter (70A–101A)                                  |
| **Plate-Material**   | Verbindungslinie: gerade = Metall, wellig = Nylon/GFK                                    |
| **Toestop**          | Querbalken = Adjustable, Halbkreis = Jam Plug                                             |

---

## Datenstruktur (`skates_v2.csv`)

| Spalte                       | Typ    | Werte / Hinweise                                                    |
|------------------------------|--------|---------------------------------------------------------------------|
| `Brand`                      | String |                                                                     |
| `Model`                      | String |                                                                     |
| `Country`                    | String |                                                                     |
| `Price (USD)`                | Number | 99–500                                                              |
| `Plate`                      | String | Plattenname                                                         |
| `Plate Material`             | String | `Nylon`, `Aluminum`, `Magnesium`, `glass-fiber reinforced plastic`  |
| `Wheelbase`                  | String | `Eng` oder `Weit`                                                   |
| `CushionHardness 0-89A 90-100A` | String | `0-89` oder `90-100`                                           |
| `Boot Material`              | String | `Leather`, `Vegan Leather`, `Suede`, `Sneaker`                      |
| `Wheels`                     | String | Radname                                                             |
| `wheel-size_mm`              | Number | 57–65 mm                                                            |
| `Wheel Hardness (Durometer)` | Number | 78–101 A                                                            |
| `Toestop`                    | String | `Adjustable` oder `Jam Plug`                                        |
| `Features`                   | String | Freitext                                                            |
| `Link`                       | String | Produkt-URL (optional, macht Badge anklickbar)                      |
| `Black`                      | String | `Yes` / `No`                                                        |
| `White`                      | String | `Yes` / `No`                                                        |
| `Colors`                     | String | `Yes` / `No`                                                        |
| `color_1` … `color_8`        | String | Hex-Werte ohne `#` (z. B. `ff5d4b`), nur wenn `Colors = Yes`       |

---

## Lokale Entwicklung

Da das Projekt ES Modules und `fetch()` nutzt, muss es über einen lokalen Webserver laufen.

```bash
cd "/Users/sarahcarnault/Documents/sketchbook/Rollerskate-Dataviz"
python3 -m http.server 5555
```

Dann im Browser öffnen: **http://localhost:5555**

Server stoppen: `Ctrl + C` im Terminal.
