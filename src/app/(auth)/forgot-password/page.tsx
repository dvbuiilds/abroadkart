import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Button } from "@app/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Password reset via email is coming soon. Please contact your
            administrator or use another sign-in method if available.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/sign-in">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
