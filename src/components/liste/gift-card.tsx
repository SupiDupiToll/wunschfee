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
import { Trash2, Pencil, Eye, Lock, Gift } from "lucide-react";
import { useState } from "react";
import { EditItemModal } from "./edit-item-modal";
import { ProductDetailModal } from "./product-detail-modal";
import { deleteItem } from "@/actions/item";
import { toast } from "sonner";
import type { GiftItem, GiftList } from "@/db/schema";

interface GiftCardProps {
  item: GiftItem;
  list: GiftList;
  isOwner: boolean;
}

export function GiftCard({ item, list: _list, isOwner }: GiftCardProps) {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function handleDelete() {
    await deleteItem(item.id);
    setDeleted(true);
    toast.success("Geschenk gelöscht");
  }

  if (deleted) return null;

  return (
    <>
      <Card
        className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
        onClick={() => setShowDetailModal(true)}
      >
        <CardContent className="relative flex gap-4 p-4">
          {isOwner && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditModal(true);
                }}
                className="absolute top-2 right-10 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <AlertDialog>
                <AlertDialogTrigger
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
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
                className="object-cover transition-all"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl text-muted-foreground">
                🎁
              </div>
            )}
            {item.isReserved && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex items-center gap-1 rounded-full bg-background/95 px-2.5 py-1 text-xs font-medium shadow-sm">
                  <Lock className="h-3 w-3" />
                  Reserviert
                </div>
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              <h3 className="line-clamp-2 font-medium leading-tight">
                {item.title}
              </h3>
              {item.price ? (
                <p className="mt-1 text-sm font-semibold text-primary">
                  {item.price}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Kein Preis angegeben
                </p>
              )}
              {item.store && (
                <Badge variant="secondary" className="mt-1 text-xs">
                  {item.store}
                </Badge>
              )}
              {item.isReserved && (
                <Badge
                  variant="outline"
                  className="mt-1 gap-1 border-primary/40 text-xs text-primary"
                >
                  <Gift className="h-3 w-3" />
                  Reserviert
                </Badge>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
              >
                <Eye className="h-3.5 w-3.5" />
                Ansehen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditItemModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        item={item}
      />

      <ProductDetailModal
        open={showDetailModal}
        onOpenChange={setShowDetailModal}
        item={item}
        isOwner={isOwner}
      />
    </>
  );
}
