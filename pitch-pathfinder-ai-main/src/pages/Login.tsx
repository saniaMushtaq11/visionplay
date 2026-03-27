import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const Login = () => {
  const { login, signup, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    
    if (mode === "signup" && !name) {
      toast({ title: "Validation Error", description: "Please enter your name", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast({ title: "Logged in", description: `Welcome back, ${email}` });
      } else {
        await signup(email, password, name || undefined);
        toast({ title: "Account created", description: `Welcome, ${name || email}` });
      }
      // After auth, open the authenticated experience (Profile)
      navigate("/profile");
    } catch (error: any) {
      toast({ 
        title: mode === "login" ? "Login Failed" : "Signup Failed", 
        description: error.message || "An error occurred", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In handler
  useEffect(() => {
    // Debug log to verify API URL
    console.log("Current API_BASE_URL:", import.meta.env.VITE_API_BASE_URL);
    
    // Test API connection
    api.health().then(response => {
      console.log("API health check successful:", response);
    }).catch(error => {
      console.error("API health check failed:", error);
    });
    // Declare the global callback function
    (window as any).handleGoogleSignIn = async (response: any) => {
      try {
        setLoading(true);
        console.log("Google Sign-In callback received:", response);
        console.log("Credential length:", response.credential?.length || 0);
        console.log("Credential first 20 chars:", response.credential?.substring(0, 20) || 'none');
        
        // Call backend with Google token
        console.log("Sending credential to backend...");
        const result = await api.googleAuth(response.credential);
        console.log("Backend auth response received:", result);
        
        if (!result || !result.token || !result.user) {
          console.error("Invalid response from backend:", result);
          toast({ 
            title: "Authentication Error", 
            description: "Received invalid response from server", 
            variant: "destructive" 
          });
          return;
        }
        
        console.log("Logging in with token:", { tokenLength: result.token.length, user: result.user });
        loginWithToken(result.token, result.user);
        toast({ title: "Google Sign-In", description: `Welcome, ${result.user.name || result.user.email}` });
        navigate("/profile");
      } catch (error: any) {
        console.error("Google auth API error:", error);
        toast({ 
          title: "Google Sign-In Failed", 
          description: error.message || "Unknown error occurred", 
          variant: "destructive" 
        });
      } finally {
        setLoading(false);
      }
    };

    // Load Google Sign-In script dynamically
    const loadGoogleScript = () => {
      // Check if script is already loaded
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        initializeGoogleSignIn();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Google Sign-In script loaded successfully");
        initializeGoogleSignIn();
      };
      script.onerror = (error) => {
        console.error("Error loading Google Sign-In script:", error);
      };
      document.body.appendChild(script);
    };

    // Initialize Google Sign-In
    const initializeGoogleSignIn = () => {
      try {
        if ((window as any).google && (window as any).google.accounts) {
          try {
            console.log("Initializing Google Sign-In");
            
            // Get the current origin for debugging
            const currentOrigin = window.location.origin;
            console.log("Current origin:", currentOrigin);
            
            // Client ID for Google Sign-In
            const clientId = "725295217817-e23vbs3tbp6a4jkh8omlc59f7q1d48rk.apps.googleusercontent.com";
            console.log("Using Google client ID:", clientId);
            
            (window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: (window as any).handleGoogleSignIn,
              use_fedcm_for_prompt: true, // Use FedCM to avoid COOP issues
              itp_support: true, // Improve support for browsers with tracking prevention
              error_callback: (error: any) => {
                console.error("Google Sign-In error:", error);
                // Don't show error toast for origin issues as it's a development configuration problem
                if (!error.toString().includes("origin is not allowed")) {
                  toast({ 
                    title: "Google Sign-In Configuration Error", 
                    description: "There was an issue with Google authentication setup.", 
                    variant: "destructive" 
                  });
                } else {
                  console.warn(`Google Sign-In origin error: This origin (${currentOrigin}) is not allowed. To fix in production, add this origin to authorized JavaScript origins in Google Cloud Console.`);
                }
              }
            });
            
            // Wait a moment to ensure the DOM is ready
            setTimeout(() => {
              const buttonElement = document.getElementById("google-signin-button");
              if (buttonElement) {
                console.log("Rendering Google Sign-In button");
                try {
                  (window as any).google.accounts.id.renderButton(
                    buttonElement,
                    { theme: "outline", size: "large", text: "sign_in_with", shape: "rectangular" }
                  );
                  console.log("Google Sign-In button rendered successfully");
                  
                  // Also display One Tap prompt
                  (window as any).google.accounts.id.prompt((notification: any) => {
                    console.log("Google One Tap prompt notification:", notification);
                  });
                } catch (renderError) {
                  console.error("Error rendering Google Sign-In button:", renderError);
                }
              } else {
                console.error("Google Sign-In button element not found");
              }
            }, 500); // Short delay to ensure DOM is ready
          } catch (error) {
            console.error("Error initializing Google Sign-In:", error);
          }
        } else {
          console.error("Google Sign-In API not available");
        }
      } catch (outerError) {
        console.error("Outer error in Google Sign-In setup:", outerError);
      }
    };
    
    // Start loading the script
    loadGoogleScript();

    return () => {
      // Clean up any Google Sign-In related resources if needed
      if ((window as any).google && (window as any).google.accounts) {
        try {
          (window as any).google.accounts.id.cancel();
        } catch (error) {
          console.error("Error cleaning up Google Sign-In:", error);
        }
      }
    };
  }, [navigate, toast, loginWithToken]);

  return (
    <div className="container px-4 py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6">{mode === "login" ? "Login" : "Sign up"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <div className="flex gap-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setMode(mode === "login" ? "signup" : "login")}> 
            {mode === "login" ? "Need an account?" : "Have an account?"}
          </Button>
        </div>
        
        {/* Test button for direct login - for debugging only */}
        <Button 
          type="button" 
          variant="secondary" 
          onClick={async () => {
            try {
              setLoading(true);
              // Use test credentials
              const testEmail = "test@example.com";
              const testPassword = "password123";
              
              console.log("Attempting direct login with test credentials");
              await login(testEmail, testPassword);
              toast({ title: "Test Login", description: `Logged in as ${testEmail}` });
              navigate("/profile");
            } catch (error: any) {
              console.error("Test login failed:", error);
              toast({ 
                title: "Test Login Failed", 
                description: error.message || "Unknown error occurred", 
                variant: "destructive" 
              });
            } finally {
              setLoading(false);
            }
          }}
        >
          Test Login (Debug)
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div id="google-signin-button" className="w-full flex justify-center"></div>
      </form>
    </div>
  );
};

export default Login;


