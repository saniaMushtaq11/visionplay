import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Spinner } from "@/components/ui/spinner";
import { Send, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { formatTimeAgo } from "@/lib/date-utils";
import { getAnimationClasses } from "@/lib/animation-utils";
import { Comment } from "@/types";

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
  onAddComment: (postId: string, content: string) => void;
}

const CommentSection = ({ postId, comments, onAddComment }: CommentSectionProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const { isLoading: isSubmitting, executeWithLoading } = useLoadingState();
  const [showComments, setShowComments] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please add some content to your comment.",
        variant: "destructive",
      });
      return;
    }

    executeWithLoading(
      async () => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        onAddComment(postId, newComment.trim());
        setNewComment("");
        setShowComments(true); // Auto-expand comments after posting
        toast({
          title: "Comment added! 💬",
          description: "Your comment has been posted.",
          className: getAnimationClasses({ variant: 'slideIn' })
        });
      },
      undefined,
      (error) => {
        toast({
          title: "Failed to add comment",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    );
  };

  // Using the imported formatTimeAgo function from date-utils.ts

  return (
    <div className="border-t pt-3">
      {/* Comment Toggle */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-300"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
          {showComments ? (
            <ChevronUp className="h-4 w-4 transition-transform duration-300" />
          ) : (
            <ChevronDown className="h-4 w-4 transition-transform duration-300" />
          )}
        </Button>
      </div>

      {/* Add Comment Form */}
      {user && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.name ? undefined : undefined} />
              <AvatarFallback className="text-xs">
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[60px] resize-none text-sm"
                disabled={isSubmitting}
              />
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || !newComment.trim()}
                  className="bg-gradient-accent hover:opacity-90 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" variant="primary" className="mr-2" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span>Post</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Comments List */}
      {showComments && (
        <div className={getAnimationClasses({ variant: 'fadeIn', transition: 'all' })}>
        <div className="space-y-3">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className={`flex items-start space-x-3 ${getAnimationClasses({ variant: 'slideIn' })}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.user.profilePicture} />
                  <AvatarFallback className="text-xs">
                    {comment.user.name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="bg-muted/50 rounded-lg p-3 hover:bg-muted/70 transition-colors duration-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{comment.user.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
