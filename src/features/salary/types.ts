import type { SalaryRecordType } from "../../database/db";

export type CreateSalaryRecordPayload = {
  userId: string;
  type: SalaryRecordType;
  amount: number;
  month: string;
  receivedDate: string;
  company?: string;
  note?: string;
  description?: string;
};

export const SALARY_TYPE_OPTIONS: {
  label: string;
  value: SalaryRecordType;
  icon: string;
  color: string;
}[] = [
  {
    label: "Lương",
    value: "salary",
    icon: "💵",
    color: "#22C55E",
  },
  {
    label: "Thưởng",
    value: "bonus",
    icon: "🎁",
    color: "#895BFF",
  },
  {
    label: "Hoàn thuế",
    value: "tax_refund",
    icon: "🧾",
    color: "#F59E0B",
  },
];

export function getSalaryTypeLabel(type: SalaryRecordType) {
  if (type === "salary") return "Lương";
  if (type === "bonus") return "Thưởng";
  if (type === "tax_refund") return "Hoàn thuế";
  return "Không rõ";
}

export function getSalaryTypeIcon(type: SalaryRecordType) {
  return SALARY_TYPE_OPTIONS.find((item) => item.value === type)?.icon || "💵";
}

export function getSalaryTypeColor(type: SalaryRecordType) {
  return SALARY_TYPE_OPTIONS.find((item) => item.value === type)?.color || "#22C55E";
}