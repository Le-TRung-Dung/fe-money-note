import { useEffect, useState } from "react";
import { Modal, Skeleton, Switch, message } from "antd";
import { RightOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { User } from "../database/db";
import {
  getCurrentUser,
  isRequirePasswordEnabled,
  logout,
  setRequirePassword,
} from "../features/auth/services/authService";

import { FaLock } from "react-icons/fa";
import { SiSimpleanalytics } from "react-icons/si";
import { MdOutlinePassword } from "react-icons/md";

const MenuRow = ({ icon, title, subtitle, onClick, danger = false }: any) => (
  <div
    onClick={onClick}
    className="flex cursor-pointer items-center border-b border-gray-50 p-4 transition-colors last:border-0 active:bg-gray-50"
  >
    <div
      className={`mr-4 text-[22px] ${
        danger ? "text-red-500" : "text-gray-700"
      }`}
    >
      {icon}
    </div>

    <div className="flex-1">
      <div
        className={`text-[15px] font-semibold ${
          danger ? "text-red-500" : "text-[#1A1C29]"
        }`}
      >
        {title}
      </div>

      {subtitle && (
        <div className="mt-0.5 text-[13px] text-gray-400">{subtitle}</div>
      )}
    </div>

    <RightOutlined className="text-[12px] text-gray-300" />
  </div>
);

const SwitchRow = ({
  icon,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center border-b border-gray-50 p-4 last:border-0">
    <div className="mr-4 text-[22px] text-gray-700">{icon}</div>

    <div className="min-w-0 flex-1 pr-3">
      <div className="text-[15px] font-semibold text-[#1A1C29]">{title}</div>

      <div className="mt-0.5 text-[13px] leading-5 text-gray-400">
        {subtitle}
      </div>
    </div>

    <Switch checked={checked} onChange={onChange} />
  </div>
);

function AccountScreen() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [requirePassword, setRequirePasswordState] = useState(false);

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
        setRequirePasswordState(isRequirePasswordEnabled(currentUser.id));
      } catch (error) {
        message.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  const handleToggleRequirePassword = (checked: boolean) => {
    if (!user) return;

    setRequirePassword(user.id, checked);
    setRequirePasswordState(checked);

    message.success(
      checked
        ? "Đã bật hỏi mật khẩu mỗi lần truy cập"
        : "Đã tắt hỏi mật khẩu mỗi lần truy cập",
    );
  };

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
      <div className="flex justify-center p-5 pt-20">
        <div className="w-full max-w-[480px]">
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-[#1A1C29]">
      <div className="relative mx-auto max-w-[480px]">
        <div className="flex items-center justify-between px-5 pb-4 pt-5" />

        <div className="px-5">
          <div className="mb-6 rounded-[24px] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <div
              className="mb-6 flex cursor-pointer items-center justify-center"
              onClick={() => navigate("/profile")}
            >
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200">
                  <img
                    src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix&backgroundColor=f3f4f6"
                    alt="avatar"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="m-0 text-center text-[17px] font-bold">
                      {user?.username || "Người dùng"}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 ml-2 text-[14px] font-bold text-gray-500">
              Cài đặt
            </h3>

            <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
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

              <SwitchRow
                icon={<MdOutlinePassword />}
                title="Hỏi mật khẩu khi mở app"
                subtitle="Khi bật, mỗi lần mở lại ứng dụng sẽ cần nhập mật khẩu để tiếp tục."
                checked={requirePassword}
                onChange={handleToggleRequirePassword}
              />

              <MenuRow
                icon={<SiSimpleanalytics />}
                title="Thống kê giao dịch"
                subtitle="Thống kê và xuất file Excel"
                onClick={() => navigate("/statistics")}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 ml-2 text-[14px] font-bold text-gray-500">
              Tài khoản
            </h3>

            <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <MenuRow
                icon={<LogoutOutlined />}
                title="Đăng xuất"
                subtitle="Đăng xuất khỏi ứng dụng"
                onClick={handleLogout}
                danger={true}
              />
            </div>
          </div>

          <div className="flex items-center justify-center pb-4 text-[13px] text-gray-400">
            Phiên bản 1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountScreen;