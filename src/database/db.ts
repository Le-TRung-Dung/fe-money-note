import Dexie, { type Table } from "dexie";

export type User = {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
};

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  type: "expense_wallet" | "saving_wallet" | "cash" | "bank" | "other";
  balance: number;
  currency: "VND";
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SavingTransactionType = "deposit" | "withdraw";

export type SavingTransaction = {
  id: string;
  userId: string;
  walletId: string;

  type: SavingTransactionType;
  amount: number;

  note?: string;
  description?: string;
  date: string;

  createdAt: string;
  updatedAt: string;
};

export type SavingGoal = {
  id: string;
  userId: string;

  name: string;
  targetAmount: number;
  description?: string;
  deadline?: string;

  icon?: string;
  color?: string;

  isCompleted: boolean;

  createdAt: string;
  updatedAt: string;
};

export type TransactionType = "expense" | "income" | "debt";

export type DebtType = "borrow" | "lend" | "repay" | "collect";

export type Category = {
  id: string;
  userId: string;
  name: string;
  type: TransactionType;
  icon?: string;
  color?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Transaction = {
  id: string;
  userId: string;
  walletId: string;

  type: TransactionType;
  debtType?: DebtType;

  categoryId: string;
  amount: number;

  note?: string;
  description?: string;
  partner?: string;

  date: string;

  createdAt: string;
  updatedAt: string;
};

class MoneyNoteDatabase extends Dexie {
  users!: Table<User, string>;
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  savingTransactions!: Table<SavingTransaction, string>;
  savingGoals!: Table<SavingGoal, string>;

  constructor() {
    super("MoneyNoteDB");

    this.version(1).stores({
      users: "id, &username",
    });

    this.version(2).stores({
      users: "id, &username",
      wallets: "id, userId, isDefault, type",
      categories: "id, userId, type, name",
      transactions:
        "id, userId, walletId, categoryId, type, debtType, date, createdAt",
    });

    this.version(3).stores({
      users: "id, &username",
      wallets: "id, userId, isDefault, type",
      categories: "id, userId, type, name",
      transactions:
        "id, userId, walletId, categoryId, type, debtType, date, createdAt",
      savingTransactions: "id, userId, walletId, type, date, createdAt",
    });

    this.version(4).stores({
      users: "id, &username",
      wallets: "id, userId, isDefault, type",
      categories: "id, userId, type, name",
      transactions:
        "id, userId, walletId, categoryId, type, debtType, date, createdAt",
      savingTransactions: "id, userId, walletId, type, date, createdAt",
      savingGoals: "id, userId, targetAmount, deadline, createdAt",
    });
  }
}

export const db = new MoneyNoteDatabase();
