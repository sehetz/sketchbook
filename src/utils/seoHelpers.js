// ============================================
// SEO UTILITIES
// ============================================
// 
// NAMING CONVENTION:
//   alt_*()      → Image alt-text generation
//   desc_*()     → Description extraction
//   seo_*()      → General SEO helpers
//
// All functions documented with:
//   - Where they're used
//   - What they do (1 sentence)
//   - Parameters & return value
// ============================================

/**
 * Generate descriptive alt text from filename or project title
 * Used in: Blocks/TextBlock.jsx (for <img> tags), Blocks/LinkBlock.jsx, CaseTeaser.jsx
 * What: Creates accessible image descriptions from filename or project metadata
 * 
 * Examples:
 *   - "my-project-sketch.jpg" → "My Project Sketch"
 *   - generateAltText("img.png", "Web Design", 2) → "Web Design - Image 3"
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
 * Used in: useHead.js (extracting project description for meta tags), DataView.jsx
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
