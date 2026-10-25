import { KPICards } from "@app/components/consultant/dashboard/KPICards";
import { RecentActivity } from "@app/components/consultant/dashboard/RecentActivity";
import { TaskSummary } from "@app/components/consultant/dashboard/TaskSummary";
import { PipelineChart } from "@app/components/consultant/dashboard/PipelineChart";

export default function ConsultantDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your students, applications, and loans.
        </p>
      </div>

      <KPICards />

      <div className="grid gap-6 lg:grid-cols-2">
        <PipelineChart />
        <RecentActivity />
      </div>

      <TaskSummary />
    </div>
  );
}
