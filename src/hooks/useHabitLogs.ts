import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitLogService } from "@/services/habit-log";
import { useAuth } from "./useAuth";

export const useHabitLogs = (habitId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const validateUser = (user: { id: string } | null): string => {
    if (!user?.id) throw new Error("User not authenticated");
    return user.id;
  };

  const createQueryKey = (habitId: string) => ["habit-logs", habitId];

  const {
    data: logs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: createQueryKey(habitId),
    queryFn: async () => {
      validateUser(user);
      return HabitLogService.getLogsByHabit(habitId);
    },
    enabled: !!user?.id && !!habitId,
  });

  const invalidateLogs = () => {
    queryClient.invalidateQueries({
      queryKey: createQueryKey(habitId),
    });
  };

  return {
    logs,
    isLoading,
    error,
    refetch,
    invalidateLogs,
  };
}; 