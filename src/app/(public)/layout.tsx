import type { Metadata } from "next";
import { Navbar } from "@app/components/Navbar";
import { Footer } from "@app/components/Footer";
import { getPublicAppUrl } from "@app/lib/public-urls";

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppUrl()),
  title: {
    default: "AbroadKart | Study Abroad Consultants",
    template: "%s | AbroadKart",
  },
  description:
    "AbroadKart helps students navigate their study abroad journey with expert guidance and resources.",
  openGraph: {
    siteName: "AbroadKart",
    type: "website",
    locale: "en_IN",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}
