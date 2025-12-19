// ============================================
// useHead.js – Dynamic Meta Tags Hook
// ============================================
// Usage: useHead({ title, description, image, url })

export function useHead({ 
  title = "Sehetz Sketchbook", 
  description = "Creative portfolio showcasing design, illustration, and digital art.",
  image = "https://sehetz.ch/og-image.jpg",
  url = "https://sehetz.ch"
} = {}) {
  
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
  setMetaTag('og:image', image, true);
  setMetaTag('og:url', url, true);
  setMetaTag('og:type', 'website', true);
  
  // Twitter Card
  setMetaTag('twitter:card', 'summary_large_image');
  setMetaTag('twitter:title', title);
  setMetaTag('twitter:description', description);
  setMetaTag('twitter:image', image);

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
