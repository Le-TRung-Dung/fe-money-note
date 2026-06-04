import { Outlet } from "react-router-dom";

function PublicShell() {
  return (
    <div
      className="w-full bg-[#F7F9FF]"
      style={{
        minHeight: "100svh",
      }}
    >
      <main className="app-scroll min-h-[100svh] overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}

export default PublicShell;