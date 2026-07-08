"use client";

import { useUser } from "@hexclave/next";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";

export function UserMenu() {
  const user = useUser();
  const router = useRouter();

  if (!user) {
    return (
      <Button
        onClick={() => router.push("/dashboard")}
        size="sm"
      >
        Anmelden
      </Button>
    );
  }

  const displayName =
    user.displayName || user.primaryEmail || "Benutzer";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold transition-colors hover:bg-secondary/80">
        {initial}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm text-muted-foreground">
          {displayName}
        </div>
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <User className="mr-2 h-4 w-4" />
          Meine Listen
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => router.push("/handler/sign-out")}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Abmelden
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
