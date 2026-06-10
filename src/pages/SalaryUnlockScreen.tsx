import { useState } from "react";
import { Button, Input, message } from "antd";
import {
  ArrowLeftOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';

import { STORAGE_KEYS } from "../shared/constants/storageKeys";
import {
  markSalaryUnlocked,
  verifyCurrentUserPassword,
} from "../features/auth/services/authService";
import { FaLock } from "react-icons/fa";

function SalaryUnlockScreen() {
  const navigate = useNavigate();

  const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    try {
      if (!currentUserId) {
        message.error("Bạn cần đăng nhập lại");
        navigate("/login", { replace: true });
        return;
      }

      if (!password.trim()) {
        message.error("Vui lòng nhập mật khẩu");
        return;
      }

      setLoading(true);

      await verifyCurrentUserPassword({
        userId: currentUserId,
        password: password.trim(),
      });

      markSalaryUnlocked(currentUserId);

      message.success("Đã mở khóa Ví lương");
      navigate("/salary", { replace: true });
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Mật khẩu không đúng",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#FAFAFF] px-5 py-8 font-sans">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#DCFCE7] opacity-70 blur-[80px]" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 translate-x-1/3 rounded-full bg-[#F3E8FF] opacity-70 blur-[80px]" />

      <div className="relative z-10 mx-auto flex h-full max-w-[520px] flex-col">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/account", { replace: true })}
            className="flex h-10 w-10 items-center justify-center rounded-full border-none bg-white text-[#111438] shadow-sm"
          >
            <ArrowLeftOutlined />
          </button>

          <div className="text-center">
            <h1 className="m-0 text-lg font-black text-[#111438]">
              Mở khóa Ví lương
            </h1>
            <div className="mt-1 text-xs font-medium text-gray-400">
              Dữ liệu lương được bảo vệ riêng
            </div>
          </div>

          <div className="h-10 w-10" />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-[32px] bg-gradient-to-br from-[#22C55E] to-[#895BFF] text-4xl text-white shadow-[0_16px_40px_rgba(34,197,94,0.28)]">
              <img src={logo} />
            </div>

            <div className="text-[24px] font-black text-[#111438]">
              Ví lương đang khóa
            </div>

            <div className="mx-auto mt-2 max-w-[320px] text-sm font-medium leading-6 text-gray-400">
              Nhập mật khẩu tài khoản local hiện tại để xem lương, thưởng và
              hoàn thuế.
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="mb-3 text-sm font-bold text-gray-600">
              Mật khẩu
            </div>

            <Input.Password
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onPressEnter={handleUnlock}
              placeholder="Nhập mật khẩu"
              size="large"
              className="h-12 rounded-2xl"
              prefix={<FaLock className="text-gray-400" />}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />

            <Button
              type="primary"
              block
              loading={loading}
              onClick={handleUnlock}
              className="mt-5 h-12 rounded-[18px] border-none bg-[#22C55E] text-[15px] font-black shadow-[0_8px_22px_rgba(34,197,94,0.28)]"
            >
              Mở khóa Ví lương
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalaryUnlockScreen;