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

export type AppNotificationType =
  | "welcome"
  | "first_transaction"
  | "first_saving"
  | "first_goal"
  | "inactive"
  | "fun";

export type AppNotification = {
  id: string;
  userId: string;

  type: AppNotificationType;
  title: string;
  description: string;

  isRead: boolean;
  actionUrl?: string;

  createdAt: string;
};

export type SalaryRecordType = "salary" | "bonus" | "tax_refund";

export type SalaryRecord = {
  id: string;
  userId: string;

  type: SalaryRecordType;
  amount: number;

  /**
   * Tháng tính lương, dùng để thống kê.
   * Ví dụ: 2026-06
   */
  month: string;

  /**
   * Ngày thực nhận tiền.
   * Ví dụ: 2026-06-10
   */
  receivedDate: string;

  company?: string;
  note?: string;
  description?: string;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

class MoneyNoteDatabase extends Dexie {
  users!: Table<User, string>;
  wallets!: Table<Wallet, string>;
  categories!: Table<Category, string>;
  transactions!: Table<Transaction, string>;
  savingTransactions!: Table<SavingTransaction, string>;
  savingGoals!: Table<SavingGoal, string>;
  notifications!: Table<AppNotification, string>;

  // THÊM BẢNG NÀY
  salaryRecords!: Table<SalaryRecord, string>;

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

    this.version(5).stores({
      users: "id, &username",
      wallets: "id, userId, isDefault, type",
      categories: "id, userId, type, name",
      transactions:
        "id, userId, walletId, categoryId, type, debtType, date, createdAt",
      savingTransactions: "id, userId, walletId, type, date, createdAt",
      savingGoals: "id, userId, targetAmount, deadline, createdAt",
      notifications: "id, userId, type, isRead, createdAt",
    });

    // THÊM VERSION 6, không sửa version cũ
    this.version(6).stores({
      users: "id, &username",
      wallets: "id, userId, isDefault, type",
      categories: "id, userId, type, name",
      transactions:
        "id, userId, walletId, categoryId, type, debtType, date, createdAt",
      savingTransactions: "id, userId, walletId, type, date, createdAt",
      savingGoals: "id, userId, targetAmount, deadline, createdAt",
      notifications: "id, userId, type, isRead, createdAt",

      salaryRecords:
        "id, userId, type, month, receivedDate, createdAt, updatedAt",
    });
  }
}

export const db = new MoneyNoteDatabase();