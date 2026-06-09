import { db } from "../../../database/db";
import type { SalaryRecord } from "../../../database/db";
import { createId } from "../../../shared/utils/id";
import type { CreateSalaryRecordPayload } from "../types";

export async function createSalaryRecord(payload: CreateSalaryRecordPayload) {
  if (!payload.amount || payload.amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0");
  }

  if (!payload.month) {
    throw new Error("Vui lòng chọn tháng lương");
  }

  if (!payload.receivedDate) {
    throw new Error("Vui lòng chọn ngày nhận");
  }

  const now = new Date().toISOString();

  const record: SalaryRecord = {
    id: createId("salary"),
    userId: payload.userId,
    type: payload.type,
    amount: payload.amount,
    month: payload.month,
    receivedDate: payload.receivedDate,
    company: payload.company?.trim(),
    note: payload.note?.trim(),
    description: payload.description?.trim(),
    createdAt: now,
    updatedAt: now,
  };

  await db.salaryRecords.add(record);

  return record;
}

export async function getSalaryRecordById(id: string) {
  return db.salaryRecords.get(id);
}

export async function updateSalaryRecord(
  id: string,
  payload: CreateSalaryRecordPayload,
) {
  const oldRecord = await db.salaryRecords.get(id);

  if (!oldRecord) {
    throw new Error("Không tìm thấy bản ghi lương");
  }

  if (!payload.amount || payload.amount <= 0) {
    throw new Error("Số tiền phải lớn hơn 0");
  }

  const now = new Date().toISOString();

  const newRecord: SalaryRecord = {
    ...oldRecord,
    type: payload.type,
    amount: payload.amount,
    month: payload.month,
    receivedDate: payload.receivedDate,
    company: payload.company?.trim(),
    note: payload.note?.trim(),
    description: payload.description?.trim(),
    updatedAt: now,
  };

  await db.salaryRecords.put(newRecord);

  return newRecord;
}

export async function deleteSalaryRecord(id: string) {
  const record = await db.salaryRecords.get(id);

  if (!record) {
    throw new Error("Không tìm thấy bản ghi lương");
  }

  await db.salaryRecords.delete(id);
}