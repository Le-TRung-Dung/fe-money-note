import { useState } from "react";
import { Button, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { sendCloudResetPasswordEmail } from "../features/cloud/services/cloudSyncService";

function CloudForgotPasswordScreen() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSendEmail = async () => {
    try {
      if (!email.trim()) {
        message.error("Vui lòng nhập email cloud");
        return;
      }

      setLoading(true);

      await sendCloudResetPasswordEmail(email.trim());

      setSent(true);
      message.success("Đã gửi email đổi mật khẩu cloud");
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Không thể gửi email đổi mật khẩu",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100svh] overflow-x-hidden bg-[#FAFAFF] px-5 py-8 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E9D5FF] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-[#DCFCE7] opacity-70 blur-[80px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-64px)] max-w-[520px] flex-col">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/account")}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <ArrowLeftOutlined />
          </button>

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">
              Quên mật khẩu cloud
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              Đổi mật khẩu tài khoản Supabase
            </div>
          </div>

          <div className="h-10 w-10" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-[#895BFF] to-[#22C55E] text-4xl text-white shadow-[0_16px_40px_rgba(137,91,255,0.25)]">
              <MailOutlined />
            </div>

            <div className="text-[24px] font-black text-[#111438]">
              Lấy lại mật khẩu cloud
            </div>

            <div className="mx-auto mt-2 max-w-[340px] text-sm font-medium leading-6 text-gray-400">
              Nhập email bạn dùng để đăng ký cloud. Supabase sẽ gửi link đặt lại
              mật khẩu vào email đó.
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-3 text-sm font-bold text-gray-600">
              Email cloud
            </div>

            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Nhập email cloud"
              size="large"
              className="h-12 rounded-2xl"
              prefix={<MailOutlined className="text-gray-400" />}
              inputMode="email"
            />

            <Button
              type="primary"
              block
              loading={loading}
              onClick={handleSendEmail}
              icon={<SendOutlined />}
              className="mt-5 h-12 rounded-[18px] border-none bg-[#895BFF] text-[15px] font-black shadow-[0_8px_22px_rgba(137,91,255,0.25)]"
            >
              Gửi email đổi mật khẩu
            </Button>

            {sent && (
              <div className="mt-4 rounded-2xl bg-[#F0FDF4] p-4 text-[13px] font-bold leading-5 text-[#15803D]">
                Đã gửi email. Bạn mở email mới nhất, bấm link đổi mật khẩu rồi
                quay lại app để đặt mật khẩu mới.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CloudForgotPasswordScreen;