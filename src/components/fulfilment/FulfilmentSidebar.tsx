"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@app/lib/utils";
import { Button } from "@app/components/ui/button";
import { Separator } from "@app/components/ui/separator";
import { authClient } from "@app/lib/auth-client";
import { FULFILMENT_NAV_ITEMS } from "@app/components/nav/portal-nav-config";

export function FulfilmentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/fulfilment/dashboard" className="font-semibold">
          AbroadKart CRM
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {FULFILMENT_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/fulfilment/dashboard" &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.title}
            </Link>
          );
        })}
      </nav>
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
  );
}
