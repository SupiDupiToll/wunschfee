"use client";

import { useState, useEffect, useRef } from "react";
import { useUser, AuthPage } from "@hexclave/next";
import { Logo } from "@/components/shared/logo";
import { Gift } from "lucide-react";

type AuthMode = "sign-up" | "sign-in";

function AuthForm({ mode }: { mode: AuthMode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const links = el.querySelectorAll("a");
    for (const link of links) {
      if (
        link.textContent?.toLowerCase().includes("anmelden") ||
        link.textContent?.toLowerCase().includes("registrieren") ||
        link.textContent?.toLowerCase().includes("sign in") ||
        link.textContent?.toLowerCase().includes("sign up") ||
        link.textContent?.toLowerCase().includes("account")
      ) {
        const parent = link.closest("p") || link.closest("div") || link.parentElement;
        if (parent) parent.style.display = "none";
      }
    }
  }, [mode]);

  return (
    <div ref={ref} className="rounded-xl border bg-card p-6 shadow-sm">
      <AuthPage type={mode} fullPage={false} />
    </div>
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useUser();
  const [mode, setMode] = useState<AuthMode>("sign-up");

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/30">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Logo />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-2xl font-bold">
              {mode === "sign-up" ? "Wunschliste erstellen" : "Willkommen zurück"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "sign-up"
                ? "Erstelle in 2 Minuten deine Wunschliste"
                : "Melde dich an, um deine Listen zu verwalten"}
            </p>
          </div>

          <div className="mb-4 flex rounded-lg border bg-muted p-1">
            <button
              onClick={() => setMode("sign-up")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === "sign-up"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Registrieren
            </button>
            <button
              onClick={() => setMode("sign-in")}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                mode === "sign-in"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Anmelden
            </button>
          </div>

          <AuthForm mode={mode} />
        </div>
      </main>
    </div>
  );
}
