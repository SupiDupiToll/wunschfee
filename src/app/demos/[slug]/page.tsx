import type { Metadata } from "next";
import QRCode from "qrcode";
import {
  demoList,
  demoItems,
  demoDashboardLists,
} from "@/lib/demo-data";
import { DemoShell } from "@/components/demo/demo-shell";

export const metadata: Metadata = {
  title: "Wunschfee – Demo",
  description:
    "Ein Blick in die Wunschfee-App mit Beispieldaten – ohne Anmeldung.",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DemoPage({ params }: Props) {
  const { slug } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://wunschfee.sdtoll.de";
  const invitationUrl = `${siteUrl}/liste/${slug}/einladung`;

  const qrDarkColor = demoList.qrDarkColor || "#1a1a1a";
  const qrLightColor = demoList.qrLightColor || "#ffffff";

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
    <DemoShell
      list={demoList}
      items={demoItems}
      lists={demoDashboardLists}
      qrDataUrl={qrDataUrl}
      wunschfeeQr={wunschfeeQr}
    />
  );
}
