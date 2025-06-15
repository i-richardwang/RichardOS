import { BlogPost } from '@/stores/useBlogStore';

interface PostListItemProps {
  post: BlogPost;
  onClick: () => void;
}

export function PostListItem({ post, onClick }: PostListItemProps) {
  return (
    <div
      className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <h3 className="font-geneva-12 text-[14px] font-semibold text-black mb-1 line-clamp-2">
        {post.title}
      </h3>
      
      {post.excerpt && (
        <p className="font-geneva-12 text-[11px] text-gray-600 mb-2 line-clamp-3">
          {post.excerpt}
        </p>
      )}
      
      <div className="flex items-center text-[10px] text-gray-500 font-geneva-12">
        <span>{post.date}</span>
        <span className="mx-2">•</span>
        <span>{post.author}</span>
      </div>
    </div>
  );
} 