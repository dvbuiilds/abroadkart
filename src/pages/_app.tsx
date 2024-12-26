// THIRD PARTY
import type { AppProps } from "next/app";

// COMPONENTS
import { Navbar } from "@app/components/Navbar";

// STYLES
import "@app/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  );
}
