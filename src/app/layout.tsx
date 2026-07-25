import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/shared/query-provider";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { getClerkConfig } from "@/lib/clerk-config";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CollabSpace - Find Teammates, Build Together",
  description: "A transparent project collaboration platform. Post ideas, recruit matching teammates, and execute projects together.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const clerkConfig = getClerkConfig();
  const clerkPublishableKey = clerkConfig.publishableKey;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" disableTransitionOnChange>
              <QueryProvider>
                {children}
                <Toaster />
              </QueryProvider>
            </ThemeProvider>
          </ClerkProvider>
        ) : (
          <AuthConfigurationError message={clerkConfig.error ?? "Clerk authentication is not configured."} />
        )}
      </body>
    </html>
  );
}

function AuthConfigurationError({ message }: { message: string }) {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-xl rounded-lg border border-border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-destructive">Authentication setup error</p>
        <h1 className="mt-3 text-2xl font-semibold">CollabSpace sign-in is not configured</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Add the real Clerk publishable key in local env and in Vercel project environment variables, then rebuild and redeploy.
        </p>
      </div>
    </main>
  );
}
