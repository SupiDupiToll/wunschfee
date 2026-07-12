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
import { Settings, Trash2, Loader2, Check } from "lucide-react";
import { updateList, deleteList } from "@/actions/list";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { GiftList } from "@/db/schema";

interface ManageListSettingsProps {
  list: GiftList;
}

const BG_STYLES = [
  { value: "default", label: "Klassisch", from: "from-amber-50", via: "via-white", to: "to-amber-50" },
  { value: "warm", label: "Warm", from: "from-orange-50", via: "via-rose-50", to: "to-amber-50" },
  { value: "cool", label: "Kühl", from: "from-sky-50", via: "via-indigo-50", to: "to-blue-50" },
  { value: "nature", label: "Natur", from: "from-emerald-50", via: "via-teal-50", to: "to-green-50" },
  { value: "festive", label: "Festlich", from: "from-pink-50", via: "via-purple-50", to: "to-rose-50" },
  { value: "minimal", label: "Minimal", from: "from-stone-50", via: "via-white", to: "to-stone-50" },
] as const;

const DECORATIONS = [
  { value: "none", label: "Keine", icon: "○" },
  { value: "circles", label: "Kreise", icon: "◯" },
  { value: "confetti", label: "Konfetti", icon: "✦" },
  { value: "stars", label: "Sterne", icon: "★" },
  { value: "hearts", label: "Herzen", icon: "♥" },
] as const;

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

  const currentBg = list.bgStyle || "default";
  const currentDecor = list.decorations || "none";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted">
        <Settings className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
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
              <Label>Hintergrund-Verlauf</Label>
              <div className="grid grid-cols-2 gap-2">
                {BG_STYLES.map((bg) => (
                  <label
                    key={bg.value}
                    className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:shadow-sm ${
                      currentBg === bg.value
                        ? "border-primary ring-1 ring-primary"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bgStyle"
                      value={bg.value}
                      defaultChecked={currentBg === bg.value}
                      className="sr-only"
                    />
                    <div
                      className={`h-8 w-full rounded-lg bg-gradient-to-br ${bg.from} ${bg.via} ${bg.to}`}
                    />
                    <span className="text-xs font-medium">{bg.label}</span>
                    {currentBg === bg.value && (
                      <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dekorationen / Formen</Label>
              <div className="grid grid-cols-3 gap-2">
                {DECORATIONS.map((dec) => (
                  <label
                    key={dec.value}
                    className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all hover:shadow-sm ${
                      currentDecor === dec.value
                        ? "border-primary ring-1 ring-primary"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decorations"
                      value={dec.value}
                      defaultChecked={currentDecor === dec.value}
                      className="sr-only"
                    />
                    <span className="text-lg">{dec.icon}</span>
                    <span className="text-xs font-medium">{dec.label}</span>
                    {currentDecor === dec.value && (
                      <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                    )}
                  </label>
                ))}
              </div>
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
