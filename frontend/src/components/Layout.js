import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePath, setActivePath] = useState("/dashboard");

  return (
    <div className="flex min-h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        activePath={activePath}
        setActivePath={setActivePath}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 bg-gray-50 ${isCollapsed ? "md:ml-20" : "md:ml-60"} ml-0`}>
        <Topbar onMobileToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
       </main>
      </div>
    </div>
  );
}

