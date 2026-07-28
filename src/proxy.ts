import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/projects", "/sign-in", "/sign-up"];

const publicPrefixes = ["/projects/", "/api/", "/invite/"];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isPublicRoute =
    publicRoutes.includes(nextUrl.pathname) ||
    publicPrefixes.some((prefix) => nextUrl.pathname.startsWith(prefix));

  if (!isLoggedIn && !isPublicRoute) {
    const signInUrl = new URL("/sign-in", nextUrl);
    signInUrl.searchParams.set("callbackUrl", nextUrl.pathname + nextUrl.search);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
