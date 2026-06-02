import Dexie, { Table } from 'dexie';

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

class MoneyNoteDatabase extends Dexie {
  users!: Table<User, string>;

  constructor() {
    super('MoneyNoteDB');

    this.version(1).stores({
      users: 'id, &username',
    });
  }
}

export const db = new MoneyNoteDatabase();