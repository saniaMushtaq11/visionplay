import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigation } from "@/hooks/useNavigation";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Star,
  ArrowRight,
  Play
} from "lucide-react";
import stadiumImage from "@/assets/football-stadium.jpg";
import playerHero from "@/assets/player-hero.jpg";

const HeroSection = () => {
  const { navigateTo } = useNavigation();
  const { toast } = useToast();

  const handleStartJourney = () => {
    navigateTo('login', false);
    toast({
      title: "Welcome to PitchPath! ⚽",
      description: "Connect to Supabase to enable full registration and authentication features.",
      duration: 4000,
    });
  };

  const handleWatchDemo = () => {
    toast({
      title: "Demo Video",
      description: "Demo video feature coming soon! Connect to Supabase to enable video content.",
      duration: 3000,
    });
  };

  return (
    <section className="relative overflow-hidden animate-fade-in">
      {/* Background with stadium */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${stadiumImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      
      <div className="relative container px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit bg-accent/20 text-accent-foreground border-accent/30">
                <Star className="w-3 h-3 mr-1" />
                Platform for Football Talent
              </Badge>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                Connect Your
                <span className="bg-gradient-primary bg-clip-text text-transparent block">
                  Football Journey
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                Link with players, clubs, and scouts. Track your performance, discover opportunities, 
                and elevate your game with AI-powered coaching insights.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={handleStartJourney}
                className="bg-gradient-primary hover:opacity-90 transition-all duration-300 shadow-football group hover:shadow-glow hover:scale-105"
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleWatchDemo}
                className="border-primary/20 hover:bg-primary/5 transition-all duration-300 hover:shadow-button group"
              >
                <Play className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-success mr-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">15K+</div>
                <div className="text-sm text-muted-foreground">Players Connected</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary mr-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Football Clubs</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-5 w-5 text-accent mr-2" />
                </div>
                <div className="text-2xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Monthly Tryouts</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative animate-scale-in animation-delay-300">
            <div className="relative bg-gradient-card rounded-2xl p-8 shadow-football hover:shadow-glow transition-all duration-500 group">
              <img 
                src={playerHero} 
                alt="Football player in action"
                className="w-full h-auto rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-500"
              />
              
              {/* Floating stats card */}
              <div className="absolute -bottom-4 -left-4 bg-card border shadow-card rounded-xl p-4 backdrop-blur-sm animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                  <div>
                    <div className="text-sm font-semibold">Live Rating</div>
                    <div className="text-2xl font-bold text-success">8.7</div>
                  </div>
                </div>
              </div>

              {/* Floating opportunity card */}
              <div className="absolute -top-4 -right-4 bg-card border shadow-card rounded-xl p-4 backdrop-blur-sm animate-float animation-delay-1000">
                <div className="text-sm font-semibold mb-1">New Opportunity</div>
                <div className="text-xs text-muted-foreground">Manchester FC Scout</div>
                <Badge variant="secondary" className="mt-2 bg-warning/20 text-warning-foreground">
                  Tryout Available
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;