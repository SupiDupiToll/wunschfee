import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getListBySlug } from "@/actions/list";
import { hexclaveServerApp } from "@/hexclave/server";
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

  const user = await hexclaveServerApp.getUser();
  const isOwner = user?.id === list.userId;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de";
  const listUrl = `${siteUrl}/liste/${list.slug}`;
  const invitationUrl = `${siteUrl}/liste/${list.slug}/einladung`;

  const qrDarkColor = list.qrDarkColor || "#1a1a1a";
  const qrLightColor = list.qrLightColor || "#ffffff";

  const qrDataUrl = await QRCode.toDataURL(invitationUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: qrDarkColor,
      light: qrLightColor,
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
      invitationUrl={invitationUrl}
      qrDataUrl={qrDataUrl}
      wunschfeeQr={wunschfeeQr}
      isOwner={isOwner}
    />
  );
}
