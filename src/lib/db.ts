import Dexie, { type Table } from 'dexie';
import type { Habit } from '@/types/habit';

export class KeepItUpDB extends Dexie {
  habits!: Table<Habit, string>;

  constructor() {
    super('KeepItUpDB');
    this.version(1).stores({
      habits: 'id, name, goal, icon, streak, isDone, updatedAt'
    });
  }
}

export const db = new KeepItUpDB();