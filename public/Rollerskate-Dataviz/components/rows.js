/**
 * COMPONENT: Rows
 * Rendert die Brand-Zeilen mit Preisskala (0–500 USD).
 * Datenpunkte (Skate-Symbole) kommen in einer späteren Komponente.
 */

const SCALE_MIN     = 50;
const SCALE_MAX     = 350;
const SCALE_STEP    = 50;   // Ticks alle 50 USD
const SCALE_DOT_STEP = 10;  // Dots alle 10 USD

/**
 * Konvertiert einen Preis in eine prozentuale Position auf der Skala.
 * @param {number} price
 * @returns {string} CSS-Prozentwert, z.B. "39.80%"
 */
function priceToPercent(price) {
  const pct = ((price - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * 100;
  return `${pct.toFixed(2)}%`;
}

/**
 * Baut den Skalen-Header (Tick-Markierungen 0–500).
 * @returns {HTMLElement}
 */
function buildScaleHeader() {
  const header = document.createElement('div');
  header.className = 'chart__scale';

  // Track mit Ticks
  const track = document.createElement('div');
  track.className = 'chart__scale-track';

  const steps = (SCALE_MAX - SCALE_MIN) / SCALE_STEP;
  for (let i = 0; i <= steps; i++) {
    const value = SCALE_MIN + i * SCALE_STEP;
    const tick  = document.createElement('div');
    tick.className = 'chart__tick' + (value % 100 !== 0 ? ' chart__tick--minor' : '');
    tick.style.left = priceToPercent(value);

    const line = document.createElement('div');
    line.className = 'chart__tick-line';

    const label = document.createElement('span');
    label.className = 'chart__tick-label';
    label.textContent = value === 0 ? '0' : `$${value}`;

    tick.appendChild(line);
    tick.appendChild(label);
    track.appendChild(tick);
  }

  header.appendChild(track);
  return header;
}

/**
 * Baut die Hintergrundstreifen (je 50 USD) in eine Track-Fläche.
 * @param {HTMLElement} trackEl
 */
function buildStripes(trackEl) {
  const steps = (SCALE_MAX - SCALE_MIN) / SCALE_STEP;
  for (let i = 0; i < steps; i++) {
    const stripe = document.createElement('div');
    stripe.className = `chart__stripe chart__stripe--${i % 2 === 0 ? 'odd' : 'even'}`;
    stripe.style.left  = priceToPercent(SCALE_MIN + i * SCALE_STEP);
    stripe.style.width = `${(SCALE_STEP / (SCALE_MAX - SCALE_MIN)) * 100}%`;
    stripe.setAttribute('aria-hidden', 'true');
    trackEl.appendChild(stripe);
  }
}

/**
 * Baut Dots alle 10 USD (klein) und alle 50 USD (groß) in eine Track-Fläche.
 * @param {HTMLElement} trackEl
 */
function buildDots(trackEl) {
  const steps = (SCALE_MAX - SCALE_MIN) / SCALE_DOT_STEP;
  for (let i = 0; i <= steps; i++) {
    const value   = SCALE_MIN + i * SCALE_DOT_STEP;
    const isMajor = value % SCALE_STEP === 0;
    const dot = document.createElement('div');
    dot.className = `chart__dot chart__dot--${isMajor ? 'major' : 'minor'}`;
    dot.style.left = priceToPercent(value);
    dot.setAttribute('aria-hidden', 'true');
    trackEl.appendChild(dot);
  }
}

/**
 * Baut Preis-Labels an den Major-Positionen (alle 50 USD) im Track.
 * @param {HTMLElement} trackEl
 */
function buildPriceLabels(trackEl) {
  const steps = (SCALE_MAX - SCALE_MIN) / SCALE_STEP;
  for (let i = 0; i <= steps; i++) {
    const value = SCALE_MIN + i * SCALE_STEP;
    const lbl = document.createElement('span');
    lbl.className = 'chart__price-label';
    lbl.style.left = priceToPercent(value);
    lbl.textContent = value === 0 ? '0' : `$${value}`;
    lbl.setAttribute('aria-hidden', 'true');
    trackEl.appendChild(lbl);
  }
}

/**
 * Baut Trenn-Dots am unteren Rand der Row (alle 10 USD klein, alle 50 USD groß).
 * @param {HTMLElement} rowEl
 */
function buildSepDots(rowEl) {
  const steps = (SCALE_MAX - SCALE_MIN) / SCALE_DOT_STEP;
  for (let i = 0; i <= steps; i++) {
    const value   = SCALE_MIN + i * SCALE_DOT_STEP;
    const isMajor = value % SCALE_STEP === 0;
    const dot = document.createElement('div');
    dot.className = `chart__sep-dot chart__sep-dot--${isMajor ? 'major' : 'minor'}`;
    dot.style.left = priceToPercent(value);
    dot.setAttribute('aria-hidden', 'true');
    rowEl.appendChild(dot);
  }
}

/**
 * Rendert alle Brand-Zeilen in das gegebene Container-Element.
 * @param {HTMLElement} container  - .chart Element
 * @param {string[]}    brands     - Sortierte Liste der Brand-Namen
 */
function buildRows(container, brandData) {
  container.appendChild(buildScaleHeader());

  for (const { name, country } of brandData) {
    const row = document.createElement('div');
    row.className = 'chart__row';
    row.dataset.brand = name;

    // Zeichen-Fläche (enthält das Brand-Label)
    const track = document.createElement('div');
    track.className = 'chart__track';
    track.setAttribute('aria-label', `${name} – Skates`);
    buildStripes(track);

    // Brand-Label positioniert innerhalb des Tracks (linke leere Zone)
    const label = document.createElement('div');
    label.className = 'chart__brand';
    label.innerHTML =
      `<span class="chart__brand-name">${name}</span>` +
      (country ? `<span class="chart__brand-country">${country}</span>` : '');
    track.appendChild(label);

    row.appendChild(track);
    if (name !== brandData[brandData.length - 1].name) buildSepDots(row);
    container.appendChild(row);
  }
}

/**
 * Parst eine einfache CSV-Datei (erste Zeile = Header).
 * @param {string} text
 * @returns {{ headers: string[], rows: Object[] }}
 */
function parseCSV(text) {
  const lines   = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const rows    = lines.slice(1).map(line => {
    const values = line.split(',');
    return Object.fromEntries(
      headers.map((h, i) => [h, (values[i] ?? '').trim()])
    );
  });
  return { headers, rows };
}

/**
 * Initialisiert die Rows-Komponente.
 * Lädt die CSV, ermittelt alle Brands (sortiert) und rendert die Zeilen.
 *
 * @param {string} csvPath     - Pfad zur skates.csv relativ zum HTML
 * @param {string} containerId - ID des .chart-Elements im HTML
 */
async function initRows(csvPath, containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`rows.js: Element #${containerId} nicht gefunden.`);
    return;
  }

  let data;
  try {
    const response = await fetch(csvPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    data = parseCSV(text);
  } catch (err) {
    console.error('rows.js: CSV konnte nicht geladen werden.', err);
    return;
  }

  // Brand → Country Mapping (erster Treffer pro Brand)
  const brandCountry = {};
  for (const r of data.rows) {
    if (r.Brand && !brandCountry[r.Brand]) brandCountry[r.Brand] = r['Country'] || '';
  }

  // Brands ermitteln (unique, mit Daten, alphabetisch sortiert)
  const brandData = [...new Set(
    data.rows
      .filter(r => r.Brand && r['Price (USD)'])
      .map(r => r.Brand)
  )].sort().map(name => ({ name, country: brandCountry[name] || '' }));

  buildRows(container, brandData);
}

// Export für Nutzung im HTML-Modul
export { initRows, priceToPercent, parseCSV };
