"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/shared/file-upload";

interface ProfileEditFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    resumeUrl: string | null;
    skills: { name: string }[];
    domains: { name: string }[];
  };
  allSkills: string[];
  allDomains: string[];
}

export function ProfileEditForm({ user, allSkills, allDomains }: ProfileEditFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatar);
  const [resumePreview, setResumePreview] = useState<string | null>(user.resumeUrl);
  const [selectedSkills, setSelectedSkills] = useState(user.skills.map((s) => s.name));
  const [selectedDomains, setSelectedDomains] = useState(user.domains.map((d) => d.name));
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || "",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleAvatarUpload(url: string) {
    setAvatarPreview(url);
    toast({ title: "Avatar updated" });
  }

  function removeAvatar() {
    setAvatarPreview(null);
  }

  function handleResumeUpload(url: string, _name?: string) {
    setResumePreview(url);
    toast({ title: "Resume updated" });
  }

  function removeResume() {
    setResumePreview(null);
  }

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  function toggleDomain(domain: string) {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        avatar: avatarPreview === user.avatar ? undefined : avatarPreview,
        resumeUrl: resumePreview === user.resumeUrl ? undefined : resumePreview,
        skills: selectedSkills,
        domains: selectedDomains,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      toast({ title: "Error", description: data.error, variant: "destructive" });
      return;
    }

    toast({ title: "Profile updated" });
    router.push(`/profile/${user.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarPreview || ""} />
            <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
            <FileUpload
              projectId="temp"
              onUploadComplete={handleAvatarUpload}
              accept="image/*"
              maxSize={2 * 1024 * 1024}
              buttonText=""
            />
          </div>
          {avatarPreview && (
            <button
              type="button"
              onClick={removeAvatar}
              className="absolute bottom-0 left-0 bg-destructive text-destructive-foreground p-2 rounded-full cursor-pointer hover:bg-destructive/90 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div>
          <h3 className="font-medium">Profile Picture</h3>
          <p className="text-sm text-muted-foreground">JPG, PNG up to 2MB</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Display Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell others about yourself..."
          rows={4}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/username"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
          <Input
            id="linkedinUrl"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Resume</Label>
        <div className="flex items-center gap-4">
          {resumePreview ? (
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" asChild>
                <a href={resumePreview} target="_blank" rel="noopener noreferrer">View Current Resume</a>
              </Button>
              <Button type="button" variant="destructive" size="icon" onClick={removeResume}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full max-w-sm">
              <FileUpload
                projectId="temp"
                onUploadComplete={handleResumeUpload}
                accept=".pdf,.doc,.docx,image/*"
                maxSize={2 * 1024 * 1024}
                buttonText="Upload Resume"
              />
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PDF, DOC, or Image up to 2MB</p>
      </div>

      <div className="space-y-2">
        <Label>Skills</Label>
        <div className="flex flex-wrap gap-2">
          {allSkills.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSkill(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedSkills.includes(s)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        {selectedSkills.length > 0 && (
          <p className="text-xs text-muted-foreground">{selectedSkills.length} selected</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Domains</Label>
        <div className="flex flex-wrap gap-2">
          {allDomains.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDomain(d)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                selectedDomains.includes(d)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        {selectedDomains.length > 0 && (
          <p className="text-xs text-muted-foreground">{selectedDomains.length} selected</p>
        )}
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
      </Button>
    </form>
  );
}
