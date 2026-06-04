import dayjs from "dayjs";
import { db } from "../../../database/db";
import type { AppNotification, AppNotificationType } from "../../../database/db";
import { createId } from "../../../shared/utils/id";

type CreateNotificationPayload = {
  userId: string;
  type: AppNotificationType;
  title: string;
  description: string;
  actionUrl?: string;
};

type CreateNotificationWithIdPayload = CreateNotificationPayload & {
  id?: string;
};

export async function getNotificationsByUser(userId: string) {
  const notifications = await db.notifications
    .where("userId")
    .equals(userId)
    .toArray();

  return notifications.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notifications
    .where("userId")
    .equals(userId)
    .filter((item) => !item.isRead)
    .count();
}

export async function markNotificationAsRead(id: string) {
  await db.notifications.update(id, {
    isRead: true,
  });
}

export async function markAllNotificationsAsRead(userId: string) {
  const notifications = await db.notifications
    .where("userId")
    .equals(userId)
    .filter((item) => !item.isRead)
    .toArray();

  await db.transaction("rw", db.notifications, async () => {
    await Promise.all(
      notifications.map((item) =>
        db.notifications.update(item.id, {
          isRead: true,
        }),
      ),
    );
  });
}

export async function createNotification(payload: CreateNotificationPayload) {
  return createNotificationSafely({
    ...payload,
    id: createId("noti"),
  });
}

async function createNotificationSafely(
  payload: CreateNotificationWithIdPayload,
) {
  const now = new Date().toISOString();

  const notification: AppNotification = {
    id: payload.id || createId("noti"),
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    description: payload.description,
    actionUrl: payload.actionUrl,
    isRead: false,
    createdAt: now,
  };

  try {
    await db.notifications.add(notification);
    return notification;
  } catch (error: any) {
    /**
     * Nếu React StrictMode gọi useEffect 2 lần,
     * add cùng id sẽ bị trùng.
     * Mình bỏ qua lỗi này để không tạo duplicate notification.
     */
    if (error?.name === "ConstraintError") {
      return null;
    }

    throw error;
  }
}

/**
 * Dùng cho thông báo chỉ được tạo 1 lần duy nhất theo user + type.
 * Ví dụ:
 * - welcome
 * - first_transaction
 * - first_saving
 * - first_goal
 */
export async function createOnceNotification(payload: CreateNotificationPayload) {
  const fixedId = `noti_once_${payload.userId}_${payload.type}`;

  return createNotificationSafely({
    ...payload,
    id: fixedId,
  });
}

/**
 * Dùng cho thông báo chỉ tạo 1 lần/ngày.
 * Ví dụ:
 * - fun
 * - inactive
 */
async function createDailyNotification(payload: CreateNotificationPayload) {
  const todayKey = dayjs().format("YYYY-MM-DD");
  const fixedId = `noti_daily_${payload.userId}_${payload.type}_${todayKey}`;

  return createNotificationSafely({
    ...payload,
    id: fixedId,
  });
}

export async function ensureWelcomeNotification(userId: string) {
  await createOnceNotification({
    userId,
    type: "welcome",
    title: "Chào mừng bạn đến với Money Note 🎉",
    description:
      "Hãy bắt đầu bằng giao dịch đầu tiên để theo dõi chi tiêu dễ dàng hơn mỗi ngày.",
    actionUrl: "/transactions/create",
  });
}

export async function notifyFirstExpenseTransaction(userId: string) {
  const expenseCount = await db.transactions
    .where("userId")
    .equals(userId)
    .filter((item) => item.type === "expense")
    .count();

  if (expenseCount !== 1) {
    return;
  }

  await createOnceNotification({
    userId,
    type: "first_transaction",
    title: "Bạn vừa ghi giao dịch chi tiêu đầu tiên 🎯",
    description:
      "Rất tốt! Việc ghi lại từng khoản chi sẽ giúp bạn kiểm soát tiền tốt hơn.",
    actionUrl: "/transactions",
  });
}

export async function notifyFirstSavingDeposit(userId: string) {
  const depositCount = await db.savingTransactions
    .where("userId")
    .equals(userId)
    .filter((item) => item.type === "deposit")
    .count();

  if (depositCount !== 1) {
    return;
  }

  await createOnceNotification({
    userId,
    type: "first_saving",
    title: "Bạn vừa gửi tiết kiệm lần đầu 💰",
    description:
      "Một bước nhỏ hôm nay có thể tạo ra nền tảng tài chính tốt hơn sau này.",
    actionUrl: "/savings",
  });
}

export async function notifyFirstSavingGoal(userId: string) {
  const goalCount = await db.savingGoals
    .where("userId")
    .equals(userId)
    .count();

  if (goalCount !== 1) {
    return;
  }

  await createOnceNotification({
    userId,
    type: "first_goal",
    title: "Bạn vừa tạo mục tiêu tiết kiệm đầu tiên 🚀",
    description:
      "Có mục tiêu rõ ràng sẽ giúp việc tiết kiệm có động lực hơn rất nhiều.",
    actionUrl: "/savings",
  });
}

export async function checkInactiveNotification(userId: string) {
  const transactions = await db.transactions
    .where("userId")
    .equals(userId)
    .toArray();

  const savingTransactions = await db.savingTransactions
    .where("userId")
    .equals(userId)
    .toArray();

  const allRecords = [...transactions, ...savingTransactions];

  if (allRecords.length === 0) {
    return;
  }

  const latestRecord = allRecords.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  })[0];

  const diffDays = dayjs().diff(dayjs(latestRecord.createdAt), "day");

  if (diffDays >= 3) {
    await createDailyNotification({
      userId,
      type: "inactive",
      title: "Lâu rồi bạn chưa ghi chú chi tiêu đó 👀",
      description:
        "Chỉ mất vài giây để ghi lại giao dịch mới. Cập nhật hôm nay để số liệu chính xác hơn nhé.",
      actionUrl: "/transactions/create",
    });
  }
}

export async function createFunNotificationSometimes(userId: string) {
  const today = dayjs();

  /**
   * Cứ khoảng 7 ngày mới hiện 1 lần.
   * Nếu bạn đang test muốn nó hiện ngay thì đổi điều kiện này.
   */
  const dayOfYear = today.diff(today.startOf("year"), "day");

  if (dayOfYear % 7 !== 0) {
    return;
  }

  await createDailyNotification({
    userId,
    type: "fun",
    title: "Một lời nhắc nhỏ hôm nay ✨",
    description:
      "Tiền không tự biến mất đâu, chỉ là đôi khi mình quên ghi lại thôi 😄",
    actionUrl: "/transactions",
  });
}