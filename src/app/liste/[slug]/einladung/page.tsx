import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListBySlug } from "@/actions/list";
import { InvitationCard } from "@/components/liste/invitation-card";
import QRCode from "qrcode";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InvitationPage({ params }: Props) {
  const { slug } = await params;
  const list = await getListBySlug(slug);

  if (!list) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de";
  const listUrl = `${siteUrl}/liste/${list.slug}`;

  const qrDataUrl = await QRCode.toDataURL(listUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: "#1a1a1a",
      light: "#ffffff",
    },
  });

  const wunschfeeQr = await QRCode.toDataURL(siteUrl, {
    width: 120,
    margin: 1,
    color: {
      dark: "#d4a853",
      light: "#ffffff",
    },
  });

  return (
    <InvitationCard
      list={list}
      listUrl={listUrl}
      qrDataUrl={qrDataUrl}
      wunschfeeQr={wunschfeeQr}
    />
  );
}
