import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Match } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api, freeFootballApi } from "@/lib/api";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Eye,
  Bell,
  Trophy
} from "lucide-react";

// Data now fetched from backend

const UpcomingMatches = () => {
  const { toast } = useToast();
  const { data: matches, isLoading, isError } = useQuery({
    queryKey: ["matches"],
    queryFn: api.matches,
  });

  const handleWatchMatch = (match: Match) => {
    api
      .watchMatch(match.id)
      .then(() =>
        toast({
          title: match.isLive ? "Watch Live" : "Reminder Set",
          description: `${match.homeTeam} vs ${match.awayTeam}`,
          duration: 3000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to set watch", description: error.message, variant: "destructive" })
      );
  };

  const handleNotification = (match: Match) => {
    api
      .notifyMatch(match.id)
      .then(() =>
        toast({
          title: "Notification Set",
          description: `You'll be notified about ${match.homeTeam} vs ${match.awayTeam}`,
          duration: 2000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to set notification", description: error.message, variant: "destructive" })
      );
  };

  return (
    <Card className="bg-gradient-card border-border/50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Upcoming Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && <div className="text-sm text-muted-foreground">Loading matches…</div>}
        {isError && <div className="text-sm text-destructive">Failed to load matches</div>}
        {matches?.map((match) => (
          <div 
            key={match.id} 
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-all duration-300 hover:shadow-button hover:border-primary/20 group"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{match.homeTeam}</span>
                <span className="text-muted-foreground text-sm">vs</span>
                <span className="font-semibold text-sm group-hover:text-primary transition-colors">{match.awayTeam}</span>
                {match.isLive && (
                  <Badge variant="destructive" className="animate-pulse bg-destructive/90">
                    LIVE
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(match.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {match.time}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {match.venue}
                </div>
              </div>
              
              <Badge variant="secondary" className="text-xs">
                {match.league}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {match.hasNotification && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleNotification(match)}
                  className="text-warning hover:bg-warning/10 hover:text-warning transition-all duration-300"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleWatchMatch(match)}
                className="transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:scale-105 group"
              >
                <Eye className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                {match.isLive ? 'Watch' : 'Remind'}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default UpcomingMatches;