"use client";

import { useActionState, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { addItem } from "@/actions/item";
import { fetchProductData, updateItemPrice } from "@/actions/amazon";
import { ImageOff } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface AddItemFormProps {
  listId: string;
}

interface PreviewData {
  title: string;
  imageUrl: string | null;
  store?: string;
}

export function AddItemForm({ listId }: AddItemFormProps) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualImage, setManualImage] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleUrlChange(value: string) {
    setUrl(value);
    if (!value.startsWith("http")) return;

    setFetching(true);
    setFetchError(false);
    setPreview(null);

    try {
      const result = await fetchProductData(value);
      if (result.error) {
        setFetchError(true);
        setManualTitle("");
        toast.error(result.error);
      } else {
        setPreview({
          title: result.title || "",
          imageUrl: result.imageUrl || null,
          store: result.store,
        });
      }
    } catch {
      setFetchError(true);
      toast.error("Fehler beim Erkennen des Produkts");
    } finally {
      setFetching(false);
    }
  }

  async function handleSubmit(_prev: unknown, formData: FormData) {
    formData.set("listId", listId);

    if (fetchError) {
      formData.set("title", manualTitle);
      formData.set("imageUrl", manualImage);
      formData.set("price", manualPrice);
    } else if (preview) {
      formData.set("title", preview.title);
      formData.set("imageUrl", preview.imageUrl || "");
      formData.set("price", "");
    }

    const result = await addItem(null, formData);
    if (!result || "error" in result) {
      if (result?.error) toast.error(result.error);
      return result;
    }

    // Preis im Hintergrund per Dataset API fetchen
    if (url) {
      updateItemPrice(result.id, url).catch(() => {});
    }

    toast.success("Geschenk hinzugefügt!");
    setUrl("");
    setPreview(null);
    setFetchError(false);
    setManualTitle("");
    setManualImage("");
    setManualPrice("");
    return null;
  }

  const [, formAction, pending] = useActionState(handleSubmit, null);

  return (
    <Card>
      <CardContent className="p-4">
        <form action={formAction} ref={formRef} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="url">Amazon-Link</Label>
            <Input
              id="url"
              name="url"
              placeholder="https://www.amazon.de/dp/..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
            />
          </div>

          {fetching && (
            <div className="flex gap-3 rounded-lg border p-3">
              <Skeleton className="h-20 w-20 flex-shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          )}

          {preview && !fetching && (
            <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-3">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                {preview.imageUrl ? (
                  <Image
                    src={preview.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">
                  {preview.title}
                </p>
                {preview.store && (
                  <p className="text-xs text-muted-foreground">
                    {preview.store}
                  </p>
                )}
              </div>
            </div>
          )}

          {fetchError && !fetching && (
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
              <p className="text-xs text-destructive">
                Automatische Erkennung fehlgeschlagen. Bitte manuell eingeben:
              </p>
              <Input
                placeholder="Titel"
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                required
              />
              <Input
                placeholder="Bild-URL (optional)"
                value={manualImage}
                onChange={(e) => setManualImage(e.target.value)}
              />
              <Input
                placeholder="Preis (optional)"
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={
              pending ||
              !url ||
              (fetching === false &&
                fetchError === false &&
                preview === null)
            }
          >
            {fetching
              ? "Erkenne Produkt…"
              : pending
                ? "Wird hinzugefügt…"
                : "Geschenk hinzufügen"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
