"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@app/lib/auth-client";
import { Button } from "@app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@app/components/ui/dropdown-menu";
import { LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@app/lib/utils";

type UserMenuProps = {
  /** Smaller trigger for dense dashboard headers */
  compact?: boolean;
  /** Pending role: only show sign out (no dashboard link). */
  pending?: boolean;
};

export function UserMenu({ compact, pending }: UserMenuProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const email = session?.user?.email ?? "";
  const name =
    (session?.user?.name && String(session.user.name).trim()) ||
    email.split("@")[0] ||
    "Account";
  const initials = name
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "relative rounded-full border bg-muted p-0 font-medium hover:bg-muted/80",
            compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-xs",
          )}
          aria-label="Account menu"
        >
          {initials || "?"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            {email ? (
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {!pending ? (
          <>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        ) : null}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => void signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
