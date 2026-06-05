import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import OnboardingModal from "../Modal/OnboardingModal";
import AppLockGuard from "./AppLockGuard";

function AppShell() {
  return (
    <div className="fixed inset-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-[#F7F9FF]">
      <main className="app-scroll relative flex-1 overflow-y-auto pb-28">
        <Outlet />
      </main>
      <AppLockGuard />

      <BottomNav />
      <OnboardingModal />
    </div>
  );
}

export default AppShell;
