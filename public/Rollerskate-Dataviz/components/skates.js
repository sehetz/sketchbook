/**
 * COMPONENT: Skates
 * Rendert jeden Skate als senkrechtes SVG-Symbol auf der Preisskala.
 *
 * Layout (von oben nach unten):
 *  1. Boot-Form  → Quadrat (Leather), Raute (Vegan Leather), Kreis (Suede), Stern (Sneaker)
 *                  Füllung = diagonale Farbstreifen 45° (White → Black → Colors)
 *  2. Plate-Linie → gerade (Metall) oder wellig (Nylon)
 *  3. Wheel-Kreis → Position = Wheelbase; radiale Striche = Durometer
 *  4. Plate-Linie (weiter)
 *  5. Toestop    → Querbalken (Adjustable) oder Halbkreis (Jam Plug)
 *
 * Name-Badge: je ein gelbes Pill pro Wort, rechts (oder links) neben dem SVG.
 */

import { priceToPercent } from './rows.js';

/* ================================================================
   GEOMETRIE
   ================================================================ */
const C        = '#ff5d4b'; // Hauptfarbe (Stroke + Wheel-Fill)
const CX       = 14;       // Mittelachse X im SVG
const TOTAL_W  = 28;       // SVG-Breite

// Boot-Form (oben)
const BOOT_CY  = 13;       // Mitte Boot
const BOOT_R   = 10;       // Effektiver Radius der Boot-Form
const BOOT_Y_SHIFT = 1;    // Alle Boot-Formen: zusätzlicher Y-Versatz (px)
const BOOT_CY_EFF  = BOOT_CY + BOOT_Y_SHIFT; // effektive Mitte für Formen
const BOOT_BOT  = BOOT_CY + BOOT_R; // 23

// Form-spezifische Geometrie (hier anpassen)
const LEATHER_R   = BOOT_R - 1;       // Quadrat (Leather):        Halbseite
const LEATHER_RX  = 3;                // Quadrat:                  Eckradius
const VEGAN_R     = BOOT_R + 2;       // Raute (Vegan Leather):    Spitzen-Radius
const VEGAN_RX    = 3;                // Raute:                    Eckradius
const SUEDE_R     = BOOT_R;           // Kreis (Suede):            Radius
const STAR_R_OUT  = BOOT_R + 2;       // Stern (Sneaker/Stoff):    äusserer Radius
const STAR_R_IN   = STAR_R_OUT * 0.75; // Stern:                    innerer Radius (60 %)
const STAR_POINTS = 5;                // Stern:                    Anzahl Zacken

// Rad
const WHEEL_R  = 9;

// Wheelbase: Position des Rades auf der Linie
function wheelCY(wheelbase) {
  return (wheelbase || '').trim() === 'Weit' ? 60 : 42;
}

// Toestop
const TOESTOP_Y       = 78;
const JAMPLUG_EXTRA_H = 8;   // Radius des JamPlug-Halbkreises
const SVG_H          = TOESTOP_Y + JAMPLUG_EXTRA_H + 4;

const STROKE_W       = 1.5;  // Standard stroke-width
const TOESTOP_HALF_W = 8;    // Halbe Breite des Toestop-Querbalkens

const SKATE_Y_OFFSET = -2;   // Vertikale Feinkorrektur des Elements (px)
const ENG_Y_SHIFT    =  0;   // Naher Radstand (Eng): Y-Versatz gegenüber Weit (px)


/* ================================================================
   BOOT-FORM mit diagonaler Farbfüllung (45°)
   ================================================================ */

/**
 * N Farben als gleich breite Diagonalbänder bei 45°, per clipPath auf die Boot-Form beschränkt.
 * extent: halbe Breite der Boot-Form im 45°-rotierten Koordinatensystem.
 *   Rechteck (side 2r):   extent = r * √2
 *   Raute (radius r):     extent = r / √2   (Rautenspitzen fallen auf ±r/√2 in u-Achse)
 *   Kreis (radius r):     extent = r
 */
function makeColorFill(cx, cy, allColors, clipId, extent) {
  const N      = allColors.length;
  if (N === 0) return '';
  const stripW = (2 * extent) / N;
  const bigH   = extent + 5; // etwas größer als nötig, clipPath begrenzt
  const strips = allColors.map((color, i) => {
    const x = (cx - extent + i * stripW).toFixed(2);
    const y = (cy - bigH).toFixed(2);
    return `<rect x="${x}" y="${y}" width="${stripW.toFixed(2)}" height="${(2 * bigH).toFixed(2)}" fill="${color}"/>`;
  }).join('');
  return `<g clip-path="url(#${clipId})"><g transform="rotate(45,${cx},${cy})">${strips}</g></g>`;
}

// Abgerundete Raute: Quadratic-Bezier mit dem Ecken-Eckpunkt als Kontrollpunkt
function roundedDiamondPath(cx, cy, r, cr) {
  const d = cr / Math.SQRT2;
  const f = v => v.toFixed(2);
  return [
    `M ${f(cx - d)} ${f(cy - r + d)}`,
    `Q ${cx} ${cy - r} ${f(cx + d)} ${f(cy - r + d)}`,
    `L ${f(cx + r - d)} ${f(cy - d)}`,
    `Q ${cx + r} ${cy} ${f(cx + r - d)} ${f(cy + d)}`,
    `L ${f(cx + d)} ${f(cy + r - d)}`,
    `Q ${cx} ${cy + r} ${f(cx - d)} ${f(cy + r - d)}`,
    `L ${f(cx - r + d)} ${f(cy + d)}`,
    `Q ${cx - r} ${cy} ${f(cx - r + d)} ${f(cy - d)}`,
    'Z',
  ].join(' ');
}

// Stern: N Zacken, äusserer + innerer Radius
function starPath(cx, cy, outerR, innerR, points) {
  const f   = v => v.toFixed(2);
  const pts = Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i * Math.PI / points) - Math.PI / 2;
    const r     = i % 2 === 0 ? outerR : innerR;
    return `${f(cx + Math.cos(angle) * r)},${f(cy + Math.sin(angle) * r)}`;
  });
  return `M ${pts.join(' L ')} Z`;
}

function makeBoot(id, material, allColors) {
  const mat    = (material || '').trim();
  const clipId = `bc${id}`;
  let tag, geoAttrs, extraStroke = '', fillExtent;

  if (mat === 'Vegan Leather') {
    const d  = roundedDiamondPath(CX, BOOT_CY_EFF, VEGAN_R, VEGAN_RX);
    tag      = 'path';
    geoAttrs = `d="${d}"`;
    fillExtent = VEGAN_R / Math.SQRT2; // Rautenspitzen bei ±r → im 45°-Frame: r/√2

  } else if (mat === 'Suede') {
    tag      = 'circle';
    geoAttrs = `cx="${CX}" cy="${BOOT_CY_EFF}" r="${SUEDE_R}"`;
    fillExtent = SUEDE_R;

  } else if (mat === 'Sneaker') {
    const d  = starPath(CX, BOOT_CY_EFF, STAR_R_OUT, STAR_R_IN, STAR_POINTS);
    tag      = 'path';
    geoAttrs = `d="${d}"`;
    extraStroke = ' stroke-linejoin="round"';
    fillExtent = STAR_R_OUT;

  } else {
    // Leather / default → abgerundetes Quadrat
    const r  = LEATHER_R;
    tag      = 'rect';
    geoAttrs = `x="${CX - r}" y="${BOOT_CY_EFF - r}" width="${r * 2}" height="${r * 2}" rx="${LEATHER_RX}"`;
    fillExtent = r * Math.SQRT2;
  }

  const clipShape = `<${tag} ${geoAttrs}/>`;
  const outlineEl = `<${tag} ${geoAttrs} fill="none" stroke="${C}" stroke-width="${STROKE_W}"${extraStroke}/>`;
  const fillEl    = makeColorFill(CX, BOOT_CY_EFF, allColors, clipId, fillExtent);
  return `<defs><clipPath id="${clipId}">${clipShape}</clipPath></defs>${fillEl}${outlineEl}`;
}


/* ================================================================
   PLATTENLINIE (zwei Segmente um das Rad herum)
   ================================================================ */
function wavySegment(x, y1, y2) {
  const dist = y2 - y1;
  if (dist <= 0) return '';
  const segs = Math.max(1, Math.round(dist / 7));
  const segH = dist / segs;
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < segs; i++) {
    const sy  = y1 + i * segH;
    const ey  = sy + segH;
    const amp = 3.5;
    d += ` C ${(x - amp).toFixed(1)} ${(sy + segH / 3).toFixed(1)},`
       + ` ${(x + amp).toFixed(1)} ${(sy + 2 * segH / 3).toFixed(1)},`
       + ` ${x} ${ey.toFixed(1)}`;
  }
  return `<path d="${d}" fill="none" stroke="${C}" stroke-width="${STROKE_W}" stroke-linecap="round"/>`;
}

function makePlate(wcy, isNylon, isJamPlug) {
  const y1 = BOOT_BOT + 1;
  const y2 = wcy - WHEEL_R - 1;
  const y3 = wcy + WHEEL_R + 1;
  const y4 = TOESTOP_Y; // immer gleich lang

  if (isNylon) {
    return wavySegment(CX, y1, y2) + wavySegment(CX, y3, y4);
  }
  let out = '';
  if (y2 > y1) out += `<line x1="${CX}" y1="${y1}" x2="${CX}" y2="${y2}" stroke="${C}" stroke-width="${STROKE_W}"/>`;
  if (y4 > y3) out += `<line x1="${CX}" y1="${y3}" x2="${CX}" y2="${y4}" stroke="${C}" stroke-width="${STROKE_W}"/>`;  
  return out;
}


/* ================================================================
   RAD (einzeln, mit radialen Strichen und Durometer-Zahl)
   ================================================================ */
function spokeCount(dur) {
  // 70A → 8, 101A → 28
  return Math.max(8, Math.min(28, Math.round(8 + ((dur - 70) / 31) * 20)));
}

function makeWheel(wcy, dur) {
  const r = WHEEL_R;
  const n = spokeCount(dur);
  const spokes = Array.from({ length: n }, (_, i) => {
    const a  = (i / n) * Math.PI * 2 - Math.PI / 2;
    // Nur im äußeren Ring – kein Überlappen der Zahl in der Mitte
    const x1 = (CX + Math.cos(a) * r * 0.55).toFixed(1);
    const y1 = (wcy + Math.sin(a) * r * 0.55).toFixed(1);
    const x2 = (CX + Math.cos(a) * r * 0.82).toFixed(1);
    const y2 = (wcy + Math.sin(a) * r * 0.82).toFixed(1);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="0.9"/>`;
  }).join('');

  const fs = dur >= 100 ? 5 : 6;
  return `
    <circle cx="${CX}" cy="${wcy}" r="${r}" fill="${C}" stroke="${C}" stroke-width="1.2"/>
    ${spokes}
    <text x="${CX}" y="${wcy + 0.5}" text-anchor="middle" dominant-baseline="middle"
      font-size="${fs}" fill="white" font-weight="bold" font-family="sans-serif">${dur}</text>`;
}


/* ================================================================
   TOESTOP
   Beide Typen teilen denselben Ankerpunkt Y = TOESTOP_Y.
   Die Plattenlinie endet genau dort – kein Gap.
   ================================================================ */
function makeToestop(isJamPlug) {
  if (isJamPlug) {
    const r         = JAMPLUG_EXTRA_H;
    const jamPlugY  = TOESTOP_Y - 16;
    const yd        = jamPlugY + r;
    return `<path d="M ${CX - r} ${yd} A ${r} ${r} 0 0 0 ${CX + r} ${yd}" fill="none" stroke="${C}" stroke-width="${STROKE_W}" stroke-linecap="round"/>`;
  }
  return `<line x1="${CX - TOESTOP_HALF_W}" y1="${TOESTOP_Y}" x2="${CX + TOESTOP_HALF_W}" y2="${TOESTOP_Y}" stroke="${C}" stroke-width="${STROKE_W}" stroke-linecap="round"/>`;
}


/* ================================================================
   GESAMTSYMBOL zusammenbauen
   ================================================================ */
function buildSkateSVG(id, skate) {
  const material  = (skate['Boot Material']             || 'Leather').trim();
  const wheelbase = (skate['Wheelbase']                 || 'Eng').trim();
  const dur       = parseInt(skate['Wheel Hardness (Durometer)']) || 85;
  const plateMat  = (skate['Plate Material']            || '').trim().toLowerCase();
  const toestop   = (skate['Toestop']                   || '').trim().toLowerCase();

  const isNylon   = plateMat === 'nylon';
  const isJamPlug = toestop.includes('jam');
  const wcy       = wheelCY(wheelbase);

  const allColors = [];
  if ((skate['White']  || '').trim() === 'Yes') allColors.push('#f0f0f0');
  if ((skate['Black']  || '').trim() === 'Yes') allColors.push('#1a1a1a');
  if ((skate['Colors'] || '').trim() === 'Yes') {
    for (let k = 1; k <= 8; k++) {
      const hex = (skate[`color_${k}`] || '').trim();
      if (hex) allColors.push(`#${hex}`);
    }
  }
  if (!allColors.length) allColors.push(C); // Fallback

  const yShift = wheelbase === 'Eng' ? ENG_Y_SHIFT : 0;
  const parts = [
    makePlate(wcy, isNylon, isJamPlug),
    makeBoot(id, material, allColors),
    makeWheel(wcy, dur),
    makeToestop(isJamPlug),
  ].join('');
  return yShift ? `<g transform="translate(0,${yShift})">${parts}</g>` : parts;
}


/* ================================================================
   EINEN SKATE IN DIE BRAND-ZEILE RENDERN
   ================================================================ */
function renderSkate(id, skate, trackEl) {
  const price = parseFloat(skate['Price (USD)']);
  if (!price) return;

  const brand = skate['Brand'] || '';
  const model = skate['Model'] || '';
  const words = model.trim().split(/\s+/).filter(Boolean);

  const wrapper = document.createElement('div');
  wrapper.className = 'skate';
  wrapper.style.left = priceToPercent(price);
  // translateX(-CX px) zentriert die SVG-Mittellinie auf dem Preispunkt
  wrapper.style.transform = `translateX(-${CX}px) translateY(calc(-50% + ${SKATE_Y_OFFSET}px))`;

  wrapper.title = [
    `${brand} ${model}`,
    `$${price}`,
    `Boot: ${skate['Boot Material']}`,
    `Plate: ${skate['Plate Material']}`,
    `Wheels: ${skate['Wheel Hardness (Durometer)']}A`,
    `Wheelbase: ${skate['Wheelbase'] === 'Weit' ? 'Weit (far)' : 'Eng (close)'}`,
    `Toestop: ${skate['Toestop']}`,
  ].join('\n');

  wrapper.setAttribute('role', 'img');
  wrapper.setAttribute('aria-label', `${brand} ${model}, $${price}`);

  const link  = (skate['Link'] || '').trim();
  const badgesHTML = words
    .map(w => `<span class="skate__badge">${w}</span>`)
    .join('');
  const priceHTML = `<span class="skate__price">$${price}</span>`;
  const badgesInner = `${badgesHTML}${priceHTML}`;
  const badgesEl = link
    ? `<a class="skate__badges" href="${link}" target="_blank" rel="noopener noreferrer" aria-label="${brand} ${model} – Produktseite">${badgesInner}</a>`
    : `<div class="skate__badges" aria-hidden="true">${badgesInner}</div>`;

  const svgContent = buildSkateSVG(id, skate);

  wrapper.innerHTML = `
    <svg
      class="skate__svg"
      viewBox="0 0 ${TOTAL_W} ${SVG_H}"
      width="${TOTAL_W}"
      height="${SVG_H}"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    ><title>${brand} ${model} – $${price}</title>${svgContent}</svg>
    ${badgesEl}`;

  trackEl.appendChild(wrapper);
}


/* ================================================================
   CSV-PARSER (unterstützt Felder in Anführungszeichen)
   ================================================================ */
function parseCSVLine(line) {
  const result = [];
  let current  = '';
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}


/* ================================================================
   INITIALISIERUNG
   ================================================================ */
export async function initSkates(csvPath) {
  let rows;
  try {
    const res     = await fetch(csvPath);
    const text    = await res.text();
    const lines   = text.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    rows = lines.slice(1).map(line => {
      const vals = parseCSVLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
    });
  } catch (e) {
    console.error('skates.js: CSV konnte nicht geladen werden.', e);
    return;
  }

  let id = 0;
  for (const skate of rows) {
    if (!skate['Brand'] || !skate['Price (USD)']) continue;

    const trackEl = document.querySelector(
      `.chart__row[data-brand="${skate['Brand']}"] .chart__track`
    );
    if (!trackEl) continue;

    renderSkate(id++, skate, trackEl);
  }

  resolveOverlaps();
  setupTouchInteraction();
}

/* ================================================================
   TOUCH-INTERAKTION
   Erster Tap → Badges zeigen (.skate--active)
   Zweiter Tap auf Badges → Link öffnen
   Tap ausserhalb → alle schließen
   ================================================================ */
function setupTouchInteraction() {
  // Nur auf Touch-Geräten aktivieren
  if (!window.matchMedia('(hover: none)').matches) return;

  const closeAll = () => {
    document.querySelectorAll('.skate--active')
      .forEach(s => s.classList.remove('skate--active'));
  };

  // Tap ausserhalb jedes Skates → alle schließen
  document.addEventListener('click', closeAll);

  document.querySelectorAll('.skate').forEach(skate => {
    skate.addEventListener('click', e => {
      e.stopPropagation(); // verhindert document-closeAll
      const isActive = skate.classList.contains('skate--active');

      if (!isActive) {
        // Erster Tap: Badges einblenden, Navigation verhindern
        e.preventDefault();
        closeAll();
        skate.classList.add('skate--active');
      } else {
        // Aktiv + Tap auf Badges: Link öffnen (<a> übernimmt)
        // Aktiv + Tap anderswo: schließen
        closeAll();
      }
    });
  });
}

/* ================================================================
   ÜBERLAPPUNGSPRÜFUNG: Badges links wenn sie rechts kollidieren
   ================================================================ */
function resolveOverlaps() {
  document.querySelectorAll('.chart__row').forEach(row => {
    // Alle Skates der Zeile nach Preis-Position (left) sortieren
    const skates = [...row.querySelectorAll('.skate')].sort((a, b) =>
      parseFloat(a.style.left) - parseFloat(b.style.left)
    );
    const rowRight = row.getBoundingClientRect().right;

    for (let i = 0; i < skates.length; i++) {
      const curr   = skates[i];
      const badges = curr.querySelector('.skate__badges');
      if (!badges) continue;

      // Prüfen ob Badges mit einem der nachfolgenden Skate-SVGs überlappt
      let flipLeft = false;
      for (let j = i + 1; j < skates.length; j++) {
        const nextSvg = skates[j].querySelector('.skate__svg');
        if (!nextSvg) continue;
        const bRect = badges.getBoundingClientRect();
        const nRect = nextSvg.getBoundingClientRect();
        if (bRect.right > nRect.left - 2) {
          flipLeft = true;
          break;
        }
      }

      // Prüfen ob Badges über den rechten Rahmen hinausragen
      if (!flipLeft) {
        const bRect = badges.getBoundingClientRect();
        if (bRect.right > rowRight - 2) {
          flipLeft = true;
        }
      }

      if (flipLeft) curr.classList.add('skate--badges-left');
    }
  });
}
