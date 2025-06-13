// WordPress 内容处理工具
export class WordPressContentProcessor {
  private baseUrl: string;

  constructor(baseUrl: string = 'https://imrichard.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * 处理图片路径，确保所有图片都使用绝对路径
   */
  private processImages(content: string): string {
    // 处理相对路径的图片
    content = content.replace(
      /<img([^>]*?)src=['"](\/[^'"]*)['"]/g,
      `<img$1src="${this.baseUrl}$2"`
    );

    // 处理 WordPress 上传目录的图片（相对路径）
    content = content.replace(
      /<img([^>]*?)src=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `<img$1src="${this.baseUrl}/$2"`
    );

    // 处理可能已经是完整 URL 但协议不对的图片
    content = content.replace(
      /<img([^>]*?)src=['"]http:\/\/imrichard\.com([^'"]*)['"]/g,
      `<img$1src="https://imrichard.com$2"`
    );

    // 处理图片 srcset 属性
    content = content.replace(
      /srcset=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `srcset="${this.baseUrl}/$1"`
    );

    // 处理 WordPress 图片的 data-src 属性（懒加载）- 修复相对路径
    content = content.replace(
      /data-src=['"](\/[^'"]*)['"]/g,
      `data-src="${this.baseUrl}$1"`
    );

    content = content.replace(
      /data-src=['"](wp-content\/uploads\/[^'"]*)['"]/g,
      `data-src="${this.baseUrl}/$1"`
    );

    // 修复懒加载图片：将 data-src 的内容复制到 src，移除占位符
    content = content.replace(
      /<img([^>]*?)src=['"]data:image[^'"]*['"]([^>]*?)data-src=['"]([^'"]+)['"]([^>]*?)>/g,
      '<img$1src="$3"$2$4>'
    );

    // 处理没有 src 但有 data-src 的图片
    content = content.replace(
      /<img([^>]*?)data-src=['"]([^'"]+)['"]([^>]*?)(?!.*src=)/g,
      '<img$1src="$2"$3>'
    );

    // 处理 srcset 中的相对路径和协议问题
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

    // 移除图片的内联样式，让 CSS 处理
    content = content.replace(
      /<img([^>]*?)style=['"][^'"]*['"]([^>]*?)>/g,
      '<img$1$2>'
    );

    // 处理 WordPress 图片包装器
    content = content.replace(
      /<figure class="wp-block-image[^"]*"[^>]*>/g,
      '<figure class="wp-block-image">'
    );

    // 移除 noscript 标签中的重复图片
    content = content.replace(
      /<noscript><img[^>]*><\/noscript>/g,
      ''
    );

    return content;
  }

  /**
   * 处理链接，确保内链和相对链接都指向正确的域名
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
   * 处理基础的 WordPress shortcodes
   */
  private processShortcodes(content: string): string {
    // 移除不支持的 shortcodes
    content = content.replace(/\[caption[^\]]*\](.*?)\[\/caption\]/gs, '$1');
    content = content.replace(/\[gallery[^\]]*\]/g, '');
    content = content.replace(/\[embed[^\]]*\](.*?)\[\/embed\]/gs, '$1');
    
    return content;
  }

  /**
   * 清理和规范化 HTML
   */
  private cleanupHTML(content: string): string {
    // 移除空的段落标签
    content = content.replace(/<p[^>]*>\s*<\/p>/g, '');
    
    // 保护代码块中的空白字符，先用占位符替换
    const codeBlocks: string[] = [];
    content = content.replace(/<pre[^>]*>[\s\S]*?<\/pre>/g, (match) => {
      const index = codeBlocks.length;
      codeBlocks.push(match);
      return `__CODE_BLOCK_${index}__`;
    });
    
    // 保护行内代码中的空白字符
    const inlineCodes: string[] = [];
    content = content.replace(/<code[^>]*>.*?<\/code>/g, (match) => {
      const index = inlineCodes.length;
      inlineCodes.push(match);
      return `__INLINE_CODE_${index}__`;
    });
    
    // 现在可以安全地清理其他地方的空白字符
    content = content.replace(/\s+/g, ' ');
    content = content.replace(/>\s+</g, '><');
    
    // 恢复代码块
    codeBlocks.forEach((codeBlock, index) => {
      content = content.replace(`__CODE_BLOCK_${index}__`, codeBlock);
    });
    
    // 恢复行内代码
    inlineCodes.forEach((inlineCode, index) => {
      content = content.replace(`__INLINE_CODE_${index}__`, inlineCode);
    });
    
    // 确保代码块的正确格式和类名
    content = content.replace(/<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g, 
      '<pre class="wp-block-code"$1><code$2>$3</code></pre>');
    
    return content.trim();
  }

  /**
   * 处理文章内容
   */
  public processContent(content: string): string {
    if (!content) return '';
    
    // 按顺序处理内容
    content = this.processImages(content);
    content = this.processLinks(content);
    content = this.processShortcodes(content);
    content = this.cleanupHTML(content);
    
    return content;
  }

  /**
   * 处理文章摘要
   */
  public processExcerpt(excerpt: string): string {
    if (!excerpt) return '';
    
    // 移除 HTML 标签，只保留纯文本
    let cleaned = excerpt.replace(/<[^>]*>/g, '');
    
    // 解码 HTML 实体
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