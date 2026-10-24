import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactQueryProvider } from "@app/lib/react-query";
import { Toaster } from "@app/components/ui/sonner";
import "@app/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  axes: ["opsz"],
});

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
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <ReactQueryProvider>
          {children}
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
