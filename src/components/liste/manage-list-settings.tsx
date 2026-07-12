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
  const [selectedBg, setSelectedBg] = useState(list.bgStyle || "default");
  const [selectedDecor, setSelectedDecor] = useState(list.decorations || "none");
  const [qrDark, setQrDark] = useState(list.qrDarkColor || "#1a1a1a");
  const [qrLight, setQrLight] = useState(list.qrLightColor || "#ffffff");

  async function handleUpdate(
    _prev: { error: string } | null,
    formData: FormData
  ): Promise<{ error: string } | null> {
    formData.set("bgStyle", selectedBg);
    formData.set("decorations", selectedDecor);
    formData.set("qrDarkColor", qrDark);
    formData.set("qrLightColor", qrLight);
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
                  <button
                    type="button"
                    key={bg.value}
                    onClick={() => setSelectedBg(bg.value)}
                    className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all hover:shadow-sm ${
                      selectedBg === bg.value
                        ? "border-primary ring-1 ring-primary"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <div
                      className={`h-8 w-full rounded-lg bg-gradient-to-br ${bg.from} ${bg.via} ${bg.to}`}
                    />
                    <span className="text-xs font-medium">{bg.label}</span>
                    {selectedBg === bg.value && (
                      <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dekorationen / Formen</Label>
              <div className="grid grid-cols-3 gap-2">
                {DECORATIONS.map((dec) => (
                  <button
                    type="button"
                    key={dec.value}
                    onClick={() => setSelectedDecor(dec.value)}
                    className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all hover:shadow-sm ${
                      selectedDecor === dec.value
                        ? "border-primary ring-1 ring-primary"
                        : "border-muted-foreground/20"
                    }`}
                  >
                    <span className="text-lg">{dec.icon}</span>
                    <span className="text-xs font-medium">{dec.label}</span>
                    {selectedDecor === dec.value && (
                      <Check className="absolute top-1 right-1 h-3 w-3 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>QR-Code Farbe</Label>
              <div className="flex gap-3">
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Dunkel (Vordergrund)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrDark}
                      onChange={(e) => setQrDark(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-md border bg-transparent p-0.5"
                    />
                    <Input
                      value={qrDark}
                      onChange={(e) => setQrDark(e.target.value)}
                      className="h-9 font-mono text-xs"
                      placeholder="#1a1a1a"
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Hell (Hintergrund)</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrLight}
                      onChange={(e) => setQrLight(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-md border bg-transparent p-0.5"
                    />
                    <Input
                      value={qrLight}
                      onChange={(e) => setQrLight(e.target.value)}
                      className="h-9 font-mono text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
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
