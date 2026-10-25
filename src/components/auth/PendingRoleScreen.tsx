"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@app/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@app/components/ui/card";
import { Separator } from "@app/components/ui/separator";
import { cn } from "@app/lib/utils";
import Link from "next/link";
import { authClient } from "@app/lib/auth-client";
import { UserMenu } from "@app/components/auth/UserMenu";
import {
  CONSULTANT_NAV_ITEMS,
  FULFILMENT_NAV_ITEMS,
  type PortalNavItem,
} from "@app/components/nav/portal-nav-config";

function PendingNavList({ items }: { items: PortalNavItem[] }) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Navigation">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <span
            key={item.href}
            aria-disabled
            className={cn(
              "flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
              "text-muted-foreground opacity-70",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.title}
          </span>
        );
      })}
    </nav>
  );
}

export function PendingRoleScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const isFulfilmentPortal = pathname.startsWith("/fulfilment");
  const navItems = isFulfilmentPortal
    ? FULFILMENT_NAV_ITEMS
    : CONSULTANT_NAV_ITEMS;

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-card">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold text-foreground">AbroadKart CRM</span>
        </div>
        <PendingNavList items={navItems} />
        <Separator />
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => void signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
          <p className="text-sm text-muted-foreground">Waiting for access</p>
          <UserMenu compact pending />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-4 md:p-6">
          <Card className="w-full max-w-md shadow-md">
            <CardHeader>
              <CardTitle>Waiting for access</CardTitle>
              <CardDescription>
                Your account is active, but a role has not been assigned yet. A
                super administrator will grant you access to the right area.
                Sign out and back in after your role is assigned, or return
                home.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/">Back to home</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
