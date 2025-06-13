import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  fetchWordPressPosts, 
  fetchWordPressCategories,
  type BlogPost,
  type BlogCategory 
} from "@/apps/blog/utils/blogApi";

// 重新导出类型
export type { BlogPost, BlogCategory };

interface BlogData {
  posts: BlogPost[];
  categories: BlogCategory[];
  selectedPost: BlogPost | null;
  selectedCategory: number | null;
  searchQuery: string;
  filteredPosts: BlogPost[];
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

const initialBlogData: BlogData = {
  posts: [],
  categories: [],
  selectedPost: null,
  selectedCategory: null,
  searchQuery: '',
  filteredPosts: [],
  isLoading: false,
  isInitialized: false,
  error: null,
};

export interface BlogState extends BlogData {
  // 基础操作
  setSelectedPost: (post: BlogPost | null) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchQuery: (query: string) => void;
  
  // 数据加载
  loadPosts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  initializeBlog: () => Promise<void>;
}

const CURRENT_BLOG_STORE_VERSION = 3;

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      ...initialBlogData,

      setSelectedPost: (post) => set({ selectedPost: post }),

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId });
        // 更新过滤后的文章列表
        const { posts, searchQuery } = get();
        const filtered = posts.filter((post) => {
          const matchesCategory = !categoryId || post.categories.includes(categoryId);
          const matchesSearch = !searchQuery || 
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        set({ filteredPosts: filtered });
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query });
        // 更新过滤后的文章列表
        const { posts, selectedCategory } = get();
        const filtered = posts.filter((post) => {
          const matchesCategory = !selectedCategory || post.categories.includes(selectedCategory);
          const matchesSearch = !query || 
            post.title.toLowerCase().includes(query.toLowerCase()) ||
            post.content.toLowerCase().includes(query.toLowerCase());
          return matchesCategory && matchesSearch;
        });
        set({ filteredPosts: filtered });
      },

      loadPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const posts = await fetchWordPressPosts();
          set({ 
            posts, 
            filteredPosts: posts,
            isLoading: false,
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load posts',
            isLoading: false,
          });
        }
      },

      loadCategories: async () => {
        try {
          const categories = await fetchWordPressCategories();
          set({ categories });
        } catch (error) {
          console.error('Failed to load categories:', error);
          // 分类加载失败不阻塞主流程
        }
      },

      initializeBlog: async () => {
        if (get().isInitialized) {
          return;
        }

        // 如果已有缓存数据，直接使用
        const { posts } = get();
        if (posts.length > 0) {
          set({ 
            isInitialized: true,
            filteredPosts: posts 
          });
          return;
        }

        // 首次加载才显示加载状态
        set({ isLoading: true, error: null });
        try {
          await Promise.all([
            get().loadPosts(),
            get().loadCategories(),
          ]);
          set({ isInitialized: true });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize blog',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "ryos:blog",
      version: CURRENT_BLOG_STORE_VERSION,
      partialize: (state) => ({
        posts: state.posts,
        categories: state.categories,
        // 只持久化数据，不保存用户的搜索和选择状态
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating Blog store:", error);
          } else if (state) {
            // 当 store 重新水化时，自动初始化博客数据
            setTimeout(() => {
              state.initializeBlog().catch((err) =>
                console.error("Failed to initialize blog on rehydrate", err)
              );
            }, 50);
          }
        };
      },
    }
  )
); 