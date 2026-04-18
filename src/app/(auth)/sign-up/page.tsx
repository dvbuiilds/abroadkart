import { SignUpPageClient } from "@app/components/auth/SignUpPageClient";

export default function SignUpPage() {
  const googleAuthEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
  return <SignUpPageClient googleAuthEnabled={googleAuthEnabled} />;
}
