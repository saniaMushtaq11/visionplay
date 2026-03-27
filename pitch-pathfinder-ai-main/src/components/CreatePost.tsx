import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLoadingState } from "@/hooks/use-loading-state";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ImageIcon, 
  VideoIcon, 
  Send, 
  X,
  Upload,
  CheckCircle
} from "lucide-react";
import { getAnimationClasses } from "@/lib/animation-utils";

import { Post } from "@/types";

interface CreatePostProps {
  onPostCreated?: (post: Post) => void;
}

const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{
    type: 'image' | 'video';
    file: File;
    url: string;
  } | null>(null);
  const [showAiAssessment, setShowAiAssessment] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attributes, setAttributes] = useState<Record<string, number> | null>(null);
  const [jerseyNumber, setJerseyNumber] = useState<string>('');
  const [jerseyColor, setJerseyColor] = useState<string>('');
  const [assessingSkill, setAssessingSkill] = useState(false);
  const { isLoading, executeWithLoading } = useLoadingState();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        // Convert image to base64 for persistence
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setMedia({ type: 'image', file, url });
          setShowAiAssessment(false); // Hide AI assessment for images
          setAttributes(null);
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        // For videos, convert to base64 for persistence instead of using blob URLs
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          setMedia({ type: 'video', file, url });
          setShowAiAssessment(true); // Show AI assessment option for videos
        };
        reader.readAsDataURL(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload an image or video file.",
          variant: "destructive",
        });
      }
    }
  };

  const removeMedia = () => {
    if (media) {
      // No need to revoke URLs since we're using base64 now
      setMedia(null);
      setShowAiAssessment(false);
      setAttributes(null);
      setJerseyNumber('');
      setJerseyColor('');
    }
  };
  
  const handleAssessSkill = async () => {
    if (!media || media.type !== 'video' || !media.file) return;
    
    setAssessingSkill(true);
    setUploadProgress(0);
    setAttributes(null);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', media.file);
    formData.append('jersey_number', jerseyNumber || '1'); // Default to 1 if empty
    formData.append('jersey_color', jerseyColor || 'white'); // Default to white if empty
    
    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        // Only increment up to 85% for real uploads
        return prev < 85 ? prev + 5 : prev;
      });
    }, 300);
    
    try {
      // Fallback to demo mode after 5 seconds if server doesn't respond
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Analysis request timed out. Using demo data instead.'));
        }, 5000);
      });

      // Race between the actual request and the timeout
      const response = await Promise.race([
        fetch('http://localhost:8003/analyze', {
          method: 'POST',
          body: formData,
        }),
        timeoutPromise
      ]) as Response;
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to assess video');
      }
      
      const data = await response.json();
      
      // Ensure all ratings are between 1-5
      const processedAttributes: Record<string, number> = {};
      Object.entries(data.attributes || {}).forEach(([key, value]) => {
        if (typeof value === 'number') {
          // Clamp values between 1 and 5
          processedAttributes[key] = Math.max(1, Math.min(5, value));
        }
      });
      
      // Remove matches and goals ratings
      // Calculate overall if missing
      if (!processedAttributes.overall) {
        // Calculate overall as average of other attributes
        const sum = Object.values(processedAttributes).reduce((acc, val) => acc + val, 0);
        const count = Object.values(processedAttributes).length;
        processedAttributes.overall = parseFloat((sum / count).toFixed(1));
      }
      
      setAttributes(processedAttributes);
      
      toast({
        title: 'Analysis complete',
        description: 'Your player attributes have been assessed',
        variant: 'default',
      });
    } catch (error) {
      console.error("Analysis error:", error);
      clearInterval(progressInterval);
      
      // Generate demo attributes as fallback
      const demoAttributes = generateDemoAttributes();
      setAttributes(demoAttributes);
      setUploadProgress(100);
      
      toast({
        title: 'Using Demo Data',
        description: 'Server connection failed. Using demo data instead.',
        variant: 'default',
      });
    } finally {
      setAssessingSkill(false);
    }
  };
  
  // Generate random attributes for demo mode
  const generateDemoAttributes = () => {
    // Generate random attributes between 1-5 with one decimal place
    const generateRating = () => parseFloat((Math.random() * 4 + 1).toFixed(1));
    
    return {
      shooting: generateRating(),
      passing: generateRating(),
      dribbling: generateRating(),
      defending: generateRating(),
      physicality: generateRating(),
      pace: generateRating(),
      matches: 1,
      goals: Math.floor(Math.random() * 3),
      overall: parseFloat((Math.random() * 2 + 2.5).toFixed(1)) // Overall between 2.5-4.5
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && !media) {
      toast({
        title: "Empty post",
        description: "Please add some content or media to your post.",
        variant: "destructive",
      });
      return;
    }

    executeWithLoading(
      async () => {
        // Simulate API call - in real app, upload to backend
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create a new post object
        const newPost: Post = {
          id: Date.now().toString(), // Simple ID generation
          userId: user?.id || "current-user",
          user: {
            id: user?.id || "current-user",
            name: user?.name || "You",
            profilePicture: "",
            position: "Professional Footballer",
            club: "Your Club"
          },
          content: content.trim(),
          media: media ? {
            type: media.type,
            url: media.url, // Store the URL directly to ensure it's preserved
            thumbnail: media.type === 'video' ? media.url : undefined
          } : undefined,
          attributes: attributes, // Include AI assessment attributes if available
          likes: 0,
          comments: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setContent("");
        removeMedia();
        onPostCreated?.(newPost);
        toast({
          title: "Post created! 🎉",
          description: "Your post has been published.",
          className: getAnimationClasses({ variant: 'slideIn' })
        });
      },
      undefined,
      (error) => {
        toast({
          title: "Failed to create post",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    )
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user?.name ? undefined : undefined} />
              <AvatarFallback>
                {user?.name?.[0] || user?.email?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <Textarea
                placeholder="Share your football moments... goals, training, matches, or thoughts!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 text-base focus-visible:ring-0"
                disabled={isLoading}
              />
              
              {media && (
                <div className="relative">
                  {media.type === 'image' ? (
                    <img
                      src={media.url}
                      alt="Post media"
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={media.url}
                      controls
                      className="w-full max-h-64 object-cover rounded-lg"
                    />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 h-8 w-8 p-0"
                    onClick={removeMedia}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              
              {showAiAssessment && media?.type === 'video' && (
                <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-700">AI Skill Assessment</h3>
                    {attributes && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        <span>Assessment Complete</span>
                      </Badge>
                    )}
                  </div>
                  
                  {!attributes ? (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-600">
                        Our AI can analyze your football skills from this video. Provide the following details:
                      </p>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor="jersey-number" className="text-sm">Jersey Number</Label>
                          <Input 
                            id="jersey-number" 
                            placeholder="Enter number" 
                            value={jerseyNumber}
                            onChange={(e) => setJerseyNumber(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="jersey-color" className="text-sm">Jersey Color</Label>
                          <Input 
                            id="jersey-color" 
                            placeholder="E.g., Red, Blue" 
                            value={jerseyColor}
                            onChange={(e) => setJerseyColor(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {assessingSkill ? (
                        <div className="space-y-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-xs text-center text-blue-600">Analyzing video... {uploadProgress}%</p>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                          onClick={handleAssessSkill}
                          disabled={!jerseyNumber || !jerseyColor}
                        >
                          Assess My Skills
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(attributes)
                          .filter(([key]) => !['filename', 'matches', 'goals'].includes(key))
                          .map(([skill, rating]) => (
                            <div key={skill} className="bg-white p-2 rounded border border-blue-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium capitalize">{skill}</span>
                                <span className="text-sm font-bold text-blue-700">{rating}/5</span>
                              </div>
                              <Progress value={(rating as number) * 20} className="h-1.5 mt-1" />
                            </div>
                          ))
                        }
                      </div>
                      <p className="text-xs text-blue-600 italic">
                        Assessment based on player #${jerseyNumber} in ${jerseyColor} jersey. Ratings are on a scale of 1-5.
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                      <ImageIcon className="h-5 w-5" />
                      <span className="text-sm">Photo</span>
                    </div>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                  
                  <label htmlFor="video-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors">
                      <VideoIcon className="h-5 w-5" />
                      <span className="text-sm">Video</span>
                    </div>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isLoading || (!content.trim() && !media)}
                  className="bg-gradient-accent hover:opacity-90 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" variant="primary" className="mr-2" />
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      <span>Post</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
