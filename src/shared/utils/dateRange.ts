import dayjs from "dayjs";

export function getCurrentMonthRange() {
  return {
    startDate: dayjs().startOf("month").format("YYYY-MM-DD"),
    endDate: dayjs().endOf("month").format("YYYY-MM-DD"),
  };
}

export function getCurrentWeekRange() {
  const today = dayjs();

  // dayjs().day():
  // Chủ nhật = 0
  // Thứ 2 = 1
  // Thứ 3 = 2
  // ...
  // Thứ 7 = 6
  //
  // Mình quy ước tuần bắt đầu từ thứ 2, kết thúc chủ nhật.
  const currentDay = today.day() === 0 ? 7 : today.day();

  const startOfWeek = today.subtract(currentDay - 1, "day");
  const endOfWeek = startOfWeek.add(6, "day");

  return {
    startDate: startOfWeek.format("YYYY-MM-DD"),
    endDate: endOfWeek.format("YYYY-MM-DD"),
  };
}