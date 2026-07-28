import { SignUpForm } from "@/components/auth/sign-up-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - CollabSpace",
  description: "Create your CollabSpace account.",
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/40">
      <div className="w-full max-w-md space-y-8 bg-background p-8 rounded-xl border shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Join CollabSpace to connect and build
          </p>
        </div>
        <SignUpForm />
      </div>
    </div>
  );
}
