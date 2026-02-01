#!/usr/bin/env node

/**
 * Generate Professional CV/Resume as PDF
 * Usage: node scripts/generate-cv.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read CSV data
const csvPath = path.join(__dirname, '../public/data/teams.json');
let teams = [];

try {
  const data = fs.readFileSync(csvPath, 'utf-8');
  const parsed = JSON.parse(data);
  teams = parsed.list || [];
} catch (err) {
  console.error('Error reading teams data:', err);
  process.exit(1);
}

// Sort teams by start date (newest first)
const sortedTeams = teams
  .filter(t => t['start-date'])
  .sort((a, b) => {
    const yearA = parseInt(a['start-date']);
    const yearB = parseInt(b['start-date']);
    return yearB - yearA;
  });

// Generate HTML with embedded CSS
const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>Lebenslauf – Sarah Heitz</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    @font-face {
      font-family: "TikTok Sans";
      src: url("file://${path.join(__dirname, '../src/assets/TikTokSans-VariableFont_opsz,slnt,wdth,wght.ttf')}") format("truetype-variations");
      font-weight: 100 900;
      font-stretch: 75% 150%;
      font-display: swap;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: "TikTok Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      line-height: 1.5;
      color: #121212;
      background: white;
    }
    
    .container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 0;
    }
    
    /* Header */
    .header {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #121212;
    }
    
    .profile-image {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    
    .header-content {
      flex: 1;
    }
    
    .name {
      font-size: 24pt;
      font-weight: 700;
      line-height: 1.1;
      margin-bottom: 8px;
    }
    
    .tagline {
      font-size: 11pt;
      color: #555;
      margin-bottom: 12px;
    }
    
    .contact {
      font-size: 9.5pt;
      line-height: 1.6;
    }
    
    .contact a {
      color: #121212;
      text-decoration: none;
    }
    
    /* Sections */
    .section {
      margin-bottom: 24px;
      page-break-inside: avoid;
    }
    
    .section-title {
      font-size: 13pt;
      font-weight: 700;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 1.5px solid #121212;
    }
    
    /* Experience Entry */
    .entry {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    
    .entry-title {
      font-size: 11.5pt;
      font-weight: 700;
    }
    
    .entry-date {
      font-size: 10pt;
      color: #555;
      white-space: nowrap;
    }
    
    .entry-subtitle {
      font-size: 10.5pt;
      color: #555;
      margin-bottom: 6px;
    }
    
    .entry-description {
      font-size: 10pt;
      line-height: 1.5;
      color: #333;
    }
    
    .entry-link {
      font-size: 9.5pt;
      color: #555;
      margin-top: 4px;
    }
    
    .entry-link a {
      color: #121212;
      text-decoration: none;
    }
    
    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .skill-category {
      margin-bottom: 12px;
    }
    
    .skill-category-title {
      font-size: 10.5pt;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .skill-list {
      font-size: 10pt;
      line-height: 1.6;
      color: #333;
    }
    
    /* Footer */
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #ddd;
      font-size: 8.5pt;
      color: #888;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <img src="file://${path.join(__dirname, '../public/media/Sarah-Heitz-sehetz.jpg')}" alt="Sarah Heitz" class="profile-image" />
      <div class="header-content">
        <h1 class="name">Sarah Heitz</h1>
        <div class="tagline">Graphic Designer & Illustrator</div>
        <div class="contact">
          Basel, Schweiz<br/>
          <a href="https://sehetz.ch">sehetz.ch</a> · 
          <a href="mailto:hello@sehetz.ch">hello@sehetz.ch</a>
        </div>
      </div>
    </div>
    
    <!-- Profile -->
    <div class="section">
      <h2 class="section-title">Profil</h2>
      <p class="entry-description">
        Leidenschaftliche Grafikdesignerin und Illustratorin mit über 10 Jahren Erfahrung in den Bereichen 
        Informationsdesign, Corporate Design und digitale Medien. Spezialisiert auf die Entwicklung 
        visueller Identitäten, interaktive Webanwendungen und Datenvisualisierung. Erfahren in der 
        Zusammenarbeit mit interdisziplinären Teams und in der eigenständigen Projektentwicklung.
      </p>
    </div>
    
    <!-- Freelance -->
    <div class="section">
      <h2 class="section-title">Selbstständige Tätigkeit</h2>
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">Freie Grafikdesignerin & Illustratorin</div>
          <div class="entry-date">2015 – heute</div>
        </div>
        <div class="entry-subtitle">Basel</div>
        <p class="entry-description">
          Selbstständige Projekte in den Bereichen Corporate Design, Webentwicklung, Illustration und 
          Informationsdesign. Beratung und Umsetzung für verschiedene Kunden aus Kultur, Wirtschaft und Bildung.
        </p>
        <div class="entry-link"><a href="https://sehetz.ch">sehetz.ch</a></div>
      </div>
    </div>
    
    <!-- Experience -->
    <div class="section">
      <h2 class="section-title">Berufserfahrung</h2>
      ${sortedTeams
        .filter(t => (t['design-work'] === true || t['design-work'] === 1) && t.Team !== 'sehetz'
          <div class="entry-title">Offene Bewerbung</div>
          <div class="entry-date">2026</div>
        </div>
        <div class="entry-subtitle">Bolo Klub · Basel</div>
        <p class="entry-description">
          Bewerbung für kreative Projektarbeit und interdisziplinäre Zusammenarbeit im kulturellen Bereich.
        </p>
      </div>
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">Mitgliedschaft</div>
          <div class="entry-date">2026</div>
        </div>
        <div class="entry-subtitle">Comic Crew Basel</div>
        <p class="entry-description">
          Aktive Teilnahme an der Basler Comic-Community, kollaborative Projekte und kreative Austauschformate.
        </p>
      </div>
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">Bewerbung Artist in Residency</div>
          <div class="entry-date">2026</div>
        </div>
        <div class="entry-subtitle">Riga, Lettland</div>
        <p class="entry-description">
          Bewerbung für ein Artist-in-Residency-Programm zur Weiterentwicklung illustrativer und grafischer Arbeiten.
        </p>
      </div>
    </div>
    
    <!-- Experience -->
    <div class="section">
      <h2 class="section-title">Berufserfahrung</h2>
      ${sortedTeams
        .filter(t => t['design-work'] === true || t['design-work'] === 1)
        .map(team => {
          const startYear = team['start-date'] || '';
          const endYear = team['end-date'] || 'heute';
          const dateRange = `${startYear}${endYear ? ' – ' + endYear : ''}`;
          
          return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${team.Team || 'N/A'}</div>
          <div class="entry-date">${dateRange}</div>
        </div>
        <div class="entry-subtitle">${team.role || ''} ${team.location ? '· ' + team.location : ''}</div>
        ${team.description ? `<p class="entry-description">${team.description}</p>` : ''}
        ${team.link ? `<div class="entry-link"><a href="${team.link}">${team.link}</a></div>` : ''}
      </div>`;
        }).join('')}
    </div>
    
    <!-- Additional Experience -->
    <div class="section">
      <h2 class="section-title">Weitere Erfahrungen</h2>
      ${sortedTeams
        .filter(t => t['design-work'] === false || t['design-work'] === 0)
        .map(team => {
          const startYear = team['start-date'] || '';
          const endYear = team['end-date'] || 'heute';
          const dateRange = `${startYear}${endYear ? ' – ' + endYear : ''}`;
          
          return `
      <div class="entry">
        <div class="entry-header">
          <div class="entry-title">${team.Team || 'N/A'}</div>
          <div class="entry-date">${dateRange}</div>
        </div>
        <div class="entry-subtitle">${team.role || ''} ${team.location ? '· ' + team.location : ''}</div>
        ${team.description ? `<p class="entry-description">${team.description}</p>` : ''}
      </div>`;
        }).join('')}
    </div>
    
    <!-- Skills -->
    <div class="section">
      <h2 class="section-title">Kompetenzen</h2>
      <div class="skills-grid">
        <div class="skill-category">
          <div class="skill-category-title">Design & Gestaltung</div>
          <div class="skill-list">
            Corporate Design · Editorial Design<br/>
            Informationsdesign · Datenvisualisierung<br/>
            Illustration · Konzeption
          </div>
        </div>
        <div class="skill-category">
          <div class="skill-category-title">Technische Fähigkeiten</div>
          <div class="skill-list">
            Adobe Creative Suite<br/>
            Figma · Sketch<br/>
            HTML/CSS · JavaScript · React
          </div>
        </div>
        <div class="skill-category">
          <div class="skill-category-title">Sprachen</div>
          <div class="skill-list">
            Deutsch (Muttersprache)<br/>
            Englisch (Fließend)<br/>
            Französisch (Grundkenntnisse)
          </div>
        </div>
        <div class="skill-category">
          <div class="skill-category-title">Soft Skills</div>
          <div class="skill-list">
            Teamarbeit · Projektmanagement<br/>
            Kommunikation · Konzeptentwicklung<br/>
            Selbstständiges Arbeiten
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      Erstellt am ${new Date().toLocaleDateString('de-CH', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>
</body>
</html>`;

// Write HTML file
const outputHtmlPath = path.join(__dirname, '../cv-sarah-heitz.html');
fs.writeFileSync(outputHtmlPath, html, 'utf-8');

console.log('✓ HTML CV generated:', outputHtmlPath);
console.log('\nTo generate PDF:');
console.log('1. Open the HTML file in your browser');
console.log('2. Press Cmd+P (Print)');
console.log('3. Select "Save as PDF"');
console.log('4. Save as "Lebenslauf-Sarah-Heitz.pdf"');
console.log('\nOr install puppeteer for automated PDF generation:');
console.log('npm install --save-dev puppeteer');
console.log('Then uncomment the PDF generation code in this script.');

// Uncomment this section after installing puppeteer:
/*
import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file://${outputHtmlPath}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(__dirname, '../Lebenslauf-Sarah-Heitz.pdf'),
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  });
  await browser.close();
  console.log('✓ PDF generated: Lebenslauf-Sarah-Heitz.pdf');
})();
*/
