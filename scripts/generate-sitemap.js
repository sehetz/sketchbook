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
import { sitemap_generate } from '../src/utils/seo.js';
import { text_labelToSlug } from '../src/utils/routing.js';

// Get environment variables
const API_URL = process.env.VITE_API_URL;
const API_TOKEN = process.env.VITE_API_TOKEN;

async function generateSitemap() {
  try {
    console.log('🗺️  Generating sitemap.xml...');

    // Read projects from the static data file that was just created
    const projectsJsonPath = path.join(process.cwd(), 'public/data/projects.json');
    
    let projects = [];
    
    if (fs.existsSync(projectsJsonPath)) {
      console.log('📖 Reading projects from public/data/projects.json...');
      const projectsData = JSON.parse(fs.readFileSync(projectsJsonPath, 'utf8'));
      projects = projectsData.list || [];
      console.log(`✅ Loaded ${projects.length} projects from static file`);
    } else {
      console.warn('⚠️  public/data/projects.json not found. Using fallback empty list.');
    }

    // Generate XML
    const sitemapXml = sitemap_generate(projects, text_labelToSlug);

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
    // Do not fail the CI build on sitemap issues; produce minimal sitemap and continue
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(distPath)) {
      fs.mkdirSync(distPath, { recursive: true });
    }
    const sitemapPath = path.join(distPath, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap_generate([], text_labelToSlug), 'utf8');
    console.log(`✨ Wrote minimal sitemap to ${sitemapPath}`);
  }
}

generateSitemap();
