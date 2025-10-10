import React, { useState } from "react";
import { FaBell, FaUserCircle, FaBars } from "react-icons/fa";

export default function Topbar({ onMobileToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 md:px-6 h-16" style={{height:"80px"}}>
      {/* Mobile Toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <button onClick={onMobileToggle} className="text-[#162570] hover:text-[#626fb2]">
          <FaBars size={28} />
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 relative">
        {/* Notification */}
        <button className="relative text-[#162570] hover:text-[#626fb2]">
          <FaBell size={28} />
          {/* Red dot for unread notifications */}
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center text-[#162570] hover:text-[#626fb2]"
          >
            <FaUserCircle size={28} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 shadow-md rounded-md">
              <div className="text-center font-bold py-2 border-b border-gray-200">
                Hello My Majesty
              </div>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
