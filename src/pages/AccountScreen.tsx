import { useEffect, useState } from "react";
import { Button, Card, Modal, Skeleton, Typography, message } from "antd";
import {
  ArrowLeftOutlined,
  LogoutOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { User } from "../database/db";
import {
  getCurrentUser,
  logout,
} from "../features/auth/services/authService";

const { Title, Text } = Typography;

function AccountScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          message.error("Bạn cần đăng nhập lại");
          navigate("/login");
          return;
        }

        setUser(currentUser);
      } catch (error) {
        message.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  const handleLogout = () => {
    Modal.confirm({
      title: "Đăng xuất tài khoản",
      content:
        "Bạn có chắc muốn đăng xuất không? Dữ liệu local vẫn được giữ nguyên trên máy.",
      okText: "Đăng xuất",
      cancelText: "Hủy",
      okButtonProps: {
        danger: true,
      },
      centered: true,
      onOk: () => {
        logout();
        message.success("Đã đăng xuất");
        navigate("/login");
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FF] p-5">
        <Skeleton active avatar paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F9FF] px-5 py-8">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E0E7FF] blur-[80px] opacity-70" />
      <div className="pointer-events-none absolute right-0 top-16 h-80 w-80 translate-x-1/3 rounded-full bg-[#F3E8FF] blur-[80px] opacity-70" />

      <div className="relative z-10 mx-auto max-w-[760px]">
        <div className="mb-5 flex items-center justify-between">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/app/dashboard")}
          >
            Quay lại
          </Button>
        </div>

        <div className="mb-6">
          <Title level={2} style={{ marginBottom: 4, color: "#111438" }}>
            Tài khoản
          </Title>
          <Text type="secondary">
            Quản lý thông tin tài khoản local của bạn
          </Text>
        </div>

        <Card
          className="mb-5 border-none shadow-[0_10px_35px_rgba(91,98,255,0.08)]"
          style={{
            borderRadius: 28,
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F0EEFF] text-[#895BFF]">
              <UserOutlined className="text-3xl" />
            </div>

            <div>
              <div className="text-sm font-medium text-gray-400">
                Tên đăng nhập
              </div>
              <div className="text-[22px] font-black text-[#111438]">
                {user?.username}
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="mb-5 border-none shadow-[0_10px_35px_rgba(91,98,255,0.08)]"
          style={{
            borderRadius: 28,
          }}
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ECFDF5] text-[#16A34A]">
              <SafetyOutlined className="text-xl" />
            </div>

            <div>
              <div className="font-black text-[#111438]">Bảo mật</div>
              <div className="text-sm text-gray-400">
                Mật khẩu được lưu dạng hash trong IndexedDB
              </div>
            </div>
          </div>

          <Button
            block
            onClick={() => navigate("/forgot-password")}
            style={{
              height: 44,
              borderRadius: 16,
              fontWeight: 700,
            }}
          >
            Đổi / đặt lại mật khẩu
          </Button>
        </Card>

        <Card
          className="border-none shadow-[0_10px_35px_rgba(91,98,255,0.08)]"
          style={{
            borderRadius: 28,
          }}
        >
          <div className="mb-4">
            <div className="font-black text-[#111438]">Đăng xuất</div>
            <div className="text-sm text-gray-400">
              Đăng xuất chỉ xóa phiên đăng nhập hiện tại, không xóa dữ liệu.
            </div>
          </div>

          <Button
            danger
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{
              height: 48,
              borderRadius: 16,
              fontWeight: 800,
            }}
          >
            Đăng xuất tài khoản
          </Button>
        </Card>
      </div>
    </div>
  );
}

export default AccountScreen;