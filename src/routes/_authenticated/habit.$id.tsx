import HabitForm from '@/components/habit-form';
import { HabitLogsTable } from '@/components/habit-logs-table';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/habit/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  
  return (
    <div className="space-y-8">
      <HabitForm id={id} />
      
      <div className="space-y-4 container mx-auto max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-center">Activity Log</h2>
        <HabitLogsTable habitId={id} />
      </div>
    </div>
  );
}
