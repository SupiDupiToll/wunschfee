"use client";

import { useActionState, useState } from "react";
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
import { Loader2, Lock, Globe } from "lucide-react";

// Metadata export from client component is not supported by Next.js,
// but this page is behind auth anyway so it's fine.

export default function NewListPage() {
  const [state, formAction, pending] = useActionState(createList, null);
  const [accessType, setAccessType] = useState("public");

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

            <div className="space-y-2">
              <Label>Zugriff</Label>
              <div className="flex gap-4">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="accessType"
                    value="public"
                    checked={accessType === "public"}
                    onChange={() => setAccessType("public")}
                    className="h-4 w-4 accent-primary"
                  />
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Öffentlich</div>
                    <div className="text-muted-foreground">
                      Jeder mit dem Link kann die Liste sehen
                    </div>
                  </div>
                </label>
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="accessType"
                    value="password"
                    checked={accessType === "password"}
                    onChange={() => setAccessType("password")}
                    className="h-4 w-4 accent-primary"
                  />
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <div className="font-medium">Passwort</div>
                    <div className="text-muted-foreground">
                      Nur mit Passwort zugänglich
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {accessType === "password" && (
              <div className="space-y-2">
                <Label htmlFor="accessPassword">Passwort</Label>
                <Input
                  id="accessPassword"
                  name="accessPassword"
                  type="password"
                  placeholder="Passwort für Gäste"
                  required
                />
              </div>
            )}

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
