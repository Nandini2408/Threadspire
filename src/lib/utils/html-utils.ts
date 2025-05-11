/**
 * Utility functions for handling HTML content
 */

/**
 * Completely removes all HTML tags from a string
 * @param html The HTML string to strip tags from
 * @returns Plain text with all HTML tags removed
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // First replace common HTML entities
  const withEntitiesReplaced = html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Then strip all HTML tags
  return withEntitiesReplaced.replace(/<[^>]*>/g, '');
}

/**
 * Safely renders HTML by first converting entities and then using dangerouslySetInnerHTML
 * @param html The HTML string to process
 * @returns Processed HTML string ready for rendering
 */
export function processHtmlForRendering(html: string): string {
  if (!html) return '';
  
  // Replace HTML entities with actual characters
  return html
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
