import { RequireRole } from '@app/components/auth/RequireRole';
import { ConsultantSidebar } from '@app/components/consultant/ConsultantSidebar';
import { ConsultantTopbar } from '@app/components/consultant/ConsultantTopbar';
import { ErrorBoundary } from '@app/components/shared/ErrorBoundary';

export default function ConsultantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole>
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-muted/30">
          <ConsultantSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <ConsultantTopbar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </ErrorBoundary>
    </RequireRole>
  );
}
