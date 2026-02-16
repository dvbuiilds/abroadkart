import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { ReactQueryProvider } from '@app/lib/react-query';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { Toaster } from '@app/components/ui/sonner';
import '@app/styles/globals.css';

export const metadata: Metadata = {
  title: 'AbroadKart - Study Abroad CRM',
  description: 'Multi-tenant CRM platform for study abroad consultants',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="antialiased min-h-screen flex flex-col">
          <ReactQueryProvider>
            {children}
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </ReactQueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}