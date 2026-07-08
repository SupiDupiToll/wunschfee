"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { verifyListPassword } from "@/actions/list";
import { Loader2, Lock } from "lucide-react";

interface PasswordGateProps {
  slug: string;
  onSuccess: () => void;
}

export function PasswordGate({ slug, onSuccess }: PasswordGateProps) {
  async function handleVerify(
    _prev: { error: string } | null,
    formData: FormData
  ): Promise<{ error: string } | null> {
    const password = formData.get("password") as string;
    const valid = await verifyListPassword(slug, password);
    if (valid) {
      onSuccess();
      return null;
    }
    return { error: "Falsches Passwort" };
  }

  const [state, formAction, pending] = useActionState(handleVerify, null);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 text-4xl">🔒</div>
          <CardTitle className="font-serif text-xl">
            Passwort erforderlich
          </CardTitle>
          <CardDescription>
            Diese Liste ist passwortgeschützt.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Passwort eingeben"
                required
                autoFocus
              />
            </div>
            {state?.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" className="w-full gap-2" disabled={pending}>
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              Entsperren
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
