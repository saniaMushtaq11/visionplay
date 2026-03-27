import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Player } from "@/types";
import { api } from "@/lib/api";
import { 
  Star, 
  MapPin, 
  Trophy, 
  Users,
  TrendingUp,
  MessageCircle,
  UserPlus,
  UserCheck
} from "lucide-react";

const PlayerCard = ({ 
  name, 
  position, 
  club, 
  location, 
  rating, 
  matches, 
  goals, 
  image,
  isConnected = false,
  jersey_number,
  jersey_color,
  hideConnect = false
}: Omit<Player, 'id'> & { jersey_number?: string; jersey_color?: string; hideConnect?: boolean }) => {
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const result = await api.connect(name, isConnected ? "disconnect" : "connect");
      toast({
        title: result.connected ? "Connected" : "Disconnected",
        description: result.connected
          ? `You are now connected with ${name}`
          : `You are no longer connected with ${name}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({ title: "Connection Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleMessage = async () => {
    try {
      await api.message(name, "Hello!");
      toast({ title: "Message Sent", description: `Message sent to ${name}` });
    } catch (error: any) {
      toast({ title: "Message Failed", description: error.message, variant: "destructive" });
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 8.5) return "text-success";
    if (rating >= 7.0) return "text-warning";
    return "text-muted-foreground";
  };

  const getRatingBg = (rating: number) => {
    if (rating >= 8.5) return "bg-success/10 border-success/20";
    if (rating >= 7.0) return "bg-warning/10 border-warning/20";
    return "bg-muted/10 border-muted/20";
  };

  return (
    <Card className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50 hover:border-primary/20 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{position}</p>
            {jersey_number && jersey_color && (
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs" style={{ backgroundColor: jersey_color.toLowerCase(), color: ['white', 'yellow', 'orange'].includes(jersey_color.toLowerCase()) ? 'black' : 'white' }}>
                  #{jersey_number}
                </Badge>
              </div>
            )}
          </div>

          <div className={`rounded-lg px-3 py-1 border ${getRatingBg(rating)}`}>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-current" />
              <span className={`text-sm font-bold ${getRatingColor(rating)}`}>
                {rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{club}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Trophy className="h-4 w-4 text-primary" />
                {matches}
              </div>
              <div className="text-xs text-muted-foreground">Matches</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <TrendingUp className="h-4 w-4 text-success" />
                {goals}
              </div>
              <div className="text-xs text-muted-foreground">Goals</div>
            </div>
          </div>

          {!hideConnect && (
            <div className="flex gap-2 pt-2">
              <Button 
                variant={isConnected ? "secondary" : "default"} 
                size="sm" 
                onClick={handleConnect}
                className={`flex-1 transition-all duration-300 ${
                  isConnected 
                    ? "bg-success/10 text-success hover:bg-success/20 border-success/30" 
                    : "bg-gradient-primary hover:opacity-90 shadow-button hover:scale-105"
                }`}
              >
                {isConnected ? (
                  <>
                    <UserCheck className="h-4 w-4 mr-1" />
                    Connected
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1" />
                    Connect
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleMessage}
                className="transition-all duration-300 hover:bg-accent/10 hover:text-accent hover:border-accent/30 hover:scale-105"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {isConnected && (
          <Badge variant="secondary" className="mt-3 bg-success/10 text-success border-success/20 animate-pulse-glow">
            <Users className="h-3 w-3 mr-1" />
            In Network
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerCard;