import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BarChart3, 
  Calendar,
  MessageSquare,
  Target,
  Trophy,
  TrendingUp,
  Shield
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Player Network",
    description: "Connect with players, scouts, and clubs worldwide. Build your professional football network.",
    badge: "Social",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Performance Analytics",
    description: "Track your match statistics, ratings, and progress with detailed analytics and insights.",
    badge: "Analytics",
    color: "text-success"
  },
  {
    icon: Target,
    title: "Tryout Finder",
    description: "Discover and apply for tryouts at professional clubs and academies near you.",
    badge: "Opportunities",
    color: "text-accent"
  },
  {
    icon: MessageSquare,
    title: "AI Coach Assistant",
    description: "Get personalized training recommendations, drills, and diet plans from our AI coach.",
    badge: "AI Powered",
    color: "text-warning"
  },
  {
    icon: Calendar,
    title: "Match Scheduling",
    description: "View upcoming matches, league tables, and important football events in your area.",
    badge: "Schedule",
    color: "text-primary"
  },
  {
    icon: Trophy,
    title: "Achievement Tracking",
    description: "Showcase your accomplishments, trophies, and milestones to potential scouts.",
    badge: "Progress",
    color: "text-success"
  },
  {
    icon: TrendingUp,
    title: "Career Development",
    description: "Plan your football career path with insights and recommendations for improvement.",
    badge: "Growth",
    color: "text-accent"
  },
  {
    icon: Shield,
    title: "Verified Profiles",
    description: "All players and clubs are verified for authentic connections and opportunities.",
    badge: "Security",
    color: "text-warning"
  }
];

const FeaturesGrid = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
            Platform Features
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-primary bg-clip-text text-transparent block">
              Advance Your Career
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools and connections you need 
            to take your football career to the next level.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-card transition-all duration-300 hover:-translate-y-1 bg-gradient-card border-border/50"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg bg-muted/50 ${feature.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {feature.badge}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;