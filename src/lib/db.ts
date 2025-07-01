import Dexie, { type Table } from 'dexie';
import type { Habit, HabitLog } from '@/types/habit';

export class KeepItUpDB extends Dexie {
  habits!: Table<Habit, string>;
  habitLogs!: Table<HabitLog, string>;

  constructor() {
    super('KeepItUpDB');
    this.version(1).stores({
      habits: 'id, userId, name, goal, icon, streak, isDone, updatedAt',
      habitLogs: 'id, habitId, date, updatedAt'
    });
  }
}

export const db = new KeepItUpDB();