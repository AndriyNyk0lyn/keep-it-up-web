import {
  createRootRouteWithContext,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AuthContextValue } from '@/contexts/auth-context'
import { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/header'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextValue
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </div>
  );
}
