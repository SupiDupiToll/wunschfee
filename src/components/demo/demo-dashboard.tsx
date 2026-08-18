import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gift, Plus } from "lucide-react";
import { demoHint } from "./demo-hint";
import { DemoNote } from "./demo-note";
import type { GiftList } from "@/db/schema";

interface DemoDashboardProps {
  lists: GiftList[];
}

function DemoListCard({ list }: { list: GiftList }) {
  return (
    <button
      type="button"
      onClick={demoHint}
      title="Nur in der echten Wunschfee möglich"
      className="text-left"
    >
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{list.title}</h3>
              {list.birthdayLabel && (
                <p className="mt-1 text-sm text-muted-foreground">
                  🎂 {list.birthdayLabel}
                </p>
              )}
              {list.eventDate && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  📅{" "}
                  {new Date(list.eventDate).toLocaleDateString("de-DE", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Gift className="h-3 w-3" />
            <span>/liste/{list.slug}</span>
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

export function DemoDashboard({ lists }: DemoDashboardProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Meine Listen</h1>
          <p className="text-muted-foreground">
            Verwalte deine Geschenkelisten
          </p>
        </div>
        <Button onClick={demoHint} className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Liste
        </Button>
      </div>

      <div className="mb-6">
        <DemoNote text="Das ist das Ersteller-Dashboard – mit Beispieldaten, in dem nichts verändert werden kann." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {lists.map((list) => (
          <DemoListCard key={list.id} list={list} />
        ))}
      </div>
    </div>
  );
}
