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

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
