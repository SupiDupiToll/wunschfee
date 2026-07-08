"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Copy, Check, Printer, Share2, ArrowLeft, Download, Gift, FileText, QrCode } from "lucide-react";
import { useState, useRef } from "react";
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

type ViewMode = "invitation" | "card";

export function InvitationCard({ list, listUrl, qrDataUrl, wunschfeeQr }: InvitationCardProps) {
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [mode, setMode] = useState<ViewMode>("invitation");
  const cardRef = useRef<HTMLDivElement>(null);

  const headline = list.invitationHeadline || "Du bist eingeladen!";

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(listUrl);
      setCopied(true);
      toast.success("Link kopiert!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Konnte Link nicht kopieren");
    }
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `🎁 Schau dir meine Wunschliste an: ${list.title}\n\n${listUrl}`
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
        text: `🎁 Schau dir meine Wunschliste an: ${list.title}`,
        url: listUrl,
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
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${mode === "card" ? "wunschliste" : "einladung"}-${list.slug}.pdf`);
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

  const tabs = [
    { value: "invitation" as ViewMode, label: "Einladung", icon: FileText },
    { value: "card" as ViewMode, label: "Wunschliste", icon: QrCode },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-amber-50 via-white to-amber-50 print:bg-white">
      <div className="mx-auto w-full max-w-lg flex-1 px-4 py-8">
        <Link
          href={`/liste/${list.slug}/verwalten`}
          className="mb-4 flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground print:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Zurück zur Verwaltung
        </Link>

        <div className="mb-6 flex overflow-hidden rounded-xl border border-amber-200/60 bg-white p-1 shadow-sm print:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setMode(tab.value)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                mode === tab.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div
          ref={cardRef}
          className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-lg print:shadow-none"
        >
          {mode === "invitation" ? (
            <>
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-6 text-center">
                <p className="text-xs font-medium uppercase tracking-widest text-primary/60">
                  Wunschfee
                </p>
                <h2 className="mt-2 font-serif text-2xl text-foreground sm:text-3xl">
                  {headline}
                </h2>
              </div>

              {list.invitationMessage && (
                <div className="border-b border-amber-100/50 px-6 py-5 text-center">
                  <p className="text-sm leading-relaxed text-muted-foreground italic">
                    &ldquo;{list.invitationMessage}&rdquo;
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background px-6 py-8 text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-primary/60">
                Wunschfee
              </p>
              <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
                {list.title}
              </h1>
              {list.birthdayLabel && (
                <p className="mt-2 text-muted-foreground">🎂 {list.birthdayLabel}</p>
              )}
              {formattedDate && (
                <p className="mt-1 text-muted-foreground">📅 {formattedDate}</p>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                Wunschliste von {list.honoreeName}
              </p>
            </div>
          )}

          {mode === "invitation" && (
            <div className="px-6 py-6 text-center">
              <p className="text-sm text-muted-foreground">
                {list.honoreeName} hat eine Wunschliste erstellt:
              </p>
              <h1 className="mt-2 font-serif text-3xl text-foreground sm:text-4xl">
                {list.title}
              </h1>

              {list.birthdayLabel && (
                <p className="mt-2 text-muted-foreground">🎂 {list.birthdayLabel}</p>
              )}
              {formattedDate && (
                <p className="mt-1 text-muted-foreground">📅 {formattedDate}</p>
              )}
            </div>
          )}

          <div className={`flex justify-center border-t border-dashed border-amber-200/50 px-6 ${mode === "card" ? "py-12" : "py-8"}`}>
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-amber-100">
              <Image
                src={qrDataUrl}
                alt="QR-Code zur Wunschliste"
                width={200}
                height={200}
                className="h-48 w-48 sm:h-56 sm:w-56"
                unoptimized
              />
            </div>
          </div>

          <p className="pb-4 text-center text-xs text-muted-foreground">
            Scanne den QR-Code mit deinem Handy
          </p>

          <div className="border-t border-amber-200/50 px-6 py-4">
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2.5">
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {listUrl}
              </span>
              <button
                onClick={handleCopyLink}
                className="flex-shrink-0 text-primary transition-colors hover:text-primary/80"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-amber-200/50 px-6 py-5 text-center">
            <Link
              href={listUrl}
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Gift className="h-4 w-4" />
              Zur Wunschliste
            </Link>
          </div>

          <div className="border-t border-amber-200/50 bg-gradient-to-r from-primary/[0.04] via-primary/[0.02] to-background px-6 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-primary/60">
              Erstellt mit
            </p>
            <p className="font-serif text-lg text-primary">
              Wunschfee
            </p>
            <div className="mx-auto mt-3 inline-flex items-center gap-3 rounded-lg bg-white p-2 shadow-sm ring-1 ring-amber-100">
              <Image
                src={wunschfeeQr}
                alt="Wunschfee QR-Code"
                width={48}
                height={48}
                className="h-10 w-10"
                unoptimized
              />
              <div className="text-left text-[10px] leading-tight text-muted-foreground">
                <p>Selbst eine</p>
                <p>Wunschliste</p>
                <p>erstellen?</p>
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
