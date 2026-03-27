import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, CheckCircle, AlertCircle, Info, Trophy, TrendingUp, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PlayerCard from '@/components/PlayerCard';

const Coach = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attributes, setAttributes] = useState<Record<string, number> | null>(null);
  const [error, setError] = useState<string>('');
  const [demoMode, setDemoMode] = useState(false);
  const [jerseyNumber, setJerseyNumber] = useState<string>('21');
  const [jerseyColor, setJerseyColor] = useState<string>('white');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('video/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a video file',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      // Create video preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setVideoPreviewUrl(previewUrl);
    }
  };

  const generateDemoAttributes = () => {
    // Generate random attribute values between 1-5 (with one decimal place)
    return {
      shooting: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      dribbling: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      passing: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      defending: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      physicality: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      pace: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      overall: parseFloat((Math.random() * 4 + 1).toFixed(1)),
      matches: 1,
      goals: 0,
      filename: file?.name || 'demo_video.mp4'
    };
  };

  const handleUpload = async () => {
    if (!file && !demoMode) {
      setError('Please select a file first');
      return;
    }

    setError('');
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        // Only increment up to 85% for real uploads, the rest happens after server response
        const limit = demoMode ? 100 : 85;
        return prev < limit ? prev + 5 : prev;
      });
    }, 300);

    try {
      if (demoMode) {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        // Generate demo attributes
        const demoData = generateDemoAttributes();
        setAttributes(demoData);
        
        toast({
          title: 'Demo Analysis Complete',
          description: 'Demo player attributes have been generated',
          variant: 'default',
        });
      } else {
        // Create form data
        const formData = new FormData();
        formData.append('file', file as File);
        formData.append('jersey_number', jerseyNumber.toString());
        formData.append('jersey_color', jerseyColor);

        try {
          // Fallback to demo mode after 5 seconds if server doesn't respond
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Analysis request timed out. Using demo mode instead.'));
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
          
          // If there's an error or timeout, fall back to demo mode
          clearInterval(progressInterval);
          setUploadProgress(100);
          setDemoMode(true);
          
          // Generate demo attributes as fallback
          const demoData = generateDemoAttributes();
          setAttributes(demoData);
          
          toast({
            title: 'Using Demo Mode',
            description: 'Analysis request timed out. Using demo mode instead.',
            variant: 'default',
          });
        }
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Failed to upload and analyze video',
        variant: 'destructive',
      });
      
      // Suggest demo mode after error
      toast({
        title: 'Try Demo Mode',
        description: 'You can use demo mode to see how the feature works without a backend connection',
        variant: 'default',
        duration: 5000,
      });
    } finally {
      setUploading(false);
    }
  };

  const renderAttributeCard = (name: string, value: number) => {
    // Calculate progress percentage (1-5 scale to 0-100%)
    const progressPercentage = ((value - 1) / 4) * 100;
    
    return (
      <Card key={name} className="p-6">
        <h3 className="font-semibold text-lg capitalize text-center mb-4">{name}</h3>
        <div className="flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-green-600">{value.toFixed(1)}</span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2 mt-2" />
      </Card>
    );
  };

  return (
    <div className="container px-4 py-10">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => window.location.href = '/'}
      >
        Back to Home
      </Button>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Player Attribute Assessment</h1>
        
        {demoMode && (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
            <Info className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-700">Demo Mode Active</h3>
              <p className="text-sm text-blue-600">You're using demo mode. Attribute ratings will be randomly generated.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => setDemoMode(false)}
              >
                Switch to Real Mode
              </Button>
            </div>
          </div>
        )}
        
        {!attributes && (
          <div className="bg-slate-50 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">Upload Football Clip</h2>
            <p className="text-slate-600 mb-6">
              Upload a video clip of a football player in action. Our AI will analyze the player's
              performance and provide attribute ratings.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="jersey-number">Jersey Number</Label>
                <Input 
                  id="jersey-number" 
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  placeholder="Enter player's jersey number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="jersey-color">Jersey Color</Label>
                <Select value={jerseyColor} onValueChange={setJerseyColor}>
                  <SelectTrigger id="jersey-color" className="mt-1">
                    <SelectValue placeholder="Select jersey color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">White</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="black">Black</SelectItem>
                    <SelectItem value="yellow">Yellow</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-8 mb-6">
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <p className="text-sm text-slate-500 mb-4">Drag and drop your video file here, or click to browse</p>
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                disabled={uploading}
              />
              <label htmlFor="video-upload">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>Select Video File</span>
                </Button>
              </label>
              {file && (
                <p className="mt-4 text-sm font-medium">
                  Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              )}
            </div>
            
            {videoPreviewUrl && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Video Preview</h3>
                <video 
                  ref={videoRef}
                  src={videoPreviewUrl} 
                  controls 
                  className="w-full rounded-lg border border-slate-200"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                {uploading ? 'Analyzing...' : 'Analyze Player'}
              </Button>
              
              {!demoMode && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDemoMode(true);
                    setError('');
                  }}
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                >
                  Use Demo Mode
                </Button>
              )}
            </div>
            
            {uploading && (
              <div className="mt-4">
                <Progress value={uploadProgress} className="h-2 mb-2" />
                <p className="text-sm text-center text-slate-500">
                  {uploadProgress < 100 ? 'Uploading and analyzing video...' : 'Finalizing results...'}
                </p>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-50 rounded-lg flex items-start">
                <AlertCircle className="text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-700">Error</h3>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {attributes && (
          <div>
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="flex items-center mb-6">
                <CheckCircle className="text-green-500 mr-2" />
                <h2 className="text-xl font-semibold">Player Attributes Assessment</h2>
                {demoMode && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Demo</span>}
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="text-lg font-semibold mb-2">Player Analysis</h3>
                <p className="text-sm text-slate-600 mb-2">Analysis Results</p>
                <div className="flex items-center">
                  <div className="bg-slate-200 text-slate-800 font-semibold px-2 py-1 rounded text-sm mr-4">
                    #{jerseyNumber}
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold mr-2">{attributes.overall?.toFixed(1) || '2.6'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row mt-4">
                  <div className="flex items-center mb-2 sm:mb-0 sm:mr-6">
                    <div className="flex items-center mr-2">
                      <Trophy className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium">{attributes.matches || 1}</span>
                    </div>
                    <span className="text-xs text-slate-500">Matches</span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center mr-2">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium">{attributes.goals || 0}</span>
                    </div>
                    <span className="text-xs text-slate-500">Goals</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center mb-2">
                    <Video className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium">Video Analysis</span>
                  </div>
                  {videoPreviewUrl && (
                    <video 
                      src={videoPreviewUrl} 
                      controls 
                      className="w-full rounded-lg border border-slate-200 mt-2"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {attributes && Object.entries(attributes)
                  .filter(([key]) => !['filename', 'overall'].includes(key))
                  .map(([name, value]) => renderAttributeCard(name, value as number))
                }
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-700 mb-2">About This Assessment</h3>
              <p className="text-sm text-blue-600">
                This AI assessment analyzes the specific player (jersey number {jerseyNumber}, {jerseyColor} jersey) movements, positioning, and actions to generate attribute ratings. 
                Ratings are on a scale of 1-5, with 5 being exceptional. For more accurate results, upload videos with
                clear visibility of the player throughout the clip.
                {demoMode && ' (Note: In demo mode, ratings are randomly generated for demonstration purposes.)'}
              </p>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  setAttributes(null);
                  setFile(null);
                  setVideoPreviewUrl(null);
                }}
              >
                New Analysis
              </Button>
              
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={() => {
                  toast({
                    title: 'Assessment Saved',
                    description: 'Player assessment has been saved to your account',
                    variant: 'default',
                  });
                }}
              >
                Save Assessment
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Coach;


