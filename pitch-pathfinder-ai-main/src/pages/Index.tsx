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
import { Users, MessageSquare, TrendingUp, Bell, Home, Target, Star, Award, Trophy, Calendar, MapPin, Plus, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Post } from "@/types";

// Sample professional posts data
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
    content: "Excited to share that I've been selected for the England U21 squad for the upcoming European Championship qualifiers. Grateful for the opportunity to represent my country and continue developing my game at the highest level. Thank you to my coaches, teammates, and family for their support! 🏴󠁧󠁢󠁥󠁮󠁧󠁿⚽",
    media: {
      type: "image",
      url: "/src/assets/football-stadium.jpg"
    },
    likes: 127,
    comments: 23,
    isLiked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    userId: "3",
    user: {
      id: "3",
      name: "Ahmed Hassan",
      profilePicture: "",
      position: "Defender",
      club: "Al-Ahly SC"
    },
    content: "Reflecting on an incredible season with Al-Ahly SC. We've achieved so much together - league title, domestic cup, and a strong Champions League run. The dedication and professionalism of this team never ceases to amaze me. Ready for the next challenge! 🏆",
    likes: 156,
    comments: 18,
    isLiked: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "4",
    userId: "4",
    user: {
      id: "4",
      name: "Emma Thompson",
      profilePicture: "",
      position: "Goalkeeper",
      club: "Chelsea FC Women"
    },
    content: "Thrilled to share that I've completed my UEFA B License coaching course! As players, we have a responsibility to give back to the game and help develop the next generation. Excited to start my coaching journey alongside my playing career. #Coaching #Development #Football",
    likes: 73,
    comments: 12,
    isLiked: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

// Sample connections data
const sampleConnections = [
  {
    id: "1",
    name: "David Silva",
    position: "Midfielder",
    club: "Real Sociedad",
    profilePicture: "",
    mutualConnections: 12,
    isConnected: false
  },
  {
    id: "2",
    name: "Alex Morgan",
    position: "Forward",
    club: "San Diego Wave",
    profilePicture: "",
    mutualConnections: 8,
    isConnected: false
  },
  {
    id: "3",
    name: "Virgil van Dijk",
    position: "Defender",
    club: "Liverpool FC",
    profilePicture: "",
    mutualConnections: 5,
    isConnected: false
  }
];

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [activeTab, setActiveTab] = useState("feed");
  const { isLoading, executeWithLoading } = useLoadingState();

  const handlePostCreated = (newPost: Post) => {
    // Add the new post to the beginning of the posts array
    setPosts(prevPosts => [newPost, ...prevPosts]);
    
    // Save to localStorage for persistence
    try {
      const existingPosts = localStorage.getItem('userPosts');
      const allPosts = existingPosts ? JSON.parse(existingPosts) : [];
      allPosts.unshift(newPost); // Add to beginning
      localStorage.setItem('userPosts', JSON.stringify(allPosts));
    } catch (error) {
      console.error('Error saving post to localStorage:', error);
    }
    
    toast({
      title: "Post created! ⚽",
      description: "Your post has been added to the feed.",
    });
  };

  const handleLike = (postId: string) => {
    // In a real app, this would make an API call
    console.log("Liked post:", postId);
  };

  const handleComment = (postId: string) => {
    // In a real app, this would open a comment modal
    console.log("Comment on post:", postId);
  };

  const handleShare = (postId: string) => {
    // In a real app, this would share the post
    console.log("Share post:", postId);
  };

  const handleAddComment = (postId: string, content: string) => {
    // In a real app, this would save the comment to the backend
    console.log("Adding comment to post:", postId, "Content:", content);
  };
  
  useEffect(() => {
    // Load posts from localStorage and combine with sample posts
    try {
      // Load user posts from localStorage
      const storedPosts = localStorage.getItem('userPosts');
      const userPosts = storedPosts ? JSON.parse(storedPosts) : [];
      
      // Combine user posts with sample posts, with user posts at the top
      setPosts([...userPosts, ...samplePosts]);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(samplePosts);
    }
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome to VisionPlay</h1>
          <p className="text-muted-foreground mb-4">Please log in to access your football network</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0"> {/* Added padding bottom for mobile navigation */}
      <Navigation />
      <main className="container py-4 px-4 md:py-6 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left Sidebar - Profile & Connections */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarImage src={user?.name ? undefined : undefined} />
                    <AvatarFallback className="text-xl">
                      {user?.name?.[0] || user?.email?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg">{user?.name || "Your Name"}</h3>
                  <p className="text-sm text-muted-foreground mb-2">Professional Footballer</p>
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                    <span>127 connections</span>
                    <span>•</span>
                    <span>23 posts</span>
                  </div>
                  <Button size="sm" className="w-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Suggested for you</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleConnections.map((connection) => (
                  <div key={connection.id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{connection.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{connection.name}</p>
                      <p className="text-xs text-muted-foreground">{connection.position} • {connection.club}</p>
                      <p className="text-xs text-muted-foreground">{connection.mutualConnections} mutual connections</p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-sm">
                  View all suggestions
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Connected with David Silva</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Endorsed by Alex Morgan</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>New achievement unlocked</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Feed */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-2">Professional Feed</h1>
              <p className="text-muted-foreground">Stay updated with your football network</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feed" className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>Feed</span>
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Trending</span>
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Network</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="mt-6">
                <CreatePost onPostCreated={handlePostCreated} />
                
                <div className="space-y-4">
                  {false && isLoading ? (
                    <>
                      <PostCardSkeleton />
                      <PostCardSkeleton />
                      <PostCardSkeleton />
                    </>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={handleShare}
                        onAddComment={handleAddComment}
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trending" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Trending in Football
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <div>
                          <p className="font-medium">Champions League Final</p>
                          <p className="text-sm text-muted-foreground">Real Madrid vs Manchester City</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Award className="h-5 w-5 text-blue-500" />
                        <div>
                          <p className="font-medium">Ballon d'Or 2024</p>
                          <p className="text-sm text-muted-foreground">Nominees announced</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                        <Star className="h-5 w-5 text-green-500" />
                        <div>
                          <p className="font-medium">Transfer News</p>
                          <p className="text-sm text-muted-foreground">Major signings this summer</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="network" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Your Professional Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Your professional connections</p>
                      <p className="text-sm">Posts from players in your network</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar - News & Opportunities */}
          <div className="lg:col-span-1 space-y-6">
            {/* Football News */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Football News</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Champions League Updates</h4>
                  <p className="text-xs text-muted-foreground">Quarter-final draw results announced</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Transfer Window</h4>
                  <p className="text-xs text-muted-foreground">Major signings across Europe</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">International Duty</h4>
                  <p className="text-xs text-muted-foreground">World Cup qualifiers this week</p>
                </div>
              </CardContent>
            </Card>

            {/* Job Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Opportunities</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                  <h4 className="font-medium text-sm mb-1">Youth Coach Position</h4>
                  <p className="text-xs text-muted-foreground mb-2">Arsenal Academy</p>
                  <Button size="sm" className="w-full">Apply</Button>
                </div>
                <div className="p-3 rounded-lg border border-green-200 bg-green-50">
                  <h4 className="font-medium text-sm mb-1">Scout Role</h4>
                  <p className="text-xs text-muted-foreground mb-2">Manchester City</p>
                  <Button size="sm" variant="outline" className="w-full">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;