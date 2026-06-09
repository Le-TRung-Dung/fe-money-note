import dayjs from "dayjs";
import { db } from "../../../database/db";
import type { SalaryRecord } from "../../../database/db";

export type SalaryStatisticFilter = {
  userId: string;
  mode: "year" | "range";
  year: string;
  fromMonth: string;
  toMonth: string;
};

export type SalaryMonthlyChartItem = {
  month: string;
  salary: number;
  bonus: number;
  taxRefund: number;
  total: number;
};

export async function getSalaryStatistic(filter: SalaryStatisticFilter) {
  const records = await db.salaryRecords
    .where("userId")
    .equals(filter.userId)
    .toArray();

  const { fromMonth, toMonth } = getMonthRange(filter);

  const filteredRecords = records.filter((item) => {
    return item.month >= fromMonth && item.month <= toMonth;
  });

  const totalSalary = sumByType(filteredRecords, "salary");
  const totalBonus = sumByType(filteredRecords, "bonus");
  const totalTaxRefund = sumByType(filteredRecords, "tax_refund");
  const totalIncome = totalSalary + totalBonus + totalTaxRefund;

  const chartData = buildMonthlyChartData({
    records: filteredRecords,
    fromMonth,
    toMonth,
  });

  const highestMonth = [...chartData].sort((a, b) => b.total - a.total)[0];

  const activeMonthCount = chartData.filter((item) => item.total > 0).length;

  return {
    fromMonth,
    toMonth,
    records: filteredRecords,
    totalSalary,
    totalBonus,
    totalTaxRefund,
    totalIncome,
    averagePerMonth:
      activeMonthCount > 0 ? Math.round(totalIncome / activeMonthCount) : 0,
    highestMonth,
    chartData,
  };
}

function getMonthRange(filter: SalaryStatisticFilter) {
  if (filter.mode === "year") {
    return {
      fromMonth: `${filter.year}-01`,
      toMonth: `${filter.year}-12`,
    };
  }

  return {
    fromMonth: filter.fromMonth,
    toMonth: filter.toMonth,
  };
}

function sumByType(records: SalaryRecord[], type: SalaryRecord["type"]) {
  return records
    .filter((item) => item.type === type)
    .reduce((total, item) => total + item.amount, 0);
}

function buildMonthlyChartData(params: {
  records: SalaryRecord[];
  fromMonth: string;
  toMonth: string;
}) {
  const result: SalaryMonthlyChartItem[] = [];

  let current = dayjs(`${params.fromMonth}-01`);
  const end = dayjs(`${params.toMonth}-01`);

  while (current.isBefore(end) || current.isSame(end, "month")) {
    const month = current.format("YYYY-MM");

    const monthRecords = params.records.filter((item) => item.month === month);

    const salary = sumByType(monthRecords, "salary");
    const bonus = sumByType(monthRecords, "bonus");
    const taxRefund = sumByType(monthRecords, "tax_refund");

    result.push({
      month,
      salary,
      bonus,
      taxRefund,
      total: salary + bonus + taxRefund,
    });

    current = current.add(1, "month");
  }

  return result;
}