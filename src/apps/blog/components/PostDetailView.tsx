import { ArrowLeft, ExternalLink, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BlogPost } from '@/stores/useBlogStore';
import { BlogContentRenderer } from './BlogContentRenderer';
import { toast } from "sonner";

interface PostDetailViewProps {
  post: BlogPost;
  onBack: () => void;
  isNarrowView?: boolean;
}

export function PostDetailView({ post, onBack, isNarrowView = false }: PostDetailViewProps) {
  const originalUrl = `https://imrichard.com/${post.slug}`;

  const handleViewOriginal = () => {
    window.open(originalUrl, '_blank');
  };

  const handleShare = async () => {
    const shareData = {
      title: post.title,
      text: `Check out this article: ${post.title}`,
      url: originalUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
          fallbackShare(originalUrl);
        }
      }
    } else {
      fallbackShare(originalUrl);
    }
  };

  const fallbackShare = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast.success("Link copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy link");
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* 头部工具栏 */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-2 py-1 bg-neutral-200/90 backdrop-blur-lg border-b border-black">
        <div className="flex items-center">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="h-7 px-2 mr-3"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            <span className="font-geneva-12 text-[11px]">Back</span>
          </Button>
          
          <div className="flex flex-col">
            <div className="font-geneva-12 text-[11px] text-gray-500">
              {/* 在移动视图下只显示日期，桌面端显示作者和日期 */}
              {isNarrowView ? (
                <span>{post.date}</span>
              ) : (
                <>
              <span>{post.author}</span>
              <span className="mx-2">•</span>
              <span>{post.date}</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleViewOriginal}
            variant="retro"
            size="sm"
            className="h-7 px-2 font-geneva-12 text-[11px] cursor-pointer"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Original
          </Button>
          
          <Button
            onClick={handleShare}
            variant="retro"
            size="sm"
            className="h-7 px-2 font-geneva-12 text-[11px] cursor-pointer"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>
      </div>
      
      {/* 文章内容区域 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* 文章标题 */}
          <h1 className="font-geneva-12 text-[22px] font-bold mb-4 text-black leading-tight">
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