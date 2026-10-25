import { RequireRole } from '@app/components/auth/RequireRole';
import { FulfilmentSidebar } from '@app/components/fulfilment/FulfilmentSidebar';
import { FulfilmentTopbar } from '@app/components/fulfilment/FulfilmentTopbar';
import { ErrorBoundary } from '@app/components/shared/ErrorBoundary';

const FULFILMENT_ROLES = ['fulfilment', 'superAdmin'];

export default function FulfilmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole roles={FULFILMENT_ROLES}>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-muted/30">
          <FulfilmentSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <FulfilmentTopbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </ErrorBoundary>
    </RequireRole>
  );
}
