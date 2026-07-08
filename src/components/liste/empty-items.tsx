import { Card, CardContent } from "@/components/ui/card";

interface EmptyItemsProps {
  isOwner: boolean;
}

export function EmptyItems({ isOwner }: EmptyItemsProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-5xl">📭</span>
        <h2 className="font-serif text-xl">
          Noch keine Geschenke
        </h2>
        <p className="max-w-sm text-muted-foreground">
          {isOwner
            ? "Füge den ersten Amazon-Link hinzu, um deine Wunschliste zu füllen."
            : "Der Besitzer hat noch keine Wünsche eingetragen."}
        </p>
      </CardContent>
    </Card>
  );
}
