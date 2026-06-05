import { useEffect, useState } from "react";
import { Button, Card, Form, Input, Typography, message } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import logo from "../assets/logo.png";
import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import {
  getCurrentUser,
  logout,
  markPasswordUnlocked,
  verifyCurrentUserPassword,
} from "../features/auth/services/authService";
import type { User } from "../database/db";

const { Title, Text } = Typography;

type UnlockFormValues = {
  password: string;
};

function UnlockScreen() {
  const navigate = useNavigate();
  const [form] = Form.useForm<UnlockFormValues>();

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  useEffect(() => {
    const init = async () => {
      if (!currentUserId) {
        navigate("/login", { replace: true });
        return;
      }

      const currentUser = await getCurrentUser();

      if (!currentUser) {
        navigate("/login", { replace: true });
        return;
      }

      setUser(currentUser);
    };

    init();
  }, [currentUserId, navigate]);

  const onFinish = async (values: UnlockFormValues) => {
    try {
      if (!currentUserId) {
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);

      await verifyCurrentUserPassword({
        userId: currentUserId,
        password: values.password,
      });

      markPasswordUnlocked(currentUserId);

      message.success("Mở khóa thành công");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể mở khóa",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#FAFAFF] px-5 py-8">
      <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#D7C8FF] opacity-70 blur-2xl" />
      <div className="pointer-events-none absolute -left-28 bottom-10 h-72 w-72 rounded-full bg-[#DDEAFF] opacity-80 blur-2xl" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[520px] flex-col justify-center py-6">
        <div className="mb-5 flex justify-center">
          <img src={logo} alt="Money Note" className="h-[90px]" />
        </div>

        <Card
          className="rounded-[36px] border-none bg-white/95 px-3 py-4 shadow-[0_26px_70px_rgba(91,98,255,0.13)]"
          style={{
            borderRadius: 36,
          }}
        >
          <div className="mb-7 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#F0EEFF] text-[#895BFF]">
              <LockOutlined className="text-3xl" />
            </div>

            <Title level={2} style={{ marginBottom: 8, color: "#111438" }}>
              Mở khóa ứng dụng
            </Title>

            <Text type="secondary">
              Nhập mật khẩu để tiếp tục sử dụng Money Note
            </Text>

            {user && (
              <div className="mt-3 text-sm font-bold text-[#895BFF]">
                {user.username}
              </div>
            )}
          </div>

          <Form
            form={form}
            layout="vertical"
            size="large"
            onFinish={onFinish}
            requiredMark={false}
          >
            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập mật khẩu",
                },
              ]}
            >
              <Input.Password
                autoFocus
                placeholder="Nhập mật khẩu"
                prefix={<LockOutlined className="mr-2 text-[#895BFF]" />}
                className="unlock-input"
                iconRender={(visible) =>
                  visible ? (
                    <EyeTwoTone twoToneColor="#8E92AD" />
                  ) : (
                    <EyeInvisibleOutlined style={{ color: "#8E92AD" }} />
                  )
                }
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="unlock-button"
            >
              Mở khóa
            </Button>
          </Form>

          <Button
            type="text"
            danger
            block
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="mt-3 font-bold"
          >
            Đăng nhập tài khoản khác
          </Button>
        </Card>
      </div>

      <style>{`
        .unlock-input.ant-input-affix-wrapper {
          height: 54px;
          border-radius: 18px;
          border: 1.5px solid #E3E6F5;
          padding: 0 18px;
          box-shadow: none;
        }

        .unlock-input.ant-input-affix-wrapper-focused,
        .unlock-input.ant-input-affix-wrapper:focus-within {
          border-color: #895BFF;
          box-shadow: 0 0 0 4px rgba(137, 91, 255, 0.12);
        }

        .unlock-button {
          height: 54px !important;
          border-radius: 18px !important;
          border: none !important;
          background: linear-gradient(90deg, #895BFF 0%, #3453FF 100%) !important;
          font-size: 17px !important;
          font-weight: 900 !important;
        }
      `}</style>
    </div>
  );
}

export default UnlockScreen;