'use client';

import { UserButton } from '@clerk/nextjs';

export function FulfilmentTopbar() {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Fulfilment Portal</span>
      </div>
      <div className="flex items-center gap-2">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'h-8 w-8',
            },
          }}
        />
      </div>
    </header>
  );
}
