#!/usr/bin/env node
/**
 * generate-sitemap.js
 * Generates sitemap.xml from environment variables containing project data
 * 
 * Usage: node scripts/generate-sitemap.js
 * 
 * This script:
 * 1. Fetches projects from NocoDB API
 * 2. Generates XML sitemap
 * 3. Writes to dist/sitemap.xml
 */

import fs from 'fs';
import path from 'path';
import { generateSitemapXML } from '../src/utils/sitemapGenerator.js';

// Get environment variables
const API_URL = process.env.VITE_API_URL;
const API_TOKEN = process.env.VITE_API_TOKEN;

async function generateSitemap() {
  try {
    console.log('🗺️  Generating sitemap.xml...');

    let projects = [];

    // If API credentials available, fetch live data
    if (API_URL && API_TOKEN) {
      console.log('📡 Fetching project data from NocoDB...');
      const res = await fetch(API_URL, {
        headers: { "xc-token": API_TOKEN }
      });
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      
      const json = await res.json();
      projects = json.list || [];
      console.log(`✅ Fetched ${projects.length} projects`);
    } else {
      console.log('⚠️  No API credentials. Using minimal sitemap.');
    }

    // Generate XML
    const sitemapXml = generateSitemapXML(projects);

    // Ensure dist folder exists
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }

    // Write to file
    const sitemapPath = path.join(distPath, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemapXml, 'utf8');

    console.log(`✨ Sitemap written to ${sitemapPath}`);
    console.log(`   Total URLs: ${(sitemapXml.match(/<url>/g) || []).length}`);

  } catch (err) {
    console.error('❌ Error generating sitemap:', err.message);
    process.exit(1);
  }
}

generateSitemap();
