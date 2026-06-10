import { useEffect, useState } from "react";
import { Button, Form, Input, Modal, Skeleton, Switch, message } from "antd";
import {
  RightOutlined,
  LogoutOutlined,
  CloudOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import type { User } from "../database/db";
import {
  getCurrentUser,
  isRequirePasswordEnabled,
  isSalaryLockEnabled,
  logout,
  setRequirePassword,
  setSalaryLockEnabled,
} from "../features/auth/services/authService";

import {
  cloudLogin,
  cloudLogout,
  cloudRegister,
  getCloudSession,
} from "../features/cloud/services/cloudAuthService";
import {
  compareLocalAndCloudData,
  pullAllCloudDataToLocal,
  pushAllLocalDataToCloud,
} from "../features/cloud/services/cloudSyncService";

import {
  FaCloud,
  FaCloudDownloadAlt,
  FaCloudUploadAlt,
  FaLock,
  FaMoneyBillWave,
} from "react-icons/fa";
import { SiSimpleanalytics } from "react-icons/si";
import { MdCloudDone, MdOutlinePassword } from "react-icons/md";

type CloudFormValues = {
  email: string;
  password: string;
};

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

  const [cloudForm] = Form.useForm<CloudFormValues>();
  const [salaryLock, setSalaryLock] = useState(false);

  const [loading, setLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [requirePassword, setRequirePasswordState] = useState(false);

  const [cloudEmail, setCloudEmail] = useState<string | null>(null);
  const [cloudModalOpen, setCloudModalOpen] = useState(false);

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
        setSalaryLock(isSalaryLockEnabled(currentUser.id));
        await loadCloudSession();
      } catch (error) {
        message.error("Không thể tải thông tin tài khoản");
      } finally {
        setLoading(false);
      }
    };

    initPage();
  }, [navigate]);

  const loadCloudSession = async () => {
    const session = await getCloudSession();

    if (session?.user?.email) {
      setCloudEmail(session.user.email);
    } else {
      setCloudEmail(null);
    }
  };

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

  const handleToggleSalaryLock = (checked: boolean) => {
    if (!user?.id) {
      message.error("Bạn cần đăng nhập lại");
      navigate("/login");
      return;
    }

    setSalaryLockEnabled(user?.id, checked);
    setSalaryLock(checked);

    message.success(checked ? "Đã bật khóa Ví lương" : "Đã tắt khóa Ví lương");
  };

  const handleCloudRegister = async () => {
    try {
      const values = await cloudForm.validateFields();

      setCloudLoading(true);

      await cloudRegister({
        email: values.email,
        password: values.password,
      });

      await loadCloudSession();

      message.success(
        "Đăng ký cloud thành công. Nếu Supabase yêu cầu xác nhận email, bạn hãy kiểm tra email trước khi đăng nhập.",
      );

      setCloudModalOpen(false);
      cloudForm.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đăng ký cloud thất bại",
      );
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudLogin = async () => {
    try {
      const values = await cloudForm.validateFields();

      setCloudLoading(true);

      await cloudLogin({
        email: values.email,
        password: values.password,
      });

      await loadCloudSession();

      message.success("Đăng nhập cloud thành công");
      setCloudModalOpen(false);
      cloudForm.resetFields();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đăng nhập cloud thất bại",
      );
    } finally {
      setCloudLoading(false);
    }
  };

  const handleCloudLogout = async () => {
    try {
      setCloudLoading(true);

      await cloudLogout();
      await loadCloudSession();

      message.success("Đã đăng xuất tài khoản cloud");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đăng xuất cloud thất bại",
      );
    } finally {
      setCloudLoading(false);
    }
  };

  const handleSyncToCloud = async () => {
    try {
      if (!user) return;

      if (!cloudEmail) {
        message.warning("Bạn cần đăng nhập tài khoản cloud trước");
        setCloudModalOpen(true);
        return;
      }

      setSyncLoading(true);

      await pushAllLocalDataToCloud(user.id);

      message.success("Đã đồng bộ toàn bộ dữ liệu local lên Supabase");
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đồng bộ cloud thất bại",
      );
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCompareCloud = async () => {
    try {
      if (!user) return;

      if (!cloudEmail) {
        message.warning("Bạn cần đăng nhập tài khoản cloud trước");
        return;
      }

      const result = await compareLocalAndCloudData(user.id);

      console.log("So sánh local/cloud:", result);

      const allMatched =
        result.wallets.matched &&
        result.categories.matched &&
        result.transactions.matched &&
        result.savingTransactions.matched &&
        result.salaryRecords.matched &&
        result.savingGoals.matched &&
        result.notifications.matched &&
        result.appSettings.matched;

      if (allMatched) {
        message.success("Dữ liệu cloud đã khớp toàn bộ với local");
        return;
      }

      Modal.info({
        title: "Dữ liệu chưa khớp",
        centered: true,
        width: 420,
        content: (
          <div className="mt-3 text-sm leading-6">
            <div>
              Ví: local {result.wallets.local} / cloud {result.wallets.cloud}
            </div>
            <div>
              Nhóm: local {result.categories.local} / cloud{" "}
              {result.categories.cloud}
            </div>
            <div>
              Giao dịch: local {result.transactions.local} / cloud{" "}
              {result.transactions.cloud}
            </div>
            <div>
              Giao dịch tiết kiệm: local {result.savingTransactions.local} /
              cloud {result.savingTransactions.cloud}
            </div>
            <div>
              Mục tiêu tiết kiệm: local {result.savingGoals.local} / cloud{" "}
              {result.savingGoals.cloud}
            </div>
            <div>
              Thông báo: local {result.notifications.local} / cloud{" "}
              {result.notifications.cloud}
            </div>
            <div>
              Cài đặt: local {result.appSettings.local} / cloud{" "}
              {result.appSettings.cloud}
            </div>
            <div className="mt-3 text-xs text-gray-400">
              Mở Console để xem chi tiết missingOnCloud / extraOnCloud.
            </div>
            <div>
              Ví lương: local {result.salaryRecords.local} / cloud{" "}
              {result.salaryRecords.cloud}
            </div>
          </div>
        ),
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể kiểm tra cloud",
      );
    }
  };

  const handlePullFromCloud = async () => {
    try {
      if (!user) return;

      if (!cloudEmail) {
        message.warning("Bạn cần đăng nhập tài khoản cloud trước");
        setCloudModalOpen(true);
        return;
      }

      Modal.confirm({
        title: "Tải dữ liệu từ cloud?",
        content:
          "Dữ liệu local hiện tại của tài khoản này sẽ được thay bằng dữ liệu trên Supabase. Bạn nên chỉ dùng thao tác này trên máy mới hoặc khi muốn khôi phục dữ liệu.",
        okText: "Tải về",
        cancelText: "Hủy",
        centered: true,
        onOk: async () => {
          const result = await pullAllCloudDataToLocal(user.id);

          message.success(
            `Đã tải dữ liệu cloud: ${result.transactions} giao dịch, ${result.categories} nhóm, ${result.wallets} ví`,
          );

          navigate("/dashboard", { replace: true });
        },
      });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể tải dữ liệu cloud",
      );
    }
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

                <div className="flex justify-center flex-col items-center">
                  <div className="mb-1 flex items-center gap-2">
                    <h2 className="m-0 text-center text-[17px] font-bold">
                      {user?.username || "Người dùng"}
                    </h2>
                  </div>

                  {cloudEmail && (
                    <div className="text-center text-[12px] font-medium text-[#895BFF]">
                      Cloud: {cloudEmail}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mb-6">
            <h3 className="mb-3 ml-2 text-[14px] font-bold text-gray-500">
              Tài chính cá nhân
            </h3>

            <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <MenuRow
                icon={<FaMoneyBillWave />}
                title="Ví lương"
                subtitle="Quản lý lương, thưởng và hoàn thuế"
                onClick={() => navigate("/salary")}
              />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 ml-2 text-[14px] font-bold text-gray-500">
              Tài khoản cloud
            </h3>

            <div className="overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              {!cloudEmail ? (
                <MenuRow
                  icon={<CloudOutlined />}
                  title="Đăng nhập cloud"
                  subtitle="Liên kết Supabase để đồng bộ dữ liệu"
                  onClick={() => setCloudModalOpen(true)}
                />
              ) : (
                <>
                  <div className="border-b border-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-[22px] text-[#895BFF]">
                        <FaCloud />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[15px] font-semibold text-[#1A1C29]">
                          Đã đăng nhập cloud
                        </div>
                        <div className="mt-0.5 truncate text-[13px] text-gray-400">
                          {cloudEmail}
                        </div>
                      </div>
                    </div>
                  </div>

                  <MenuRow
                    icon={<FaCloudUploadAlt />}
                    title={
                      syncLoading
                        ? "Đang đồng bộ..."
                        : "Đồng bộ toàn bộ dữ liệu"
                    }
                    subtitle="Đẩy ví, nhóm, giao dịch, tiết kiệm, mục tiêu và thông báo lên Supabase"
                    onClick={syncLoading ? undefined : handleSyncToCloud}
                  />

                  <MenuRow
                    icon={<MdCloudDone />}
                    title="Kiểm tra dữ liệu cloud"
                    subtitle="So sánh số lượng và ID giữa local và Supabase"
                    onClick={handleCompareCloud}
                  />

                  <MenuRow
                    icon={<FaCloudDownloadAlt />}
                    title="Tải dữ liệu từ cloud"
                    subtitle="Khôi phục dữ liệu Supabase về máy hiện tại"
                    onClick={handlePullFromCloud}
                  />

                  <MenuRow
                    icon={<LogoutOutlined />}
                    title="Đăng xuất cloud"
                    subtitle="Chỉ đăng xuất cloud, không đăng xuất app local"
                    onClick={handleCloudLogout}
                    danger
                  />
                 
                </>
              )}
            </div>
          </div>

           <div
                    onClick={() => {
                      setCloudModalOpen(false);
                      navigate("/cloud-forgot-password");
                    }}
                    className="mt-3 cursor-pointer text-center text-[13px] font-bold text-[#895BFF]"
                  >
                    Quên mật khẩu cloud?
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

              <SwitchRow
                icon={<LockOutlined />}
                title="Khóa Ví lương"
                subtitle="Yêu cầu mật khẩu khi truy cập lương, thưởng và hoàn thuế"
                checked={salaryLock}
                onChange={handleToggleSalaryLock}
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

      <Modal
        title={
          <span className="text-[18px] font-black text-[#111438]">
            Tài khoản cloud
          </span>
        }
        open={cloudModalOpen}
        onCancel={() => setCloudModalOpen(false)}
        footer={null}
        centered
      >
        <div className="pt-3">
          <div className="mb-5 rounded-2xl bg-[#F7F8FF] p-4 text-[13px] leading-5 text-gray-500">
            Dùng tài khoản cloud để đồng bộ dữ liệu Money Note lên Supabase. Tài
            khoản local hiện tại của bạn vẫn được giữ nguyên.
          </div>

          <Form form={cloudForm} layout="vertical" requiredMark={false}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email",
                },
                {
                  type: "email",
                  message: "Email không hợp lệ",
                },
              ]}
            >
              <Input
                placeholder="Nhập email cloud"
                autoComplete="email"
                className="h-11 rounded-xl"
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu",
                },
                {
                  min: 6,
                  message: "Mật khẩu tối thiểu 6 ký tự",
                },
              ]}
            >
              <Input.Password
                placeholder="Nhập mật khẩu cloud"
                autoComplete="current-password"
                className="h-11 rounded-xl"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleCloudRegister}
                loading={cloudLoading}
                className="h-11 rounded-xl font-bold"
              >
                Đăng ký
              </Button>

              <Button
                type="primary"
                onClick={handleCloudLogin}
                loading={cloudLoading}
                className="h-11 rounded-xl bg-[#895BFF] font-bold"
              >
                Đăng nhập
              </Button>
            </div>
          </Form>
        </div>
      </Modal>
    </div>
  );
}

export default AccountScreen;
