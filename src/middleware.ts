import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = [
  "/",
  "/projects",
  "/sign-in",
  "/sign-up",
];

const publicPrefixes = [
  "/projects/",
  "/api/",
  "/invite/",
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute = 
    publicRoutes.includes(nextUrl.pathname) || 
    publicPrefixes.some(prefix => nextUrl.pathname.startsWith(prefix));

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/sign-in", nextUrl));
  }
});

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
