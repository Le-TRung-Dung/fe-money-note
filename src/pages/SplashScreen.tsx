import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Spin } from "antd";
import logo from "../assets/logo.png";
import { STORAGE_KEYS } from "../shared/constants/storageKeys";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUserId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);

      if (currentUserId) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/landing", { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAFF]">
      <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#D7C8FF] opacity-70 blur-2xl" />
      <div className="pointer-events-none absolute -left-24 bottom-10 h-72 w-72 rounded-full bg-[#DDEAFF] opacity-80 blur-2xl" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 flex h-[140px] w-[140px] items-center justify-center rounded-[36px] bg-white shadow-[0_24px_70px_rgba(91,98,255,0.16)]">
          <img
            src={logo}
            alt="Money Note"
            className="h-[90px] object-contain"
          />
        </div>
        <Spin size="large" />

        <div className="mt-5 text-[13px] font-semibold text-[#8A8EA9]">
          Đang khởi động ứng dụng...
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;