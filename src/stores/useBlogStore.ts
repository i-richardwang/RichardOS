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
  
  // UI状态
  isSidebarVisible: boolean;
  
  // 加载状态
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // 缓存管理
  lastFetchTime: number | null;
}

const initialBlogData: BlogData = {
  posts: [],
  categories: [],
  selectedPost: null,
  selectedCategory: null,
  searchQuery: '',
  filteredPosts: [],
  isSidebarVisible: true,
  isLoading: false,
  isInitialized: false,
  error: null,
  lastFetchTime: null,
};

export interface BlogState extends BlogData {
  // 基础操作
  setSelectedPost: (post: BlogPost | null) => void;
  setSelectedCategory: (categoryId: number | null) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebarVisibility: () => void;
  
  // 数据加载
  loadPosts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  initializeBlog: () => Promise<void>;
  refreshPosts: () => Promise<void>;
}

const CURRENT_BLOG_STORE_VERSION = 4;

// 缓存过期时间：4小时
const CACHE_DURATION = 4 * 60 * 60 * 1000;

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

      toggleSidebarVisibility: () => {
        set((state) => ({ isSidebarVisible: !state.isSidebarVisible }));
      },

      loadPosts: async () => {
        set({ isLoading: true, error: null });
        try {
          const posts = await fetchWordPressPosts();
          set({ 
            posts, 
            filteredPosts: posts,
            isLoading: false,
            lastFetchTime: Date.now(),
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

        const { posts, lastFetchTime } = get();
        
        // 检查缓存是否有效（4小时内）
        const isCacheValid = lastFetchTime && 
          (Date.now() - lastFetchTime) < CACHE_DURATION;
        
        if (posts.length > 0 && isCacheValid) {
          // 缓存有效，直接使用
          set({ 
            isInitialized: true,
            filteredPosts: posts 
          });
          return;
        }

        // 缓存无效或为空，重新加载
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

      refreshPosts: async () => {
        // 强制刷新，忽略缓存
        set({ isLoading: true, error: null });
        try {
          await Promise.all([
            get().loadPosts(),
            get().loadCategories(),
          ]);
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to refresh posts',
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
        isSidebarVisible: state.isSidebarVisible,
        lastFetchTime: state.lastFetchTime,
        // 只持久化数据和UI偏好，不保存用户的搜索和选择状态
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