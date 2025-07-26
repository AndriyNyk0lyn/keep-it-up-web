import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitService } from "@/services/habit";
import { HabitLogService } from "@/services/habit-log";
import type { Habit, CreateHabit, UpdateHabit } from "@/types/habit";
import { useAuth } from "./useAuth";
import { useCallback } from "react";
import { toast } from "@/lib/toast";

const HABITS_QUERY_KEY = "habits" as const;

const createQueryKey = (userId: string, habitId?: string) =>
  habitId ? [HABITS_QUERY_KEY, userId, habitId] : [HABITS_QUERY_KEY, userId];

const validateUser = (userId?: string): string => {
  if (!userId) throw new Error("User not authenticated");
  return userId;
};

export const useManageHabits = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const habitsQuery = useQuery({
    queryKey: createQueryKey(validateUser(userId)),
    queryFn: () => HabitService.getHabitsByUser(validateUser(userId)),
    enabled: !!userId,
  });

  const useGetHabit = (habitId: string) =>
    useQuery({
      queryKey: createQueryKey(validateUser(userId), habitId),
      queryFn: async () => {
        const habit = await HabitService.getHabit(
          validateUser(userId),
          habitId
        );
        if (!habit) throw new Error("Habit not found");
        return habit;
      },
      enabled: !!userId && !!habitId,
    });

  const updateCaches = useCallback(
    (habitId: string, updater: (habit: Habit) => Habit) => {
      if (!userId) return;

      queryClient.setQueryData(
        createQueryKey(userId, habitId),
        (oldHabit: Habit | undefined) =>
          oldHabit ? updater(oldHabit) : oldHabit
      );

      queryClient.setQueryData(createQueryKey(userId), (habits: Habit[] = []) =>
        habits.map((habit) => (habit.id === habitId ? updater(habit) : habit))
      );
    },
    [queryClient, userId]
  );

  const createHabitMutation = useMutation({
    mutationFn: (newHabit: CreateHabit) =>
      HabitService.createHabit(validateUser(userId), newHabit),
    onSuccess: (createdHabit) => {
      if (!userId) return;
      queryClient.setQueryData(
        createQueryKey(userId),
        (habits: Habit[] = []) => [...habits, createdHabit]
      );
      toast.success("Habit created successfully");
    },
  });

  const updateHabitMutation = useMutation({
    mutationFn: async ({
      habitId,
      updates,
    }: {
      habitId: string;
      updates: UpdateHabit;
    }) => {
      const validUserId = validateUser(userId);
      const currentHabit = queryClient.getQueryData<Habit>(
        createQueryKey(validUserId, habitId)
      );

      if (!currentHabit) throw new Error("Habit not found");

      return HabitService.updateHabit(validUserId, {
        ...currentHabit,
        ...updates,
      });
    },
    onSuccess: (_, { habitId, updates }) => {
      updateCaches(habitId, (habit) => ({ ...habit, ...updates }));
      toast.success("Habit updated successfully");
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) =>
      HabitService.deleteHabit(validateUser(userId), habitId),
    onSuccess: (_, habitId) => {
      if (!userId) return;

      queryClient.setQueryData(createQueryKey(userId), (habits: Habit[] = []) =>
        habits.filter((habit) => habit.id !== habitId)
      );

      queryClient.removeQueries({
        queryKey: createQueryKey(userId, habitId),
      });
      toast.success("Habit deleted successfully");
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const validUserId = validateUser(userId);
      return HabitService.toggleHabitToday(validUserId, habitId);
    },

    onMutate: async (habitId) => {
      const validUserId = validateUser(userId);

      await queryClient.cancelQueries({
        queryKey: createQueryKey(validUserId),
      });

      const previousHabits = queryClient.getQueryData(
        createQueryKey(validUserId)
      );

      const isCompletedToday =
        await HabitLogService.isHabitCompletedToday(habitId);
      const willBeCompleted = !isCompletedToday;
      const now = new Date().toISOString();

      queryClient.setQueryData(
        createQueryKey(validUserId),
        (habits: Habit[] = []) =>
          habits.map((habit) =>
            habit.id === habitId
              ? {
                  ...habit,
                  isDone: willBeCompleted,
                  doneAt: willBeCompleted ? now : undefined,
                  updatedAt: now,
                }
              : habit
          )
      );

      return { previousHabits };
    },

    onSuccess: (result, habitId) => {
      const now = new Date().toISOString();
      updateCaches(habitId, (habit) => ({
        ...habit,
        isDone: result.completed,
        doneAt: result.completed ? now : undefined,
        updatedAt: now,
        streak: result.streak,
      }));
      toast.success("Activity updated successfully");
    },

    onError: (error, _, context) => {
      if (context?.previousHabits && userId) {
        queryClient.setQueryData(
          createQueryKey(userId),
          context.previousHabits
        );
      }
      console.error("Error toggling habit:", error);
      toast.error("Error toggling habit");
    },
  });

  return {
    habits: habitsQuery.data ?? [],
    isLoadingHabits: habitsQuery.isLoading,
    habitsError: habitsQuery.error,

    useGetHabit,
    refetchHabits: habitsQuery.refetch,

    createHabit: createHabitMutation.mutate,
    updateHabit: updateHabitMutation.mutate,
    deleteHabit: deleteHabitMutation.mutate,
    toggleHabit: toggleHabitMutation.mutate,

    isCreatingHabit: createHabitMutation.isPending,
    isUpdatingHabit: updateHabitMutation.isPending,
    isDeletingHabit: deleteHabitMutation.isPending,
    isTogglingHabit: toggleHabitMutation.isPending,

    createHabitError: createHabitMutation.error,
    updateHabitError: updateHabitMutation.error,
    deleteHabitError: deleteHabitMutation.error,
    toggleHabitError: toggleHabitMutation.error,
  } as const;
};
