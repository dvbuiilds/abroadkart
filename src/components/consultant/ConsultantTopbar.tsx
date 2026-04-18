"use client";

import { useCurrentUser } from "@app/hooks/useCurrentUser";
import { UserMenu } from "@app/components/auth/UserMenu";

export function ConsultantTopbar() {
  const { user } = useCurrentUser();

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {user?.tenant?.name && (
          <span className="font-medium text-foreground">
            {user.tenant.name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <UserMenu compact />
      </div>
    </header>
  );
}
