import React, { useState } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";

export default function Topbar({ onMobileToggle }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 md:px-6 h-16">
      {/* Mobile Toggle */}
      <div className="flex items-center gap-2 md:hidden">
        <button onClick={onMobileToggle} className="text-[#49796B] hover:text-[#355f4f]">☰</button>
      </div>

      {/* Search */}
      <div className="flex-1 px-2 md:px-4 max-w-md mx-auto">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#49796B]" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full border border-[#49796B] rounded-md px-10 py-2 text-sm 
                       focus:outline-none focus:ring-2 focus:ring-[#49796B]"
          />
        </div>
      </div>

      {/* Profile */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center text-[#49796B] hover:text-[#355f4f]"
        >
          <FaUserCircle size={28} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 shadow-md rounded-md">
            {/* <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
              Logout
            </button> */}
           <div className="text-center font-bold">Hello My Majesty </div> 
          </div>
        )}
      </div>
    </header>
  );
}
