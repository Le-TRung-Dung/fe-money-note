import React from "react";
import { Form, Input, Button, ConfigProvider, Divider } from "antd";
import {
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";
import { CiLock } from "react-icons/ci";
import { MdPersonOutline } from "react-icons/md";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = (values: any) => {
    console.log("Login values:", values);
  };

  const handleGoogleLogin = () => {
    console.log("Login with Google");
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
          <div className="w-full max-w-[560px]">
            {/* Logo */}
            <div className="mb-5 flex items-center justify-center gap-5">
              <img
                onClick={() => navigate("/landing")}
                className="h-[90px]"
                src={logo}
              />
            </div>
            {/* Heading */}
            <div className="mb-10 text-center">
              <p className="mb-4 text-[20px] font-black leading-tight tracking-[-1px] text-[#070B35] max-sm:text-[30px]">
                Đăng nhập tài khoản
              </p>
            </div>

            {/* Form card */}
            <div className="rounded-[42px] bg-white/95 px-12 py-12 shadow-[0_26px_70px_rgba(91,98,255,0.13)] backdrop-blur-xl max-sm:rounded-[32px] max-sm:px-6 max-sm:py-8">
              <Form
                name="login"
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
                      message: "Vui lòng nhập email hoặc số điện thoại",
                    },
                  ]}
                >
                  <Input
                    prefix={
                      <MdPersonOutline className="mr-3 text-[24px] text-[#545BFF]" />
                    }
                    placeholder="Email hoặc số điện thoại"
                    className="money-input"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng nhập mật khẩu",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={
                      <CiLock className="mr-3 text-[24px] text-[#545BFF]" />
                    }
                    placeholder="Mật khẩu"
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

                <div className="-mt-2 mb-7 flex justify-end">
                  <a
                    href="#forgot"
                    className="text-[17px] font-bold text-[#3145FF] transition hover:text-[#1D28D9]"
                  >
                    Quên mật khẩu?
                  </a>
                </div>

                <Form.Item className="mb-7">
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="login-main-button"
                  >
                    Đăng nhập
                  </Button>
                </Form.Item>
              </Form>

              <Divider className="money-divider">
                <span className="px-5 text-[17px] font-medium text-[#8A8EA9]">
                  Hoặc
                </span>
              </Divider>

              <Button
                size="large"
                block
                onClick={handleGoogleLogin}
                className="google-button"
              >
                <span className="mr-4 inline-flex h-7 w-7 items-center justify-center text-[26px] font-black">
                  <span className="google-g">G</span>
                </span>
                <span className="text-base text-gray-700">
                  Tiếp tục với Google
                </span>
              </Button>

              <div className="mt-8 text-center text-base font-medium text-[#737895]">
                Chưa có tài khoản?{" "}
                <a
                  href="#register"
                  className="font-black text-[#3145FF] transition hover:text-[#1D28D9]"
                >
                  Đăng ký ngay
                </a>
              </div>
            </div>

            {/* Footer */}
            {/* <div className="mt-10 text-center text-[16px] font-medium text-[#7F839F]">
              Phát triển bởi chuyên viên phần mềm{" "}
              <span className="font-black text-[#3145FF]">MobiFone IT</span>
            </div> */}
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

          .login-main-button {
            height: 68px !important;
            border: none !important;
            border-radius: 20px !important;
            background: linear-gradient(90deg, #895BFF 0%, #3453FF 100%) !important;
            font-size: 22px !important;
            font-weight: 900 !important;
            color: #FFFFFF !important;
            transition: all 0.25s ease !important;
          }

          .login-main-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 22px 40px rgba(65, 83, 255, 0.34) !important;
            filter: brightness(1.03);
          }

          .money-divider {
            margin: 22px 0 26px;
            color: #8A8EA9;
          }

          .money-divider::before,
          .money-divider::after {
            border-color: #E5E7F4 !important;
          }

          .google-button {
            height: 64px !important;
            border-radius: 18px !important;
            border: 1.5px solid #E3E6F5 !important;
            background: #FFFFFF !important;
            color: #101437 !important;
            font-size: 20px !important;
            font-weight: 800 !important;
            box-shadow: none !important;
            transition: all 0.25s ease !important;
          }

          .google-button:hover {
            border-color: #B7BDFF !important;
            background: #FAFAFF !important;
            color: #101437 !important;
            transform: translateY(-1px);
          }

          .google-g {
            background: conic-gradient(
              from -45deg,
              #4285F4 0deg 90deg,
              #34A853 90deg 180deg,
              #FBBC05 180deg 270deg,
              #EA4335 270deg 360deg
            );
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            font-family: Arial, sans-serif;
            font-weight: 900;
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

            .login-main-button {
              height: 50px !important;
              border-radius: 18px !important;
              font-size: 20px !important;
            }

            .google-button {
              height: 50px !important;
              font-size: 18px !important;
            }
          }
        `}</style>
      </div>
    </ConfigProvider>
  );
};

export default LoginPage;
