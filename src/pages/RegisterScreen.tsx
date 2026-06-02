import React, { useState } from "react";
import { Form, Input, Button, ConfigProvider, message } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { CiLock } from "react-icons/ci";
import { MdPersonOutline } from "react-icons/md";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
// Thay đổi import service tương ứng với hàm đăng ký của bạn
import { register } from "../features/auth/services/authService"; 

type RegisterFormValues = {
  account: string;
  password: string;
  confirmPassword: string;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    try {
      setLoading(true);

      // Gọi API đăng ký
      await register({
        username: values.account,
        password: values.password,
      });

      message.success("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login"); // Đăng ký xong thì điều hướng về trang đăng nhập
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Đăng ký thất bại"
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
      <div className="relative min-h-screen w-full overflow-hidden bg-[#FAFAFF] font-sans text-[#080C35]">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-[#D7C8FF] blur-sm opacity-75" />
        <div className="pointer-events-none absolute -left-28 top-[45%] h-64 w-64 rounded-full bg-[#DDEAFF] opacity-90" />
        <div className="pointer-events-none absolute bottom-16 right-[-120px] h-80 w-80 rounded-full bg-[#EEF3FF] opacity-95" />

        {/* Small decoration */}
        <div className="pointer-events-none absolute left-[18%] top-[16%] text-4xl text-[#C8C4FF]">
          ✦
        </div>
        <div className="pointer-events-none absolute right-[14%] bottom-[18%] text-3xl text-[#C8C4FF]">
          ✦
        </div>

        <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-8">
          {/* Giảm -mt-16 xuống -mt-12 một chút vì form đăng ký dài hơn form đăng nhập 1 ô */}
          <div className="w-full max-w-[560px] -mt-12">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center gap-5">
              <img
                onClick={() => navigate("/landing")}
                className="h-[90px] cursor-pointer transition-transform hover:scale-105"
                src={logo}
                alt="Money Note"
              />
            </div>

            {/* Heading */}
            <div className="mb-12 text-center">
              <p className="mb-4 text-[20px] font-black leading-tight tracking-[-1px] text-[#070B35] max-sm:text-[30px]">
                Đăng ký tài khoản
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-[42px] bg-white/95 px-12 py-12 shadow-[0_26px_70px_rgba(91,98,255,0.13)] backdrop-blur-xl max-sm:rounded-[32px] max-sm:px-6 max-sm:py-8">
              <Form
                name="register"
                layout="vertical"
                size="large"
                onFinish={onFinish}
                requiredMark={false}
              >
                <Form.Item
                  name="account"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập tên đăng nhập",
                    },
                    {
                      min: 4,
                      message: "Tên đăng nhập phải có ít nhất 4 ký tự",
                    }
                  ]}
                >
                  <Input
                    prefix={
                      <MdPersonOutline className="mr-3 text-[24px] text-[#545BFF]" />
                    }
                    placeholder="Tên đăng nhập"
                    className="money-input"
                    autoComplete="username"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu",
                    },
                    {
                      min: 6,
                      message: "Mật khẩu phải có ít nhất 6 ký tự",
                    }
                  ]}
                >
                  <Input.Password
                    prefix={
                      <CiLock className="mr-3 text-[24px] text-[#545BFF]" />
                    }
                    placeholder="Mật khẩu"
                    className="money-input"
                    autoComplete="new-password"
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone twoToneColor="#8E92AD" />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: "#8E92AD" }} />
                      )
                    }
                  />
                </Form.Item>

                {/* Trường xác nhận mật khẩu */}
                <Form.Item
                  name="confirmPassword"
                  dependencies={['password']}
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng xác nhận lại mật khẩu",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={
                      <CiLock className="mr-3 text-[24px] text-[#545BFF]" />
                    }
                    placeholder="Xác nhận mật khẩu"
                    className="money-input"
                    autoComplete="new-password"
                    iconRender={(visible) =>
                      visible ? (
                        <EyeTwoTone twoToneColor="#8E92AD" />
                      ) : (
                        <EyeInvisibleOutlined style={{ color: "#8E92AD" }} />
                      )
                    }
                  />
                </Form.Item>

                <Form.Item className="mt-8 mb-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className="auth-main-button"
                  >
                    Đăng ký
                  </Button>
                </Form.Item>
              </Form>

              <div className="mt-6 text-center text-base font-medium text-[#737895]">
                Đã có tài khoản?{" "}
                <Link
                  to="/login"
                  className="font-black text-[#3145FF] transition hover:text-[#1D28D9]"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          .money-input.ant-input-affix-wrapper {
            height: 68px;
            border-radius: 20px;
            border: 1.5px solid #E3E6F5;
            background: rgba(255, 255, 255, 0.92);
            padding: 0 22px;
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

          .money-input .ant-input,
          .money-input .ant-input-password {
            font-size: 20px;
            font-weight: 500;
            color: #111438;
            background: transparent;
          }

          .money-input .ant-input::placeholder {
            color: #969AB8;
            font-weight: 500;
          }

          .auth-main-button {
            height: 68px !important;
            border: none !important;
            border-radius: 20px !important;
            background: linear-gradient(90deg, #895BFF 0%, #3453FF 100%) !important;
            font-size: 22px !important;
            font-weight: 900 !important;
            color: #FFFFFF !important;
            transition: all 0.25s ease !important;
          }

          .auth-main-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 22px 40px rgba(65, 83, 255, 0.34) !important;
            filter: brightness(1.03);
          }

          @media (max-width: 640px) {
            .money-input.ant-input-affix-wrapper {
              height: 50px;
              border-radius: 18px;
              padding: 0 18px;
            }

            .money-input .ant-input,
            .money-input .ant-input-password {
              font-size: 17px;
            }

            .auth-main-button {
              height: 50px !important;
              border-radius: 18px !important;
              font-size: 20px !important;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default RegisterPage;