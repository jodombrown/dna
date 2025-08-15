import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationTypeahead from "@/components/location/LocationTypeahead";

const privacyOptions = [
  { key: "public", label: "Public" },
  { key: "connections", label: "Connections" },
  { key: "private", label: "Private" },
];

const UnifiedSettings: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data: profile, refetch } = useProfile();
  const { mutateAsync: updateProfile } = useUpdateProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Profile section state
  const [displayName, setDisplayName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [org, setOrg] = useState("");
  const [completion, setCompletion] = useState(0);

  // Experience section state
  const [roles, setRoles] = useState("");
  const [skills, setSkills] = useState("");

  // Links section state
  const [website, setWebsite] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Privacy section state
  const [visibility, setVisibility] = useState<any>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState("");

  // Skills as array for tag functionality
  const [skillsArray, setSkillsArray] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState("");

  useEffect(() => {
    if (profile) {
      // Profile data
      setDisplayName((profile as any).display_name || (profile as any).full_name || "");
      setHeadline((profile as any).headline || "");
      setBio((profile as any).bio || "");
      setLocation((profile as any).location || "");
      setOrg((profile as any).company || "");
      setCompletion((profile as any).profile_completeness_score || 0);

      // Experience data
      setRoles(((profile as any).roles || []).join(", "));
      const profileSkills = (profile as any).skills || [];
      setSkillsArray(profileSkills);
      setSkills(profileSkills.join(", "));

      // Links data - using individual fields instead of links object
      setWebsite((profile as any).website_url || "");
      setLinkedin((profile as any).linkedin_url || "");

      // Privacy data
      setVisibility((profile as any).visibility || {});
    }
  }, [profile]);

  useEffect(() => {
    document.title = "Settings | DNA";
    const desc = "Manage your profile, experience, links and privacy settings on DNA.";
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = desc;
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = window.location.href;
  }, []);

  const setPrivacyField = (field: string, value: string) => {
    setVisibility((v: any) => ({ ...v, [field]: value }));
  };

  const handleSaveAll = async () => {
    if (!user) return;
    try {
      const updates: any = {
        // Profile updates
        display_name: displayName || null,
        full_name: displayName || null,
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        company: org || null,

        // Experience updates
        roles: roles ? roles.split(/\s*,\s*/).filter(Boolean) : [],
        skills: skillsArray,

        // Links updates - using individual URL fields
        website_url: website || null,
        linkedin_url: linkedin || null,

        // Privacy updates
        visibility
      };

      await updateProfile({ id: user.id, updates });
      toast({ title: "Success", description: "All settings saved successfully!" });
      refetch();
      
      // Navigate back to dashboard
      navigate('/app/dashboard');
    } catch (e: any) {
      toast({ 
        title: "Save failed", 
        description: e.message || "Failed to save settings. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!user?.email || deleteConfirmEmail !== user.email) {
      toast({
        title: "Email mismatch",
        description: "Please enter your login email to confirm deletion.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsDeleting(true);
      const { error } = await supabase.functions.invoke('delete-account', { body: {} });
      if (error) throw error;
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Delete account failed:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
      setDeleteConfirmEmail("");
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentSkill.trim()) {
      e.preventDefault();
      if (!skillsArray.includes(currentSkill.trim())) {
        setSkillsArray([...skillsArray, currentSkill.trim()]);
      }
      setCurrentSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkillsArray(skillsArray.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/app/dashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your profile, experience, links and privacy
            </p>
          </div>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Display Name</label>
                <Input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder="Your display name" 
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Headline</label>
                <Input 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="Software Engineer at DNA" 
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Bio</label>
              <Textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell us about yourself..." 
                className="min-h-[120px] resize-y"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground">Location</label>
                <LocationTypeahead value={location} onChange={setLocation} />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Organization</label>
                <Input 
                  value={org} 
                  onChange={(e) => setOrg(e.target.value)} 
                  placeholder="Company / Org" 
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile completion</span>
              <span className="text-sm font-medium">{completion}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Roles (comma separated)</label>
              <Input 
                value={roles} 
                onChange={(e) => setRoles(e.target.value)} 
                placeholder="Founder, Engineer" 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Skills</label>
              <div className="space-y-2">
                <Input 
                  value={currentSkill} 
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter" 
                />
                {skillsArray.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skillsArray.map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20 hover:bg-primary/20 transition-colors"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-1 hover:text-primary/70"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Links Section */}
        <Card>
          <CardHeader>
            <CardTitle>Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Website</label>
              <Input 
                value={website} 
                onChange={(e) => setWebsite(e.target.value)} 
                placeholder="https://..." 
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">LinkedIn</label>
              <Input 
                value={linkedin} 
                onChange={(e) => setLinkedin(e.target.value)} 
                placeholder="https://linkedin.com/in/you" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Choose who can see each field. Public = visible to all; Connections = people you connect with; Private = only you.
            </p>
            <div className="space-y-4">
              {[
                { key: "location", label: "Location" },
                { key: "links", label: "Links" },
                { key: "email", label: "Email" },
                { key: "phone", label: "Phone" },
              ].map((f) => (
                <div key={f.key} className="flex items-center justify-between">
                  <span className="text-sm">{f.label}</span>
                  <select
                    value={visibility?.[f.key] || "public"}
                    onChange={(e) => setPrivacyField(f.key, e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {privacyOptions.map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button onClick={handleSaveAll} size="lg" className="w-full md:w-auto px-12">
            Save All & Return to Dashboard
          </Button>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and data. This action cannot be undone.
            </p>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete Account
            </Button>
          </CardContent>
        </Card>

        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open);
            if (!open) setDeleteConfirmEmail("");
          }}
          onConfirm={handleConfirmDelete}
          title="Delete account"
          description={
            <div className="space-y-4">
              <p>This will permanently delete your account and data. This action cannot be undone.</p>
              <div>
                <label className="text-sm font-medium">Enter your email to confirm:</label>
                <Input
                  type="email"
                  value={deleteConfirmEmail}
                  onChange={(e) => setDeleteConfirmEmail(e.target.value)}
                  placeholder={user?.email}
                  className="mt-1"
                />
              </div>
            </div>
          }
          confirmText={isDeleting ? 'Deleting…' : 'Delete'}
          cancelText="Cancel"
          variant="destructive"
        />
      </div>
    </div>
  );
};

export default UnifiedSettings;