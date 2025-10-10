// Sidebar.js
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaCubes,FaTags, FaLayerGroup, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Logo from '../uploads/logo/logo-dark.png';
import ShortLogo from '../uploads/logo/short.png';

export default function Sidebar({ isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/" },
    { name: "Products", icon: <FaCubes />, path: "/products" },
    { name: "Brands", icon: <FaLayerGroup />, path: "/brands" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-screen bg-[#49796B] text-white flex-col transition-all duration-300 z-40 ${isCollapsed ? "w-20" : "w-60"}`}>
        <div className="h-16 flex items-center px-4 shadow-sm border-b border-gray-200 relative" onClick={() => setIsCollapsed(!isCollapsed)}>
          {!isCollapsed && <div className="flex-1 flex justify-left">
            <img src={Logo} alt="JAY GURU TYRE" className="logo" style={{height:"70px", margin:"4px 0 0 0"}}/>
            {/* <h1>JG Tyres</h1> */}
            </div>}
          <button
            className={`transition-all duration-300 ${isCollapsed ? "mx-auto block" : "absolute right-4"}`}
          >
            {isCollapsed ? <img src={ShortLogo} alt="JGT" className="logo" style={{height:"50px"}}/>: <span></span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto bg-[#49796B] py-4">
          {menuItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors rounded-md mx-2 mb-1 ${
                  active
                    ? "bg-[#355f4f] border-l-4 border-[#d0f0c0]"
                    : "hover:bg-[#3f7a66]"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-30 md:hidden" onClick={() => setMobileOpen(false)}></div>
          <aside className="fixed top-0 left-0 h-screen w-64 bg-[#49796B] text-white z-50 shadow-lg flex flex-col md:hidden">
            <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
              <img src="/logo.png" alt="Logo" className="h-8" />
              <button onClick={() => setMobileOpen(false)} className="text-white hover:text-gray-200">✕</button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              {menuItems.map(item => {
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-md mx-2 mb-1 ${
                      active
                        ? "bg-[#355f4f] border-l-4 border-[#d0f0c0]"
                        : "hover:bg-[#3f7a66]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </>
  );
}
