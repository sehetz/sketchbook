// ============================================
// SEO UTILITIES – Consolidated
// ============================================
// 
// All SEO-related utilities in one place:
//   - Meta tags & Open Graph (useHead hook)
//   - Alt text & descriptions
//   - JSON-LD structured data
//   - Sitemap generation
// ============================================

// ============================================
// META TAGS & OPEN GRAPH
// ============================================

/**
 * Generate OG image URL from project slug
 * Checks if generated OG image exists, otherwise falls back to default
 * 
 * @param {String} slug - Project slug (e.g., "harbourwalk")
 * @returns {String} OG image URL
 */
export function getOgImage(slug) {
  if (!slug) return "https://sehetz.ch/og-image.jpg";
  return `https://sehetz.ch/og/${slug}.jpg`;
}

/**
 * Dynamic meta tags hook
 * Used in: App.jsx, CaseDetail.jsx
 * What: Updates document title, meta tags, OG tags, and canonical URL
 * 
 * @param {Object} options - { title, description, image, url, slug }
 */
export function useHead({ 
  title = "Sehetz Sketchbook", 
  description = "Creative portfolio showcasing design, illustration, and digital art.",
  image = "https://sehetz.ch/og-image.jpg",
  url = "https://sehetz.ch",
  slug = null
} = {}) {
  // Auto-generate OG image from slug if not explicitly provided
  const ogImage = slug ? getOgImage(slug) : image;
  
  // Update document title
  if (typeof document !== 'undefined') {
    document.title = title;
  }

  // Update/create meta tags
  const setMetaTag = (name, content, isProperty = false) => {
    if (typeof document === 'undefined') return;
    
    const attr = isProperty ? 'property' : 'name';
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    
    tag.setAttribute('content', content);
  };

  // Standard meta tags
  setMetaTag('description', description);
  setMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  
  // Open Graph
  setMetaTag('og:title', title, true);
  setMetaTag('og:description', description, true);
  setMetaTag('og:image', ogImage, true);
  setMetaTag('og:url', url, true);
  setMetaTag('og:type', 'website', true);
  setMetaTag('og:image:width', '1200', true);
  setMetaTag('og:image:height', '630', true);
  
  // Twitter Card
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', ogImage);

  // Canonical URL
  if (typeof document !== 'undefined') {
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;
  }
}

// ============================================
// ALT TEXT & DESCRIPTIONS
// ============================================

/**
 * Generate descriptive alt text from filename or project title
 * Used in: ImageBlock.jsx, LinkBlock.jsx, CaseTeaser.jsx
 * What: Creates accessible image descriptions from filename or project metadata
 * 
 * Examples:
 *   - "my-project-sketch.jpg" → "My Project Sketch"
 *   - alt_generate("img.png", "Web Design", 2) → "Web Design - Image 3"
 *   
 * @param {String} filename - Image filename with extension
 * @param {String} projectTitle - Project title (optional fallback)
 * @param {Number} blockIndex - Block position in content (0-indexed)
 * @returns {String} Descriptive alt text
 */
export function alt_generate(filename, projectTitle = "", blockIndex = 0) {
  if (!filename && !projectTitle) return "Project image";
  
  // If custom text provided, use it
  if (projectTitle) {
    return `${projectTitle} - Image ${blockIndex + 1}`;
  }
  
  // Parse filename: remove extension, replace separators with spaces
  const nameWithoutExt = filename?.replace(/\.[^.]+$/, '') || "image";
  const formatted = nameWithoutExt
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Capitalize first letter of each word
  return formatted
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Extract first text block from blocks array for meta description
 * Used in: CaseDetail.jsx, DataView.jsx
 * What: Finds first text content block, removes HTML, truncates to 160 characters
 * 
 * @param {Array} blocks - Array of { type, data } content blocks
 * @param {Number} maxLength - Maximum description length (default: 160 SEO standard)
 * @returns {String} Cleaned text excerpt with ellipsis if truncated
 */
export function desc_extractFirst(blocks, maxLength = 160) {
  if (!blocks?.length) return "";
  
  // Find first text block
  const textBlock = blocks.find(b => b.type?.includes('text'));
  
  if (!textBlock || typeof textBlock.data !== 'string') {
    return "";
  }
  
  // Clean HTML and truncate
  const text = textBlock.data
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
  
  return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
}

// ============================================
// STRUCTURED DATA (JSON-LD)
// ============================================

/**
 * Generate Person schema for Sarah Heitz
 * Used in: About.jsx, static page generation
 * What: Creates JSON-LD Person schema for SEO (profile info)
 *
 * @returns {Object} Schema object with alle relevanten Felder
 */
export function schema_getPerson() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Sarah Heitz",
    alternateName: ["Sarah Heitz", "Sarah", "sehetz"],
    description: "Graphic Designer with experience in Information Design, UX/UI, Design Systems, and Illustration.",
    jobTitle: ["Information Designer", "Illustrator", "Frontend Developer"],
    url: "https://sehetz.ch",
    email: "hoi@sehetz.ch",
    image: "https://sehetz.ch/media/Sehetz-Team-Hochschule-Trier-3.jpg",
    birthDate: "1995-10-10",
    gender: "female",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Hochschule Trier",
      url: "https://www.hochschule-trier.de/"
    },
    nationality: "German",
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Bachelor of Arts",
        educationalLevel: "University"
      }
    ],
    knowsLanguage: ["de", "en"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Basel",
      addressCountry: "CH"
    },
    sameAs: [
      "https://www.linkedin.com/in/sarah-heitz-7b722b118/",
      "https://www.instagram.com/sehetz/",
      "https://www.behance.net/sehetz",
      "https://ch.pinterest.com/sehetzch/"
    ],
    knowsAbout: [
      "Product Design",
      "UX Design",
      "UI Design",
      "Design Systems",
      "Illustration",
      "Frontend Development",
      "Comic",
      "User Research"
    ],
    worksFor: [
      {
        "@type": "Organization",
        name: "Superdot.studio",
        url: "https://superdot.studio",
        description: "Agency for Information Design"
      },
      {
        "@type": "Organization",
        name: "Carnault.ch",
        url: "https://carnault.ch",
        description: "Luxury Brand for electric Cigarettes"
      }
    ],
    hasOccupation: [
      {
        "@type": "Occupation",
        name: "Designer"
      },
      {
        "@type": "Occupation",
        name: "Illustrator"
      },
      {
        "@type": "Occupation",
        name: "Developer"
      }
    ]
  };
}

/**
 * Generate Organization schema for homepage
 * Used in: App.jsx (useEffect on mount)
 * What: Creates JSON-LD Organization schema for SEO (homepage brand info)
 * 
 * @returns {Object} Schema object with name, URL, description, socials
 */
export function schema_getOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sehetz",
    "url": "https://sehetz.ch",
    "description": "Sarah Heitz - illustrator and designer based in Basel, Switzerland. Creative portfolio showcasing illustration, and design work.",
    "image": "https://sehetz.ch/og-image.jpg",
    "logo": "https://sehetz.ch/favicon.svg",
    "sameAs": [
      "https://instagram.com/sehetz",
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Basel",
      "addressCountry": "CH"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Creative Services"
    }
  };
}

/**
 * Generate CreativeWork schema for individual projects
 * Used in: CaseDetail.jsx
 * What: Creates JSON-LD CreativeWork schema with project metadata, skills, images
 * 
 * @param {Object} project - Normalized project object
 * @returns {Object} Schema object with title, description, image, author, keywords
 */
export function schema_getCreativeWork(project) {
  const {
    Title = "Untitled Project",
    description = "",
    teaserImage = "",
    Datum = "",
    nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills = []
  } = project;

  const skills = nc_3zu8___nc_m2m_nc_3zu8__Projec_Skills
    ?.map(s => s.Skills?.Skill)
    .filter(Boolean) || [];

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": Title,
    "description": description?.substring(0, 500) || `A creative project by Sehetz`,
    "image": teaserImage || "https://sehetz.ch/og-image.jpg",
    "datePublished": Datum || new Date().toISOString(),
    "author": {
      "@type": "Organization",
      "name": "Sehetz"
    },
    "keywords": skills.join(", ")
  };
}

/**
 * Inject JSON-LD schema script into document head
 * Used in: App.jsx, CaseDetail.jsx
 * What: Removes existing schema script, creates new one, appends to <head>
 * 
 * @param {Object} schema - JSON-LD schema object to inject
 * @side-effect Modifies document.head
 */
export function schema_inject(schema) {
  if (typeof document === 'undefined') return;

  // Remove existing schema script if present
  const existing = document.querySelector('script[type="application/ld+json"]');
  if (existing) existing.remove();

  // Create and inject new schema
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// ============================================
// SITEMAP GENERATION
// ============================================

/**
 * Escape XML special characters for safe XML output
 * @private
 */
function xml_escape(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate XML sitemap from projects data
 * Used in: scripts/generate-sitemap.js (run during build to create public/sitemap.xml)
 * What: Creates XML sitemap with all project URLs, priorities, and lastmod dates
 * 
 * Note: Imports text_labelToSlug from routing.js
 * 
 * @param {Array} projects - Array of projects from NocoDB
 * @param {Function} text_labelToSlug - Slug conversion function from routing.js
 * @returns {String} XML sitemap content ready to write to file
 */
export function sitemap_generate(projects = [], text_labelToSlug) {
  const baseUrl = "https://sehetz.ch";
  
  // Start with base URLs (homepage, etc)
  const urls = [
    { loc: baseUrl, lastmod: new Date().toISOString().split('T')[0], priority: "1.0" },
    { loc: `${baseUrl}/sarah-heitz`, lastmod: new Date().toISOString().split('T')[0], priority: "0.9" },
    { loc: `${baseUrl}/mission-iris`, lastmod: new Date().toISOString().split('T')[0], priority: "0.8" },
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
