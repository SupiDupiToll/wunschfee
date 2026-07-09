"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShoppingCart, Gift, Lock, Trash2, Pencil, Loader } from "lucide-react";
import { addAffiliateTag } from "@/lib/amazon";
import { deleteItem } from "@/actions/item";
import { toast } from "sonner";
import { ReserveModal } from "./reserve-modal";
import { EditItemModal } from "./edit-item-modal";
import type { GiftItem } from "@/db/schema";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: GiftItem;
  isOwner: boolean;
}

const STORAGE_KEY = "wunschfee_reserved";

function getMyReservedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function addMyReservedId(id: string) {
  try {
    const ids = getMyReservedIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch { /* ignore */ }
}

export function ProductDetailModal({
  open,
  onOpenChange,
  item,
  isOwner,
}: ProductDetailModalProps) {
  const allImages = useMemo(() => {
    try {
      const parsed = item.images ? JSON.parse(item.images) : [];
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed
        : item.imageUrl
          ? [item.imageUrl]
          : [];
    } catch {
      return item.imageUrl ? [item.imageUrl] : [];
    }
  }, [item.images, item.imageUrl]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isReserved, setIsReserved] = useState(item.isReserved);
  const [reservedBy, setReservedBy] = useState(item.reservedBy);
  const [reservedByMe, setReservedByMe] = useState(getMyReservedIds().has(item.id));
  const [deleted, setDeleted] = useState(false);

  function handleImageError(index: number) {
    setImgErrors((prev) => new Set(prev).add(index));
  }

  function handleClose() {
    setSelectedIndex(0);
    setImgErrors(new Set());
    onOpenChange(false);
  }

  async function handleDelete() {
    await deleteItem(item.id);
    setDeleted(true);
    handleClose();
    toast.success("Geschenk gelöscht");
  }

  function handleBuyClick(e: React.MouseEvent) {
    if (!isOwner) {
      if (isReserved && reservedByMe) return;
      e.preventDefault();
      setShowBuyDialog(true);
    }
  }

  function proceedToBuy() {
    setShowBuyDialog(false);
    window.open(addAffiliateTag(item.url), "_blank", "noopener noreferrer");
  }

  if (deleted) return null;

  const selectedImage = allImages[selectedIndex];
  const hasMultipleImages = allImages.length > 1;

  function renderThumbnails() {
    if (!hasMultipleImages) return null;
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {allImages.map((url, i) => (
          <button
            key={i}
            onClick={() => setSelectedIndex(i)}
            className={`relative h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
              i === selectedIndex
                ? "border-primary"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {!imgErrors.has(i) ? (
              <Image
                src={url}
                alt=""
                fill
                className="object-cover"
                onError={() => handleImageError(i)}
                unoptimized
                sizes="60px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-card text-xs text-muted-foreground">
                🎁
              </div>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
        <DialogContent
          className="w-full max-w-[900px] p-0 overflow-hidden"
          showCloseButton={false}
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground shadow-xs"
          >
            <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
            <span className="sr-only">Schließen</span>
          </button>

          <div className="flex flex-col sm:flex-row">
            {/* Left: Image Gallery — Amazon-Layout */}
            <div className="flex w-full flex-col items-center gap-3 bg-muted/30 p-6 sm:w-[42%] sm:p-8">
              <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-card shadow-sm">
                {selectedImage && !imgErrors.has(selectedIndex) ? (
                  <Image
                    src={selectedImage}
                    alt={item.title}
                    fill
                    className="object-contain p-4 transition-all duration-300"
                    onError={() => handleImageError(selectedIndex)}
                    unoptimized
                    sizes="(max-width: 640px) 100vw, 40vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl text-muted-foreground">
                    🎁
                  </div>
                )}
                {isReserved && !isOwner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                    <div className="flex items-center gap-1.5 rounded-full bg-background/95 px-3.5 py-1.5 text-xs font-medium shadow-sm">
                      <Lock className="h-3 w-3" />
                      Reserviert{reservedBy ? ` von ${reservedBy}` : ""}
                    </div>
                  </div>
                )}
              </div>

              {renderThumbnails()}
            </div>

            {/* Right: Product Details — Amazon-Layout */}
            <div className="flex w-full flex-col gap-4 p-6 sm:w-[58%] sm:p-8">
              {/* Title + Store */}
              <div>
                <h2 className="text-xl font-bold leading-snug text-foreground sm:text-2xl">
                  {item.title}
                </h2>
                {item.store && (
                  <p className="mt-1 text-sm text-primary hover:underline cursor-default">
                    Besuche den {item.store}-Store
                  </p>
                )}
              </div>

              {/* Divider */}
              <hr className="border-border" />

              {/* Price */}
              <div>
                <p className="text-xs text-muted-foreground">
                  Preis:
                </p>
                {item.price ? (
                  <p className="mt-0.5 text-[28px] font-bold leading-none tracking-tight text-foreground sm:text-[32px]">
                    {item.price}
                  </p>
                ) : (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Loader className="h-3.5 w-3.5 animate-spin" />
                    Preis wird ermittelt…
                  </p>
                )}
              </div>

              {/* Divider */}
              <hr className="border-border" />

              {/* Actions */}
              <div className="space-y-2.5">
                {isOwner ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => setShowEditModal(true)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Bearbeiten
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Löschen
                      </Button>
                    </div>
                    <a
                      href={addAffiliateTag(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98]"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Auf Amazon kaufen
                    </a>
                  </>
                ) : (
                  <>
                    {isReserved ? (
                      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
                        <Gift className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">
                          Reserviert{reservedBy ? ` von ${reservedBy}` : ""}
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowReserveModal(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 active:scale-[0.98] shadow-sm"
                      >
                        <Gift className="h-4 w-4" />
                        Reservieren
                      </button>
                    )}
                    <a
                      href={addAffiliateTag(item.url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleBuyClick}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-[0.98] shadow-sm"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Auf Amazon kaufen
                    </a>
                  </>
                )}
              </div>

              {/* Info footer */}
              <div className="mt-auto rounded-lg bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                <p>
                  Dieses Produkt wird auf Amazon.de angeboten.
                  Beim Klick auf &bdquo;Auf Amazon kaufen&rdquo; wirst du zu
                  Amazon weitergeleitet.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <AlertDialogContent className="max-w-sm sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isReserved ? "Bereits reserviert" : "Noch nicht reserviert"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isReserved ? (
                <>
                  Dieses Geschenk wurde bereits
                  {reservedBy ? ` von ${reservedBy}` : ""} reserviert. Wenn du
                  es trotzdem kaufst, könnte es doppelt vorhanden sein.
                </>
              ) : (
                <>
                  Dieses Geschenk ist bisher von niemandem reserviert. Wenn du
                  es kaufst, könnte es sonst doppelt gekauft werden.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              variant="outline"
              onClick={proceedToBuy}
            >
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              Trotzdem kaufen
            </AlertDialogAction>
            {!isReserved && (
              <Button
                onClick={() => {
                  setShowBuyDialog(false);
                  setShowReserveModal(true);
                }}
              >
                <Gift className="mr-1.5 h-4 w-4" />
                Reservieren
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Geschenk löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{item.title}&rdquo; wird endgültig gelöscht.
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

      <EditItemModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        item={item}
      />

      <ReserveModal
        open={showReserveModal}
        onOpenChange={setShowReserveModal}
        itemId={item.id}
        onSuccess={(name) => {
          setIsReserved(true);
          setReservedBy(name);
          setReservedByMe(true);
          addMyReservedId(item.id);
          setShowReserveModal(false);
        }}
      />
    </>
  );
}
