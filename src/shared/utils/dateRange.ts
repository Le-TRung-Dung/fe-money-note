import dayjs from "dayjs";

export function getCurrentMonthRange() {
  return {
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  };
}

export function getCurrentWeekRange() {
  return {
    startDate: dayjs().startOf("week").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("week").format("YYYY-MM-DD"),
  };
}