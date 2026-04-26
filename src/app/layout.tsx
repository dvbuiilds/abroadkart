import type { Metadata } from "next";
import { ReactQueryProvider } from "@app/lib/react-query";
import { Toaster } from "@app/components/ui/sonner";
import "@app/styles/globals.css";

export const metadata: Metadata = {
  title: "AbroadKart - Study Abroad CRM",
  description: "Multi-tenant CRM platform for study abroad consultants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col">
        <ReactQueryProvider>
          {children}
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
