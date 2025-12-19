// ============================================
// structuredData.js – JSON-LD Schema for SEO
// ============================================

/**
 * Generate Organization schema for homepage
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Sehetz",
    "url": "https://sehetz.ch",
    "description": "Creative portfolio showcasing design, illustration, and digital art",
    "image": "https://sehetz.ch/og-image.jpg",
    "sameAs": [
      "https://instagram.com/sehetz",
      "https://twitter.com/sehetz"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "CH"
    }
  };
}

/**
 * Generate CreativeWork schema for individual projects
 */
export function getCreativeWorkSchema(project) {
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
 * Inject JSON-LD script into document head
 */
export function injectSchema(schema) {
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
