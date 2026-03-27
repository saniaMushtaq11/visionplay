import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/hooks/useNavigation";
import { 
  Trophy, 
  Users, 
  Calendar, 
  MessageSquare, 
  User, 
  LogIn,
  Search,
  Target,
  Bell
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navigation = () => {
  const { navigateTo, handleSearch } = useNavigation();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleSearch(searchQuery);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-fade-in shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <button 
            onClick={() => navigateTo('dashboard')}
            className="mr-6 flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
          >
            <Target className="h-7 w-7 text-accent group-hover:animate-pulse-glow" />
            <span className="hidden font-bold sm:inline-block text-xl text-gradient-accent group-hover:scale-105 transition-transform">
              VisionPlay
            </span>
          </button>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105 shadow-md' : ''}`}>
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors duration-300 ${isSearchFocused ? 'text-primary' : 'text-muted-foreground'}`} />
                <Input
                  type="search"
                  placeholder="Search players, clubs, events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 h-9 bg-muted/50 border-border/50 focus:border-primary focus:ring-primary transition-all duration-300 rounded-full"
                />
              </div>
            </form>
          </div>
          
          <nav className="flex items-center space-x-1">

            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateTo('connections')}
              className="group transition-all duration-300 hover:bg-success/10 hover:text-success hover:shadow-button"
            >
              <Users className="h-4 w-4 mr-2 group-hover:animate-float" />
              <span className="hidden sm:inline">Connections</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigateTo('events')}
              className="group transition-all duration-300 hover:bg-accent/10 hover:text-accent hover:shadow-button"
            >
              <Calendar className="h-4 w-4 mr-2 group-hover:animate-float" />
              <span className="hidden sm:inline">Events</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateTo('coach')}
              className="relative group transition-all duration-300 hover:bg-warning/10 hover:text-warning hover:shadow-button"
            >
              <MessageSquare className="h-4 w-4 mr-2 group-hover:animate-float" />
              <span className="hidden sm:inline">Coach AI</span>
              <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-warning/20 text-warning border-warning/30 animate-pulse-glow">
                2
              </Badge>
            </Button>
            
            {/* Admin link - only visible to logged in users */}
            {user && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigateTo('admin')}
                className="group transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:shadow-button"
              >
                <User className="h-4 w-4 mr-2 group-hover:animate-float" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            
            <div className="hidden md:flex md:items-center md:space-x-2 md:ml-4">
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigateTo('profile')}
                    className="group transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-button"
                  >
                    <User className="h-4 w-4 mr-2 group-hover:animate-float" />
                    {user.name || user.email}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo('myposts')}
                    className="group transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:shadow-button"
                  >
                    <span className="hidden sm:inline">My Posts</span>
                  </Button>
                  <Button 
                    variant="outline"
                    size="sm" 
                    onClick={logout}
                    className="transition-all duration-300 hover:bg-destructive/10 hover:text-destructive hover:shadow-button"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                    size="sm" 
                    onClick={() => navigateTo('login')}
                    className="bg-gradient-accent hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-accent/20 hover:scale-105 group animate-slide-in"
                  >
                    <LogIn className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Login
                  </Button>
              )}
            </div>
          </nav>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 py-2 px-6 flex justify-between items-center md:hidden z-50 animate-slide-in shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('dashboard')}
          className="flex flex-col items-center justify-center p-1"
        >
          <Target className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Button>
        

        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('connections')}
          className="flex flex-col items-center justify-center p-1"
        >
          <Users className="h-5 w-5" />
          <span className="text-xs mt-1">Network</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('coach')}
          className="flex flex-col items-center justify-center p-1 relative"
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-xs mt-1">Coach</span>
          <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[10px] bg-warning/20 text-warning border-warning/30">
            2
          </Badge>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateTo('profile')}
          className="flex flex-col items-center justify-center p-1"
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;