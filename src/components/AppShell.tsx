import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

function AppShell() {
  return (
    <div className="min-h-screen bg-[#F7F9FF] pb-28">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export default AppShell;