import type { Metadata } from "next";
import { LinkButton } from "@/components/shared/link-button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { getUserLists } from "@/actions/list";
import { ListCard } from "@/components/dashboard/list-card";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const lists = await getUserLists();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl">Meine Listen</h1>
          <p className="text-muted-foreground">
            Verwalte deine Geschenkelisten
          </p>
        </div>
        <LinkButton href="/liste/neu" className="gap-2">
          <Plus className="h-4 w-4" />
          Neue Liste
        </LinkButton>
      </div>

      {lists.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <span className="text-5xl">🎁</span>
            <h2 className="font-serif text-xl">
              Noch keine Wunschliste
            </h2>
            <p className="max-w-sm text-muted-foreground">
              Erstelle deine erste Geschenkeliste und teile sie mit Freunden
              und Familie.
            </p>
            <LinkButton href="/liste/neu" className="gap-2">
              <Plus className="h-4 w-4" />
              Erste Liste erstellen
            </LinkButton>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
