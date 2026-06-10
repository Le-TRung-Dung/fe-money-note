import { db } from "../../../database/db";
import { ensureDefaultDataForUser } from "../../../database/seed";
import { getPasswordUnlockedKey, getRequirePasswordKey, getSalaryLockKey, getSalaryUnlockedKey, STORAGE_KEYS } from "../../../shared/constants/storageKeys";
import { createId } from "../../../shared/utils/id";
import { hashPassword } from "../../../shared/utils/password";
import type { LoginPayload, RegisterPayload } from "../types";

export async function register(payload: RegisterPayload) {
  const username = payload.username.trim().toLowerCase();
  const password = payload.password.trim();

  if (!username) {
    throw new Error("Vui lòng nhập tên đăng nhập");
  }

  if (!password) {
    throw new Error("Vui lòng nhập mật khẩu");
  }

  if (password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự");
  }

  const existedUser = await db.users.where("username").equals(username).first();

  if (existedUser) {
    throw new Error("Tên đăng nhập đã tồn tại");
  }

  const now = new Date().toISOString();

  const user = {
    id: createId("user"),
    username,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction("rw", db.users, db.wallets, db.categories, async () => {
    await db.users.add(user);
    await ensureDefaultDataForUser(user.id);
  });

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

  return user;
}

export async function login(payload: LoginPayload) {
  const username = payload.username.trim().toLowerCase();
  const password = payload.password.trim();

  if (!username) {
    throw new Error("Vui lòng nhập tên đăng nhập");
  }

  if (!password) {
    throw new Error("Vui lòng nhập mật khẩu");
  }

  const user = await db.users.where("username").equals(username).first();

  if (!user) {
    throw new Error("Tài khoản không tồn tại");
  }

  const passwordHash = await hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    throw new Error("Mật khẩu không đúng");
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
  markPasswordUnlocked(user.id);

  return user;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
}

export function getCurrentUserId() {
  return localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
}

export function isAuthenticated() {
  return Boolean(getCurrentUserId());
}

export async function resetPassword(payload: {
  username: string;
  newPassword: string;
}) {
  const username = payload.username.trim().toLowerCase();
  const newPassword = payload.newPassword.trim();

  if (!username) {
    throw new Error("Vui lòng nhập tên đăng nhập");
  }

  if (!newPassword) {
    throw new Error("Vui lòng nhập mật khẩu mới");
  }

  if (newPassword.length < 6) {
    throw new Error("Mật khẩu mới phải có ít nhất 6 ký tự");
  }

  const user = await db.users.where("username").equals(username).first();

  if (!user) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const newPasswordHash = await hashPassword(newPassword);

  await db.users.update(user.id, {
    passwordHash: newPasswordHash,
    updatedAt: new Date().toISOString(),
  });

  return user;
}

export async function getCurrentUser() {
  const currentUserId = getCurrentUserId();

  if (!currentUserId) {
    return null;
  }

  return db.users.get(currentUserId);
}

export function isRequirePasswordEnabled(userId: string) {
  return localStorage.getItem(getRequirePasswordKey(userId)) === "true";
}

export function setRequirePassword(userId: string, enabled: boolean) {
  localStorage.setItem(getRequirePasswordKey(userId), String(enabled));

  if (!enabled) {
    sessionStorage.removeItem(getPasswordUnlockedKey(userId));
  }
}

export function isPasswordUnlocked(userId: string) {
  return sessionStorage.getItem(getPasswordUnlockedKey(userId)) === "true";
}

export function markPasswordUnlocked(userId: string) {
  sessionStorage.setItem(getPasswordUnlockedKey(userId), "true");
}

export async function verifyCurrentUserPassword(payload: {
  userId: string;
  password: string;
}) {
  const user = await db.users.get(payload.userId);

  if (!user) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const passwordHash = await hashPassword(payload.password);

  if (passwordHash !== user.passwordHash) {
    throw new Error("Mật khẩu không đúng");
  }

  return user;
}

export function clearPasswordUnlocked(userId: string) {
  sessionStorage.removeItem(getPasswordUnlockedKey(userId));
}

export function isSalaryLockEnabled(userId: string) {
  return localStorage.getItem(getSalaryLockKey(userId)) === "true";
}

export function setSalaryLockEnabled(userId: string, enabled: boolean) {
  localStorage.setItem(getSalaryLockKey(userId), String(enabled));

  if (!enabled) {
    sessionStorage.removeItem(getSalaryUnlockedKey(userId));
  }
}

export function isSalaryUnlocked(userId: string) {
  return sessionStorage.getItem(getSalaryUnlockedKey(userId)) === "true";
}

export function markSalaryUnlocked(userId: string) {
  sessionStorage.setItem(getSalaryUnlockedKey(userId), "true");
}

export function clearSalaryUnlocked(userId: string) {
  sessionStorage.removeItem(getSalaryUnlockedKey(userId));
}