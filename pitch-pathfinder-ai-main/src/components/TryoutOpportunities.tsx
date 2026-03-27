import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Tryout } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Target, 
  Calendar, 
  MapPin, 
  Users,
  Clock,
  Star,
  Send,
  Bookmark
} from "lucide-react";

// Data now fetched from backend

const TryoutOpportunities = () => {
  const { toast } = useToast();
  const { data: tryouts, isLoading, isError } = useQuery({
    queryKey: ["tryouts"],
    queryFn: api.tryouts,
  });

  const handleApply = (tryout: Tryout) => {
    api
      .applyTryout(tryout.id)
      .then(() =>
        toast({
          title: "Application Submitted! ⚽",
          description: `Your application for ${tryout.club} ${tryout.position} position has been submitted.`,
          duration: 4000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to apply", description: error.message, variant: "destructive" })
      );
  };

  const handleSave = (tryout: Tryout) => {
    api
      .saveTryout(tryout.id)
      .then(() =>
        toast({
          title: "Tryout Saved",
          description: `${tryout.club} tryout saved to your favorites.`,
          duration: 2000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to save", description: error.message, variant: "destructive" })
      );
  };

  const handleViewAll = () => {
    toast({
      title: "View All Opportunities",
      description: "Connect to Supabase to access the complete database of tryout opportunities.",
      duration: 3000,
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Professional":
        return "bg-success/10 text-success border-success/20";
      case "Academy":
        return "bg-primary/10 text-primary border-primary/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 2;
  };

  return (
    <Card className="bg-gradient-card border-border/50 animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-accent animate-pulse-glow" />
          Tryout Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && <div className="text-sm text-muted-foreground">Loading tryouts…</div>}
        {isError && <div className="text-sm text-destructive">Failed to load tryouts</div>}
        {tryouts?.map((tryout) => (
          <div 
            key={tryout.id} 
            className="p-4 rounded-lg border border-border/50 hover:shadow-card transition-all duration-300 space-y-4 hover:border-accent/30 group animate-scale-in"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">{tryout.club}</h3>
                  <Badge className={getLevelColor(tryout.level)}>
                    {tryout.level}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-accent group-hover:animate-float" />
                  <span className="text-sm font-medium group-hover:text-accent transition-colors">{tryout.position}</span>
                  <span className="text-xs text-muted-foreground">• Age {tryout.ageGroup}</span>
                </div>
              </div>

              {isDeadlineSoon(tryout.deadline) && (
                <Badge variant="destructive" className="animate-pulse bg-destructive/90">
                  Urgent
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(tryout.date).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{tryout.time}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                <MapPin className="h-4 w-4" />
                <span>{tryout.location}</span>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{tryout.spots} spots available</span>
              </div>
              
              <div className="text-muted-foreground">
                <span className="text-xs">Deadline: {new Date(tryout.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Requirements:</div>
              <div className="flex flex-wrap gap-1">
                {Array.isArray(tryout.requirements) 
                  ? tryout.requirements.map((req, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {req}
                      </Badge>
                    ))
                  : (
                      <Badge variant="outline" className="text-xs">
                        {tryout.requirements}
                      </Badge>
                    )
                }
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleApply(tryout)}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-button hover:scale-105 group"
              >
                <Send className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                Apply Now
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSave(tryout)}
                className="transition-all duration-300 hover:bg-accent/10 hover:text-accent hover:border-accent/30 group"
              >
                <Bookmark className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                Save
              </Button>
            </div>
          </div>
        ))}

        <div className="text-center pt-4">
          <Button 
            variant="outline" 
            onClick={handleViewAll}
            className="w-full transition-all duration-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 hover:scale-105"
          >
            View All Opportunities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TryoutOpportunities;