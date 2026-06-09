export const STORAGE_KEYS = {
  CURRENT_USER_ID: "money_note_current_user_id",

  REQUIRE_PASSWORD_PREFIX: "money_note_require_password_",
  PASSWORD_UNLOCK_PREFIX: "money_note_password_unlocked_",

  SALARY_LOCK_PREFIX: "money_note_salary_lock_",
  SALARY_UNLOCK_PREFIX: "money_note_salary_unlocked_",
};

export function getRequirePasswordKey(userId: string) {
  return `${STORAGE_KEYS.REQUIRE_PASSWORD_PREFIX}${userId}`;
}

export function getPasswordUnlockedKey(userId: string) {
  return `${STORAGE_KEYS.PASSWORD_UNLOCK_PREFIX}${userId}`;
}

export function getSalaryLockKey(userId: string) {
  return `${STORAGE_KEYS.SALARY_LOCK_PREFIX}${userId}`;
}

export function getSalaryUnlockedKey(userId: string) {
  return `${STORAGE_KEYS.SALARY_UNLOCK_PREFIX}${userId}`;
}

export const categoryIconOptions = [
  "🍜",
  "☕",
  "🛵",
  "🚕",
  "🛍️",
  "🧾",
  "🏠",
  "🎮",
  "💊",
  "📚",
  "💼",
  "🎁",
  "💻",
  "📈",
  "💰",
  "💸",
  "📥",
  "📤",
  "🤝",
  "✨",
];
