import { useState, useEffect } from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import PostCardSkeleton from "@/components/PostCardSkeleton";
import Navigation from "@/components/Navigation";
import CreatePost from "@/components/CreatePost";
import PostCard from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, MessageSquare, TrendingUp, Home, Star, Award, Trophy, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Post } from "@/types";

const samplePosts: Post[] = [
  {
    id: "1",
    userId: "1",
    user: {
      id: "1",
      name: "Marcus Johnson",
      profilePicture: "",
      position: "Midfielder",
      club: "Manchester United Academy"
    },
    content: "Excited to share that I've been selected for the England U21 squad! ⚽",
    likes: 127,
    comments: 23,
    isLiked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [activeTab, setActiveTab] = useState("feed");
  const { isLoading } = useLoadingState();

  useEffect(() => {
    try {
      const storedPosts = localStorage.getItem("userPosts");
      const userPosts = storedPosts ? JSON.parse(storedPosts) : [];
      setPosts([...userPosts, ...samplePosts]);
    } catch {
      setPosts(samplePosts);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#0f172a,_#020617)] text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to VisionPlay ⚽</h1>
          <p className="mb-4 text-gray-400">Please log in to continue</p>
          <Button onClick={() => window.location.href = "/login"}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_#0f172a,_#020617)] text-white pb-16 md:pb-0">
      
      <Navigation />

      <main className="container py-6 px-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-green-400">⚽ Professional Feed</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 bg-gray-900 border border-gray-700">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            <CreatePost onPostCreated={(post) => setPosts([post, ...posts])} />

            <div className="space-y-4 mt-4">
              {isLoading ? (
                <>
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="trending" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Trending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Latest football trends ⚽</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">Your connections</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;