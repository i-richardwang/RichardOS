import { useState, useEffect } from "react";
import { AppProps } from "@/apps/base/types";
import { WindowFrame } from "@/components/layout/WindowFrame";
import { BlogMenuBar } from "./BlogMenuBar";
import { PostListItem } from "./PostListItem";
import { PostDetailView } from "./PostDetailView";
import { HelpDialog } from "@/components/dialogs/HelpDialog";
import { AboutDialog } from "@/components/dialogs/AboutDialog";
import { helpItems, appMetadata } from "../index";
import { useBlogStore, type BlogPost } from "@/stores/useBlogStore";
import { Input } from "@/components/ui/input";
import { Search, FileText } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    setSelectedPost,
    setSelectedCategory,
    setSearchQuery,
    initializeBlog,
  } = useBlogStore();

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

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedPost(null);
  };

  if (!isWindowOpen) return null;

  // 根据视图模式渲染不同内容
  if (viewMode === 'detail' && selectedPost) {
    return (
      <>
        <BlogMenuBar
          onClose={onClose}
          onShowHelp={() => setIsHelpDialogOpen(true)}
          onShowAbout={() => setIsAboutDialogOpen(true)}
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
            minWidth: 600,
            minHeight: 400,
          }}
        >
          <PostDetailView 
            post={selectedPost} 
            onBack={handleBackToList}
          />

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

  return (
    <>
      <BlogMenuBar
        onClose={onClose}
        onShowHelp={() => setIsHelpDialogOpen(true)}
        onShowAbout={() => setIsAboutDialogOpen(true)}
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
          minWidth: 600,
          minHeight: 400,
        }}
      >

        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* 搜索和筛选工具栏 */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2">
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
              
              {/* 分类筛选 */}
              <Select 
                value={selectedCategory?.toString() || "all"} 
                onValueChange={(value) => setSelectedCategory(value === "all" ? null : parseInt(value))}
              >
                <SelectTrigger className="h-7 w-40 text-[11px] font-geneva-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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