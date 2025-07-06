import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  fetchWordPressPosts, 
  fetchWordPressCategories,
  type BlogPost,
  type BlogCategory 
} from "@/apps/blog/utils/blogApi";

// Re-export types
export type { BlogPost, BlogCategory };

interface BlogData {
  posts: BlogPost[];
  categories: BlogCategory[];
  selectedPost: BlogPost | null;
  selectedCategory: number | null;
  searchQuery: string;
  filteredPosts: BlogPost[];
  
  // UI state
  isSidebarVisible: boolean;
  
  // Loading state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Cache management
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

const CURRENT_BLOG_STORE_VERSION = 1;

// Cache expiration time: 4 hours
const CACHE_DURATION = 4 * 60 * 60 * 1000;

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      ...initialBlogData,

      setSelectedPost: (post) => set({ selectedPost: post }),

      setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId });
        // Update filtered articles list
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
        // Update filtered articles list
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
          // Category loading failure should not block main process
        }
      },

      initializeBlog: async () => {
        if (get().isInitialized) {
          return;
        }

        const { posts, lastFetchTime } = get();
        
        // Check if cache is valid (within 4 hours)
        const isCacheValid = lastFetchTime && 
          (Date.now() - lastFetchTime) < CACHE_DURATION;
        
        if (posts.length > 0 && isCacheValid) {
          // Cache is valid, use directly
          set({ 
            isInitialized: true,
            filteredPosts: posts 
          });
          return;
        }

        // Cache is invalid or empty, reload
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
        // Force refresh, ignore cache
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
        // Only persist data and UI preferences, don't save user search and selection state
      }),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error("Error rehydrating Blog store:", error);
          } else if (state) {
            // Auto-initialize blog data when store rehydrates
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