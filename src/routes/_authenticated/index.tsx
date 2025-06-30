import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../hooks/useAuth";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

function Index() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Welcome back, {user?.email}!</p>
        </div>
      </div>
    </div>
  );
}
