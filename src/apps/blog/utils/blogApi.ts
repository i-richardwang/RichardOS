import { contentProcessor } from './contentProcessor';

// WordPress API 数据结构
interface WordPressPost {
  id: number;
  date: string;
  modified: string;
  slug: string;
  status: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  _links: Record<string, any>;
}

interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
}

// 内部博客文章接口
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  slug: string;
  categories: number[];
  featuredImage?: string;
  author: string;
}

// 分类接口
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

// WordPress API 调用函数
export async function fetchWordPressPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      'https://imrichard.com/wp-json/wp/v2/posts?per_page=50&_embed'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const wpPosts: WordPressPost[] = await response.json();
    
    // 转换为内部格式
    const posts: BlogPost[] = wpPosts.map((post) => ({
      id: post.id,
      title: post.title.rendered.replace(/&#8217;/g, "'").replace(/&#8216;/g, "'"),
      content: contentProcessor.processContent(post.content.rendered),
      excerpt: contentProcessor.processExcerpt(post.excerpt.rendered),
      date: new Date(post.date).toLocaleDateString(),
      slug: post.slug,
      categories: post.categories,
      author: 'Richard Wang', // 可以根据需要从 author API 获取
    }));
    
    return posts;
  } catch (error) {
    console.error('Failed to fetch WordPress posts:', error);
    throw error;
  }
}

export async function fetchWordPressCategories(): Promise<BlogCategory[]> {
  try {
    const response = await fetch(
      'https://imrichard.com/wp-json/wp/v2/categories?per_page=100'
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const wpCategories: WordPressCategory[] = await response.json();
    
    // 转换为内部格式
    const categories: BlogCategory[] = wpCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      count: cat.count,
    }));
    
    return categories;
  } catch (error) {
    console.error('Failed to fetch WordPress categories:', error);
    throw error;
  }
} 