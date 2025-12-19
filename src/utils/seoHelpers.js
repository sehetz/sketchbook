// ============================================
// SEO Helpers – Image Alt Text Generation
// ============================================

/**
 * Generate descriptive alt text from filename or fallback text
 * Examples:
 *   - "my-project-sketch.jpg" → "My Project Sketch"
 *   - "image.png" → "Project Image"
 *   - Custom text with project title
 */
export function generateAltText(filename, projectTitle = "", blockIndex = 0) {
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
 * Used for project descriptions in meta tags
 */
export function extractDescription(blocks, maxLength = 160) {
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
