import dayjs from "dayjs";
import { db } from "../../../database/db";
import type {
  Category,
  Transaction,
  TransactionType,
  Wallet,
} from "../../../database/db";

export type TransactionWithCategory = Transaction & {
  category?: Category;
};

export type TransactionDateRange =
  | "last30days"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "customMonth"
  | "customYear";

export type TransactionChartRange = "day" | "month" | "year";



export type TransactionListFilter = {
  userId: string;

  // Bộ lọc danh sách
  range: TransactionDateRange;
  type?: TransactionType | "all";
  categoryId?: string | "all";
  selectedMonth?: string; // YYYY-MM
  selectedYear?: string; // YYYY

  // Bộ lọc chart riêng
  chartRange: TransactionChartRange;
  chartDate?: string; // YYYY-MM-DD
  chartMonth?: string; // YYYY-MM
  chartYear?: string; // YYYY
};

export type TransactionListResult = {
  wallet: Wallet | null;
  transactions: TransactionWithCategory[];
  categories: Category[];
  dailyExpenseChartData: {
    date: string;
    dayLabel: string;
    amount: number;
  }[];
  totalExpenseInRange: number;
  totalIncomeInRange: number;
  totalDebtInRange: number;
};

export async function getTransactionListData(
  filter: TransactionListFilter,
): Promise<TransactionListResult> {
  const { startDate, endDate } = getRangeDate(
    filter.range,
    filter.selectedMonth,
    filter.selectedYear,
  );

  const wallet = await db.wallets
    .where("userId")
    .equals(filter.userId)
    .filter((item) => item.type === "expense_wallet")
    .first();

  const categories = await db.categories
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const allTransactions = await db.transactions
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const filteredTransactions = allTransactions
    .filter((item) => item.date >= startDate && item.date <= endDate)
    .filter((item) => {
      if (!filter.type || filter.type === "all") return true;
      return item.type === filter.type;
    })
    .filter((item) => {
      if (!filter.categoryId || filter.categoryId === "all") return true;
      return item.categoryId === filter.categoryId;
    })
    .map((item) => ({
      ...item,
      category: categories.find((category) => category.id === item.categoryId),
    }))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      return timeB - timeA;
    });

  const totalExpenseInRange = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncomeInRange = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDebtInRange = filteredTransactions
    .filter((item) => item.type === "debt")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    wallet: wallet || null,
    transactions: filteredTransactions,
    categories,
    dailyExpenseChartData: buildDailyExpenseChartData(
      allTransactions,
      startDate,
      endDate,
    ),
    totalExpenseInRange,
    totalIncomeInRange,
    totalDebtInRange,
  };
}

export async function searchTransactions(payload: {
  userId: string;
  keyword: string;
}) {
  const keyword = payload.keyword.trim().toLowerCase();

  const categories = await db.categories
    .where("userId")
    .equals(payload.userId)
    .toArray();

  const transactions = await db.transactions
    .where("userId")
    .equals(payload.userId)
    .toArray();

  return transactions
    .map((item) => ({
      ...item,
      category: categories.find((category) => category.id === item.categoryId),
    }))
    .filter((item) => {
      if (!keyword) return true;

      const categoryName = item.category?.name?.toLowerCase() || "";
      const note = item.note?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      const partner = item.partner?.toLowerCase() || "";

      return (
        categoryName.includes(keyword) ||
        note.includes(keyword) ||
        description.includes(keyword) ||
        partner.includes(keyword)
      );
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      return timeB - timeA;
    });
}

function getRangeDate(
  range: TransactionDateRange,
  selectedMonth?: string,
  selectedYear?: string
) {
  const today = dayjs();

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
    const month = selectedMonth ? dayjs(selectedMonth) : today;

    return {
      startDate: month.startOf("month").format("YYYY-MM-DD"),
      endDate: month.endOf("month").format("YYYY-MM-DD"),
    };
  }

  if (range === "customYear") {
    const year = selectedYear ? dayjs(selectedYear) : today;

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

function buildDailyExpenseChartData(
  transactions: Transaction[],
  startDate: string,
  endDate: string,
) {
  const start = dayjs(startDate);
  const end = dayjs(endDate);
  const diffDays = end.diff(start, "day") + 1;

  return Array.from({ length: diffDays }, (_, index) => {
    const date = start.add(index, "day").format("YYYY-MM-DD");

    const amount = transactions
      .filter((item) => item.type === "expense")
      .filter((item) => item.date === date)
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      date,
      dayLabel: dayjs(date).format("DD"),
      amount,
    };
  });
}
