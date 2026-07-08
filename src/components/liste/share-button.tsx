"use client";

import { Button } from "@/components/ui/button";
import { Copy, Check, Share2 } from "lucide-react";
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

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `🎁 Schau dir meine Wunschliste an:\n\n${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener noreferrer");
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Geschenkeliste",
        url,
      });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
        {copied ? "Kopiert!" : "Link kopieren"}
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleWhatsApp}>
        <Share2 className="h-3.5 w-3.5" />
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={handleShare}>
        <Share2 className="h-3.5 w-3.5" />
        Teilen
      </Button>
    </div>
  );
}
