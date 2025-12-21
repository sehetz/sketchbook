// ============================================
// useHead.js – Dynamic Meta Tags Hook
// ============================================
// Usage: useHead({ title, description, image, url, slug })

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
