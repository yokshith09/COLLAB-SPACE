import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/projects",
  "/projects/(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/cron/(.*)",
  "/api/webhooks/(.*)",
  "/invite/(.*)",
  "/invite",
]);

export const proxy = clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// For Next.js 16+, we export as `proxy` instead of `default`
// However, in case Clerk or some internal tool expects a default export,
// we can alias it just to be safe.
export default proxy;

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
