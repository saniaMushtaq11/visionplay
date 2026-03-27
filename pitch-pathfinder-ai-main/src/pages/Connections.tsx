import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Search, 
  Filter,
  MessageCircle,
  Star,
  MapPin,
  Calendar,
  Award,
  Trophy,
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";

interface Connection {
  id: string;
  name: string;
  position: string;
  club: string;
  location: string;
  profilePicture?: string;
  mutualConnections: number;
  isConnected: boolean;
  connectionDate?: string;
  status: 'connected' | 'pending' | 'suggested';
  achievements?: string[];
  lastActive?: string;
}

const Connections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample connections data
  const sampleConnections: Connection[] = [
    {
      id: "1",
      name: "Marcus Johnson",
      position: "Midfielder",
      club: "Manchester United Academy",
      location: "Manchester, UK",
      profilePicture: "",
      mutualConnections: 12,
      isConnected: true,
      connectionDate: "2024-01-15",
      status: 'connected',
      achievements: ["U21 England Call-up", "Academy Player of the Year"],
      lastActive: "2 hours ago"
    },
    {
      id: "2",
      name: "Sofia Rodriguez",
      position: "Striker",
      club: "Barcelona Femení",
      location: "Barcelona, Spain",
      profilePicture: "",
      mutualConnections: 8,
      isConnected: true,
      connectionDate: "2024-02-03",
      status: 'connected',
      achievements: ["Champions League Winner", "Golden Boot 2023"],
      lastActive: "1 day ago"
    },
    {
      id: "3",
      name: "Ahmed Hassan",
      position: "Defender",
      club: "Al-Ahly SC",
      location: "Cairo, Egypt",
      profilePicture: "",
      mutualConnections: 5,
      isConnected: true,
      connectionDate: "2024-01-28",
      status: 'connected',
      achievements: ["African Champions League Winner", "Egypt National Team"],
      lastActive: "3 hours ago"
    },
    {
      id: "4",
      name: "Emma Thompson",
      position: "Goalkeeper",
      club: "Chelsea FC Women",
      location: "London, UK",
      profilePicture: "",
      mutualConnections: 15,
      isConnected: false,
      status: 'pending',
      achievements: ["UEFA B License", "England Women's Team"],
      lastActive: "5 hours ago"
    },
    {
      id: "5",
      name: "David Silva",
      position: "Midfielder",
      club: "Real Sociedad",
      location: "San Sebastián, Spain",
      profilePicture: "",
      mutualConnections: 3,
      isConnected: false,
      status: 'pending',
      achievements: ["World Cup Winner", "Premier League Legend"],
      lastActive: "1 week ago"
    },
    {
      id: "6",
      name: "Alex Morgan",
      position: "Forward",
      club: "San Diego Wave",
      location: "San Diego, USA",
      profilePicture: "",
      mutualConnections: 7,
      isConnected: false,
      status: 'suggested',
      achievements: ["World Cup Winner", "Olympic Gold Medalist"],
      lastActive: "2 days ago"
    },
    {
      id: "7",
      name: "Virgil van Dijk",
      position: "Defender",
      club: "Liverpool FC",
      location: "Liverpool, UK",
      profilePicture: "",
      mutualConnections: 4,
      isConnected: false,
      status: 'suggested',
      achievements: ["Champions League Winner", "PFA Player of the Year"],
      lastActive: "1 day ago"
    },
    {
      id: "8",
      name: "Megan Rapinoe",
      position: "Midfielder",
      club: "OL Reign",
      location: "Seattle, USA",
      profilePicture: "",
      mutualConnections: 9,
      isConnected: false,
      status: 'suggested',
      achievements: ["World Cup Winner", "Ballon d'Or Féminin"],
      lastActive: "3 days ago"
    }
  ];

  useEffect(() => {
    setConnections(sampleConnections);
  }, []);

  const handleConnect = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'pending' as const }
          : conn
      )
    );
    toast({
      title: "Connection Request Sent! 🤝",
      description: "Your connection request has been sent successfully.",
      duration: 3000,
    });
  };

  const handleAcceptConnection = (connectionId: string) => {
    setConnections(prev => 
      prev.map(conn => 
        conn.id === connectionId 
          ? { ...conn, status: 'connected' as const, isConnected: true, connectionDate: new Date().toISOString().split('T')[0] }
          : conn
      )
    );
    toast({
      title: "Connection Accepted! ✅",
      description: "You are now connected with this player.",
      duration: 3000,
    });
  };

  const handleRejectConnection = (connectionId: string) => {
    setConnections(prev => 
      prev.filter(conn => conn.id !== connectionId)
    );
    toast({
      title: "Connection Request Declined",
      description: "The connection request has been declined.",
      duration: 2000,
    });
  };

  const handleMessage = (connectionId: string) => {
    toast({
      title: "Messaging Feature",
      description: "Direct messaging will be available soon!",
      duration: 2000,
    });
  };

  const filteredConnections = connections.filter(connection => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      connection.name.toLowerCase().includes(query) ||
      connection.position.toLowerCase().includes(query) ||
      connection.club.toLowerCase().includes(query) ||
      connection.location.toLowerCase().includes(query)
    );
  });

  const getConnectionsByStatus = (status: string) => {
    return filteredConnections.filter(conn => conn.status === status);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
            <div className="mb-4">
              <button
                style={{ backgroundColor: '#22c55e', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '0.375rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                onClick={() => window.location.href = '/'}
              >
                Back to Home
              </button>
            </div>
          <h1 className="text-2xl font-bold mb-4">Welcome to VisionPlay</h1>
          <p className="text-muted-foreground mb-4">Please log in to access your connections</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
        <div className="container mx-auto px-4 pt-4">
          <Button variant="default" style={{ backgroundColor: '#22c55e', color: 'white' }} onClick={() => window.location.href = '/'}>Back to Home</Button>
        </div>
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Network</h1>
          <p className="text-muted-foreground">Connect with fellow football professionals and grow your network</p>
        </div>

        {/* Search and Stats */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections by name, position, or club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="w-full md:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          
          {/* Connection Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{getConnectionsByStatus('connected').length}</div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-500">{getConnectionsByStatus('pending').length}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">{getConnectionsByStatus('suggested').length}</div>
                <div className="text-sm text-muted-foreground">Suggestions</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-500">{connections.length}</div>
                <div className="text-sm text-muted-foreground">Total</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="connected" className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4" />
              <span>Connected</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Pending</span>
            </TabsTrigger>
            <TabsTrigger value="suggested" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Suggested</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4">
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={connection.profilePicture} />
                          <AvatarFallback className="text-lg">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{connection.name}</h3>
                            <Badge variant={connection.status === 'connected' ? 'default' : connection.status === 'pending' ? 'secondary' : 'outline'}>
                              {connection.status === 'connected' ? 'Connected' : connection.status === 'pending' ? 'Pending' : 'Suggested'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-2">
                              <Trophy className="h-4 w-4" />
                              <span>{connection.position} • {connection.club}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{connection.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4" />
                              <span>{connection.mutualConnections} mutual connections</span>
                            </div>
                            {connection.connectionDate && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>Connected on {formatDate(connection.connectionDate)}</span>
                              </div>
                            )}
                            {connection.lastActive && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span>Last active {connection.lastActive}</span>
                              </div>
                            )}
                          </div>
                          
                          {connection.achievements && connection.achievements.length > 0 && (
                            <div className="mb-3">
                              <div className="flex flex-wrap gap-1">
                                {connection.achievements.map((achievement, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Award className="h-3 w-3 mr-1" />
                                    {achievement}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {connection.status === 'connected' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleMessage(connection.id)}>
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button size="sm" variant="outline">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {connection.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => handleAcceptConnection(connection.id)}>
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectConnection(connection.id)}>
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {connection.status === 'suggested' && (
                          <Button size="sm" onClick={() => handleConnect(connection.id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="mt-6">
            <div className="grid gap-4">
              {getConnectionsByStatus('connected').length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No connected players yet</p>
                    <p className="text-sm text-muted-foreground">Start building your network by connecting with other players</p>
                  </CardContent>
                </Card>
              ) : (
                getConnectionsByStatus('connected').map((connection) => (
                  <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={connection.profilePicture} />
                            <AvatarFallback className="text-lg">
                              {connection.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{connection.name}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4" />
                                <span>{connection.position} • {connection.club}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{connection.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{connection.mutualConnections} mutual connections</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleMessage(connection.id)}>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4">
              {getConnectionsByStatus('pending').length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No pending connection requests</p>
                    <p className="text-sm text-muted-foreground">Connection requests will appear here</p>
                  </CardContent>
                </Card>
              ) : (
                getConnectionsByStatus('pending').map((connection) => (
                  <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={connection.profilePicture} />
                            <AvatarFallback className="text-lg">
                              {connection.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{connection.name}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4" />
                                <span>{connection.position} • {connection.club}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{connection.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{connection.mutualConnections} mutual connections</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleAcceptConnection(connection.id)}>
                            <Check className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectConnection(connection.id)}>
                            <X className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggested" className="mt-6">
            <div className="grid gap-4">
              {getConnectionsByStatus('suggested').length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No suggested connections</p>
                    <p className="text-sm text-muted-foreground">Suggestions will appear here based on your network</p>
                  </CardContent>
                </Card>
              ) : (
                getConnectionsByStatus('suggested').map((connection) => (
                  <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={connection.profilePicture} />
                            <AvatarFallback className="text-lg">
                              {connection.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{connection.name}</h3>
                            <div className="space-y-1 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-2">
                                <Trophy className="h-4 w-4" />
                                <span>{connection.position} • {connection.club}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4" />
                                <span>{connection.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="h-4 w-4" />
                                <span>{connection.mutualConnections} mutual connections</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button size="sm" onClick={() => handleConnect(connection.id)}>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Connections;
