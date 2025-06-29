import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { AuthContextValue } from '@/contexts/auth-context'
import { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
  auth: AuthContextValue
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { auth } = Route.useRouteContext();
  const { isAuthenticated, signOut } = auth;

  return (
    <>
      <div className="flex gap-2 items-center">
        {isAuthenticated ? (
          <>
            <Link to="/" className="[&.active]:font-bold">
              Dashboard
            </Link>
            <button
              onClick={signOut}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>
        ) : null}
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
