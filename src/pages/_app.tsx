// THIRD PARTY
import type { AppProps } from "next/app";

// COMPONENTS
import { Navbar } from "@app/components/Navbar";

// STYLES
import "@app/styles/globals.css";
import { UserSessionProvider } from "@app/context/UserSessionContext";
import { SessionProvider } from "next-auth/react";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <UserSessionProvider>
        <div className="h-screen flex flex-col overflow-y-auto">
          <Navbar />
          <Component {...pageProps} />
        </div>
      </UserSessionProvider>
    </SessionProvider>
  );
}
