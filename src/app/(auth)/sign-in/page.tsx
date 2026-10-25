import { SignInPageClient } from "@app/components/auth/SignInPageClient";

export default function SignInPage() {
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return <SignInPageClient googleAuthEnabled={googleAuthEnabled} />;
}
