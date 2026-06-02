import type { DebtType, TransactionType } from "../../database/db";

export type CreateTransactionPayload = {
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
};