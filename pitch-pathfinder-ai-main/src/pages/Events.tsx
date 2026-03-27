import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Bookmark,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Events = () => {
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fetch tryouts data
  const { data: tryouts, isLoading, isError } = useQuery({
    queryKey: ["tryouts"],
    queryFn: api.tryouts,
  });

  // Sample additional events data (trials and auditions)
  const additionalEvents: Tryout[] = [
    {
      id: "3",
      club: "Liverpool FC Academy",
      position: "Goalkeeper",
      date: "2025-04-05",
      time: "09:30",
      location: "AXA Training Centre, Liverpool",
      level: "Academy",
      ageGroup: "U17",
      deadline: "2025-03-25",
      spots: 3,
      requirements: ["Previous academy experience", "Excellent reflexes", "Good distribution skills"],
      contact: "academy@liverpoolfc.com",
      fee: 0
    },
    {
      id: "4",
      club: "Chelsea FC Foundation",
      position: "Defender",
      date: "2025-04-12",
      time: "13:00",
      location: "Cobham Training Centre, Surrey",
      level: "Professional",
      ageGroup: "U19",
      deadline: "2025-03-30",
      spots: 5,
      requirements: ["Strong tackling ability", "Good positional awareness", "Leadership qualities"],
      contact: "foundation@chelseafc.com",
      fee: 25
    },
    {
      id: "5",
      club: "Tottenham Hotspur Academy",
      position: "Midfielder",
      date: "2025-04-18",
      time: "10:00",
      location: "Hotspur Way, Enfield",
      level: "Academy",
      ageGroup: "U16",
      deadline: "2025-04-05",
      spots: 4,
      requirements: ["Technical skills", "Game intelligence", "Stamina"],
      contact: "academy@tottenhamhotspur.com",
      fee: 15
    },
    {
      id: "6",
      club: "Manchester United Foundation",
      position: "Forward",
      date: "2025-04-25",
      time: "14:30",
      location: "Carrington Training Centre, Manchester",
      level: "Professional",
      ageGroup: "U21",
      deadline: "2025-04-10",
      spots: 3,
      requirements: ["Pace", "Finishing ability", "Off-ball movement"],
      contact: "foundation@manutd.com",
      fee: 30
    },
    {
      id: "7",
      club: "Arsenal Women FC",
      position: "All Positions",
      date: "2025-05-02",
      time: "11:00",
      location: "London Colney, Hertfordshire",
      level: "Professional",
      ageGroup: "U23 Women",
      deadline: "2025-04-15",
      spots: 10,
      requirements: ["Previous competitive experience", "Fitness test required", "Technical assessment"],
      contact: "women@arsenal.com",
      fee: 0
    }
  ];

  // Combine backend tryouts with additional events
  const allEvents = [...(tryouts || []), ...additionalEvents];

  // Filter events based on search query and filter selection
  const filteredEvents = allEvents.filter(event => {
    const matchesSearch = 
      event.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && event.level.toLowerCase() === filter.toLowerCase();
  });

  const handleApply = (event: Tryout) => {
    api
      .applyTryout(event.id)
      .then(() =>
        toast({
          title: "Application Submitted! ⚽",
          description: `Your application for ${event.club} ${event.position} position has been submitted.`,
          duration: 4000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to apply", description: error.message, variant: "destructive" })
      );
  };

  const handleSave = (event: Tryout) => {
    api
      .saveTryout(event.id)
      .then(() =>
        toast({
          title: "Event Saved",
          description: `${event.club} event saved to your favorites.`,
          duration: 2000,
        })
      )
      .catch((error: any) =>
        toast({ title: "Failed to save", description: error.message, variant: "destructive" })
      );
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Professional":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "Academy":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "Amateur":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "Youth":
        return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  const isDeadlineSoon = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return diffDays <= 2;
  };

  return (
    <div className="container px-4 py-10">
      <Button
        variant="default"
        className="mb-6 bg-green-600 hover:bg-green-700"
        onClick={() => window.location.href = '/'}
      >
        Back to Home
      </Button>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Football Events</h1>
        <p className="text-muted-foreground mb-8">Discover upcoming tryouts, trials, and auditions hosted by clubs.</p>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by club, position, or location..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full md:w-64">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter by level" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
                <SelectItem value="Academy">Academy</SelectItem>
                <SelectItem value="Amateur">Amateur</SelectItem>
                <SelectItem value="Youth">Youth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Events List */}
        <div className="space-y-6">
          {isLoading && <div className="text-center py-8 text-muted-foreground">Loading events...</div>}
          {isError && <div className="text-center py-8 text-destructive">Failed to load events</div>}
          
          {filteredEvents.length === 0 && !isLoading && !isError && (
            <div className="text-center py-8 text-muted-foreground">
              No events found matching your criteria. Try adjusting your search or filter.
            </div>
          )}
          
          {filteredEvents.map((event) => (
            <Card 
              key={event.id} 
              className="border border-border/50 hover:shadow-md transition-all duration-300 hover:border-accent/30 group animate-scale-in"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-xl text-foreground group-hover:text-accent transition-colors">
                          {event.club}
                        </h3>
                        <Badge className={getLevelColor(event.level)}>
                          {event.level}
                        </Badge>
                        {isDeadlineSoon(event.deadline) && (
                          <Badge variant="destructive" className="animate-pulse bg-destructive/90">
                            Deadline Soon
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-accent group-hover:animate-float" />
                        <span className="text-sm font-medium group-hover:text-accent transition-colors">
                          {event.position}
                        </span>
                        <span className="text-xs text-muted-foreground">• Age {event.ageGroup}</span>
                        {event.fee > 0 && (
                          <span className="text-xs text-muted-foreground ml-2">• Fee: £{event.fee}</span>
                        )}
                        {event.fee === 0 && (
                          <span className="text-xs text-green-500 ml-2">• Free Entry</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground md:col-span-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.spots} spots available</span>
                      </div>
                      
                      <div className="text-muted-foreground">
                        <span className="text-xs">Application Deadline: {new Date(event.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">Requirements:</div>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(event.requirements) 
                          ? event.requirements.map((req, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {req}
                              </Badge>
                            ))
                          : (
                              <Badge variant="outline" className="text-xs">
                                {event.requirements}
                              </Badge>
                            )
                        }
                      </div>
                    </div>

                    {event.contact && (
                      <div className="text-xs text-muted-foreground">
                        Contact: {event.contact}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-row md:flex-col gap-2 mt-4 md:mt-0">
                    <Button 
                      onClick={() => handleApply(event)}
                      className="bg-gradient-to-r from-blue-600 to-blue-500 hover:opacity-90 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 group"
                    >
                      <Send className="h-4 w-4 mr-1 group-hover:translate-x-1 transition-transform" />
                      Apply Now
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSave(event)}
                      className="transition-all duration-300 hover:bg-accent/10 hover:text-accent hover:border-accent/30 group"
                    >
                      <Bookmark className="h-4 w-4 mr-1 group-hover:scale-110 transition-transform" />
                      Save
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;


