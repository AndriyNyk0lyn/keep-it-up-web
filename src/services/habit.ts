import { db } from "@/lib/db";
import type { CreateHabit, Habit } from "@/types/habit";
import { nanoid } from "nanoid";

export class HabitService {
  static async getHabitsByUser(userId: string) {
    return db.habits.where("userId").equals(userId).toArray();
  }

  static async createHabit(userId: string, habit: CreateHabit) {
    const now = new Date().toISOString();
    const toSave: Habit = {
      ...habit,
      id: nanoid(),
      userId,
      createdAt: now,
      updatedAt: now,
      streak: habit.streak ?? 0,
      isDone: habit.isDone ?? false,
    };
    await db.habits.add(toSave);
    return toSave;
  }

  static async getHabit(userId: string, id: string) {
    const h = await db.habits.get(id);
    return h?.userId === userId ? h : undefined;
  }

  static async updateHabit(userId: string, habit: Habit) {
    if (habit.userId !== userId) throw new Error("Not authorized");
    habit.updatedAt = new Date().toISOString();
    await db.habits.put(habit);
  }

  static async deleteHabit(userId: string, id: string) {
    const h = await db.habits.get(id);
    if (h?.userId !== userId) throw new Error("Not authorized");
    await db.habits.delete(id);
  }
}
