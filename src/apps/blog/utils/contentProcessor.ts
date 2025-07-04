// WordPress content processing utility
export class WordPressContentProcessor {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://imrichard.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Process image paths to ensure all images use absolute paths
   */
  private processImages(content: string): string {
    // Process relative path images
    content = content.replace(
      /<img([^>]*?)src=['"](\/[^'"]*)['"]/g,
      `<img$1src="${this.baseUrl}$2"`
    );

    // Process WordPress upload directory images (relative paths)
    content = content.replace(
      /<img([^>]*?)src=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `<img$1src="${this.baseUrl}/$2"`
    );

    // Process images that might already be full URLs but with wrong protocol
    content = content.replace(
      /<img([^>]*?)src=['"]http:\/\/imrichard\.com([^'"]*)['"]/g,
      `<img$1src="https://imrichard.com$2"`
    );

    // Process image srcset attributes
    content = content.replace(
      /srcset=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `srcset="${this.baseUrl}/$1"`
    );

    // Process WordPress image data-src attributes (lazy loading) - fix relative paths
    content = content.replace(
      /data-src=['"](\/[^'"]*)['"]/g,
      `data-src="${this.baseUrl}$1"`
    );

    content = content.replace(
      /data-src=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `data-src="${this.baseUrl}/$1"`
    );

    // Fix lazy loading images: copy data-src content to src, remove placeholder
    content = content.replace(
      /<img([^>]*?)src=['"]data:image[^'"]*['"]([^>]*?)data-src=['"]([^'"]+)['"]([^>]*?)>/g,
      '<img$1src="$3"$2$4>'
    );

    // Process images without src but with data-src
    content = content.replace(
      /<img([^>]*?)data-src=['"]([^'"]+)['"]([^>]*?)(?!.*src=)/g,
      '<img$1src="$2"$3>'
    );

    // Process relative paths and protocol issues in srcset
    content = content.replace(
      /srcset=['"]([^'"]*)['"]/g,
      (_, srcset) => {
        const fixedSrcset = srcset
          .replace(/wp-content\/uploads\//g, `${this.baseUrl}/wp-content/uploads/`)
          .replace(/http:\/\/imrichard\.com/g, 'https://imrichard.com')
          .replace(/\s+\/wp-content/g, ` ${this.baseUrl}/wp-content`);
        return `srcset="${fixedSrcset}"`;
      }
    );

    // Smart processing of image inline styles: preserve width settings, remove other potentially interfering styles
    content = content.replace(
      /<img([^>]*?)style=['"]([^'"]*)['"]([^>]*?)>/g,
      (match, before, style, after) => {
        // If style contains width attribute, preserve the entire style attribute
        // These are usually images manually resized in WordPress backend
        if (style.includes('width:')) {
          return match;
        }
        // Otherwise, remove style attribute to avoid layout interference
        return `<img${before}${after}>`;
      }
    );

    // Process WordPress image wrappers
    content = content.replace(
      /<figure class="wp-block-image[^"]*"[^>]*>/g,
      '<figure class="wp-block-image">'
    );

    // Remove duplicate images in noscript tags
    content = content.replace(
      /<noscript><img[^>]*><\/noscript>/g,
      ''
    );

    return content;
  }

  /**
   * Process links to ensure internal links and relative links point to correct domain
   */
  private processLinks(content: string): string {
    // 处理相对路径的链接（以 / 开头）
    content = content.replace(
      /<a([^>]*?)href=['"](\/[^'"]*)['"]/g,
      `<a$1href="${this.baseUrl}$2"`
    );

    // 处理可能已经是完整 URL 但协议不对的链接
    content = content.replace(
      /<a([^>]*?)href=['"]http:\/\/imrichard\.com([^'"]*)['"]/g,
      `<a$1href="https://imrichard.com$2"`
    );

    // 处理相对路径链接（不以 / 开头，如 ./page 或 page.html）
    content = content.replace(
      /<a([^>]*?)href=['"](?!https?:\/\/|mailto:|tel:|#)([^'"]*)['"]/g,
      `<a$1href="${this.baseUrl}/$2"`
    );

    return content;
  }

  /**
   * Process basic WordPress shortcodes
   */
  private processShortcodes(content: string): string {
    // Remove unsupported shortcodes
    content = content.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, '$1');
    content = content.replace(/\[gallery[^\]]*\]/g, '');
    content = content.replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gs, '$1');
    
    return content;
  }

  /**
   * Clean and normalize HTML
   */
  private cleanupHTML(content: string): string {
    // Remove empty paragraph tags
    content = content.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    // Protect whitespace in code blocks, replace with placeholders first
    const codeBlocks: string[] = [];
    content = content.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, (match) => {
      const index = codeBlocks.length;
      codeBlocks.push(match);
      return `__CODE_BLOCK_${index}__`;
    });
    
    // Protect whitespace in inline code
    const inlineCodes: string[] = [];
    content = content.replace(/<code[^>]*>.*?<\/code>/g, (match) => {
      const index = inlineCodes.length;
      inlineCodes.push(match);
      return `__INLINE_CODE_${index}__`;
    });
    
    // Now safely clean whitespace in other places
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/>\s+</g, '><');
    
    // Restore code blocks
    codeBlocks.forEach((codeBlock, index) => {
      content = content.replace(`__CODE_BLOCK_${index}__`, codeBlock);
    });
    
    // Restore inline code
    inlineCodes.forEach((inlineCode, index) => {
      content = content.replace(`__INLINE_CODE_${index}__`, inlineCode);
    });
    
    // Ensure correct format and class names for code blocks
    content = content.replace(/<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, 
      '<pre class="wp-block-code"$1><code$2>$3</code></pre>');
    
    return content.trim();
  }

  /**
   * Process article content
   */
  public processContent(content: string): string {
    if (!content) return '';
    
    // Process content in sequence
    content = this.processImages(content);
    content = this.processLinks(content);
    content = this.processShortcodes(content);
    content = this.cleanupHTML(content);
    
    return content;
  }

  /**
   * Process article excerpt
   */
  public processExcerpt(excerpt: string): string {
    if (!excerpt) return '';
    
    // Remove HTML tags, keep only plain text
    let cleaned = excerpt.replace(/<[^>]*>/g, '');
    
    // Decode HTML entities
    cleaned = cleaned.replace(/&quot;/g, '"');
    cleaned = cleaned.replace(/&#8217;/g, "'");
    cleaned = cleaned.replace(/&#8216;/g, "'");
    cleaned = cleaned.replace(/&amp;/g, '&');
    cleaned = cleaned.replace(/&lt;/g, '<');
    cleaned = cleaned.replace(/&gt;/g, '>');
    
    return cleaned.trim();
  }
}

export const contentProcessor = new WordPressContentProcessor(); 