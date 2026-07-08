"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Printer, Share2, Download, Gift, ArrowLeft, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import type { GiftList } from "@/db/schema";

interface InvitationCardProps {
  list: GiftList;
  listUrl: string;
  qrDataUrl: string;
  wunschfeeQr: string;
}

function personalise(text: string, name: string): string {
  if (!name) return text;
  if (text.includes("{name}")) return text.replace(/\{name\}/g, name);
  return `${text.replace(/[!.]?$/, "")}, ${name}!`;
}

export function InvitationCard({ list, listUrl, qrDataUrl, wunschfeeQr }: InvitationCardProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const n = params.get("name");
    if (n) setName(n);
  }, []);

  const baseHeadline = list.invitationHeadline || "Du bist eingeladen!";
  const headline = personalise(baseHeadline, name);

  function updateName(value: string) {
    setName(value);
    const url = new URL(window.location.href);
    if (value) {
      url.searchParams.set("name", value);
    } else {
      url.searchParams.delete("name");
    }
    window.history.replaceState({}, "", url.toString());
  }

  const shareUrl = name ? `${listUrl}?name=${encodeURIComponent(name)}` : listUrl;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Konnte Link nicht kopieren");
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `🎁 ${headline} – ${list.title}\n\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener noreferrer");
  }

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: list.title,
        text: `🎁 ${headline} – ${list.title}`,
        url: shareUrl,
      });
    } else {
      handleCopyLink();
    }
  }

  async function handleDownloadPdf() {
    if (!cardRef.current) return;
    setPdfLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`einladung-${list.slug}.pdf`);
      toast.success("PDF heruntergeladen!");
    } catch {
      toast.error("PDF konnte nicht erstellt werden");
    } finally {
      setPdfLoading(false);
    }
  }

  const formattedDate = list.eventDate
    ? new Date(list.eventDate).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-white to-amber-50 print:bg-white">
      <div className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="print:hidden">
          <Link
            href={listUrl}
            className="mb-6 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Zur Wunschliste
          </Link>
        </div>

        <div className="mb-6 print:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-amber-200/50 bg-white px-4 py-2.5 shadow-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <Input
              value={name}
              onChange={(e) => updateName(e.target.value)}
              placeholder="Name des Gastes (optional)"
              className="h-8 border-0 bg-transparent p-0 text-sm shadow-none placeholder:text-muted-foreground/50 focus-visible:ring-0"
            />
          </div>
        </div>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-lg print:shadow-none"
        >
          <div className="px-8 pt-10 pb-6 text-center">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary/60">
              Wunschfee
            </p>
            <h2 className="mt-4 font-serif text-3xl leading-tight text-foreground sm:text-4xl">
              {headline}
            </h2>
          </div>

          {list.invitationMessage && (
            <div className="px-8 py-4 text-center">
              <p className="mx-auto max-w-md text-base leading-relaxed text-muted-foreground italic">
                &ldquo;{list.invitationMessage}&rdquo;
              </p>
            </div>
          )}

          <div className="border-t border-amber-100/60 px-8 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {list.honoreeName} hat eine Wunschliste erstellt:
            </p>
            <h1 className="mt-1 font-serif text-2xl text-foreground">
              {list.title}
            </h1>

            {list.birthdayLabel && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                🎂 {list.birthdayLabel}
              </p>
            )}
            {formattedDate && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                📅 {formattedDate}
              </p>
            )}
          </div>

          <div className="px-8 pb-8 text-center">
            <Link
              href={listUrl}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Gift className="h-4 w-4" />
              Zur Wunschliste
            </Link>

            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-amber-200/50" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                oder via QR-Code
              </span>
              <div className="h-px flex-1 bg-amber-200/50" />
            </div>

            <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-amber-50/80 p-2.5">
              <div className="rounded-lg bg-white p-1.5 shadow-sm">
                <Image
                  src={qrDataUrl}
                  alt="QR-Code zur Wunschliste"
                  width={64}
                  height={64}
                  className="h-14 w-14"
                  unoptimized
                />
              </div>
              <div className="text-left text-xs leading-snug text-muted-foreground">
                <p>Scanne den QR-Code</p>
                <p>und öffne die Liste</p>
                <p>auf deinem Handy</p>
              </div>
            </div>
          </div>

          <div className="border-t border-amber-200/50 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-background px-6 py-4 text-center">
            <div className="mx-auto inline-flex items-center gap-3">
              <div className="rounded-lg bg-white p-1 shadow-sm ring-1 ring-amber-100">
                <Image
                  src={wunschfeeQr}
                  alt="Wunschfee QR-Code"
                  width={40}
                  height={40}
                  className="h-8 w-8"
                  unoptimized
                />
              </div>
              <div className="text-left text-[10px] leading-tight text-muted-foreground">
                <p className="text-xs font-medium uppercase tracking-widest text-primary/60">
                  Erstellt mit Wunschfee
                </p>
                <p>Selbst eine Wunschliste erstellen?</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            Link kopieren
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleWhatsApp}>
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Teilen
          </Button>
          <Button variant="outline" className="gap-2" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
            Drucken
          </Button>
          <Button
            variant="default"
            className="gap-2"
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
          >
            <Download className="h-4 w-4" />
            {pdfLoading ? "Wird erstellt…" : "PDF herunterladen"}
          </Button>
        </div>
      </div>
    </div>
  );
}
