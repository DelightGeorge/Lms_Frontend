import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Globe,
  Bell,
  ChevronDown,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const categories = ["Development", "Business", "Design", "Marketing"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-md shadow-md py-2"
          : "bg-white py-4"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-1 shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform">
            L
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">
            MS<span className="text-blue-600 italic">PRO</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-6">
          {/* Categories Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1 text-sm font-medium text-slate-600 group-hover:text-blue-600 py-2">
              Categories
              <ChevronDown size={14} />
            </button>
            <div className="absolute top-full left-0 w-64 bg-white shadow-2xl rounded-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 p-4">
              {categories.map((cat) => (
                <NavLink
                  key={cat}
                  to={`/categories/${cat.toLowerCase()}`}
                  className="block p-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg font-medium"
                >
                  {cat}
                </NavLink>
              ))}
              <NavLink
                to="/categories"
                className="block p-2 mt-2 text-sm text-blue-600 font-bold rounded-lg hover:bg-blue-50"
              >
                View All Categories
              </NavLink>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              placeholder="Search courses..."
              className="w-full bg-slate-100 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="hidden lg:flex items-center gap-4">
          <NavLink
            to="/instructordashboard"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
          >
            Teach <Sparkles size={14} className="text-blue-500" />
          </NavLink>
          <ShoppingCart size={22} />
          <Bell size={22} />
          <NavLink to="/auth" className="text-sm font-bold">
            Log in
          </NavLink>
          <NavLink
            to="/auth"
            className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold"
          >
            Join for Free
          </NavLink>
          <Globe size={18} />
        </div>

        {/* Mobile Hamburger */}
        <button
          className="lg:hidden p-2 text-slate-700"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden bg-white shadow-xl border-t border-slate-100 transition-all duration-300 ${
          mobileOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="flex flex-col px-6 gap-4">
          {/* Categories */}
          {categories.map((cat) => (
            <NavLink
              key={cat}
              to={`/categories/${cat.toLowerCase()}`}
              className="block p-3 text-slate-700 font-medium rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all"
              onClick={() => setMobileOpen(false)}
            >
              {cat}
            </NavLink>
          ))}
          <NavLink
            to="/categories"
            className="block p-3 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-all"
            onClick={() => setMobileOpen(false)}
          >
            View All Categories
          </NavLink>

          {/* Auth */}
          <NavLink
            to="/auth"
            className="block p-3 text-slate-700 font-bold rounded-lg hover:bg-blue-50 transition-all"
            onClick={() => setMobileOpen(false)}
          >
            Log in / Join
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
