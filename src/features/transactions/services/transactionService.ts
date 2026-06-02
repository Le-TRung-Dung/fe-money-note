import { db } from "../../../database/db";
import type { Transaction } from "../../../database/db";
import { createId } from "../../../shared/utils/id";
import type { CreateTransactionPayload } from "../types";
import type { Category, TransactionType } from "../../../database/db";

export async function getDefaultWalletByUser(userId: string) {
  const wallet = await db.wallets
    .where("userId")
    .equals(userId)
    .filter((item) => item.isDefault)
    .first();

  if (!wallet) {
    throw new Error("Không tìm thấy Ví chi tiêu");
  }

  return wallet;
}

export async function getCategoriesByType(
  userId: string,
  type: "expense" | "income" | "debt"
) {
  return db.categories
    .where("userId")
    .equals(userId)
    .filter((item) => item.type === type)
    .toArray();
}

export async function createTransaction(payload: CreateTransactionPayload) {
  if (!payload.amount || payload.amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0");
  }

  const wallet = await db.wallets.get(payload.walletId);

  if (!wallet) {
    throw new Error("Không tìm thấy ví");
  }

  const now = new Date().toISOString();

  const transaction: Transaction = {
    id: createId("transaction"),
    userId: payload.userId,
    walletId: payload.walletId,
    type: payload.type,
    debtType: payload.debtType,
    categoryId: payload.categoryId,
    amount: payload.amount,
    note: payload.note?.trim(),
    description: payload.description?.trim(),
    partner: payload.partner?.trim(),
    date: payload.date,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction("rw", db.transactions, db.wallets, async () => {
    const newBalance = calculateNewWalletBalance({
      currentBalance: wallet.balance,
      type: transaction.type,
      debtType: transaction.debtType,
      amount: transaction.amount,
    });

    await db.wallets.update(wallet.id, {
      balance: newBalance,
      updatedAt: now,
    });

    await db.transactions.add(transaction);
  });

  return transaction;
}

function calculateNewWalletBalance(params: {
  currentBalance: number;
  type: Transaction["type"];
  debtType?: Transaction["debtType"];
  amount: number;
}) {
  const { currentBalance, type, debtType, amount } = params;

  if (type === "expense") {
    return currentBalance - amount;
  }

  if (type === "income") {
    return currentBalance + amount;
  }

  if (type === "debt") {
    if (debtType === "borrow") {
      return currentBalance + amount;
    }

    if (debtType === "lend") {
      return currentBalance - amount;
    }

    if (debtType === "repay") {
      return currentBalance - amount;
    }

    if (debtType === "collect") {
      return currentBalance + amount;
    }

    throw new Error("Vui lòng chọn loại vay nợ");
  }

  return currentBalance;
}

export async function createCategoryForTransaction(payload: {
  userId: string;
  name: string;
  type: TransactionType;
  icon: string;
  color?: string;
}) {
  const name = payload.name.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên nhóm");
  }

  const existedCategory = await db.categories
    .where("userId")
    .equals(payload.userId)
    .filter(
      (item) =>
        item.type === payload.type &&
        item.name.trim().toLowerCase() === name.toLowerCase()
    )
    .first();

  if (existedCategory) {
    throw new Error("Nhóm này đã tồn tại");
  }

  const now = new Date().toISOString();

  const category: Category = {
    id: createId("category"),
    userId: payload.userId,
    name,
    type: payload.type,
    icon: payload.icon,
    color: payload.color || "#6366f1",
    isDefault: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.categories.add(category);

  return category;
}