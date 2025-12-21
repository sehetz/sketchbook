#!/usr/bin/env node
/**
 * Inline Critical CSS into dist/index.html
 * This improves First Contentful Paint by eliminating render-blocking CSS
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const criticalCssPath = path.join(__dirname, '../src/styles/critical.css');
const distIndexPath = path.join(__dirname, '../dist/index.html');

console.log('🎨 Inlining critical CSS...');

// Read critical CSS
let criticalCss = '';
try {
  criticalCss = fs.readFileSync(criticalCssPath, 'utf-8');
  console.log(`✅ Read ${criticalCss.length} bytes of critical CSS`);
} catch (err) {
  console.error('❌ Failed to read critical.css:', err.message);
  process.exit(1);
}

// Read dist/index.html
let html = '';
try {
  html = fs.readFileSync(distIndexPath, 'utf-8');
} catch (err) {
  console.error('❌ Failed to read dist/index.html:', err.message);
  process.exit(1);
}

// Inline critical CSS before </head>
const inlineStyle = `<style>${criticalCss}</style>`;
const updatedHtml = html.replace('</head>', `${inlineStyle}\n  </head>`);

// Write back
try {
  fs.writeFileSync(distIndexPath, updatedHtml, 'utf-8');
  console.log('✅ Critical CSS inlined successfully!');
} catch (err) {
  console.error('❌ Failed to write dist/index.html:', err.message);
  process.exit(1);
}
