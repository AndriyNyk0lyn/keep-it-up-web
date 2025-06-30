import { RouterProvider } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { queryClient, router } from "@/router";

export function RouterContextProvider() {
  const auth = useAuth();

  return <RouterProvider router={router} context={{ queryClient, auth }} />;
}
