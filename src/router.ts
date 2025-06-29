import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import type { AuthContextValue } from "./contexts/auth-context";
import { routeTree } from "./routeTree.gen";

export interface MyRouterContext {
  queryClient: QueryClient;
  auth: AuthContextValue;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const router = createRouter({ 
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  }
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
} 