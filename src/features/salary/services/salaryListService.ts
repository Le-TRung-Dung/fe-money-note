import dayjs from "dayjs";
import { db } from "../../../database/db";
import type { SalaryRecord, SalaryRecordType } from "../../../database/db";

export type SalaryListFilter = {
  userId: string;
  keyword?: string;
  type?: SalaryRecordType | "all";
  fromMonth?: string;
  toMonth?: string;
};

export async function getSalaryRecords(filter: SalaryListFilter) {
  const records = await db.salaryRecords
    .where("userId")
    .equals(filter.userId)
    .toArray();

  return records
    .filter((item) => {
      if (filter.type && filter.type !== "all" && item.type !== filter.type) {
        return false;
      }

      if (filter.fromMonth && item.month < filter.fromMonth) {
        return false;
      }

      if (filter.toMonth && item.month > filter.toMonth) {
        return false;
      }

      if (filter.keyword?.trim()) {
        const keyword = filter.keyword.trim().toLowerCase();

        const target = [
          item.company,
          item.note,
          item.description,
          item.month,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!target.includes(keyword)) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = dayjs(a.receivedDate).valueOf();
      const timeB = dayjs(b.receivedDate).valueOf();

      return timeB - timeA;
    });
}

export async function searchSalaryRecords(params: {
  userId: string;
  keyword: string;
}) {
  return getSalaryRecords({
    userId: params.userId,
    keyword: params.keyword,
    type: "all",
  });
}