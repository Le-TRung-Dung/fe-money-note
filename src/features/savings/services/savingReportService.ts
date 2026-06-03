import dayjs from "dayjs";
import { db } from "../../../database/db";

export type MonthlySavingItem = {
  month: string;
  monthLabel: string;
  depositAmount: number;
  withdrawAmount: number;
  netAmount: number;
};

export type SavingMonthlyReport = {
  monthlyData: MonthlySavingItem[];

  currentMonth: MonthlySavingItem;
  previousMonth: MonthlySavingItem | null;

  diffAmount: number;
  diffPercent: number | null;
  trend: "increase" | "decrease" | "same";
};

export async function getSavingMonthlyReport(
  userId: string,
  monthCount = 6
): Promise<SavingMonthlyReport> {
  const transactions = await db.savingTransactions
    .where("userId")
    .equals(userId)
    .toArray();

  const months = Array.from({ length: monthCount }, (_, index) => {
    const monthDate = dayjs().subtract(monthCount - 1 - index, "month");

    return {
      month: monthDate.format("YYYY-MM"),
      monthLabel: monthDate.format("MM/YYYY"),
      startDate: monthDate.startOf("month").format("YYYY-MM-DD"),
      endDate: monthDate.endOf("month").format("YYYY-MM-DD"),
    };
  });

  const monthlyData: MonthlySavingItem[] = months.map((monthItem) => {
    const transactionsInMonth = transactions.filter((item) => {
      return item.date >= monthItem.startDate && item.date <= monthItem.endDate;
    });

    const depositAmount = transactionsInMonth
      .filter((item) => item.type === "deposit")
      .reduce((sum, item) => sum + item.amount, 0);

    const withdrawAmount = transactionsInMonth
      .filter((item) => item.type === "withdraw")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      month: monthItem.month,
      monthLabel: monthItem.monthLabel,
      depositAmount,
      withdrawAmount,
      netAmount: depositAmount - withdrawAmount,
    };
  });

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2] || null;

  const diffAmount = previousMonth
    ? currentMonth.netAmount - previousMonth.netAmount
    : currentMonth.netAmount;

  let diffPercent: number | null = null;

  if (previousMonth && previousMonth.netAmount !== 0) {
    diffPercent = Math.round((diffAmount / Math.abs(previousMonth.netAmount)) * 100);
  }

  const trend =
    diffAmount > 0 ? "increase" : diffAmount < 0 ? "decrease" : "same";

  return {
    monthlyData,
    currentMonth,
    previousMonth,
    diffAmount,
    diffPercent,
    trend,
  };
}