import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/stores/useBlogStore';
import { BlogContentRenderer } from './BlogContentRenderer';

interface PostDetailViewProps {
  post: BlogPost;
  onBack: () => void;
}

export function PostDetailView({ post, onBack }: PostDetailViewProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* 头部工具栏 */}
      <div className="flex items-center p-3 border-b border-gray-200 bg-gray-50">
        <Button
          onClick={onBack}
          variant="outline"
          size="sm"
          className="h-7 px-2 mr-3"
        >
          <ArrowLeft className="w-3 h-3 mr-1" />
          <span className="font-geneva-12 text-[11px]">Back</span>
        </Button>
        
        <div className="flex flex-col">
          <div className="font-geneva-12 text-[11px] text-gray-500">
            <span>{post.author}</span>
            <span className="mx-2">•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </div>
      
      {/* 文章内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* 文章标题 */}
          <h1 className="font-geneva-12 text-[18px] font-bold mb-4 text-black leading-tight">
            {post.title}
          </h1>
          
          {/* 文章摘要 */}
          {post.excerpt && (
            <div className="mb-6 p-3 bg-gray-50 border-l-2 border-gray-300">
              <p className="font-geneva-12 text-[12px] text-gray-700 italic">
                {post.excerpt}
              </p>
            </div>
          )}
          
          {/* 文章内容 */}
          <BlogContentRenderer 
            content={post.content}
            className="font-geneva-12 text-[12px] leading-relaxed prose prose-sm max-w-none"
          />
        </div>
      </div>
    </div>
  );
} 