"use client";

import { ListHero } from "@/components/liste/list-hero";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DemoGiftCard } from "./demo-gift-card";
import { DemoNote } from "./demo-note";
import { demoHint } from "./demo-hint";
import { ArrowLeft, Lock, Mail, Settings } from "lucide-react";
import type { DemoTab } from "./demo-shell";
import type { GiftList, GiftItem } from "@/db/schema";

interface DemoManageProps {
  list: GiftList;
  items: GiftItem[];
  onGoToTab: (tab: DemoTab) => void;
}

export function DemoManage({ list, items, onGoToTab }: DemoManageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <ListHero list={list} showShare={false} />
      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 pb-20">
        <button
          type="button"
          onClick={() => onGoToTab("dashboard")}
          className="-mt-2 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Übersicht
        </button>

        <DemoNote text="Das ist die Verwaltungsansicht des Erstellers – im Demo-Modus ist alles gesperrt." />

        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl">Geschenke ({items.length})</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => onGoToTab("einladung")}
            >
              <Mail className="h-4 w-4" />
              Einladung
            </Button>
            <Button
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={demoHint}
              title="Nur in der echten Wunschfee möglich"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <Card className="border-dashed">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
              <Lock className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Hier können im echten Wunschfee Amazon-Links eingefügt werden,
              die Titel & Bilder automatisch geladen bekommen.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {items.map((item) => (
            <DemoGiftCard key={item.id} item={item} isOwner={true} />
          ))}
        </div>
      </main>
    </div>
  );
}
