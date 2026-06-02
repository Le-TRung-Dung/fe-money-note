import dayjs from "dayjs";
import { db } from "../../../database/db";
import type { Category, Transaction, Wallet } from "../../../database/db";
import { getCurrentMonthRange, getCurrentWeekRange } from "../../../shared/utils/dateRange";

export type DashboardSummary = {
  wallet: Wallet | null;

  totalBalance: number;
  totalIncomeThisMonth: number;
  totalExpenseThisMonth: number;
  totalDebtThisMonth: number;
  remainThisMonth: number;

  monthPieChartData: {
    name: string;
    value: number;
  }[];

  dailyExpenseChartData: {
    day: string;
    amount: number;
  }[];

  topExpenseThisWeek: TopExpenseItem[];
  topExpenseThisMonth: TopExpenseItem[];

  recentTransactions: RecentTransactionItem[];
};

export type TopExpenseItem = {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
};

export type RecentTransactionItem = Transaction & {
  category?: Category;
};

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const wallet = await db.wallets
    .where("userId")
    .equals(userId)
    .filter((item) => item.isDefault)
    .first();

  const categories = await db.categories
    .where("userId")
    .equals(userId)
    .toArray();

  const transactions = await db.transactions
    .where("userId")
    .equals(userId)
    .toArray();

  const currentMonthRange = getCurrentMonthRange();
  const currentWeekRange = getCurrentWeekRange();

  const transactionsThisMonth = transactions.filter((item) => {
    return item.date >= currentMonthRange.startDate && item.date <= currentMonthRange.endDate;
  });

  const transactionsThisWeek = transactions.filter((item) => {
    return item.date >= currentWeekRange.startDate && item.date <= currentWeekRange.endDate;
  });

  const totalIncomeThisMonth = sumAmountByType(transactionsThisMonth, "income");
  const totalExpenseThisMonth = sumAmountByType(transactionsThisMonth, "expense");
  const totalDebtThisMonth = sumAmountByType(transactionsThisMonth, "debt");

  const remainThisMonth = totalIncomeThisMonth - totalExpenseThisMonth;

  const monthPieChartData = [
    {
      name: "Khoản thu",
      value: totalIncomeThisMonth,
    },
    {
      name: "Khoản chi",
      value: totalExpenseThisMonth,
    },
    {
      name: "Vay nợ",
      value: totalDebtThisMonth,
    },
  ].filter((item) => item.value > 0);

  const dailyExpenseChartData = buildDailyExpenseChartData(transactionsThisMonth);

  const topExpenseThisWeek = getTopExpenseByCategory(transactionsThisWeek, categories);
  const topExpenseThisMonth = getTopExpenseByCategory(transactionsThisMonth, categories);

  const recentTransactions = transactions
    .sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.createdAt}`).getTime();
      const dateB = new Date(`${b.date} ${b.createdAt}`).getTime();

      return dateB - dateA;
    })
    .slice(0, 6)
    .map((item) => ({
      ...item,
      category: categories.find((category) => category.id === item.categoryId),
    }));

  return {
    wallet: wallet || null,

    totalBalance: wallet?.balance || 0,
    totalIncomeThisMonth,
    totalExpenseThisMonth,
    totalDebtThisMonth,
    remainThisMonth,

    monthPieChartData,
    dailyExpenseChartData,

    topExpenseThisWeek,
    topExpenseThisMonth,

    recentTransactions,
  };
}

function sumAmountByType(
  transactions: Transaction[],
  type: "income" | "expense" | "debt"
) {
  return transactions
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

function buildDailyExpenseChartData(transactions: Transaction[]) {
  const daysInMonth = dayjs().daysInMonth();

  const result = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;

    return {
      day: String(day),
      amount: 0,
    };
  });

  transactions
    .filter((item) => item.type === "expense")
    .forEach((item) => {
      const day = dayjs(item.date).date();
      result[day - 1].amount += item.amount;
    });

  return result;
}

function getTopExpenseByCategory(
  transactions: Transaction[],
  categories: Category[]
): TopExpenseItem[] {
  const expenseTransactions = transactions.filter((item) => item.type === "expense");

  const groupByCategory = expenseTransactions.reduce<Record<string, number>>(
    (result, item) => {
      result[item.categoryId] = (result[item.categoryId] || 0) + item.amount;
      return result;
    },
    {}
  );

  return Object.entries(groupByCategory)
    .map(([categoryId, amount]) => {
      const category = categories.find((item) => item.id === categoryId);

      return {
        categoryId,
        categoryName: category?.name || "Không rõ",
        categoryIcon: category?.icon,
        categoryColor: category?.color,
        amount,
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
}