import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Post, Comment } from "@/types";
import CommentSection from "./CommentSection";
import { Spinner } from "@/components/ui/spinner";
import { formatTimeAgo } from "@/lib/date-utils";
import { getAnimationClasses } from "@/lib/animation-utils";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Play,
  Calendar,
  MapPin,
  Trash2
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
}

const PostCard = ({ post, onLike, onComment, onShare, onAddComment, onDelete }: PostCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likes, setLikes] = useState(post.likes);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);
  
  // Check if the current user is the post owner
  const isPostOwner = user && post.userId === user.id;

  const { isLoading: isLikeLoading, executeWithLoading: executeLikeWithLoading } = useLoadingState();
  const { isLoading: isCommentLoading, executeWithLoading: executeCommentWithLoading } = useLoadingState();
  const { isLoading: isShareLoading, executeWithLoading: executeShareWithLoading } = useLoadingState();

  const handleLike = () => {
    executeLikeWithLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        setIsLiked(!isLiked);
        setLikes(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.(post.id);
      }
    );
  };

  const handleComment = () => {
    setShowComments(!showComments);
    executeCommentWithLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 300));
        onComment?.(post.id);
      }
    );
  };

  const handleAddComment = (postId: string, content: string) => {
    const newComment: Comment = {
      id: Date.now().toString(),
      postId: postId,
      userId: "current-user", // In real app, get from auth context
      user: {
        id: "current-user",
        name: "You", // In real app, get from auth context
        profilePicture: ""
      },
      content: content,
      createdAt: new Date().toISOString()
    };
    
    setComments(prev => [...prev, newComment]);
    onAddComment?.(postId, content);
  };

  const handleShare = () => {
    executeShareWithLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        onShare?.(post.id);
        toast({
          title: "Shared! ⚽",
          description: "Post shared with your network.",
          className: getAnimationClasses({ variant: 'slideIn' })
        });
      }
    );
  };

  const handleDelete = async () => {
    // Only allow post owner to delete
    if (!isPostOwner) {
      toast({ 
        title: "Permission denied", 
        description: "You can only delete your own posts.",
        variant: "destructive" 
      });
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      // Try to call the API to delete the post, but don't wait for it to succeed
      try {
        await api.deletePost(post.id);
      } catch (apiError) {
        // If API call fails with 404, it's likely a local-only post
        // Just continue with local deletion
        console.log("API delete failed, proceeding with local deletion:", apiError);
      }
      
      // Always update localStorage to remove the post
      try {
        const storedPosts = localStorage.getItem('userPosts');
        if (storedPosts) {
          const userPosts = JSON.parse(storedPosts);
          const updatedPosts = userPosts.filter((p: Post) => p.id !== post.id);
          localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
        }
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
      
      toast({ 
        title: "Post deleted", 
        description: "Your post has been deleted successfully." 
      });
      
      // Call the onDelete callback to update the UI
      onDelete?.(post.id);
    } catch (error: any) {
      toast({ 
        title: "Delete failed", 
        description: error.message || "Failed to delete post. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to render video or image media
  const renderMedia = () => {
    if (!post.media) return null;
    
    if (post.media.type === 'video') {
      // Ensure the video URL is properly formatted
      const videoSrc = post.media.url.startsWith('data:') 
        ? post.media.url 
        : `data:video/mp4;base64,${post.media.url.replace(/^data:video\/mp4;base64,/, '')}`;
      
      return (
        <div className="relative rounded-lg overflow-hidden mt-3 bg-black/5">
          <video 
            key={post.id} // Force re-render when post changes
            src={videoSrc}
            controls 
            className="w-full max-h-[500px] object-contain"
            poster={post.media.thumbnail}
            onError={(e) => {
              console.error("Video failed to load:", e);
            }}
            preload="metadata"
          />
        </div>
      );
    } else if (post.media.type === 'image') {
      return (
        <div className="relative rounded-lg overflow-hidden mt-3">
          <img 
            src={post.media.url} 
            alt="Post media" 
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="mb-4 overflow-hidden border-border/40 shadow-sm hover:shadow-md transition-all duration-300 card-hover animate-fade-in max-w-2xl mx-auto">
      <CardContent className="p-4 sm:p-5">
        {/* Post Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border hover:ring-2 hover:ring-primary/50 transition-all duration-300">
              <AvatarImage src={post.user.profilePicture || ""} alt={post.user.name} />
              <AvatarFallback className="bg-primary/10 text-primary-foreground">
                {post.user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 animate-slide-in">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground">{post.user.name}</h3>
                {post.user.position && (
                  <Badge variant="secondary" className="text-xs">
                    {post.user.position}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>{post.user.club}</span>
                <span>•</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="destructive" 
              size="sm" 
              className="h-8 px-2 flex items-center gap-1" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Spinner size="sm" variant="primary" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </>
              )}
            </Button>
          </div>
        </div>
        
        {/* Post Content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-line">{post.content}</p>
          
          {/* Render Media (Video or Image) */}
          {renderMedia()}
          
          {/* Player Attributes (if available) */}
          {post.attributes && Object.keys(post.attributes).length > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10">
              <h4 className="text-sm font-semibold mb-2 text-primary">Player Attributes</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(post.attributes)
                  .filter(([key]) => !['filename', 'matches', 'goals', 'overall'].includes(key))
                  .map(([skill, rating]) => (
                    <div key={skill} className="flex justify-between items-center">
                      <span className="text-xs capitalize">{skill}</span>
                      <Badge variant="outline" className="text-xs font-semibold">
                        {typeof rating === 'number' ? rating.toFixed(1) : rating}/5
                      </Badge>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-muted-foreground hover:text-primary ${isLiked ? 'text-red-500 hover:text-red-600' : ''}`}
            onClick={handleLike}
            disabled={isLikeLoading}
          >
            {isLikeLoading ? (
              <Spinner size="sm" variant="primary" className="mr-2" />
            ) : (
              <Heart className={`h-4 w-4 mr-1.5 ${isLiked ? 'fill-current' : ''}`} />
            )}
            <span>{likes}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={handleComment}
            disabled={isCommentLoading}
          >
            {isCommentLoading ? (
              <Spinner size="sm" variant="primary" className="mr-2" />
            ) : (
              <MessageCircle className="h-4 w-4 mr-1.5" />
            )}
            <span>{post.comments}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-primary"
            onClick={handleShare}
            disabled={isShareLoading}
          >
            {isShareLoading ? (
              <Spinner size="sm" variant="primary" className="mr-2" />
            ) : (
              <Share className="h-4 w-4 mr-1.5" />
            )}
            <span>Share</span>
          </Button>
        </div>
        
        {/* Comments Section */}
        {showComments && (
          <CommentSection 
            postId={post.id} 
            comments={comments} 
            onAddComment={handleAddComment} 
          />
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
