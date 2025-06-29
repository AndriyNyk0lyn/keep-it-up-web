import { createRootRouteWithContext, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { MyRouterContext } from "../router";

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const { auth } = Route.useRouteContext();
  const { isAuthenticated, signOut } = auth;

  return (
    <>
      <div className="p-2 flex gap-2 items-center">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="[&.active]:font-bold">
              Dashboard
            </Link>
            <button
              onClick={signOut}
              className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="ml-auto flex gap-2">
            <Link to="/auth/sign-in" className="[&.active]:font-bold">
              Sign In
            </Link>
            <Link to="/auth/sign-up" className="[&.active]:font-bold">
              Sign Up
            </Link>
          </div>
        )}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  );
}
