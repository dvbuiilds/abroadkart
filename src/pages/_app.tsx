// THIRD PARTY
import type { AppProps } from "next/app";

// COMPONENTS
import { Navbar } from "@app/components/Navbar";

// STYLES
import "@app/styles/globals.css";
import { UserSessionProvider } from "@app/context/UserSessionContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserSessionProvider>
      <Navbar />
      <Component {...pageProps} />
    </UserSessionProvider>
  );
}
