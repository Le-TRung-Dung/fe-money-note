import { db } from "../../../database/db";
import type {
  SavingTransaction,
  SavingTransactionType,
} from "../../../database/db";
import { createId } from "../../../shared/utils/id";

export async function getSavingWalletByUser(userId: string) {
  const wallet = await db.wallets
    .where("userId")
    .equals(userId)
    .filter((item) => item.type === "saving_wallet")
    .first();

  if (!wallet) {
    throw new Error("Không tìm thấy Ví tiết kiệm");
  }

  return wallet;
}

export async function getSavingTransactions(userId: string) {
  const transactions = await db.savingTransactions
    .where("userId")
    .equals(userId)
    .toArray();

  return transactions.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    return timeB - timeA;
  });
}

export async function getSavingTransactionById(id: string) {
  return db.savingTransactions.get(id);
}

export async function createSavingTransaction(payload: {
  userId: string;
  walletId: string;
  type: SavingTransactionType;
  amount: number;
  note?: string;
  description?: string;
  date: string;
}) {
  if (!payload.amount || payload.amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0");
  }

  const wallet = await db.wallets.get(payload.walletId);

  if (!wallet) {
    throw new Error("Không tìm thấy ví tiết kiệm");
  }

  const now = new Date().toISOString();

  const savingTransaction: SavingTransaction = {
    id: createId("saving"),
    userId: payload.userId,
    walletId: payload.walletId,
    type: payload.type,
    amount: payload.amount,
    note: payload.note?.trim(),
    description: payload.description?.trim(),
    date: payload.date,
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction("rw", db.wallets, db.savingTransactions, async () => {
    const nextBalance =
      payload.type === "deposit"
        ? wallet.balance + payload.amount
        : wallet.balance - payload.amount;

    if (nextBalance < 0) {
      throw new Error("Số tiền rút không được lớn hơn tiền tiết kiệm hiện có");
    }

    await db.wallets.update(wallet.id, {
      balance: nextBalance,
      updatedAt: now,
    });

    await db.savingTransactions.add(savingTransaction);
  });

  return savingTransaction;
}

export async function updateSavingTransaction(
  id: string,
  payload: {
    userId: string;
    walletId: string;
    type: SavingTransactionType;
    amount: number;
    note?: string;
    description?: string;
    date: string;
  }
) {
  const oldTransaction = await db.savingTransactions.get(id);

  if (!oldTransaction) {
    throw new Error("Không tìm thấy giao dịch tiết kiệm");
  }

  const wallet = await db.wallets.get(oldTransaction.walletId);

  if (!wallet) {
    throw new Error("Không tìm thấy ví tiết kiệm");
  }

  const now = new Date().toISOString();

  const newTransaction: SavingTransaction = {
    ...oldTransaction,
    type: payload.type,
    amount: payload.amount,
    note: payload.note?.trim(),
    description: payload.description?.trim(),
    date: payload.date,
    updatedAt: now,
  };

  await db.transaction("rw", db.wallets, db.savingTransactions, async () => {
    let balanceAfterRevert = wallet.balance;

    if (oldTransaction.type === "deposit") {
      balanceAfterRevert -= oldTransaction.amount;
    }

    if (oldTransaction.type === "withdraw") {
      balanceAfterRevert += oldTransaction.amount;
    }

    let finalBalance = balanceAfterRevert;

    if (newTransaction.type === "deposit") {
      finalBalance += newTransaction.amount;
    }

    if (newTransaction.type === "withdraw") {
      finalBalance -= newTransaction.amount;
    }

    if (finalBalance < 0) {
      throw new Error("Số tiền rút không được lớn hơn tiền tiết kiệm hiện có");
    }

    await db.wallets.update(wallet.id, {
      balance: finalBalance,
      updatedAt: now,
    });

    await db.savingTransactions.put(newTransaction);
  });

  return newTransaction;
}

export async function deleteSavingTransaction(id: string) {
  const transaction = await db.savingTransactions.get(id);

  if (!transaction) {
    throw new Error("Không tìm thấy giao dịch tiết kiệm");
  }

  const wallet = await db.wallets.get(transaction.walletId);

  if (!wallet) {
    throw new Error("Không tìm thấy ví tiết kiệm");
  }

  await db.transaction("rw", db.wallets, db.savingTransactions, async () => {
    let nextBalance = wallet.balance;

    if (transaction.type === "deposit") {
      nextBalance -= transaction.amount;
    }

    if (transaction.type === "withdraw") {
      nextBalance += transaction.amount;
    }

    if (nextBalance < 0) {
      throw new Error("Không thể xóa vì số dư tiết kiệm sẽ bị âm");
    }

    await db.wallets.update(wallet.id, {
      balance: nextBalance,
      updatedAt: new Date().toISOString(),
    });

    await db.savingTransactions.delete(id);
  });
}