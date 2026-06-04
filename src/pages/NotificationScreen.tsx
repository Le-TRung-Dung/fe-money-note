import { useEffect, useState } from "react";
import { Badge, Button, Empty, Skeleton, message } from "antd";
import {
  ArrowLeftOutlined,
  BellOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import type { AppNotification } from "../database/db";
import {
  getNotificationsByUser,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../features/notifications/services/notificationService";

function NotificationScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login");
        return;
      }

      setLoading(true);

      const data = await getNotificationsByUser(currentUserId);
      setNotifications(data);
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải thông báo",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    try {
      if (!currentUserId) return;

      await markAllNotificationsAsRead(currentUserId);
      await loadData();
    } catch (error) {
      message.error("Không thể đánh dấu đã đọc");
    }
  };

  const handleClickNotification = async (item: AppNotification) => {
    try {
      if (!item.isRead) {
        await markNotificationAsRead(item.id);
      }

      if (item.actionUrl) {
        navigate(item.actionUrl);
        return;
      }

      await loadData();
    } catch (error) {
      message.error("Không thể mở thông báo");
    }
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5 pt-8">
        <Skeleton active avatar paragraph={{ rows: 8 }} />
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#F7F9FF] font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-64 w-64 -translate-x-1/3 -translate-y-1/3 rounded-full bg-[#E0E7FF] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-72 w-72 translate-x-1/3 rounded-full bg-[#F3E8FF] opacity-60 blur-[80px]" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[760px] flex-col px-5 pt-8">
        
        <div className="mb-6 flex shrink-0 items-center justify-between">
          <ArrowLeftOutlined
            className="cursor-pointer text-xl text-[#111438]"
            onClick={() => navigate("/dashboard")}
          />

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">
              Thông báo
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              {unreadCount > 0
                ? `${unreadCount} thông báo chưa đọc`
                : "Bạn đã đọc hết thông báo"}
            </div>
          </div>

          <Badge count={unreadCount} size="small">
            <BellOutlined className="text-xl text-[#111438]" />
          </Badge>
        </div>

        {notifications.length > 0 && (
          <div className="mb-5 flex shrink-0 justify-end">
            <Button
              onClick={handleReadAll}
              style={{
                borderRadius: 14,
                fontWeight: 700,
              }}
            >
              Đánh dấu đã đọc
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-28">
          {notifications.length === 0 ? (
            <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
              <Empty description="Chưa có thông báo nào" />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleClickNotification(item)}
                  className={`flex cursor-pointer items-start gap-3 rounded-[22px] border p-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition hover:bg-[#FAFAFF] ${
                    item.isRead
                      ? "border-white bg-white"
                      : "border-[#E9E5FF] bg-[#F8F6FF]"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${
                      item.isRead
                        ? "bg-gray-100 text-gray-400"
                        : "bg-[#F0EEFF] text-[#895BFF]"
                    }`}
                  >
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-start justify-between gap-3">
                      <div className="text-[15px] font-black text-[#111438]">
                        {item.title}
                      </div>

                      {!item.isRead && (
                        <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#895BFF]" />
                      )}
                    </div>

                    <div className="text-[13px] font-medium leading-5 text-gray-500">
                      {item.description}
                    </div>

                    <div className="mt-2 text-[12px] font-semibold text-gray-400">
                      {formatNotificationTime(item.createdAt)}
                    </div>
                  </div>

                  {item.actionUrl && (
                    <RightOutlined className="mt-3 text-xs text-gray-300" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ... các hàm helper bên dưới giữ nguyên ...
function getNotificationIcon(type: AppNotification["type"]) {
  if (type === "welcome") return <GiftOutlined />;
  if (type === "first_transaction") return "📝";
  if (type === "first_saving") return "💰";
  if (type === "first_goal") return "🎯";
  if (type === "inactive") return "⏰";
  if (type === "fun") return "✨";

  return <CheckCircleOutlined />;
}

function formatNotificationTime(createdAt: string) {
  const date = dayjs(createdAt);

  if (date.isSame(dayjs(), "day")) {
    return `Hôm nay · ${date.format("HH:mm")}`;
  }

  if (date.isSame(dayjs().subtract(1, "day"), "day")) {
    return `Hôm qua · ${date.format("HH:mm")}`;
  }

  return date.format("DD/MM/YYYY · HH:mm");
}

export default NotificationScreen;