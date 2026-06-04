import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

function AppShell() {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F7F9FF]">
      
      {/* 2. Vùng chứa nội dung trang: Cho phép tự cuộn độc lập (overflow-y-auto) */}
      <div className="flex-1 overflow-y-auto pb-28 relative">
        <Outlet />
      </div>

      <BottomNav />
    </div>
  );
}

export default AppShell;