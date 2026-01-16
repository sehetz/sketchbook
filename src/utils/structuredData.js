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
    location: {
      "@type": "Place",
      name: "Basel, Switzerland"
    },
    birthDate: "1995-10-10",
    gender: "female",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "Hochschule Trier",
      url: "https://www.hochschule-trier.de/"
    },
    nationality: "German",
    speaks: ["German", "English"],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Bachelor of Arts",
        educationalLevel: "University"
      }
    ],
    // memberOf: [
    //   {
    //     "@type": "Organization",
    //     name: "Swiss Graphic Designers Association"
    //   }
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
// ============================================
// STRUCTURED DATA (JSON-LD) UTILITIES – SEO
// ============================================
// 
// NAMING CONVENTION:
//   schema_get*()  → Generate JSON-LD schema objects
//   schema_inject() → Inject schema into DOM
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

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
 * Used in: useHead.js (for project detail pages)
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
 * Used in: App.jsx, useHead.js (injectSchema() calls this)
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
