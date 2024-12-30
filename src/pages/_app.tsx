// THIRD PARTY
import type { AppProps } from "next/app";

// COMPONENTS
import { Navbar } from "@app/components/Navbar";

// STYLES
import "@app/styles/globals.css";
import { UserDataProvider } from "@app/context/UserDataContext";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserDataProvider>
      <Navbar />
      <Component {...pageProps} />
    </UserDataProvider>
  );
}
