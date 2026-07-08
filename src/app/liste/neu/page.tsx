"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createList } from "@/actions/list";
import { Loader2 } from "lucide-react";

// Metadata export from client component is not supported by Next.js,
// but this page is behind auth anyway so it's fine.

export default function NewListPage() {
  const [state, formAction, pending] = useActionState(createList, null);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-2xl">
            Neue Wunschliste
          </CardTitle>
          <CardDescription>
            Erstelle eine Liste und teile sie mit deinen Liebsten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Titel der Liste *</Label>
              <Input
                id="title"
                name="title"
                placeholder='z.B. "Max 30. Geburtstag"'
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="honoreeName">Name *</Label>
              <Input
                id="honoreeName"
                name="honoreeName"
                placeholder="z.B. Max Mustermann"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthdayLabel">Anlass (optional)</Label>
              <Input
                id="birthdayLabel"
                name="birthdayLabel"
                placeholder='z.B. "30. Geburtstag" oder "5 Jahre"'
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventDate">Datum (optional)</Label>
              <Input id="eventDate" name="eventDate" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Begrüßungstext für Gäste (optional)
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Schreibe deinen Gästen eine Nachricht..."
                rows={3}
              />
            </div>

            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Liste erstellen
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
