import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  LogOut,
  LibraryBig
} from "lucide-react";

export default function Sidebar() {
  // मराठी मेनू आयटम्स
  const navItems = [
    { to: "/dashboard", label: "मुख्य फलक", icon: <LayoutDashboard size={20} /> },
    { to: "/members", label: "सभासद", icon: <Users size={20} /> },
    {to: "/book-category", label: "पुस्तक वर्गीकरण", icon: <BookOpen size={20} /> },
    { to: "/books", label: "पुस्तके", icon: <BookOpen size={20} /> },
    { to: "/issue", label: "पुस्तक वाटप", icon: <ArrowUpRight size={20} /> },
    { to: "/return", label: "पुस्तक जमा", icon: <ArrowDownLeft size={20} /> },
    { to: "/transactions", label: "व्यवहार इतिहास", icon: <History size={20} /> },
  ];

  return (
    <div className="w-72 bg-slate-900 text-slate-300 min-h-screen flex flex-col border-r border-slate-800 shadow-2xl">
      {/* Brand Logo Section */}
      {/* <img src="/MJPhule.jpg" className="w-5 h-5 filter group-hover:brightness-0 group-hover:invert"/> */}

      <div className="p-8 flex items-center gap-3 border-b border-slate-800/50">
        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-500/20">
          <LibraryBig size={24} />
        </div>
        <div>
          <h2 className="text-lg font-black text-white tracking-tight leading-tight">
            महात्मा फुले <br /> 
            <span className="text-lg font-black text-white tracking-tight leading-tight">सार्वजनिक वाचनालय</span>
            <br /> 
            <span className="text-lg font-black text-white tracking-tight leading-tight">
      दहीफळ (भो.) तांडा</span>
           <br /> 
            <span className="text-lg font-black text-white tracking-tight leading-tight">
                परतूर, जालना</span>
          </h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">व्यवस्थापन प्रणाली</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group
              ${isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                : "hover:bg-slate-800 hover:text-white"}
            `}
          >
            <span className="transition-transform group-hover:scale-110">
              {item.icon}
            </span>
            <span className="font-bold text-sm tracking-wide">
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User Profile Section */}
      <div className="p-6 border-t border-slate-800/50">
        <button 
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="flex items-center gap-4 w-full px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-2xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm">बाहेर पडा (Logout)</span>
        </button>
      </div>
    </div>
  );
}