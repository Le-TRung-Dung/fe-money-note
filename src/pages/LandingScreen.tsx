import { useEffect, useState } from "react";
// Thông thường trên ReactJS chúng ta dùng react-router-dom để điều hướng thay cho @react-navigation
import { useNavigate } from "react-router-dom";
import { Button, message } from "antd";
import Banner from "../assets/money-note-landing.png";
import type { User } from "../database/db";
import { getCurrentUser } from "../features/auth/services/authService";

export default function LandingPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initPage = async () => {
      try {
        const currentUser = await getCurrentUser();

        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        message.error("Không thể tải thông tin tài khoản");
      } 
    };

    initPage();
  }, []);

  const handleStart = () => {
    if (user) {
      navigate("/dashboard");
      return;
    }

    navigate("/login");
  };

  return (
    // Sử dụng h-[100dvh] để tự động co giãn chính xác theo chiều cao thực tế của trình duyệt (tránh bị che bởi thanh URL)
    <div className="relative w-full h-[100dvh] bg-[#FAFAFF] overflow-hidden">
      {/* Container chứa ảnh nền tương đương ImageBackground */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${Banner})` }}
        /* Lưu ý: Đảm bảo đường dẫn ảnh ở thư mục public/assets hợp lệ trong dự án React của bạn */
      >
        {/* Vùng chứa nút bấm: Set cứng vị trí tuyệt đối ở dưới cùng */}
        <div className="absolute bottom-[54px] left-[26px] right-[26px]">
          {/* Nút bấm Ant Design (Button) được override bằng TailwindCSS để y hệt bản Mobile */}
          <Button
            type="primary"
            onClick={handleStart}
            className="
              w-full h-[60px] rounded-[24px] bg-[#3033F1] border-none
              flex items-center justify-center relative
              shadow-[0px_14px_20px_rgba(48,51,241,0.34)] 
              hover:bg-[#3033F1] hover:opacity-90 
              active:bg-[#3033F1] active:opacity-90 
              transition-opacity mb-2
            "
          >
            {/* Chữ "Bắt đầu ngay" */}
            <span className="text-[#FFFFFF] text-[23px] font-[900] tracking-[0.2px]">
              Bắt đầu ngay
            </span>

            {/* Mũi tên điều hướng */}
            <span className="absolute right-[30px] text-[#FFFFFF] text-[36px] font-[500] -mt-[3px]">
              →
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
