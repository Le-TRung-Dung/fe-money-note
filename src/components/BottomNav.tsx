import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { MdHome } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { GiPieChart } from "react-icons/gi";
import { BsPiggyBank } from "react-icons/bs";

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center pointer-events-none">
      <div className="w-full max-w-[760px] bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(91,98,255,0.08)] rounded-t-[32px] pointer-events-auto flex items-end justify-between px-6 pb-3 pt-3 border-t border-[#F7F9FF]">
        {/* Tổng quan */}
        <div
          className="flex w-[60px] cursor-pointer flex-col items-center gap-1.5"
          onClick={() => navigate("/dashboard")}
        >
          <MdHome
            className={`text-[22px] ${
              isActive("/dashboard") ? "text-[#895BFF]" : "text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] ${
              isActive("/dashboard")
                ? "font-bold text-[#895BFF]"
                : "font-medium text-gray-400"
            }`}
          >
            Tổng quan
          </span>
        </div>

        {/* Giao dịch */}
        <div
          className="flex w-[60px] cursor-pointer flex-col items-center gap-1.5"
          onClick={() => navigate("/transactions")}
        >
          <GrTransaction
            className={`text-[22px] transition-colors ${
              isActive("/transactions") ? "text-[#895BFF]" : "text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] ${
              isActive("/transactions")
                ? "font-bold text-[#895BFF]"
                : "font-medium text-gray-400"
            }`}
          >
            Giao dịch
          </span>
        </div>

        {/* Nút thêm giao dịch */}
        <div className="relative flex -translate-y-5 flex-col items-center justify-center">
          <div
            className="flex h-[56px] w-[56px] cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#895BFF] to-[#5B62FF] shadow-[0_10px_25px_rgba(137,91,255,0.4)] transition-all hover:scale-105 active:scale-95"
            onClick={() => navigate("/transactions/create")}
          >
            <PlusOutlined className="text-[24px] text-white" />
          </div>
        </div>

        {/* Tiết kiệm */}
        <div
          className="flex w-[60px] cursor-pointer flex-col items-center gap-1.5"
          onClick={() => navigate("/savings")}
        >
          <BsPiggyBank
            className={`text-[22px] transition-colors ${
              isActive("/savings") ? "text-[#895BFF]" : "text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] ${
              isActive("/savings")
                ? "font-bold text-[#895BFF]"
                : "font-medium text-gray-400"
            }`}
          >
            Tiết kiệm
          </span>
        </div>

        {/* Tài khoản */}
        <div
          className="flex w-[60px] cursor-pointer flex-col items-center gap-1.5"
          onClick={() => navigate("/account")}
        >
          <UserOutlined
            className={`text-[22px] transition-colors ${
              isActive("/account") ? "text-[#895BFF]" : "text-gray-400"
            }`}
          />
          <span
            className={`text-[10px] ${
              isActive("/account")
                ? "font-bold text-[#895BFF]"
                : "font-medium text-gray-400"
            }`}
          >
            Tài khoản
          </span>
        </div>
      </div>
    </div>
  );
}

export default BottomNav;