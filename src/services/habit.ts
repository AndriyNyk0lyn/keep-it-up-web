import { db } from "@/lib/db";
import type { CreateHabit, Habit } from "@/types/habit";
import { nanoid } from "nanoid";
import { HabitLogService } from "./habit-log";

export class HabitService {
  static async getHabitsByUser(userId: string) {
    const habits = await db.habits.where("userId").equals(userId).toArray();

    const enrichedHabits = await Promise.all(
      habits.map(async (habit) => {
        const isCompletedToday = await HabitLogService.isHabitCompletedToday(
          habit.id
        );
        const currentStreak = await HabitLogService.calculateCurrentStreak(
          habit.id
        );

        if (currentStreak !== habit.streak) {
          await this.updateHabitStreak(habit.id, currentStreak);
          habit.streak = currentStreak;
        }

        return {
          ...habit,
          isDone: isCompletedToday,
          doneAt: isCompletedToday ? new Date().toISOString() : undefined,
        };
      })
    );

    return enrichedHabits;
  }

  static async createHabit(userId: string, habit: CreateHabit) {
    const now = new Date().toISOString();
    const toSave: Habit = {
      ...habit,
      id: nanoid(),
      userId,
      createdAt: now,
      updatedAt: now,
      streak: 0,
      isDone: false,
    };
    await db.habits.add(toSave);
    return toSave;
  }

  static async getHabit(userId: string, id: string) {
    const h = await db.habits.get(id);
    if (!h || h.userId !== userId) return undefined;

    const isCompletedToday = await HabitLogService.isHabitCompletedToday(h.id);
    const currentStreak = await HabitLogService.calculateCurrentStreak(h.id);

    if (currentStreak !== h.streak) {
      await this.updateHabitStreak(h.id, currentStreak);
      h.streak = currentStreak;
    }

    return {
      ...h,
      isDone: isCompletedToday,
      doneAt: isCompletedToday ? new Date().toISOString() : undefined,
    };
  }

  static async updateHabit(userId: string, habit: Habit) {
    if (habit.userId !== userId) throw new Error("Not authorized");

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { streak, isDone, doneAt, ...updateData } = habit;
    const updatedHabit = {
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    await db.habits.put(updatedHabit as Habit);
  }

  static async deleteHabit(userId: string, id: string) {
    const h = await db.habits.get(id);
    if (h?.userId !== userId) throw new Error("Not authorized");

    await HabitLogService.deleteLogsByHabit(id);

    await db.habits.delete(id);
  }

  static async toggleHabitToday(
    userId: string,
    habitId: string,
    note?: string
  ) {
    const habit = await this.getHabit(userId, habitId);
    if (!habit) throw new Error("Habit not found");

    const result = await HabitLogService.toggleHabitToday(habitId, note);

    await this.updateHabitStreak(habitId, result.streak);

    return {
      ...result,
      habit: {
        ...habit,
        streak: result.streak,
        isDone: result.completed,
        doneAt: result.completed ? new Date().toISOString() : undefined,
      },
    };
  }

  static async getHabitWithStats(
    userId: string,
    habitId: string,
    days: number = 30
  ) {
    const habit = await this.getHabit(userId, habitId);
    if (!habit) return undefined;

    const stats = await HabitLogService.getHabitStats(habitId, days);
    const logs = await HabitLogService.getLogsByHabit(habitId);

    return {
      habit,
      stats,
      recentLogs: logs.slice(0, 10), // Last 10 logs
    };
  }

  static async getHabitCalendar(
    userId: string,
    habitId: string,
    year: number,
    month: number
  ) {
    const habit = await this.getHabit(userId, habitId);
    if (!habit) return undefined;

    const calendar = await HabitLogService.getCompletionCalendar(
      habitId,
      year,
      month
    );

    return {
      habit,
      calendar,
    };
  }

  private static async updateHabitStreak(habitId: string, streak: number) {
    const habit = await db.habits.get(habitId);
    if (habit) {
      habit.streak = streak;
      habit.updatedAt = new Date().toISOString();
      await db.habits.put(habit);
    }
  }

  static async recalculateAllStreaks(userId: string) {
    const habits = await db.habits.where("userId").equals(userId).toArray();

    for (const habit of habits) {
      const currentStreak = await HabitLogService.calculateCurrentStreak(
        habit.id
      );
      if (currentStreak !== habit.streak) {
        await this.updateHabitStreak(habit.id, currentStreak);
      }
    }
  }
}
