"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";

interface OnboardingStepsProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    skills: { name: string }[];
    domains: { name: string }[];
  };
}

const ALL_SKILLS = [
  "React", "TypeScript", "Python", "Node.js", "UI/UX Design",
  "PostgreSQL", "Docker", "Machine Learning", "Mobile Dev", "Solidity",
  "Rust", "Go", "AWS", "GraphQL", "Next.js",
];

const ALL_DOMAINS = [
  "Web Dev", "AI/ML", "Mobile", "Blockchain", "DevOps",
  "Data Science", "Design", "Open Source", "IoT", "SaaS",
];

export function OnboardingSteps({ user }: OnboardingStepsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bio: user.bio || "",
    githubUrl: user.githubUrl || "",
    linkedinUrl: user.linkedinUrl || "",
    skills: user.skills.map((s) => s.name),
    domains: user.domains.map((d) => d.name),
  });

  const steps = [
    {
      title: "Welcome to CollabSpace!",
      description: "Let us know about yourself to help you find the right projects",
    },
    {
      title: "Your Skills",
      description: "What technical skills do you have?",
    },
    {
      title: "Your Interests",
      description: "What domains are you interested in?",
    },
    {
      title: "Social Profiles",
      description: "Share your GitHub and LinkedIn (optional)",
    },
    {
      title: "Bio",
      description: "Tell us about yourself (optional)",
    },
  ];

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleSkill(skill: string) {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  }

  function toggleDomain(domain: string) {
    setFormData((prev) => ({
      ...prev,
      domains: prev.domains.includes(domain)
        ? prev.domains.filter((d) => d !== domain)
        : [...prev.domains, domain],
    }));
  }

  async function handleNext() {
    if (currentStep === steps.length - 1) {
      await handleSubmit();
      return;
    }
    setCurrentStep((prev) => prev + 1);
  }

  async function handlePrevious() {
    setCurrentStep((prev) => prev - 1);
  }

  async function handleSubmit() {
    setLoading(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        name: user.name,
        avatar: user.avatar,
        email: user.email,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const errorData = await res.json();
      toast({ title: "Error", description: errorData.error, variant: "destructive" });
      return;
    }

    toast({ title: "Profile updated!" });
    router.push("/dashboard");
    router.refresh();
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Welcome, {user.name}!</h2>
              <p className="text-muted-foreground">Let us complete your profile to get started</p>
            </div>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">📧 {user.email}</p>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Skills</h2>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_SKILLS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.skills.includes(skill)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Interests</h2>
            <p className="text-sm text-muted-foreground">Select domains you're interested in</p>
            <div className="grid grid-cols-2 gap-2">
              {ALL_DOMAINS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    formData.domains.includes(domain)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Social Profiles</h2>
            <div className="space-y-3">
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
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">About You</h2>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about your experience, interests, and what you're looking for..."
                rows={4}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground">{steps[currentStep].description}</p>
      </div>

      <div className="bg-card rounded-xl border p-6">
        {renderStep()}
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || loading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Previous
        </Button>

        <Button onClick={handleNext} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        Step {currentStep + 1} of {steps.length}
      </div>
    </div>
  );
}