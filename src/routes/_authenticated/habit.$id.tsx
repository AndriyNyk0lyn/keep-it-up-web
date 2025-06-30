import HabitForm from '@/components/habit-form';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/habit/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams();
  return <HabitForm id={id} />;
}
