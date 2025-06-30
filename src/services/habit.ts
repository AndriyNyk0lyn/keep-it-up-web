import { db } from "@/lib/db";
import type { Habit } from "@/types/habit";

export class HabitService {
  static async getHabits() {
    return await db.habits.toArray();
  }

  static async createHabit(habit: Habit) {
    await db.habits.add(habit);
  }

  static async getHabit(id: string) {
    return await db.habits.get(id);
  }

  static async updateHabit(habit: Habit) {
    await db.habits.put(habit);
  }

  static async deleteHabit(id: string) {
    await db.habits.delete(id);
  }
}
