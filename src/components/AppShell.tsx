import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import OnboardingModal from "../Modal/OnboardingModal";

function AppShell() {
  return (
    <div className="flex min-h-[100svh] w-full flex-col bg-[#F7F9FF]">
      <main className="app-scroll flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>

      <BottomNav />
      <OnboardingModal />
    </div>
  );
}

export default AppShell;