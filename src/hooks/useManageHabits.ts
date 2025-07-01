import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitService } from "@/services/habit";
import { HabitLogService } from "@/services/habit-log";
import type { Habit, CreateHabit, UpdateHabit } from "@/types/habit";
import { useAuth } from "./useAuth";
import { useCallback, useMemo } from "react";

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

  const validatedUserId = useMemo(() => {
    try {
      return validateUser(userId);
    } catch {
      return null;
    }
  }, [userId]);

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

  const createToggleUpdate = useCallback(
    (completed: boolean, streak?: number) => {
      const now = new Date().toISOString();
      return {
        isDone: completed,
        doneAt: completed ? now : undefined,
        updatedAt: now,
        ...(streak !== undefined && { streak }),
      };
    },
    []
  );

  const updateHabitInBothCaches = useCallback(
    (habitId: string, updater: (habit: Habit) => Habit) => {
      if (!validatedUserId) return;

      updateSingleHabitCache(habitId, updater);

      updateHabitsCache((habits = []) =>
        habits.map((habit) => (habit.id === habitId ? updater(habit) : habit))
      );
    },
    [validatedUserId, updateSingleHabitCache, updateHabitsCache]
  );

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
    mutationFn: async (habitId: string) =>
      HabitService.toggleHabitToday(validatedUserId!, habitId),

    onMutate: async (habitId) => {
      if (!validatedUserId) return;

      await queryClient.cancelQueries({
        queryKey: createQueryKey(validatedUserId),
      });

      const previousHabits = queryClient.getQueryData(
        createQueryKey(validatedUserId)
      );
      const isCompletedToday =
        await HabitLogService.isHabitCompletedToday(habitId);
      const willBeCompleted = !isCompletedToday;

      updateHabitsCache((habits = []) =>
        habits.map((habit) =>
          habit.id === habitId
            ? { ...habit, ...createToggleUpdate(willBeCompleted) }
            : habit
        )
      );

      return { previousHabits };
    },

    onSuccess: (result, habitId) => {
      if (!validatedUserId) return;

      const update = createToggleUpdate(result.completed, result.streak);
      updateHabitInBothCaches(habitId, (habit) => ({ ...habit, ...update }));
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
