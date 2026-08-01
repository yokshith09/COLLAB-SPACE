import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Mock auth completely to avoid any sign-in requirement
export const auth = async () => {
  return {
    user: {
      id: "mock-user-123",
      name: "Test User",
      email: "test@example.com",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=TestUser",
    }
  };
};

export const { handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [],
});
