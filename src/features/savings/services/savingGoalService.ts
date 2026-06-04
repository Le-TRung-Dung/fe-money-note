import { db } from "../../../database/db";
import type { SavingGoal } from "../../../database/db";
import { createId } from "../../../shared/utils/id";
import { notifyFirstSavingGoal } from "../../notifications/services/notificationService";

export type CreateSavingGoalPayload = {
  userId: string;
  name: string;
  targetAmount: number;
  description?: string;
  deadline?: string;
  icon?: string;
  color?: string;
};

export async function getSavingGoalsByUser(userId: string) {
  const goals = await db.savingGoals.where("userId").equals(userId).toArray();

  return goals.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();

    return timeB - timeA;
  });
}

export async function createSavingGoal(payload: CreateSavingGoalPayload) {
  const name = payload.name.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên mục tiêu");
  }

  if (!payload.targetAmount || payload.targetAmount <= 0) {
    throw new Error("Số tiền mục tiêu phải lớn hơn 0");
  }

  const now = new Date().toISOString();

  const goal: SavingGoal = {
    id: createId("goal"),
    userId: payload.userId,
    name,
    targetAmount: payload.targetAmount,
    description: payload.description?.trim(),
    deadline: payload.deadline,
    icon: payload.icon || "🎯",
    color: payload.color || "#895BFF",
    isCompleted: false,
    createdAt: now,
    updatedAt: now,
  };

  await db.savingGoals.add(goal);

  await notifyFirstSavingGoal(payload.userId);

  return goal;
}

export async function updateSavingGoal(
  id: string,
  payload: CreateSavingGoalPayload
) {
  const oldGoal = await db.savingGoals.get(id);

  if (!oldGoal) {
    throw new Error("Không tìm thấy mục tiêu");
  }

  const name = payload.name.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên mục tiêu");
  }

  if (!payload.targetAmount || payload.targetAmount <= 0) {
    throw new Error("Số tiền mục tiêu phải lớn hơn 0");
  }

  const updatedGoal: SavingGoal = {
    ...oldGoal,
    name,
    targetAmount: payload.targetAmount,
    description: payload.description?.trim(),
    deadline: payload.deadline,
    icon: payload.icon || "🎯",
    color: payload.color || "#895BFF",
    updatedAt: new Date().toISOString(),
  };

  await db.savingGoals.put(updatedGoal);

  return updatedGoal;
}

export async function deleteSavingGoal(id: string) {
  const goal = await db.savingGoals.get(id);

  if (!goal) {
    throw new Error("Không tìm thấy mục tiêu");
  }

  await db.savingGoals.delete(id);
}