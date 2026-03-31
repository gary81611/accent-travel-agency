import type { Metadata } from "next";
import "./globals.css";
import ConditionalLayout from "@/components/public/ConditionalLayout";
import { getSiteSettings } from "@/lib/supabase/site-settings";

export const metadata: Metadata = {
  title: {
    default: "Accent Travel Agency | Group Tours from Amarillo, TX",
    template: "%s | Accent Travel Agency",
  },
  description:
    "Specializing in group travel and tours since 1981. Ask us — we've been there! Call (806) 570-6640.",
  openGraph: {
    siteName: "Accent Travel Agency",
    type: "website",
    locale: "en_US",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <ConditionalLayout settings={settings}>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
