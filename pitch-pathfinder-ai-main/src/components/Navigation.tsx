import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigation } from "@/hooks/useNavigation";
import {
  Users,
  Calendar,
  MessageSquare,
  User,
  LogIn,
  Search,
  Target,
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
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-black/60 backdrop-blur-md shadow-lg">
      
      <div className="container flex h-16 items-center">
        
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <button
            onClick={() => navigateTo("dashboard")}
            className="mr-6 flex items-center space-x-2 group transition-all duration-300 hover:scale-105"
          >
            <Target className="h-7 w-7 text-green-400 group-hover:animate-pulse" />
            <span className="hidden font-bold sm:inline-block text-xl text-green-400">
              ⚽ VisionPlay
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearchSubmit} className="relative">
              <div
                className={`relative transition-all duration-300 ${
                  isSearchFocused ? "scale-105 shadow-md" : ""
                }`}
              >
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isSearchFocused ? "text-green-400" : "text-gray-400"
                  }`}
                />
                <Input
                  type="search"
                  placeholder="Search players, clubs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="pl-10 h-9 bg-gray-900 border-gray-700 text-white focus:border-green-400 rounded-full"
                />
              </div>
            </form>
          </div>

          {/* Menu */}
          <nav className="flex items-center space-x-1">

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("connections")}
              className="text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition"
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Connections</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("events")}
              className="text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Events</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo("coach")}
              className="relative text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Coach AI</span>

              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs bg-green-500/20 text-green-400 border-green-400/30">
                2
              </Badge>
            </Button>

            {/* Admin */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateTo("admin")}
                className="text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition"
              >
                <User className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}

            {/* Right Side */}
            <div className="hidden md:flex md:items-center md:space-x-2 md:ml-4">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo("profile")}
                    className="text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name || user.email}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo("myposts")}
                    className="text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition"
                  >
                    My Posts
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => navigateTo("login")}
                  className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 py-2 px-6 flex justify-between items-center md:hidden z-50">
        
        <Button variant="ghost" size="icon" onClick={() => navigateTo("dashboard")}>
          <Target className="h-5 w-5 text-green-400" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => navigateTo("connections")}>
          <Users className="h-5 w-5 text-gray-300" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => navigateTo("coach")}>
          <MessageSquare className="h-5 w-5 text-gray-300" />
        </Button>

        <Button variant="ghost" size="icon" onClick={() => navigateTo("profile")}>
          <User className="h-5 w-5 text-gray-300" />
        </Button>

      </div>
    </nav>
  );
};

export default Navigation;