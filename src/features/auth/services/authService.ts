import { db } from '../../../database/db';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import { createId } from '../../../shared/utils/id';
import { hashPassword } from '../../../shared/utils/password';
import type { LoginPayload, RegisterPayload } from '../types';

export async function register(payload: RegisterPayload) {
  const username = payload.username.trim().toLowerCase();
  const password = payload.password.trim();

  if (!username) {
    throw new Error('Vui lòng nhập tên đăng nhập');
  }

  if (!password) {
    throw new Error('Vui lòng nhập mật khẩu');
  }

  if (password.length < 6) {
    throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
  }

  const existedUser = await db.users.where('username').equals(username).first();

  if (existedUser) {
    throw new Error('Tên đăng nhập đã tồn tại');
  }

  const now = new Date().toISOString();

  const user = {
    id: createId('user'),
    username,
    passwordHash: await hashPassword(password),
    createdAt: now,
    updatedAt: now,
  };

  await db.users.add(user);

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

  return user;
}

export async function login(payload: LoginPayload) {
  const username = payload.username.trim().toLowerCase();
  const password = payload.password.trim();

  if (!username) {
    throw new Error('Vui lòng nhập tên đăng nhập');
  }

  if (!password) {
    throw new Error('Vui lòng nhập mật khẩu');
  }

  const user = await db.users.where('username').equals(username).first();

  if (!user) {
    throw new Error('Tài khoản không tồn tại');
  }

  const passwordHash = await hashPassword(password);

  if (user.passwordHash !== passwordHash) {
    throw new Error('Mật khẩu không đúng');
  }

  localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);

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