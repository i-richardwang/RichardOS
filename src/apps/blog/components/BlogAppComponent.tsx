import { useState, useEffect, useRef, useCallback } from "react";
import { AppProps } from "@/apps/base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { BlogMenuBar } from "./BlogMenuBar";
import { BlogSidebar } from "./BlogSidebar";
import { PostListItem } from "./PostListItem";
import { PostDetailView } from "./PostDetailView";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "../index";
import { useBlogStore, type BlogPost } from "@/stores/useBlogStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FileText, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import "./BlogContent.css";


export function BlogAppComponent({
  isWindowOpen,
  onClose,
  isForeground,
  skipInitialSound,
  instanceId,
  onNavigateNext,
  onNavigatePrevious,
}: AppProps) {
  const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');

  const {
    posts,
    categories,
    selectedPost,
    selectedCategory,
    searchQuery,
    filteredPosts,
    isLoading,
    isInitialized,
    error,
    isSidebarVisible,
    setSelectedPost,
    setSelectedCategory,
    setSearchQuery,
    toggleSidebarVisibility,
    initializeBlog,
  } = useBlogStore();

  // 窗口宽度检测
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFrameNarrow, setIsFrameNarrow] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = (width: number) => {
      setIsFrameNarrow(width < 550);
    };

    // 初始测量
    updateWidth(containerRef.current.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        updateWidth(entries[0].contentRect.width);
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // 从窄屏切换到宽屏时自动显示侧边栏
  const prevFrameNarrowRef = useRef(isFrameNarrow);

  useEffect(() => {
    if (prevFrameNarrowRef.current && !isFrameNarrow) {
      // 从narrow -> wide
      if (!isSidebarVisible) {
        toggleSidebarVisibility();
      }
    }
    prevFrameNarrowRef.current = isFrameNarrow;
  }, [isFrameNarrow, isSidebarVisible, toggleSidebarVisibility]);

  // 初始化博客数据
  useEffect(() => {
    if (!isInitialized) {
      initializeBlog();
    }
  }, [isInitialized, initializeBlog]);

  const handlePostClick = (post: BlogPost) => {
    setSelectedPost(post);
    setViewMode('detail');
  };

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedPost(null);
    
    // 如果是宽屏模式且侧边栏隐藏，则显示侧边栏
    if (!isFrameNarrow && !isSidebarVisible) {
      toggleSidebarVisibility();
    }
  }, [isFrameNarrow, isSidebarVisible, toggleSidebarVisibility, setSelectedPost]);

  // 移动端分类选择后关闭侧边栏
  const handleMobileCategorySelect = useCallback(() => {
    if (isSidebarVisible && isFrameNarrow) {
      toggleSidebarVisibility();
    }
  }, [isSidebarVisible, isFrameNarrow, toggleSidebarVisibility]);

  if (!isWindowOpen) return null;

  const sidebarVisibleBool = isSidebarVisible ?? false;

  return (
    <>
      <BlogMenuBar
        onClose={onClose}
        onShowHelp={() => setIsHelpDialogOpen(true)}
        onShowAbout={() => setIsAboutDialogOpen(true)}
        onToggleSidebar={toggleSidebarVisibility}
        isSidebarVisible={sidebarVisibleBool}
      />
      <WindowFrame
        title="Blog"
        onClose={onClose}
        isForeground={isForeground}
        appId="blog"
        skipInitialSound={skipInitialSound}
        instanceId={instanceId}
        onNavigateNext={onNavigateNext}
        onNavigatePrevious={onNavigatePrevious}
        windowConstraints={{
          minWidth: 800,
          minHeight: 400,
        }}
      >
        <div ref={containerRef} className="relative h-full w-full">
          {/* 移动端侧边栏覆盖层 - framer-motion 3D 动画 */}
          <AnimatePresence>
            {sidebarVisibleBool && isFrameNarrow && (
              <motion.div
                className="absolute inset-0 z-20"
                style={{ perspective: "2000px" }}
              >
                {/* 遮罩层 - 淡入淡出 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="absolute inset-0 bg-black"
                  onClick={toggleSidebarVisibility}
                />

                {/* 侧边栏 - 3D翻转动画 */}
                <motion.div
                  initial={{
                    rotateX: -60,
                    translateY: "-30%",
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: "top center",
                  }}
                  animate={{
                    rotateX: 0,
                    translateY: "0%",
                    scale: 1,
                    opacity: 1,
                    transformOrigin: "top center",
                  }}
                  exit={{
                    rotateX: -60,
                    translateY: "-30%",
                    scale: 0.9,
                    opacity: 0,
                    transformOrigin: "top center",
                  }}
                  transition={{
                    type: "spring",
                    damping: 40,
                    stiffness: 300,
                    mass: 1,
                  }}
                  className="relative w-full bg-neutral-100 z-10"
                  style={{
                    transformPerspective: "2000px",
                    backfaceVisibility: "hidden",
                    willChange: "transform",
                    maxHeight: "70%",
                  }}
                >
                  <BlogSidebar
                    categories={categories}
                    posts={posts}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    isVisible={true}
                    isOverlay={true}
                    onCategorySelect={handleMobileCategorySelect}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 基于窗口宽度的布局 */}
          <div className={`flex h-full ${isFrameNarrow ? "flex-col" : "flex-row"}`}>
            {/* 桌面端侧边栏 - 使用平滑过渡 */}
            <div 
              className={`${isFrameNarrow ? "hidden" : "block"} h-full transition-all duration-200 ease-in-out overflow-hidden ${
                viewMode === 'list' && sidebarVisibleBool ? "w-56" : "w-0"
              }`}
            >
              {viewMode === 'list' && (
                <div className="w-56 h-full">
                  <BlogSidebar
                    categories={categories}
                    posts={posts}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    isVisible={sidebarVisibleBool}
                  />
                </div>
              )}
            </div>

            {/* 主内容区域 */}
            <div className="relative flex flex-col flex-1 h-full bg-white transition-all duration-200 ease-in-out">
              {/* 根据视图模式渲染不同内容 */}
              {viewMode === 'detail' && selectedPost ? (
                <PostDetailView 
                  post={selectedPost} 
                  onBack={handleBackToList}
                  isNarrowView={isFrameNarrow}
                />
              ) : (
                <>
                  {/* 顶部工具栏 */}
                  <div className="sticky top-0 z-10 flex items-center justify-between px-2 py-1 bg-neutral-200/90 backdrop-blur-lg border-b border-black">
                    <div className="flex items-center flex-1">
                      {/* 移动端分类菜单按钮 - 复古风格 */}
                      {isFrameNarrow && (
                        <Button
                          variant="ghost"
                          onClick={toggleSidebarVisibility}
                          className="flex items-center gap-1 px-2 py-1 h-7 mr-2 hover:bg-neutral-300/50 transition-colors duration-150 border border-transparent hover:border-neutral-400"
                        >
                          <List className="h-3 w-3 text-neutral-600" />
                          <span className="font-geneva-12 text-[10px] text-neutral-600 font-medium">Menu</span>
                        </Button>
                      )}
                      
                      {/* 搜索框 */}
                      <div className="flex-1 relative">
                        <Search className="absolute left-2 top-1.5 w-3 h-3 text-gray-400" />
                        <Input
                          placeholder="Search articles..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-7 pl-7 text-[11px] font-geneva-12"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 文章列表 */}
                  <div className="flex-1 overflow-y-auto">
                    {isLoading && posts.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center font-geneva-12">
                          <p className="text-gray-600 text-[11px]">Loading articles...</p>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center font-geneva-12">
                          <p className="text-red-600 text-[11px] mb-2">Error loading articles</p>
                          <p className="text-gray-500 text-[10px]">Please check your connection</p>
                        </div>
                      </div>
                    ) : filteredPosts.length === 0 ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="text-center font-geneva-12">
                          <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-[11px]">No articles found</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {filteredPosts.map((post) => (
                          <PostListItem
                            key={post.id}
                            post={post}
                            onClick={() => handlePostClick(post)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 对话框 */}
        <HelpDialog
          isOpen={isHelpDialogOpen}
          onOpenChange={setIsHelpDialogOpen}
          appName="Blog"
          helpItems={helpItems}
        />

        <AboutDialog
          isOpen={isAboutDialogOpen}
          onOpenChange={setIsAboutDialogOpen}
          metadata={appMetadata}
        />
      </WindowFrame>
    </>
  );
} 