import { createFileRoute } from "@tanstack/react-router";

import HabitForm from "@/components/habit-form";

export const Route = createFileRoute("/_authenticated/add-habit")({
  component: RouteComponent,
});

function RouteComponent() {
  return <HabitForm />;
}
