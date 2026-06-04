import { Outlet } from "react-router-dom";

function PublicShell() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-[#F7F9FF]">
      <main className="app-scroll h-full overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicShell;