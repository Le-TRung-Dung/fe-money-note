import type { SavingDateRange, SavingTypeFilter } from "../../features/savings/services/savingListService";

export const typeOptions: { label: string; value: SavingTypeFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Gửi tiết kiệm", value: "deposit" },
  { label: "Rút tiết kiệm", value: "withdraw" },
];

export const rangeOptions: { label: string; value: SavingDateRange }[] = [
  { label: "Hôm nay", value: "today" },
  { label: "30 ngày", value: "last30days" },
  { label: "Tuần này", value: "thisWeek" },
  { label: "Tuần trước", value: "lastWeek" },
  { label: "Tháng này", value: "thisMonth" },
  { label: "Theo tháng", value: "customMonth" },
  { label: "Theo năm", value: "customYear" },
];