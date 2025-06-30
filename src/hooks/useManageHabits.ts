import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitService } from "@/services/habit";
import type { Habit, CreateHabit, UpdateHabit } from "@/types/habit";
import { useAuth } from "./useAuth";
import { useCallback } from "react";

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

  const useGetHabit = (habitId: string) => useQuery({
    queryKey: createQueryKey(validateUser(userId), habitId),
    queryFn: async () => {
      const habit = await HabitService.getHabit(validateUser(userId), habitId);
      if (!habit) throw new Error("Habit not found");
      return habit;
    },
    enabled: !!userId && !!habitId,
  });

  const updateHabitsCache = useCallback(
    (updater: (habits: Habit[]) => Habit[]) => {
      if (!userId) return;
      queryClient.setQueryData(createQueryKey(userId), updater);
    },
    [queryClient, userId]
  );

  const updateSingleHabitCache = useCallback(
    (habitId: string, updater: (habit: Habit) => Habit) => {
      if (!userId) return;
      queryClient.setQueryData(
        createQueryKey(userId, habitId),
        (oldHabit: Habit | undefined) =>
          oldHabit ? updater(oldHabit) : oldHabit
      );
    },
    [queryClient, userId]
  );

  const createHabitMutation = useMutation({
    mutationFn: (newHabit: CreateHabit) =>
      HabitService.createHabit(validateUser(userId), newHabit),
    onSuccess: (createdHabit) => {
      updateHabitsCache((habits = []) => [...habits, createdHabit]);
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

      const updatedHabit: Habit = { ...currentHabit, ...updates };
      return HabitService.updateHabit(validUserId, updatedHabit);
    },
    onSuccess: (_, { habitId, updates }) => {
      updateSingleHabitCache(habitId, (habit) => ({ ...habit, ...updates }));
      updateHabitsCache((habits = []) =>
        habits.map((habit) =>
          habit.id === habitId ? { ...habit, ...updates } : habit
        )
      );
    },
  });

  const deleteHabitMutation = useMutation({
    mutationFn: (habitId: string) =>
      HabitService.deleteHabit(validateUser(userId), habitId),
    onSuccess: (_, habitId) => {
      if (!userId) return;

      updateHabitsCache((habits = []) =>
        habits.filter((habit) => habit.id !== habitId)
      );

      queryClient.removeQueries({
        queryKey: createQueryKey(userId, habitId),
      });
    },
  });

  const toggleHabitMutation = useMutation({
    mutationFn: async (habitId: string) => {
      const validUserId = validateUser(userId);
      const currentHabit = habitsQuery.data?.find((h) => h.id === habitId);

      if (!currentHabit) throw new Error("Habit not found");

      const now = new Date().toISOString();
      const isDoneAfterToggle = !currentHabit.isDone;

      const updates: UpdateHabit = {
        isDone: isDoneAfterToggle,
        streak: isDoneAfterToggle
          ? currentHabit.streak + 1
          : Math.max(0, currentHabit.streak - 1),
        doneAt: isDoneAfterToggle ? now : undefined,
        updatedAt: now,
      };

      const updatedHabit: Habit = { ...currentHabit, ...updates };
      return HabitService.updateHabit(validUserId, updatedHabit);
    },
    onMutate: async (habitId) => {
      if (!userId) return;

      await queryClient.cancelQueries({
        queryKey: createQueryKey(userId),
      });

      const previousHabits = queryClient.getQueryData(createQueryKey(userId));

      updateHabitsCache((habits = []) =>
        habits.map((habit) => {
          if (habit.id !== habitId) return habit;

          const now = new Date().toISOString();
          const isDoneAfterToggle = !habit.isDone;

          return {
            ...habit,
            isDone: isDoneAfterToggle,
            streak: isDoneAfterToggle
              ? habit.streak + 1
              : Math.max(0, habit.streak - 1),
            doneAt: isDoneAfterToggle ? now : undefined,
            updatedAt: now,
          };
        })
      );

      return { previousHabits };
    },
    onError: (error, _, context) => {
      if (context?.previousHabits && userId) {
        queryClient.setQueryData(
          createQueryKey(userId),
          context.previousHabits
        );
      }
      console.error("Error toggling habit:", error);
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
