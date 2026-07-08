import type { GiftList } from "@/db/schema";
import { ShareButton } from "./share-button";

interface ListHeroProps {
  list: GiftList;
  showShare?: boolean;
}

export function ListHero({ list, showShare = true }: ListHeroProps) {
  return (
    <div className="border-b bg-gradient-to-b from-secondary/50 to-background">
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="font-serif text-3xl sm:text-4xl">
          {list.title}
        </h1>
        {list.birthdayLabel && (
          <p className="mt-2 text-lg text-muted-foreground">
            🎂 {list.birthdayLabel}
          </p>
        )}
        {list.eventDate && (
          <p className="mt-1 text-sm text-muted-foreground">
            📅{" "}
            {new Date(list.eventDate).toLocaleDateString("de-DE", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        {list.message && (
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            {list.message}
          </p>
        )}
        {showShare && (
          <div className="mt-6">
            <ShareButton slug={list.slug} />
          </div>
        )}
      </div>
    </div>
  );
}
