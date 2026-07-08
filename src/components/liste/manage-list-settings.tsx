"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Settings, Trash2, Loader2, Globe, Lock } from "lucide-react";
import { updateList, deleteList } from "@/actions/list";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { GiftList } from "@/db/schema";

interface ManageListSettingsProps {
  list: GiftList;
}

export function ManageListSettings({ list }: ManageListSettingsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleUpdate(
    _prev: { error: string } | null,
    formData: FormData
  ): Promise<{ error: string } | null> {
    const result = await updateList(list.id, _prev, formData);
    if (result?.error) {
      toast.error(result.error);
      return result;
    }
    toast.success("Einstellungen gespeichert");
    setOpen(false);
    return null;
  }

  async function handleDelete() {
    await deleteList(list.id);
    toast.success("Liste gelöscht");
    router.push("/dashboard");
  }

  const [, formAction, pending] = useActionState(handleUpdate, null);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted">
        <Settings className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="font-serif">Einstellungen</SheetTitle>
          <SheetDescription>
            Verwalte deine Geschenkeliste
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Titel</Label>
              <Input
                id="edit-title"
                name="title"
                defaultValue={list.title}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-message">Nachricht</Label>
              <Input
                id="edit-message"
                name="message"
                defaultValue={list.message || ""}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Zugriff</Label>
              <div className="flex gap-4">
                <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input
                    type="radio"
                    name="accessType"
                    value="public"
                    defaultChecked={list.accessType === "public"}
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
                    defaultChecked={list.accessType === "password"}
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

            <div className="space-y-2">
              <Label htmlFor="edit-password">
                Neues Passwort (optional)
              </Label>
              <Input
                id="edit-password"
                name="accessPassword"
                type="password"
                placeholder="Neues Passwort"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={pending}
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Speichern
            </Button>
          </form>

          <Separator />

          <AlertDialog>
            <AlertDialogTrigger className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-transparent bg-destructive/10 px-2.5 text-sm font-medium whitespace-nowrap text-destructive transition-all hover:bg-destructive/20">
              <Trash2 className="h-4 w-4" />
              Liste löschen
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Liste wirklich löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Diese Aktion kann nicht rückgängig gemacht werden. Alle
                  Geschenke werden ebenfalls gelöscht.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
