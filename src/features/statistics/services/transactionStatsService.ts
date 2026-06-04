import dayjs from "dayjs";
import { db } from "../../../database/db";
import type { Category, Transaction } from "../../../database/db";

export type StatisticRangeType = "week" | "month" | "year";

export type StatisticFilter = {
  userId: string;
  rangeType: StatisticRangeType;
  selectedDate: string; // YYYY-MM-DD
  selectedMonth: string; // YYYY-MM
  selectedYear: string; // YYYY
};

export type TransactionWithCategory = Transaction & {
  category?: Category;
};

export type TopExpenseCategory = {
  categoryId: string;
  categoryName: string;
  categoryIcon?: string;
  categoryColor?: string;
  totalAmount: number;
  transactionCount: number;
};

export type StatisticChartItem = {
  label: string;
  expenseAmount: number;
  incomeAmount: number;
  debtAmount: number;
};

export type TransactionStatisticResult = {
  startDate: string;
  endDate: string;
  rangeLabel: string;

  transactions: TransactionWithCategory[];

  totalExpense: number;
  totalIncome: number;
  totalDebt: number;
  totalBalance: number;

  topExpenseCategories: TopExpenseCategory[];
  chartData: StatisticChartItem[];
};

export async function getTransactionStatisticData(
  filter: StatisticFilter,
): Promise<TransactionStatisticResult> {
  const { startDate, endDate, rangeLabel } = getDateRange(filter);

  const categories = await db.categories
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const transactions = await db.transactions
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const filteredTransactions: TransactionWithCategory[] = transactions
    .filter((item) => item.date >= startDate && item.date <= endDate)
    .map((item) => ({
      ...item,
      category: categories.find((category) => category.id === item.categoryId),
    }))
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();

      return timeB - timeA;
    });

  const totalExpense = filteredTransactions
    .filter((item) => item.type === "expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalIncome = filteredTransactions
    .filter((item) => item.type === "income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalDebt = filteredTransactions
    .filter((item) => item.type === "debt")
    .reduce((sum, item) => sum + item.amount, 0);

  const topExpenseCategories = buildTopExpenseCategories(filteredTransactions);

  const chartData = buildChartData({
    transactions: filteredTransactions,
    rangeType: filter.rangeType,
    startDate,
    endDate,
  });

  return {
    startDate,
    endDate,
    rangeLabel,
    transactions: filteredTransactions,
    totalExpense,
    totalIncome,
    totalDebt,
    totalBalance: totalIncome - totalExpense,
    topExpenseCategories,
    chartData,
  };
}

function getDateRange(filter: StatisticFilter) {
  if (filter.rangeType === "week") {
    const selected = dayjs(filter.selectedDate);
    const day = selected.day() === 0 ? 7 : selected.day();

    const start = selected.subtract(day - 1, "day");
    const end = start.add(6, "day");

    return {
      startDate: start.format("YYYY-MM-DD"),
      endDate: end.format("YYYY-MM-DD"),
      rangeLabel: `${start.format("DD/MM/YYYY")} - ${end.format("DD/MM/YYYY")}`,
    };
  }

  if (filter.rangeType === "month") {
    const month = dayjs(`${filter.selectedMonth}-01`);

    return {
      startDate: month.startOf("month").format("YYYY-MM-DD"),
      endDate: month.endOf("month").format("YYYY-MM-DD"),
      rangeLabel: `Tháng ${month.format("MM/YYYY")}`,
    };
  }

  const year = dayjs(`${filter.selectedYear}-01-01`);

  return {
    startDate: year.startOf("year").format("YYYY-MM-DD"),
    endDate: year.endOf("year").format("YYYY-MM-DD"),
    rangeLabel: `Năm ${filter.selectedYear}`,
  };
}

function buildTopExpenseCategories(transactions: TransactionWithCategory[]) {
  const expenseTransactions = transactions.filter(
    (item) => item.type === "expense",
  );

  const map = new Map<string, TopExpenseCategory>();

  expenseTransactions.forEach((item) => {
    const categoryId = item.categoryId || "unknown";
    const oldValue = map.get(categoryId);

    if (oldValue) {
      map.set(categoryId, {
        ...oldValue,
        totalAmount: oldValue.totalAmount + item.amount,
        transactionCount: oldValue.transactionCount + 1,
      });
      return;
    }

    map.set(categoryId, {
      categoryId,
      categoryName: item.category?.name || "Không rõ nhóm",
      categoryIcon: item.category?.icon || "✨",
      categoryColor: item.category?.color || "#895BFF",
      totalAmount: item.amount,
      transactionCount: 1,
    });
  });

  return Array.from(map.values())
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 3);
}

function buildChartData(params: {
  transactions: TransactionWithCategory[];
  rangeType: StatisticRangeType;
  startDate: string;
  endDate: string;
}) {
  const { transactions, rangeType, startDate } = params;

  const getAmountsByDate = (date: string) => {
    const dayTransactions = transactions.filter((item) => item.date === date);

    return {
      expenseAmount: dayTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),

      incomeAmount: dayTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),

      debtAmount: dayTransactions
        .filter((item) => item.type === "debt")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  };

  if (rangeType === "week") {
    const start = dayjs(startDate);

    return Array.from({ length: 7 }, (_, index) => {
      const date = start.add(index, "day").format("YYYY-MM-DD");
      const amounts = getAmountsByDate(date);

      return {
        label: start.add(index, "day").format("DD/MM"),
        ...amounts,
      };
    });
  }

  if (rangeType === "month") {
    const start = dayjs(startDate);
    const daysInMonth = start.daysInMonth();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const date = start.date(index + 1).format("YYYY-MM-DD");
      const amounts = getAmountsByDate(date);

      return {
        label: String(index + 1),
        ...amounts,
      };
    });
  }

  const year = dayjs(startDate).format("YYYY");

  return Array.from({ length: 12 }, (_, index) => {
    const monthNumber = index + 1;
    const month = dayjs(`${year}-${String(monthNumber).padStart(2, "0")}-01`);

    const monthStart = month.startOf("month").format("YYYY-MM-DD");
    const monthEnd = month.endOf("month").format("YYYY-MM-DD");

    const monthTransactions = transactions.filter(
      (item) => item.date >= monthStart && item.date <= monthEnd,
    );

    return {
      label: `T${monthNumber}`,

      expenseAmount: monthTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0),

      incomeAmount: monthTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + item.amount, 0),

      debtAmount: monthTransactions
        .filter((item) => item.type === "debt")
        .reduce((sum, item) => sum + item.amount, 0),
    };
  });
}
