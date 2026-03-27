import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import { Post } from "@/types";
import { useNavigate } from "react-router-dom";

const MyPosts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = () => {
      setLoading(true);
      try {
        // Get posts from localStorage (in a real app, this would be from an API)
        const savedPosts = localStorage.getItem('userPosts');
        if (savedPosts) {
          const parsedPosts = JSON.parse(savedPosts);
          // Filter posts for current user
          const userPosts = parsedPosts.filter((post: Post) => post.userId === user?.id);
          setPosts(userPosts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchPosts();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground mb-4">You need to be logged in to view your posts</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => navigate('/')}>Back to Home</Button>
          <h1 className="text-2xl font-bold">My Posts</h1>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading your posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-4">Start sharing your football journey with the community!</p>
              <Button onClick={() => navigate('/')}> 
                Create Your First Post
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
