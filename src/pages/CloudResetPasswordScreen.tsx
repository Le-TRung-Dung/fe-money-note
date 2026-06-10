import { useEffect, useState } from "react";
import { Button, Input, message } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import { supabase } from "../shared/libs/supabaseClient";
import { updateCloudPassword } from "../features/cloud/services/cloudSyncService";

function CloudResetPasswordScreen() {
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async () => {
    try {
      if (!ready) {
        message.error("Link đổi mật khẩu chưa hợp lệ hoặc đã hết hạn");
        return;
      }

      if (password.length < 6) {
        message.error("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      if (password !== confirmPassword) {
        message.error("Mật khẩu nhập lại không khớp");
        return;
      }

      setLoading(true);

      await updateCloudPassword(password);

      message.success("Đã đổi mật khẩu cloud");

      await supabase.auth.signOut();

      navigate("/account", { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Không thể đổi mật khẩu cloud",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#FAFAFF] px-5 py-8 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E9D5FF] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-[#DCFCE7] opacity-70 blur-[80px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-[520px] flex-col justify-center">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-[#895BFF] to-[#22C55E] text-4xl text-white shadow-[0_16px_40px_rgba(137,91,255,0.25)]">
            <LockOutlined />
          </div>

          <div className="text-[24px] font-black text-[#111438]">
            Đặt mật khẩu cloud mới
          </div>

          <div className="mx-auto mt-2 max-w-[340px] text-sm font-medium leading-6 text-gray-400">
            Nhập mật khẩu mới cho tài khoản cloud Supabase của bạn.
          </div>
        </div>

        <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="mb-3 text-sm font-bold text-gray-600">
            Mật khẩu mới
          </div>

          <Input.Password
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu mới"
            size="large"
            className="h-12 rounded-2xl"
            prefix={<LockOutlined className="text-gray-400" />}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />

          <div className="mb-3 mt-5 text-sm font-bold text-gray-600">
            Nhập lại mật khẩu
          </div>

          <Input.Password
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            onPressEnter={handleResetPassword}
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            className="h-12 rounded-2xl"
            prefix={<LockOutlined className="text-gray-400" />}
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />

          <Button
            type="primary"
            block
            loading={loading}
            disabled={!ready}
            onClick={handleResetPassword}
            className="mt-5 h-12 rounded-[18px] border-none bg-[#895BFF] text-[15px] font-black shadow-[0_8px_22px_rgba(137,91,255,0.25)]"
          >
            Đổi mật khẩu cloud
          </Button>

          {!ready && (
            <div className="mt-4 rounded-2xl bg-[#FFF7ED] p-4 text-[13px] font-bold leading-5 text-[#C2410C]">
              Nếu nút bị mờ, hãy mở lại app bằng link trong email đổi mật khẩu
              mới nhất.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CloudResetPasswordScreen;