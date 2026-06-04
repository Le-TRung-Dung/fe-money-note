import dayjs from "dayjs";
import { db } from "../../../database/db";
import type {
  SavingTransaction,
  SavingTransactionType,
  Wallet,
} from "../../../database/db";

export type SavingDateRange =
  | "today"
  | "last30days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "customMonth"
  | "customYear";

export type SavingTypeFilter = SavingTransactionType | "all";

export type SavingTransactionListFilter = {
  userId: string;
  range: SavingDateRange;
  type: SavingTypeFilter;
  selectedMonth?: string; // YYYY-MM
  selectedYear?: string; // YYYY
};

export type SavingTransactionListResult = {
  wallet: Wallet | null;
  transactions: SavingTransaction[];
  totalDepositInRange: number;
  totalWithdrawInRange: number;
  netSavingInRange: number;
};

export async function getSavingTransactionListData(
  filter: SavingTransactionListFilter,
): Promise<SavingTransactionListResult> {
  const { startDate, endDate } = getRangeDate(
    filter.range,
    filter.selectedMonth,
    filter.selectedYear,
  );

  const wallet = await db.wallets
    .where("userId")
    .equals(filter.userId)
    .filter((item) => item.type === "saving_wallet")
    .first();

  const allTransactions = await db.savingTransactions
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const filteredTransactions = allTransactions
    .filter((item) => item.date >= startDate && item.date <= endDate)
    .filter((item) => {
      if (filter.type === "all") return true;
      return item.type === filter.type;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${dayjs(a.createdAt).format("HH:mm:ss")}`).getTime();
      const dateB = new Date(`${b.date}T${dayjs(b.createdAt).format("HH:mm:ss")}`).getTime();

      return dateB - dateA;
    });

  const totalDepositInRange = filteredTransactions
    .filter((item) => item.type === "deposit")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalWithdrawInRange = filteredTransactions
    .filter((item) => item.type === "withdraw")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    wallet: wallet || null,
    transactions: filteredTransactions,
    totalDepositInRange,
    totalWithdrawInRange,
    netSavingInRange: totalDepositInRange - totalWithdrawInRange,
  };
}

function getRangeDate(
  range: SavingDateRange,
  selectedMonth?: string,
  selectedYear?: string,
) {
  const today = dayjs();

  if (range === "today") {
    return {
      startDate: today.format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  }

  if (range === "thisWeek") {
    const currentDay = today.day() === 0 ? 7 : today.day();
    const start = today.subtract(currentDay - 1, "day");

    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: today.format("YYYY-MM-DD"),
    };
  }

  if (range === "lastWeek") {
    const currentDay = today.day() === 0 ? 7 : today.day();
    const startThisWeek = today.subtract(currentDay - 1, "day");
    const startLastWeek = startThisWeek.subtract(7, "day");
    const endLastWeek = startThisWeek.subtract(1, "day");

    return {
      startDate: startLastWeek.format("YYYY-MM-DD"),
      endDate: endLastWeek.format("YYYY-MM-DD"),
    };
  }

  if (range === "thisMonth") {
    return {
      startDate: today.startOf("month").format("YYYY-MM-DD"),
      endDate: today.endOf("month").format("YYYY-MM-DD"),
    };
  }

  if (range === "customMonth") {
    const month = selectedMonth ? dayjs(`${selectedMonth}-01`) : today;

    return {
      startDate: month.startOf("month").format("YYYY-MM-DD"),
      endDate: month.endOf("month").format("YYYY-MM-DD"),
    };
  }

  if (range === "customYear") {
    const year = selectedYear ? dayjs(`${selectedYear}-01-01`) : today;

    return {
      startDate: year.startOf("year").format("YYYY-MM-DD"),
      endDate: year.endOf("year").format("YYYY-MM-DD"),
    };
  }

  return {
    startDate: today.subtract(29, "day").format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
}


export async function searchSavingTransactions(payload: {
  userId: string;
  keyword: string;
}) {
  const keyword = payload.keyword.trim().toLowerCase();

  const transactions = await db.savingTransactions
    .where("userId")
    .equals(payload.userId)
    .toArray();

  return transactions
    .filter((item) => {
      if (!keyword) return true;

      const note = item.note?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const typeLabel =
        item.type === "deposit" ? "gửi tiết kiệm" : "rút tiết kiệm";
      const dateText = dayjs(item.date).format("DD/MM/YYYY");

      return (
        note.includes(keyword) ||
        description.includes(keyword) ||
        typeLabel.includes(keyword) ||
        dateText.includes(keyword)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      return timeB - timeA;
    });
}