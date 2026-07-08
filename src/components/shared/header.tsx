import { Suspense } from "react";
import { Logo } from "./logo";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Logo />
        <Suspense
          fallback={
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          }
        >
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
