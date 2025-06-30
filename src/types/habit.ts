import type { IconName } from "@/assets/icons";

export interface Habit {
  id: string;
  userId: string;
  name: string;
  goal: string;
  icon: IconName;
  createdAt: string;
  updatedAt: string;
  streak: number;
  isDone: boolean;
  doneAt?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  note?: string;
  updatedAt: string;
}

export type CreateHabit = Omit<
  Habit,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type CreateHabitLog = Omit<HabitLog, "id" | "updatedAt">;

export type UpdateHabit = Partial<Omit<Habit, "id" | "userId" | "createdAt">>;
export type UpdateHabitLog = Partial<Omit<HabitLog, "id" | "habitId" | "date">>;
