"use client";

import { useActionState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { reserveItem } from "@/actions/reserve";
import { Loader2, Gift } from "lucide-react";
import { toast } from "sonner";

interface ReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  onSuccess: (name: string) => void;
}

export function ReserveModal({
  open,
  onOpenChange,
  itemId,
  onSuccess,
}: ReserveModalProps) {
  async function handleReserve(_prev: unknown, formData: FormData) {
    formData.set("itemId", itemId);
    const result = await reserveItem(null, formData);
    if (result?.error) {
      toast.error(result.error);
      return result;
    }
    const name = formData.get("name") as string;
    toast.success("Reserviert!");
    onSuccess(name);
    return null;
  }

  const [, formAction, pending] = useActionState(handleReserve, null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Geschenk reservieren
          </DialogTitle>
          <DialogDescription>
            Trag dich ein, damit niemand dasselbe Geschenk kauft.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Dein Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="z.B. Anna"
              required
              autoFocus
              minLength={2}
            />
          </div>
          <input type="hidden" name="itemId" value={itemId} />
          <Button type="submit" className="w-full gap-2" disabled={pending}>
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Gift className="h-4 w-4" />
            )}
            Reservieren
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
