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
    { loc: `${baseUrl}/about`, lastmod: new Date().toISOString().split('T')[0], priority: "0.9" },
    { loc: `${baseUrl}/impressum`, lastmod: new Date().toISOString().split('T')[0], priority: "0.3" },
    { loc: `${baseUrl}/privacy`, lastmod: new Date().toISOString().split('T')[0], priority: "0.3" },
  ];

  // Add project URLs from data
  const onlineProjects = projects.filter(p => p.is_online === 1);
  
  onlineProjects.forEach(project => {
    const title = project.Title || "";
    const slug = text_labelToSlug(title);
    const datum = project.Datum || new Date().toISOString().split('T')[0];
    
    let projectAdded = false;
    
    // Add skill URLs (if has skills)
    const skills = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills || [];
    skills.forEach(skill => {
      const skillLabel = skill.Skills?.Skill || "";
      if (skillLabel) {
        const skillSlug = text_labelToSlug(skillLabel);
        urls.push({
          loc: `${baseUrl}/skills/${skillSlug}/${slug}`,
          lastmod: datum,
          priority: "0.8"
        });
        projectAdded = true;
      }
    });
    
    // Add gear URLs (if has gears)
    const gears = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears || [];
    gears.forEach(gear => {
      const gearLabel = gear.Gear?.Gear || "";
      if (gearLabel) {
        const gearSlug = text_labelToSlug(gearLabel);
        urls.push({
          loc: `${baseUrl}/gears/${gearSlug}`,
          lastmod: datum,
          priority: "0.7"
        });
      }
    });
    
    // Add team URLs (if has teams)
    const teams = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Teams || [];
    teams.forEach(team => {
      const teamLabel = team.Teams?.Team || "";
      if (teamLabel) {
        const teamSlug = text_labelToSlug(teamLabel);
        urls.push({
          loc: `${baseUrl}/teams/${teamSlug}`,
          lastmod: datum,
          priority: "0.6"
        });
      }
    });
    
    // If project has no skills, add it via first team or gear as fallback
    if (!projectAdded && (teams.length > 0 || gears.length > 0)) {
      projectAdded = true;
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
