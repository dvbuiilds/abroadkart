import { LoanStatusDistribution } from '@app/components/fulfilment/analytics/LoanStatusDistribution';
import { ApprovalRateByConsultant } from '@app/components/fulfilment/analytics/ApprovalRateByConsultant';
import { TATMetrics } from '@app/components/fulfilment/analytics/TATMetrics';
import { DocumentRejectionRates } from '@app/components/fulfilment/analytics/DocumentRejectionRates';

export default function FulfilmentAnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">
          Loan status distribution, approval rates, TAT metrics, and document rejection rates.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LoanStatusDistribution />
        <ApprovalRateByConsultant />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <TATMetrics />
        <DocumentRejectionRates />
      </div>
    </div>
  );
}
