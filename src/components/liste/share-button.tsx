"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ShareButtonProps {
  slug: string;
}

export function ShareButton({ slug }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/liste/${slug}`
    : "";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Konnte Link nicht kopieren");
    }
  }

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: "Geschenkeliste",
        url,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <Button
      onClick={handleShare}
      variant="outline"
      className="gap-2"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {copied ? "Kopiert!" : "Link kopieren"}
    </Button>
  );
}
