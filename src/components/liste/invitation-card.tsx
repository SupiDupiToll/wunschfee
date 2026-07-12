"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Printer, Share2, Gift, ArrowLeft, Pencil, X, Save, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { updateList } from "@/actions/list";
import type { GiftList } from "@/db/schema";

interface InvitationCardProps {
  list: GiftList;
  listUrl: string;
  invitationUrl: string;
  qrDataUrl: string;
  wunschfeeQr: string;
  isOwner: boolean;
}

const BG_CLASSES: Record<string, string> = {
  default: "from-amber-50 via-white to-amber-50",
  warm: "from-orange-50 via-rose-50 to-amber-50",
  cool: "from-sky-50 via-indigo-50 to-blue-50",
  nature: "from-emerald-50 via-teal-50 to-green-50",
  festive: "from-pink-50 via-purple-50 to-rose-50",
  minimal: "from-stone-50 via-white to-stone-50",
};

const DECORATION_SHAPES: Record<string, React.ReactNode> = {
  none: null,
  circles: (
    <>
      <div className="pointer-events-none absolute -top-6 -left-6 h-32 w-32 rounded-full border-2 border-amber-200/30 print:border-amber-300/50" />
      <div className="pointer-events-none absolute top-1/4 -right-4 h-20 w-20 rounded-full border-2 border-amber-200/20 print:border-amber-300/40" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full border-2 border-amber-200/25 print:border-amber-300/45" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-12 w-12 rounded-full bg-amber-200/10 print:bg-amber-200/15" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 h-16 w-16 rounded-full bg-amber-200/10 print:bg-amber-200/15" />
    </>
  ),
  confetti: (
    <>
      <div className="pointer-events-none absolute top-10 right-10 h-3 w-3 rotate-45 bg-amber-300/30 print:bg-amber-300/40" />
      <div className="pointer-events-none absolute top-20 left-8 h-2.5 w-2.5 rotate-12 bg-rose-300/30 print:bg-rose-300/40" />
      <div className="pointer-events-none absolute bottom-16 right-12 h-3 w-3 -rotate-12 bg-sky-300/30 print:bg-sky-300/40" />
      <div className="pointer-events-none absolute bottom-24 left-10 h-2 w-2 rotate-60 bg-emerald-300/30 print:bg-emerald-300/40" />
      <div className="pointer-events-none absolute top-1/3 right-4 h-2.5 w-2.5 rotate-90 bg-yellow-300/30 print:bg-yellow-300/40" />
      <div className="pointer-events-none absolute bottom-1/3 left-6 h-3 w-3 rotate-30 bg-purple-300/30 print:bg-purple-300/40" />
    </>
  ),
  stars: (
    <>
      <div className="pointer-events-none absolute top-8 right-8 text-2xl text-amber-300/30 print:text-amber-300/45">★</div>
      <div className="pointer-events-none absolute top-12 left-12 text-lg text-amber-300/20 print:text-amber-300/35">★</div>
      <div className="pointer-events-none absolute bottom-12 right-16 text-xl text-amber-300/25 print:text-amber-300/40">★</div>
      <div className="pointer-events-none absolute bottom-8 left-8 text-2xl text-amber-300/20 print:text-amber-300/35">★</div>
      <div className="pointer-events-none absolute top-1/2 right-4 text-sm text-amber-300/25 print:text-amber-300/40">★</div>
    </>
  ),
  hearts: (
    <>
      <div className="pointer-events-none absolute top-8 right-8 text-xl text-rose-300/30 print:text-rose-300/45">♥</div>
      <div className="pointer-events-none absolute top-16 left-10 text-lg text-rose-300/20 print:text-rose-300/35">♥</div>
      <div className="pointer-events-none absolute bottom-12 right-12 text-2xl text-rose-300/25 print:text-rose-300/40">♥</div>
      <div className="pointer-events-none absolute bottom-4 left-8 text-lg text-rose-300/20 print:text-rose-300/35">♥</div>
      <div className="pointer-events-none absolute top-1/3 right-4 text-sm text-rose-300/25 print:text-rose-300/40">♥</div>
    </>
  ),
};

function personalise(text: string, name: string): string {
  if (!name) return text;
  if (text.includes("{name}")) return text.replace(/\{name\}/g, name);
  return `${text.replace(/[!.]?$/, "")}, ${name}!`;
}

export function InvitationCard({ list, listUrl, invitationUrl, qrDataUrl, wunschfeeQr, isOwner }: InvitationCardProps) {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("name") || "";
    }
    return "";
  });
  const [editing, setEditing] = useState(false);
  const [editHeadline, setEditHeadline] = useState(list.invitationHeadline || "");
  const [editMessage, setEditMessage] = useState(list.invitationMessage || "");
  const [saving, setSaving] = useState(false);

  const bgStyle = list.bgStyle || "default";
  const bgClass = BG_CLASSES[bgStyle] || BG_CLASSES.default;
  const decorations = list.decorations || "none";

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

  async function handleSave() {
    setSaving(true);
    const formData = new FormData();
    formData.set("invitationHeadline", editHeadline);
    formData.set("invitationMessage", editMessage);
    const result = await updateList(list.id, null, formData);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Einladungstext gespeichert");
      setEditing(false);
    }
    setSaving(false);
  }

  function handleCancelEdit() {
    setEditHeadline(list.invitationHeadline || "");
    setEditMessage(list.invitationMessage || "");
    setEditing(false);
  }

  const shareUrl = name ? `${invitationUrl}?name=${encodeURIComponent(name)}` : invitationUrl;

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

  const formattedDate = list.eventDate
    ? new Date(list.eventDate).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={`relative flex min-h-screen flex-col bg-gradient-to-br ${bgClass} print:bg-white`}>
      {DECORATION_SHAPES[decorations]}

      <div className="relative mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <div className="mb-6 flex items-center justify-between print:hidden">
          <Link
            href={isOwner ? `/liste/${list.slug}/verwalten` : listUrl}
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {isOwner ? "Zurück zur Verwaltung" : "Zur Wunschliste"}
          </Link>

          {isOwner && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
              Text bearbeiten
            </button>
          )}
        </div>

        {editing && (
          <div className="mb-6 space-y-4 rounded-xl border border-amber-200/60 bg-white p-4 shadow-sm print:hidden">
            <h3 className="text-sm font-medium">Einladungstext bearbeiten</h3>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                Überschrift (<code className="rounded bg-muted px-1 py-0.5">{`{name}`}</code> für den Namen)
              </label>
              <Input
                value={editHeadline}
                onChange={(e) => setEditHeadline(e.target.value)}
                placeholder="Du bist eingeladen!"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Einladungstext (optional)</label>
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                placeholder="z.B. Ich freue mich auf euch! Hier sind meine Geschenkwünsche …"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                {saving ? "Wird gespeichert…" : "Speichern"}
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                <X className="mr-1.5 h-3.5 w-3.5" />
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {isOwner && (
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
        )}

        <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-lg print:shadow-none print:border-amber-300/80">
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
              <p className="mx-auto max-w-md whitespace-pre-line text-muted-foreground">
                {list.invitationMessage}
              </p>
            </div>
          )}

          <div className="border-t border-amber-100/60 px-8 py-6 text-center">
            <h1 className="font-serif text-2xl text-foreground">
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
              className="print:hidden inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Gift className="h-4 w-4" />
              Zur Wunschliste
            </Link>

            <div className="mt-4 flex items-center justify-center gap-3 print:hidden">
              <div className="h-px flex-1 bg-amber-200/50" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
                oder via QR-Code
              </span>
              <div className="h-px flex-1 bg-amber-200/50" />
            </div>

            <div className="mt-4 inline-flex items-center gap-3 rounded-xl bg-amber-50/80 p-2.5 print:mx-auto print:mt-6 print:inline-flex print:bg-transparent print:p-0">
              <div className="rounded-lg bg-white p-1.5 shadow-sm print:shadow-md print:rounded-xl">
                <Image
                  src={qrDataUrl}
                  alt="QR-Code zur Wunschliste"
                  width={64}
                  height={64}
                  className="h-14 w-14 print:h-32 print:w-32"
                  unoptimized
                />
              </div>
              <div className="text-left text-xs leading-snug text-muted-foreground print:hidden">
                <p>Scanne den QR-Code</p>
                <p>und öffne die Liste</p>
                <p>auf deinem Handy</p>
              </div>
            </div>

            <div className="print:mt-4 print:block print:text-center print:text-[10px] print:text-muted-foreground print:tracking-wider">
              <span className="hidden print:inline">Scanne den QR-Code um zur Wunschliste zu gelangen</span>
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
        </div>
      </div>
    </div>
  );
}
