import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Lock } from "lucide-react";
import type { GiftList } from "@/db/schema";

interface ListCardProps {
  list: GiftList;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Link href={`/liste/${list.slug}/verwalten`}>
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
            <div className="flex gap-1">
              {list.accessType === "password" && (
                <Badge variant="secondary" className="gap-1">
                  <Lock className="h-3 w-3" />
                  Geschützt
                </Badge>
              )}

            </div>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
            <Gift className="h-3 w-3" />
            <span>
              /liste/{list.slug}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
