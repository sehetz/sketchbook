// ============================================
// sitemapGenerator.js – Generate XML Sitemap
// ============================================

/**
 * Generate XML sitemap from projects data
 * Returns XML string that can be written to public/sitemap.xml
 */
export function generateSitemapXML(projects = []) {
  const baseUrl = "https://sehetz.ch";
  
  // Start with base URLs (homepage, etc)
  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString().split('T')[0], priority: "1.0" },
    { loc: `${baseUrl}/impressum`, lastmod: new Date().toISOString().split('T')[0], priority: "0.3" },
  ];

  // Add project URLs from data
  const onlineProjects = projects.filter(p => p.is_online === 1);
  
  onlineProjects.forEach(project => {
    const title = project.Title || "";
    const slug = makeSlug(title);
    const datum = project.Datum || new Date().toISOString().split('T')[0];
    
    // Add skill URLs (if has skills)
    const skills = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills || [];
    skills.forEach(skill => {
      const skillLabel = skill.Skills?.Skill || "";
      if (skillLabel) {
        const skillSlug = makeSlug(skillLabel);
        urls.push({
          loc: `${baseUrl}/skills/${skillSlug}/${slug}`,
          lastmod: datum,
          priority: "0.8"
        });
      }
    });
    
    // Add gear URLs (if has gears)
    const gears = project.nc_3zu8___nc_m2m_nc_3zu8__Projec_Gears || [];
    gears.forEach(gear => {
      const gearLabel = gear.Gear?.Gear || "";
      if (gearLabel) {
        const gearSlug = makeSlug(gearLabel);
        urls.push({
          loc: `${baseUrl}/gears/${gearSlug}/${slug}`,
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
        const teamSlug = makeSlug(teamLabel);
        urls.push({
          loc: `${baseUrl}/teams/${teamSlug}/${slug}`,
          lastmod: datum,
          priority: "0.6"
        });
      }
    });
  });

  // Remove duplicates (use Map to keep first occurrence)
  const uniqueUrls = Array.from(new Map(urls.map(u => [u.loc, u])).values());

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueUrls.map(url => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

/**
 * Escape XML special characters
 */
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Convert title to URL slug (used for project URLs)
 */
function makeSlug(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
