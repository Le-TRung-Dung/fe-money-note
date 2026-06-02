import { db } from "./db";
import { createId } from "../shared/utils/id";

export async function ensureDefaultDataForUser(userId: string) {
  const now = new Date().toISOString();

  const defaultWallet = await db.wallets
    .where("userId")
    .equals(userId)
    .filter((wallet) => wallet.isDefault)
    .first();

  if (!defaultWallet) {
    await db.wallets.add({
      id: createId("wallet"),
      userId,
      name: "Ví chi tiêu",
      type: "expense_wallet",
      balance: 0,
      currency: "VND",
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  const categoryCount = await db.categories
    .where("userId")
    .equals(userId)
    .count();

  if (categoryCount > 0) {
    return;
  }

  const expenseCategories = [
    { name: "Ăn uống", icon: "🍜", color: "#f97316" },
    { name: "Đi lại", icon: "🛵", color: "#06b6d4" },
    { name: "Mua sắm", icon: "🛍️", color: "#ec4899" },
    { name: "Hóa đơn", icon: "🧾", color: "#ef4444" },
    { name: "Nhà cửa", icon: "🏠", color: "#8b5cf6" },
    { name: "Sức khỏe", icon: "💊", color: "#dc2626" },
    { name: "Giải trí", icon: "🎮", color: "#14b8a6" },
    { name: "Học tập", icon: "📚", color: "#3b82f6" },
    { name: "Khác", icon: "✨", color: "#6b7280" },
  ];

  const incomeCategories = [
    { name: "Lương", icon: "💼", color: "#16a34a" },
    { name: "Thưởng", icon: "🎁", color: "#84cc16" },
    { name: "Freelance", icon: "💻", color: "#0ea5e9" },
    { name: "Đầu tư", icon: "📈", color: "#6366f1" },
    { name: "Được cho/tặng", icon: "🤝", color: "#22c55e" },
    { name: "Khác", icon: "✨", color: "#6b7280" },
  ];

  const debtCategories = [
    { name: "Tôi vay", icon: "📥", color: "#2563eb" },
    { name: "Tôi cho vay", icon: "📤", color: "#f59e0b" },
    { name: "Tôi trả nợ", icon: "💸", color: "#ef4444" },
    { name: "Người khác trả tôi", icon: "💰", color: "#16a34a" },
  ];

  const categories = [
    ...expenseCategories.map((item) => ({
      id: createId("category"),
      userId,
      name: item.name,
      icon: item.icon,
      color: item.color,
      type: "expense" as const,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })),

    ...incomeCategories.map((item) => ({
      id: createId("category"),
      userId,
      name: item.name,
      icon: item.icon,
      color: item.color,
      type: "income" as const,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })),

    ...debtCategories.map((item) => ({
      id: createId("category"),
      userId,
      name: item.name,
      icon: item.icon,
      color: item.color,
      type: "debt" as const,
      isDefault: true,
      createdAt: now,
      updatedAt: now,
    })),
  ];

  await db.categories.bulkAdd(categories);
}