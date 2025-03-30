import { type ReactNode } from "react";

// THIRD PARTY
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/router";

// COMPONENTS
import { DashboardLayout } from "@app/components/DashboardLayout";
import { Navbar } from "@app/components/Navbar";
import { UserSessionProvider } from "@app/context/UserSessionContext";

// STYLES
import "@app/styles/globals.css";
import { Footer } from "@app/components/Footer";

const getLayoutFromPathName = (pathName: string, children: ReactNode) => {
  if (pathName.startsWith("/dashboard")) {
    return <DashboardLayout>{children}</DashboardLayout>;
  }
  return (
    <>
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
          <Navbar />
          {ComponentWithLayout}
        </div>
      </UserSessionProvider>
    </SessionProvider>
  );
}
