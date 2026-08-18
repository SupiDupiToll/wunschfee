"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Wrench, Gift, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoDashboard } from "./demo-dashboard";
import { DemoManage } from "./demo-manage";
import { DemoWishlist } from "./demo-wishlist";
import { DemoInvitation } from "./demo-invitation";
import type { GiftList, GiftItem } from "@/db/schema";

export type DemoTab = "dashboard" | "verwalten" | "wunschliste" | "einladung";

const TABS: { id: DemoTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "verwalten", label: "Verwalten", icon: Wrench },
  { id: "wunschliste", label: "Wunschliste", icon: Gift },
  { id: "einladung", label: "Einladung", icon: Mail },
];

function tabFromHash(): DemoTab {
  if (typeof window === "undefined") return "dashboard";
  const hash = window.location.hash.replace(/^#/, "");
  return (TABS.find((t) => t.id === hash)?.id as DemoTab | undefined) ?? "dashboard";
}

interface DemoShellProps {
  list: GiftList;
  items: GiftItem[];
  lists: GiftList[];
  qrDataUrl: string;
  wunschfeeQr: string;
}

export function DemoShell({
  list,
  items,
  lists,
  qrDataUrl,
  wunschfeeQr,
}: DemoShellProps) {
  const [tab, setTab] = useState<DemoTab>(tabFromHash);

  useEffect(() => {
    const onHash = () => setTab(tabFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function goTo(next: DemoTab) {
    setTab(next);
    if (window.location.hash !== `#${next}`) {
      window.history.pushState(null, "", `#${next}`);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-serif text-lg font-bold whitespace-nowrap"
          >
            <span className="text-primary">🎁</span>
            Wunschfee
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[10px] font-semibold tracking-wide text-primary uppercase">
              Demo
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto rounded-xl border bg-secondary/50 p-1">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => goTo(t.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </nav>

          <Link
            href="/dashboard"
            className="hidden text-xs text-muted-foreground whitespace-nowrap transition-colors hover:text-foreground sm:block"
          >
            Zur echten App →
          </Link>
        </div>
      </header>

      <div className="flex-1">
        {tab === "dashboard" && <DemoDashboard lists={lists} />}
        {tab === "verwalten" && (
          <DemoManage list={list} items={items} onGoToTab={goTo} />
        )}
        {tab === "wunschliste" && <DemoWishlist list={list} items={items} />}
        {tab === "einladung" && (
          <DemoInvitation
            list={list}
            qrDataUrl={qrDataUrl}
            wunschfeeQr={wunschfeeQr}
            onGoToTab={goTo}
          />
        )}
      </div>
    </div>
  );
}
