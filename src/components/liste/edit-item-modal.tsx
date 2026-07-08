"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateItem } from "@/actions/item";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import type { GiftItem } from "@/db/schema";

interface EditItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GiftItem;
}

export function EditItemModal({ open, onOpenChange, item }: EditItemModalProps) {
  const [title, setTitle] = useState(item.title);
  const [price, setPrice] = useState(item.price || "");
  const [imageUrl, setImageUrl] = useState(item.imageUrl || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const formData = new FormData();
    formData.set("title", title);
    formData.set("price", price);
    formData.set("imageUrl", imageUrl);
    try {
      await updateItem(item.id, formData);
      toast.success("Geschenk aktualisiert");
      onOpenChange(false);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">Geschenk bearbeiten</DialogTitle>
          <DialogDescription>
            Korrigiere Titel, Preis oder Bild-URL.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titel</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-price">Preis</Label>
            <Input
              id="edit-price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="z.B. 29,99 €"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-image">Bild-URL (optional)</Label>
            <Input
              id="edit-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          <Button className="w-full gap-2" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
