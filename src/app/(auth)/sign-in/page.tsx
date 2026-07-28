import { SignInForm } from "@/components/auth/sign-in-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - CollabSpace",
  description: "Sign in to your CollabSpace account.",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to access your projects and teams
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
