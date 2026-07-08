"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ShoppingCart, Gift, Lock, Trash2, Pencil } from "lucide-react";
import { useState, useEffect } from "react";
import { ReserveModal } from "./reserve-modal";
import { EditItemModal } from "./edit-item-modal";
import { deleteItem } from "@/actions/item";
import { addAffiliateTag } from "@/lib/amazon";
import { toast } from "sonner";
import type { GiftItem, GiftList } from "@/db/schema";

interface GiftCardProps {
  item: GiftItem;
  list: GiftList;
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

export function GiftCard({ item, list, isOwner }: GiftCardProps) {
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isReserved, setIsReserved] = useState(item.isReserved);
  const [reservedBy, setReservedBy] = useState(item.reservedBy);
  const [reservedByMe, setReservedByMe] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    setReservedByMe(getMyReservedIds().has(item.id));
  }, [item.id]);

  async function handleDelete() {
    await deleteItem(item.id);
    setDeleted(true);
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

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <CardContent className="relative flex gap-4 p-4">
          {isOwner && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="absolute top-2 right-10 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </AlertDialogTrigger>
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
            </>
          )}

          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted sm:h-32 sm:w-32">
            {item.imageUrl && !imageError ? (
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className={`object-cover transition-all ${
                  isReserved && !isOwner ? "opacity-50" : ""
                }`}
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
                🎁
              </div>
            )}
            {isReserved && !isOwner && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Lock className="h-8 w-8 text-white drop-shadow" />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <h3 className="line-clamp-2 font-medium leading-tight">
                {item.title}
              </h3>
              {item.price && (
                <p className="mt-1 text-sm font-semibold text-primary">
                  {item.price}
                </p>
              )}
              {item.store && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {item.store}
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href={addAffiliateTag(item.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1.5 rounded-[min(var(--radius-md),12px)] border border-border bg-background px-2.5 text-[0.8rem] font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
                onClick={handleBuyClick}
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Kaufen
              </a>

              {!isOwner && isReserved ? (
                <Badge
                  variant="secondary"
                  className="gap-1 px-3 py-1.5 text-xs"
                >
                  <Gift className="h-3 w-3" />
                  Reserviert
                  {reservedBy && ` von ${reservedBy}`}
                </Badge>
              ) : !isOwner ? (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setShowReserveModal(true)}
                >
                  <Gift className="h-3.5 w-3.5" />
                  Reservieren
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

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
