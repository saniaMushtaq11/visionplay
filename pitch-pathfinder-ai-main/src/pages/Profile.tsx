import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon, CameraIcon, UserIcon } from "lucide-react";
import { UserProfileDetailed } from "@/types";
import { api } from "@/lib/api";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileDetailed & {
    preferredFoot?: string;
    height?: number;
    weight?: number;
    highlightedSkill?: string;
    highlightedSkillFile?: string;
    pace?: number;
    dribbling?: number;
    shooting?: number;
    defence?: number;
    passing?: number;
    physicality?: number;
  }>({
    id: user?.id || "",
    email: user?.email || "",
    firstName: user?.name?.split(" ")[0] || "",
    lastName: user?.name?.split(" ").slice(1).join(" ") || "",
    fatherName: "",
    motherName: "",
    nationality: "",
    address: "",
    age: 0,
    gender: "prefer-not-to-say",
    dateOfBirth: "",
    profilePicture: "",
    position: "",
    club: "",
    joinDate: new Date().toISOString().split("T")[0],
    isVerified: false,
    connections: 0,
    rating: 0,
    preferredFoot: "",
    height: undefined,
    weight: undefined,
    highlightedSkill: "",
    highlightedSkillFile: "",
    pace: undefined,
    dribbling: undefined,
    shooting: undefined,
    defence: undefined,
    passing: undefined,
    physicality: undefined,
  });
  // Handle highlighted skill file upload
  const handleSkillFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          highlightedSkillFile: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    // Fetch profile from backend
    (async () => {
      try {
        // Since api.getProfile doesn't exist, we'll use mock data for now
        // In a real app, you would implement this endpoint in the API
        const mockProfileData = {
          firstName: user?.name?.split(" ")[0] || "",
          lastName: user?.name?.split(" ").slice(1).join(" ") || "",
          position: "Forward",
          club: "FC Barcelona",
          nationality: "Spain",
          age: 25,
          dateOfBirth: "1998-01-15",
          preferredFoot: "Right",
          height: 180,
          weight: 75,
          pace: 85,
          dribbling: 90,
          shooting: 88,
          defence: 65,
          passing: 87,
          physicality: 78
        };
        
        setProfile(prev => ({ ...prev, ...mockProfileData }));
      } catch (error) {
        console.error("Error fetching profile from backend:", error);
        toast({
          title: "Failed to load profile",
          description: "Your profile information could not be loaded. Using default values instead.",
          variant: "destructive"
        });
      }
    })();
  }, [user, navigate, toast]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save profile to backend
      await api.updateProfile(profile);
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully. Welcome to your football network!",
      });
      setIsEditing(false);
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile(prev => ({
          ...prev,
          profilePicture: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAge = (dob: string) => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateChange = (date: string) => {
    setProfile(prev => ({
      ...prev,
      dateOfBirth: date,
      age: calculateAge(date)
    }));
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container px-4 py-10 max-w-4xl mx-auto">
        <div className="mb-4">
    <Button variant="default" style={{ backgroundColor: '#22c55e', color: 'white' }} onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and settings</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload a photo to personalize your profile</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage src={profile.profilePicture} alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {profile.firstName ? profile.firstName[0] : user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute bottom-0 right-0">
                    <Label htmlFor="profile-picture" className="cursor-pointer">
                      <div className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-colors">
                        <CameraIcon className="w-4 h-4" />
                      </div>
                    </Label>
                    <Input
                      id="profile-picture"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <p><strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><strong>Email:</strong> {profile.email}</p>
                <p><strong>Member since:</strong> {new Date(profile.joinDate).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Parent Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    value={profile.fatherName}
                    onChange={(e) => setProfile(prev => ({ ...prev, fatherName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your father's name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    value={profile.motherName}
                    onChange={(e) => setProfile(prev => ({ ...prev, motherName: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your mother's name"
                  />
                </div>
              </div>

              {/* Nationality and Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality *</Label>
                  <Input
                    id="nationality"
                    value={profile.nationality}
                    onChange={(e) => setProfile(prev => ({ ...prev, nationality: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your nationality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your address"
                  />
                </div>
              </div>

              {/* Age, Gender, and DOB */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                    disabled={!isEditing}
                    placeholder="Age"
                    min="0"
                    max="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={profile.gender}
                    onValueChange={(value: any) => setProfile(prev => ({ ...prev, gender: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile.dateOfBirth}
                      onChange={(e) => handleDateChange(e.target.value)}
                      disabled={!isEditing}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Football Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={profile.position}
                    onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Forward, Midfielder, Defender, Goalkeeper"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="club">Club</Label>
                  <Input
                    id="club"
                    value={profile.club}
                    onChange={(e) => setProfile(prev => ({ ...prev, club: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your club name"
                  />
                </div>
              </div>

              {/* Preferred Foot, Height, Weight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="preferredFoot">Preferred Foot</Label>
                  <Select
                    value={profile.preferredFoot}
                    onValueChange={(value: any) => setProfile(prev => ({ ...prev, preferredFoot: value }))}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select foot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={profile.height ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    placeholder="Height in cm"
                    min="100"
                    max="250"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={profile.weight ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    placeholder="Weight in kg"
                    min="30"
                    max="200"
                  />
                </div>
              </div>

              {/* Highlighted Skill */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="highlightedSkill">Highlighted Skill</Label>
                  <Input
                    id="highlightedSkill"
                    value={profile.highlightedSkill}
                    onChange={(e) => setProfile(prev => ({ ...prev, highlightedSkill: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="e.g., Free Kick, Dribbling, Long Pass"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlightedSkillFile">Upload Skill Video/Image</Label>
                  <Input
                    id="highlightedSkillFile"
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleSkillFileUpload}
                    disabled={!isEditing}
                  />
                  {profile.highlightedSkillFile && (
                    <div className="mt-2">
                      {profile.highlightedSkillFile.startsWith("data:video") ? (
                        <video src={profile.highlightedSkillFile} controls width="200" />
                      ) : (
                        <img src={profile.highlightedSkillFile} alt="Skill" width="200" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Football Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pace">Pace</Label>
                  <Input
                    id="pace"
                    type="number"
                    value={profile.pace ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, pace: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dribbling">Dribbling</Label>
                  <Input
                    id="dribbling"
                    type="number"
                    value={profile.dribbling ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, dribbling: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shooting">Shooting</Label>
                  <Input
                    id="shooting"
                    type="number"
                    value={profile.shooting ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, shooting: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="defence">Defence</Label>
                  <Input
                    id="defence"
                    type="number"
                    value={profile.defence ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, defence: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passing">Passing</Label>
                  <Input
                    id="passing"
                    type="number"
                    value={profile.passing ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, passing: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="physicality">Physicality</Label>
                  <Input
                    id="physicality"
                    type="number"
                    value={profile.physicality ?? ""}
                    onChange={(e) => setProfile(prev => ({ ...prev, physicality: parseInt(e.target.value) || undefined }))}
                    disabled={!isEditing}
                    min="1"
                    max="99"
                    placeholder="1-99"
                  />
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;


