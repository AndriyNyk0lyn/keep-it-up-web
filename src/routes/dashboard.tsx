import { createFileRoute, redirect } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  beforeLoad: ({ context }) => {
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: "/auth/sign-in" });
    }
  },
});

function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user?.email}!</p>
        </div>
      </div>
    </div>
  );
}
