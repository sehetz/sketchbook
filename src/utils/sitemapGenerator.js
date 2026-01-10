// ============================================
// SITEMAP GENERATION UTILITIES
// ============================================
// 
// NAMING CONVENTION:
//   sitemap_*()   → Sitemap XML generation
//   xml_*()       → XML utility functions (escape, etc)
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

import { text_labelToSlug } from "./urlRouting.js";

/**
 * Generate XML sitemap from projects data
 * Used in: scripts/generate-sitemap.js (run during build to create public/sitemap.xml)
 * What: Creates XML sitemap with all project URLs, priorities, and lastmod dates
 * 
 * @param {Array} projects - Array of projects from NocoDB
 * @returns {String} XML sitemap content ready to write to file
 */
export function sitemap_generate(projects = []) {
  const baseUrl = "https://sehetz.ch";
  
  // Start with base URLs (homepage, etc)
  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString().split('T')[0], priority: "1.0" },
    { loc: `${baseUrl}/sarah-heitz`, lastmod: new Date().toISOString().split('T')[0], priority: "0.9" },
    { loc: `${baseUrl}/impressum`, lastmod: new Date().toISOString().split('T')[0], priority: "0.3" },
    { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString().split('T')[0], priority: "0.3" },
  ];

  // Add project URLs from data
  const onlineProjects = projects.filter(p => p.is_online === 1 || !p.is_online);
  
  console.log(`[Sitemap] Total projects: ${projects.length}`);
  console.log(`[Sitemap] is_online values:`, projects.map((p, i) => `${i}: ${p.is_online}`).join(', '));
  console.log(`[Sitemap] Processing ${onlineProjects.length} projects (after filter)`);
  
  onlineProjects.forEach((project, idx) => {
    const title = project.Title || "";
    const slug = text_labelToSlug(title);
    const datum = project.Datum || new Date().toISOString().split('T')[0];
    
    // Get skills/gears/teams - simple string fields
    const skillStr = project.skill ? (typeof project.skill === 'string' ? project.skill : '') : '';
    const gearStr = project.Gear ? (typeof project.Gear === 'string' ? project.Gear : '') : '';
    const teamStr = project.Team ? (typeof project.Team === 'string' ? project.Team : '') : '';
    
    console.log(`[Sitemap] Project ${idx + 1}: "${title}" | skill="${skillStr}" gear="${gearStr}" team="${teamStr}"`);
    
    // Add skill URL
    if (skillStr) {
      const skillSlug = text_labelToSlug(skillStr);
      urls.push({
        loc: `${baseUrl}/skills/${skillSlug}/${slug}`,
        lastmod: datum,
        priority: "0.8"
      });
    }
    
    // Add gear URL
    if (gearStr) {
      const gearSlug = text_labelToSlug(gearStr);
      urls.push({
        loc: `${baseUrl}/gears/${gearSlug}`,
        lastmod: datum,
        priority: "0.7"
      });
    }
    
    // Add team URL
    if (teamStr) {
      const teamSlug = text_labelToSlug(teamStr);
      urls.push({
        loc: `${baseUrl}/teams/${teamSlug}`,
        lastmod: datum,
        priority: "0.6"
      });
    }
  });

  // Remove duplicates (use Map to keep first occurrence)
  const uniqueUrls = Array.from(new Map(urls.map(u => [u.loc, u])).values());

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${xml_escape(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

/**
 * Escape XML special characters for safe XML output
 * Used in: sitemap_generate()
 * What: Replaces &, <, >, ", ' with XML entities
 * 
 * @param {String} unsafe - Raw text with potential XML special chars
 * @returns {String} XML-safe escaped string
 */
function xml_escape(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
