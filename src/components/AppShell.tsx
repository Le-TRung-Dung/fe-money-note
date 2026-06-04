import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";
import OnboardingModal from "../Modal/OnboardingModal";

function AppShell() {
  return (
    <div
      className="flex w-full flex-col bg-[#F7F9FF]"
      style={{ minHeight: "100svh" }}
    >
      <main className="app-scroll flex-1 pb-28">
        <Outlet />
      </main>

      <BottomNav />
      <OnboardingModal />
    </div>
  );
}

export default AppShell;