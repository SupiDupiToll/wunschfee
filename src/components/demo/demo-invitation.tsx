"use client";

import Image from "next/image";
import { Gift } from "lucide-react";
import { DemoNote } from "./demo-note";
import type { DemoTab } from "./demo-shell";
import type { GiftList } from "@/db/schema";

interface DemoInvitationProps {
  list: GiftList;
  qrDataUrl: string;
  wunschfeeQr: string;
  onGoToTab: (tab: DemoTab) => void;
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
      <div className="pointer-events-none absolute -top-6 -left-6 h-32 w-32 rounded-full border-2 border-amber-200/30" />
      <div className="pointer-events-none absolute top-1/4 -right-4 h-20 w-20 rounded-full border-2 border-amber-200/20" />
      <div className="pointer-events-none absolute -bottom-8 left-1/3 h-40 w-40 rounded-full border-2 border-amber-200/25" />
      <div className="pointer-events-none absolute top-1/3 left-1/4 h-12 w-12 rounded-full bg-amber-200/10" />
      <div className="pointer-events-none absolute right-1/4 bottom-1/4 h-16 w-16 rounded-full bg-amber-200/10" />
    </>
  ),
  confetti: (
    <>
      <div className="pointer-events-none absolute top-10 right-10 h-3 w-3 rotate-45 bg-amber-300/30" />
      <div className="pointer-events-none absolute top-20 left-8 h-2.5 w-2.5 rotate-12 bg-rose-300/30" />
      <div className="pointer-events-none absolute right-12 bottom-16 h-3 w-3 -rotate-12 bg-sky-300/30" />
      <div className="pointer-events-none absolute bottom-24 left-10 h-2 w-2 rotate-60 bg-emerald-300/30" />
      <div className="pointer-events-none absolute top-1/3 right-4 h-2.5 w-2.5 rotate-90 bg-yellow-300/30" />
      <div className="pointer-events-none absolute bottom-1/3 left-6 h-3 w-3 rotate-30 bg-purple-300/30" />
    </>
  ),
  stars: (
    <>
      <div className="pointer-events-none absolute top-8 right-8 text-2xl text-amber-300/30">★</div>
      <div className="pointer-events-none absolute top-12 left-12 text-lg text-amber-300/20">★</div>
      <div className="pointer-events-none absolute right-16 bottom-12 text-xl text-amber-300/25">★</div>
      <div className="pointer-events-none absolute bottom-8 left-8 text-2xl text-amber-300/20">★</div>
      <div className="pointer-events-none absolute top-1/2 right-4 text-sm text-amber-300/25">★</div>
    </>
  ),
  hearts: (
    <>
      <div className="pointer-events-none absolute top-8 right-8 text-xl text-rose-300/30">♥</div>
      <div className="pointer-events-none absolute top-16 left-10 text-lg text-rose-300/20">♥</div>
      <div className="pointer-events-none absolute right-12 bottom-12 text-2xl text-rose-300/25">♥</div>
      <div className="pointer-events-none absolute bottom-4 left-8 text-lg text-rose-300/20">♥</div>
      <div className="pointer-events-none absolute top-1/3 right-4 text-sm text-rose-300/25">♥</div>
    </>
  ),
};

export function DemoInvitation({
  list,
  qrDataUrl,
  wunschfeeQr,
  onGoToTab,
}: DemoInvitationProps) {
  const bgClass = BG_CLASSES[list.bgStyle || "default"] || BG_CLASSES.default;
  const decorations = DECORATION_SHAPES[list.decorations || "none"];

  const headline = list.invitationHeadline || "Du bist eingeladen!";
  const formattedDate = list.eventDate
    ? new Date(list.eventDate).toLocaleDateString("de-DE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className={`relative flex min-h-screen flex-col bg-gradient-to-br ${bgClass}`}>
      {decorations}

      <div className="relative mx-auto w-full max-w-xl flex-1 px-4 py-10">
        <div className="overflow-hidden rounded-2xl border border-amber-200/60 bg-white shadow-lg">
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
            <button
              type="button"
              onClick={() => onGoToTab("wunschliste")}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
            >
              <Gift className="h-4 w-4" />
              Zur Wunschliste
            </button>

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

        <div className="mt-6">
          <DemoNote text="So sieht die Einladung aus, die der Ersteller verschicken kann." />
        </div>
      </div>
    </div>
  );
}
