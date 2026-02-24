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
