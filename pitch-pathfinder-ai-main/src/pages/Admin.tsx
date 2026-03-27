import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Post } from "@/types";
import { Trash2, UserX } from "lucide-react";
import Navigation from "@/components/Navigation";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState("users");

  // Admin credentials (in a real app, this would be handled securely on the backend)
  const ADMIN_PASSWORD = "admin123";

  useEffect(() => {
    // Check if user is already authenticated as admin
    const adminStatus = localStorage.getItem("isAdmin");
    if (adminStatus === "true") {
      setIsAdmin(true);
      loadAdminData();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAdminLogin = () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("isAdmin", "true");
      toast({
        title: "Admin access granted",
        description: "You now have administrator privileges",
      });
      loadAdminData();
    } else {
      toast({
        title: "Access denied",
        description: "Incorrect admin password",
        variant: "destructive",
      });
    }
  };

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      // In a real app, these would be API calls
      // Simulate loading users
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock users data
      const mockUsers = [
        { id: "1", name: "Marcus Johnson", email: "marcus@example.com", role: "user" },
        { id: "3", name: "Ahmed Hassan", email: "ahmed@example.com", role: "user" },
        { id: "4", name: "Emma Thompson", email: "emma@example.com", role: "user" },
      ];
      
      // Load posts from localStorage and sample posts
      const storedPosts = localStorage.getItem('userPosts');
      const userPosts = storedPosts ? JSON.parse(storedPosts) : [];
      
      // Sample posts from Index.tsx
      const samplePosts = [
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
      
      setUsers(mockUsers);
      setPosts([...userPosts, ...samplePosts]);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter(user => user.id !== userId));
    // Also delete all posts by this user
    setPosts(posts.filter(post => post.userId !== userId));
    toast({
      title: "User deleted",
      description: `User ID ${userId} has been removed from the system`,
    });
  };

  const handleDeletePost = (postId: string) => {
    setPosts(posts.filter(post => post.id !== postId));
    
    // Update localStorage if it's a user post
    try {
      const storedPosts = localStorage.getItem('userPosts');
      if (storedPosts) {
        const userPosts = JSON.parse(storedPosts);
        const updatedPosts = userPosts.filter((post: Post) => post.id !== postId);
        localStorage.setItem('userPosts', JSON.stringify(updatedPosts));
      }
    } catch (error) {
      console.error('Error updating localStorage:', error);
    }
    
    toast({
      title: "Post deleted",
      description: `Post ID ${postId} has been removed`,
    });
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem("isAdmin");
    toast({
      title: "Logged out",
      description: "You have been logged out of admin mode",
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Admin Access</h1>
          <p className="text-muted-foreground mb-4">Please log in first to access admin features</p>
          <Button onClick={() => navigate("/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingOverlay isLoading={true} fullScreen text="Loading admin panel..." />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container py-4 px-4 md:py-6 md:px-6 max-w-7xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
            <CardDescription>
              {isAdmin 
                ? "Manage users, posts, and system settings" 
                : "Enter admin password to access administrative features"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isAdmin ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input 
                    id="admin-password" 
                    type="password" 
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                  />
                </div>
                <Button onClick={handleAdminLogin}>Login as Admin</Button>
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="posts">Posts</TabsTrigger>
                </TabsList>
                <TabsContent value="users" className="space-y-4">
                  <h3 className="text-lg font-medium mt-4">User Management</h3>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <Card key={user.id}>
                        <CardContent className="p-4 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <p className="text-xs text-muted-foreground">Role: {user.role}</p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <UserX className="h-4 w-4 mr-1" /> Delete User
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="posts" className="space-y-4">
                  <h3 className="text-lg font-medium mt-4">Post Management</h3>
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <Card key={post.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{post.user.name}</p>
                              <p className="text-xs text-muted-foreground">Post ID: {post.id}</p>
                              <p className="text-sm mt-2">{post.content.substring(0, 100)}...</p>
                            </div>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete Post
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          {isAdmin && (
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
              <Button variant="destructive" onClick={handleLogout}>Logout Admin</Button>
            </CardFooter>
          )}
        </Card>
      </main>
    </div>
  );
};

export default Admin;