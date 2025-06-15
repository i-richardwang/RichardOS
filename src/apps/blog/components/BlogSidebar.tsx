import { type BlogPost, type BlogCategory } from "@/stores/useBlogStore";

interface BlogSidebarProps {
  categories: BlogCategory[];
  posts: BlogPost[];
  selectedCategory: number | null;
  setSelectedCategory: (categoryId: number | null) => void;
  isVisible: boolean;
  isOverlay?: boolean;
  onCategorySelect?: () => void;
}

export function BlogSidebar({ 
  categories, 
  posts, 
  selectedCategory, 
  setSelectedCategory, 
  isVisible, 
  isOverlay = false,
  onCategorySelect 
}: BlogSidebarProps) {
  if (!isVisible) {
    return null;
  }

  const handleCategoryClick = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    // 移动端选择分类后自动关闭侧边栏
    if (onCategorySelect) {
      onCategorySelect();
    }
  };

  return (
    <div className={`flex flex-col font-geneva-12 text-[12px] border-black bg-neutral-100 ${
      isOverlay ? "w-full border-b" : "w-56 border-r h-full overflow-hidden"
    }`}>
      <div className={`py-3 px-3 flex flex-col ${
        isOverlay ? "" : "flex-1 overflow-hidden"
      }`}>
        <div className="flex justify-between items-center mb-2 flex-shrink-0">
          <h2 className="text-[14px] pl-1">Categories</h2>
        </div>
        
        <div className="space-y-1 overscroll-contain flex-1 overflow-y-auto min-h-0" 
             style={{ WebkitOverflowScrolling: "touch" }}>
          {/* 全部分类选项 */}
          <div
            onClick={() => handleCategoryClick(null)}
            className={`p-2 py-1 cursor-pointer ${
              selectedCategory === null ? 'bg-black text-white' : 'hover:bg-black/5'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>All Articles</span>
              <span className={`text-[10px] ml-1.5 ${
                selectedCategory === null ? 'text-white/40' : 'text-black/40'
              }`}>
                {posts.length}
              </span>
            </div>
          </div>
          
          {/* 各个分类 */}
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`p-2 py-1 cursor-pointer ${
                selectedCategory === category.id ? 'bg-black text-white' : 'hover:bg-black/5'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className={`text-[10px] ml-1.5 ${
                  selectedCategory === category.id ? 'text-white/40' : 'text-black/40'
                }`}>
                  {category.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 