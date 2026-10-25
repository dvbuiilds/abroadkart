import { FulfilmentKPICards } from '@app/components/fulfilment/dashboard/FulfilmentKPICards';
import { OverdueAlerts } from '@app/components/fulfilment/dashboard/OverdueAlerts';
import { RecentLoansList } from '@app/components/fulfilment/dashboard/RecentLoansList';
import { PendingDocumentsSummary } from '@app/components/fulfilment/dashboard/PendingDocumentsSummary';

export default function FulfilmentDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fulfilment Dashboard</h1>
        <p className="text-muted-foreground">
          Cross-tenant loans, documents, and reimbursements overview.
        </p>
      </div>

      <OverdueAlerts />

      <FulfilmentKPICards />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentLoansList />
        <PendingDocumentsSummary />
      </div>
    </div>
  );
}
