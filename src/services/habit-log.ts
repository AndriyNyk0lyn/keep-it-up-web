import { db } from "@/lib/db";
import type { CreateHabitLog, HabitLog, UpdateHabitLog } from "@/types/habit";
import { nanoid } from "nanoid";

export class HabitLogService {
  static async getLogsByHabit(habitId: string): Promise<HabitLog[]> {
    return db.habitLogs
      .where("habitId")
      .equals(habitId)
      .reverse()
      .sortBy("date");
  }

  static async getLogsByHabitAndDateRange(
    habitId: string,
    startDate: string,
    endDate: string
  ): Promise<HabitLog[]> {
    return db.habitLogs
      .where("habitId")
      .equals(habitId)
      .and((log) => log.date >= startDate && log.date <= endDate)
      .reverse()
      .sortBy("date");
  }

  static async getLogByHabitAndDate(
    habitId: string,
    date: string
  ): Promise<HabitLog | undefined> {
    return db.habitLogs
      .where("habitId")
      .equals(habitId)
      .and((log) => log.date === date)
      .first();
  }

  static async createLog(log: CreateHabitLog): Promise<HabitLog> {
    const now = new Date().toISOString();
    const toSave: HabitLog = {
      ...log,
      id: nanoid(),
      updatedAt: now,
    };
    await db.habitLogs.add(toSave);
    return toSave;
  }

  static async updateLog(id: string, updates: UpdateHabitLog): Promise<void> {
    const existing = await db.habitLogs.get(id);
    if (!existing) throw new Error("Log not found");

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.habitLogs.put(updated);
  }

  static async deleteLog(id: string): Promise<void> {
    await db.habitLogs.delete(id);
  }

  static async deleteLogsByHabit(habitId: string): Promise<void> {
    await db.habitLogs.where("habitId").equals(habitId).delete();
  }

  static async calculateCurrentStreak(habitId: string): Promise<number> {
    const logs = await this.getLogsByHabit(habitId);
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    const today = new Date();
    let currentDate = new Date(today);

    const todayStr = this.dateToString(today);
    const yesterdayStr = this.dateToString(
      new Date(today.getTime() - 24 * 60 * 60 * 1000)
    );

    let startFromYesterday = false;
    if (sortedLogs[0]?.date === todayStr) {
      streak = 1;
      currentDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    } else if (sortedLogs[0]?.date === yesterdayStr) {
      streak = 1;
      currentDate = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);
      startFromYesterday = true;
    } else {
      return 0;
    }

    for (let i = startFromYesterday ? 0 : 1; i < sortedLogs.length; i++) {
      const expectedDate = this.dateToString(currentDate);
      if (sortedLogs[i].date === expectedDate) {
        if (!startFromYesterday || i > 0) streak++;
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      } else {
        break;
      }
    }

    return streak;
  }

  static async calculateLongestStreak(habitId: string): Promise<number> {
    const logs = await this.getLogsByHabit(habitId);
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort((a, b) => a.date.localeCompare(b.date));

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const log of sortedLogs) {
      const logDate = new Date(log.date + "T00:00:00");

      if (lastDate === null) {
        currentStreak = 1;
      } else {
        const daysDiff = Math.floor(
          (logDate.getTime() - lastDate.getTime()) / (24 * 60 * 60 * 1000)
        );

        if (daysDiff === 1) {
          currentStreak++;
        } else {
          maxStreak = Math.max(maxStreak, currentStreak);
          currentStreak = 1;
        }
      }

      lastDate = logDate;
    }

    return Math.max(maxStreak, currentStreak);
  }

  static async isHabitCompletedOnDate(
    habitId: string,
    date: string
  ): Promise<boolean> {
    const log = await this.getLogByHabitAndDate(habitId, date);
    return !!log;
  }

  static async isHabitCompletedToday(habitId: string): Promise<boolean> {
    const today = this.dateToString(new Date());
    return this.isHabitCompletedOnDate(habitId, today);
  }

  static async toggleHabitToday(
    habitId: string,
    note?: string
  ): Promise<{
    completed: boolean;
    streak: number;
    log?: HabitLog;
  }> {
    const today = this.dateToString(new Date());
    const existingLog = await this.getLogByHabitAndDate(habitId, today);

    if (existingLog) {
      await this.deleteLog(existingLog.id);
      const newStreak = await this.calculateCurrentStreak(habitId);
      return {
        completed: false,
        streak: newStreak,
      };
    } else {
      const log = await this.createLog({
        habitId,
        date: today,
        note,
      });
      const newStreak = await this.calculateCurrentStreak(habitId);
      return {
        completed: true,
        streak: newStreak,
        log,
      };
    }
  }

  static async getHabitStats(
    habitId: string,
    days: number = 30
  ): Promise<{
    totalDays: number;
    completedDays: number;
    completionRate: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    const endDate = new Date();
    const startDate = new Date(
      endDate.getTime() - (days - 1) * 24 * 60 * 60 * 1000
    );

    const logs = await this.getLogsByHabitAndDateRange(
      habitId,
      this.dateToString(startDate),
      this.dateToString(endDate)
    );

    const currentStreak = await this.calculateCurrentStreak(habitId);
    const longestStreak = await this.calculateLongestStreak(habitId);

    return {
      totalDays: days,
      completedDays: logs.length,
      completionRate: logs.length / days,
      currentStreak,
      longestStreak,
    };
  }

  private static dateToString(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  static async getCompletionCalendar(
    habitId: string,
    year: number,
    month: number
  ): Promise<Array<{ date: string; completed: boolean }>> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const logs = await this.getLogsByHabitAndDateRange(
      habitId,
      this.dateToString(startDate),
      this.dateToString(endDate)
    );

    const logDates = new Set(logs.map((log) => log.date));
    const calendar: Array<{ date: string; completed: boolean }> = [];

    for (let day = 1; day <= endDate.getDate(); day++) {
      const date = new Date(year, month - 1, day);
      const dateStr = this.dateToString(date);
      calendar.push({
        date: dateStr,
        completed: logDates.has(dateStr),
      });
    }

    return calendar;
  }
}
