import { type ReactNode } from "react";

// THIRD PARTY
import { SessionProvider } from "next-auth/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";

// COMPONENTS
import { DashboardLayout } from "@app/components/DashboardLayout";
import { Navbar } from "@app/components/Navbar";
import { UserSessionProvider } from "@app/context/UserSessionContext";
import { Footer } from "@app/components/Footer";

// STYLES
import "@app/styles/globals.css";

const getLayoutFromPathName = (pathName: string, children: ReactNode) => {
  if (pathName.startsWith("/dashboard")) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const ComponentWithLayout = getLayoutFromPathName(
    router.pathname,
    <Component {...pageProps} />
  );

  return (
    <SessionProvider session={pageProps.session}>
      <UserSessionProvider>
        <div className="h-screen flex flex-col overflow-y-auto">
          {ComponentWithLayout}
        </div>
      </UserSessionProvider>
      <SpeedInsights />
      <Analytics />
    </SessionProvider>
  );
}
