import { useEffect, useState } from "react";
import { Modal, Skeleton, message } from "antd";
import {
  BellOutlined,
  RightOutlined,
  UserOutlined,
  LockOutlined,
  BgColorsOutlined,
  CloudUploadOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { User } from "../database/db";
import { getCurrentUser, logout } from "../features/auth/services/authService";
import { FaLock } from "react-icons/fa";

// Component con để render từng dòng menu cài đặt
const MenuRow = ({ icon, title, subtitle, onClick, danger = false }: any) => (
  <div
    onClick={onClick}
    className="flex items-center p-4 border-b border-gray-50 last:border-0 active:bg-gray-50 cursor-pointer transition-colors"
  >
    <div
      className={`text-[22px] mr-4 ${danger ? "text-red-500" : "text-gray-700"}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <div
        className={`text-[15px] font-semibold ${danger ? "text-red-500" : "text-[#1A1C29]"}`}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-[13px] text-gray-400 mt-0.5">{subtitle}</div>
      )}
    </div>
    <RightOutlined className="text-gray-300 text-[12px]" />
  </div>
);

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
      okButtonProps: { danger: true },
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
      <div className="min-h-screen bg-[#F7F9FF] p-5 flex items-center justify-center">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    // Thêm pb-24 (padding-bottom: 6rem) để nội dung không bị che bởi Bottom Nav chung
    <div className="min-h-screen bg-[#F7F9FF] font-sans text-[#1A1C29]">
      <div className="mx-auto max-w-[480px] bg-[#F7F9FF] min-h-screen relative">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4"></div>

        <div className="px-5">
          {/* Profile Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mb-6">
            <div
              className="flex items-center justify-center mb-6 cursor-pointer"
              onClick={() => navigate("/profile")}
            >
              <div className="flex flex-col justify-center items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f3f4f6"
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-[17px] font-bold m-0 text-center">
                      {user?.username || "Người dùng"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cài đặt Group */}
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-gray-500 mb-3 ml-2">
              Cài đặt
            </h3>
            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* <MenuRow
                icon={<UserOutlined />}
                title="Thông tin cá nhân"
                subtitle="Cập nhật thông tin của bạn"
                onClick={() => navigate("/profile")}
              /> */}
              <MenuRow
                icon={<FaLock />}
                title="Bảo mật"
                subtitle="Đổi mật khẩu"
                onClick={() =>
                  navigate("/forgot-password", {
                    state: { isChangePassword: true },
                  })
                }
              />
            </div>
          </div>

          {/* Tài khoản Group */}
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-gray-500 mb-3 ml-2">
              Tài khoản
            </h3>
            <div className="bg-white rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] overflow-hidden">
              {/* <MenuRow
                icon={<SwapOutlined />}
                title="Đổi tài khoản"
                subtitle="Chuyển sang tài khoản khác"
                onClick={() => {}}
              /> */}
              <MenuRow
                icon={<LogoutOutlined />}
                title="Đăng xuất"
                subtitle="Đăng xuất khỏi ứng dụng"
                onClick={handleLogout}
                danger={true}
              />
            </div>
          </div>

          {/* App Info */}
          <div className="flex justify-center items-center text-gray-400 text-[13px] pb-4">
            Phiên bản 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountScreen;
