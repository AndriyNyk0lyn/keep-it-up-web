import React, { useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AuthService, authQueryKeys } from "../services/auth";
import type { SignInData, SignUpData } from "@/types/auth";
import { AuthContext, type AuthContextValue } from "./auth-context";
import { router } from "@/router";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: authQueryKeys.session,
    queryFn: AuthService.getCurrentSession,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: authQueryKeys.user,
    queryFn: AuthService.getCurrentUser,
    enabled: !!session,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const signInMutation = useMutation({
    mutationFn: AuthService.signIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });

  const signUpMutation = useMutation({
    mutationFn: AuthService.signUp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authQueryKeys.session });
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: AuthService.signOut,
    onSuccess: () => {
      queryClient.clear();
    },
  });

  useEffect(() => {
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((session) => {
      queryClient.setQueryData(authQueryKeys.session, session);
      if (session?.user) {
        queryClient.setQueryData(authQueryKeys.user, session.user);
      } else {
        queryClient.removeQueries({ queryKey: authQueryKeys.user });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  useEffect(() => {
    router.invalidate();
  }, [session, user]);

  const loading = sessionLoading || userLoading;
  const isAuthenticated = !!session && !!user;

  const contextValue: AuthContextValue = {
    user: user || null,
    session: session || null,
    loading,
    signIn: async (data: SignInData) => {
      await signInMutation.mutateAsync(data);
    },
    signUp: async (data: Omit<SignUpData, "confirmPassword">) => {
      await signUpMutation.mutateAsync(data);
    },
    signOut: async () => {
      await signOutMutation.mutateAsync();
    },
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
