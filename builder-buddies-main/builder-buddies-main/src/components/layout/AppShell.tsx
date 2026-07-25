import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppShell({ children, fullBleed = false }: { children: ReactNode; fullBleed?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={fullBleed ? "flex-1" : "flex-1 mx-auto w-full max-w-7xl px-4 py-8"}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
