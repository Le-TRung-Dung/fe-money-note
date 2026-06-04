import React, { useState } from "react";
import {
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { CiLock } from "react-icons/ci";
import { MdPersonOutline } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { resetPassword } from "../features/auth/services/authService";

const { Title, Text } = Typography;

type ForgotPasswordFormValues = {
  username: string;
  newPassword: string;
  confirmPassword: string;
};

const ForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const isChangePassword = location.state?.isChangePassword;

  const onFinish = async (values: ForgotPasswordFormValues) => {
    try {
      if (values.newPassword !== values.confirmPassword) {
        message.error("Mật khẩu nhập lại không khớp");
        return;
      }

      setLoading(true);

      await resetPassword({
        username: values.username,
        newPassword: values.newPassword,
      });

      if (isChangePassword) {
        message.success("Đổi mật khẩu thành công.");
        navigate("/account");
      } else {
        message.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại");
        navigate("/login");
      }
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4F55FF",
          borderRadius: 18,
          fontFamily:
            'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Button: {
            controlHeightLG: 58,
            borderRadiusLG: 18,
            fontWeight: 700,
          },
          Input: {
            controlHeightLG: 58,
            borderRadiusLG: 18,
            colorBorder: "#E3E6F5",
            colorBgContainer: "#FFFFFF",
            colorTextPlaceholder: "#969AB8",
          },
          Form: {
            itemMarginBottom: 22,
          },
        },
      }}
    >
      <div className="relative min-h-[100svh] w-full overflow-hidden bg-[#FAFAFF] px-5 py-8 font-sans text-[#080C35]">
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#D7C8FF] blur-sm opacity-75" />
        <div className="pointer-events-none absolute -left-28 top-[45%] h-64 w-64 rounded-full bg-[#DDEAFF] opacity-90" />
        <div className="pointer-events-none absolute bottom-16 right-[-120px] h-80 w-80 rounded-full bg-[#EEF3FF] opacity-95" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-[560px] flex-col justify-center">
          <div className="mb-5 flex items-center justify-center">
            <img
              onClick={() => navigate("/landing")}
              className="h-[90px] cursor-pointer"
              src={logo}
              alt="Money Note"
            />
          </div>

          <Card
            className="rounded-[42px] bg-white/95 px-4 py-4 shadow-[0_26px_70px_rgba(91,98,255,0.13)] backdrop-blur-xl"
            style={{
              borderRadius: 42,
            }}
          >
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() =>
                isChangePassword ? navigate(-1) : navigate("/login")
              }
              className="mb-4 p-0"
            >
              {isChangePassword ? "Quay lại" : "Quay lại đăng nhập"}
            </Button>

            <div className="mb-8 text-center">
              <Title level={2} style={{ marginBottom: 8, color: "#070B35" }}>
                {isChangePassword ? "Đổi mật khẩu" : "Quên mật khẩu"}
              </Title>
              <Text type="secondary">
                {isChangePassword
                  ? "Nhập tên đăng nhập hiện tại và tạo mật khẩu mới."
                  : "Nhập tên đăng nhập và tạo mật khẩu mới. Dữ liệu cũ sẽ được giữ nguyên."}
              </Text>
            </div>

            <Form
              name="forgot-password"
              layout="vertical"
              size="large"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                label="Tên đăng nhập"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tên đăng nhập",
                  },
                ]}
              >
                <Input
                  prefix={
                    <MdPersonOutline className="mr-3 text-[24px] text-[#545BFF]" />
                  }
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  className="money-input"
                />
              </Form.Item>

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu mới",
                  },
                  {
                    min: 6,
                    message: "Mật khẩu mới tối thiểu 6 ký tự",
                  },
                ]}
              >
                <Input.Password
                  prefix={
                    <CiLock className="mr-3 text-[24px] text-[#545BFF]" />
                  }
                  placeholder="Nhập mật khẩu mới"
                  autoComplete="new-password"
                  className="money-input"
                  iconRender={(visible) =>
                    visible ? (
                      <EyeTwoTone twoToneColor="#8E92AD" />
                    ) : (
                      <EyeInvisibleOutlined style={{ color: "#8E92AD" }} />
                    )
                  }
                />
              </Form.Item>

              <Form.Item
                label="Nhập lại mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập lại mật khẩu mới",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(
                        new Error("Mật khẩu nhập lại không khớp"),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={
                    <CiLock className="mr-3 text-[24px] text-[#545BFF]" />
                  }
                  placeholder="Nhập lại mật khẩu mới"
                  autoComplete="new-password"
                  className="money-input"
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
                className="forgot-main-button"
              >
                {isChangePassword
                  ? "Xác nhận đổi mật khẩu"
                  : "Đặt lại mật khẩu"}
              </Button>
            </Form>

            <div className="mt-5 rounded-2xl bg-[#F7F8FF] p-4 text-sm font-medium text-[#737895]">
              Lưu ý: Đây là tài khoản local trên máy của bạn. App chỉ đổi mật
              khẩu trong IndexedDB, không xóa ví, giao dịch, tiết kiệm hay mục
              tiêu cũ.
            </div>
          </Card>
        </div>

        <style>{`
          .money-input.ant-input-affix-wrapper {
            height: 50px;
            border-radius: 18px;
            border: 1.5px solid #E3E6F5;
            background: rgba(255, 255, 255, 0.92);
            padding: 0 18px;
            box-shadow: none;
            transition: all 0.25s ease;
          }

          .money-input.ant-input-affix-wrapper:hover {
            border-color: #B7BDFF;
            background: #FFFFFF;
          }

          .money-input.ant-input-affix-wrapper-focused,
          .money-input.ant-input-affix-wrapper:focus-within {
            border-color: #5863FF;
            box-shadow: 0 0 0 4px rgba(88, 99, 255, 0.12);
            background: #FFFFFF;
          }

          .money-input .ant-input {
            font-size: 17px;
            font-weight: 500;
            color: #111438;
            background: transparent;
          }

          .forgot-main-button {
            height: 50px !important;
            border: none !important;
            border-radius: 20px !important;
            background: linear-gradient(90deg, #895BFF 0%, #3453FF 100%) !important;
            font-size: 18px !important;
            font-weight: 900 !important;
            color: #FFFFFF !important;
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default ForgotPasswordScreen;
