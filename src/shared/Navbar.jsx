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

  // ✅ Close mobile menu when switching to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const iconClass =
    "cursor-pointer text-slate-700 hover:text-blue-600 transition";

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-md py-2"
            : "bg-white py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform">
              L
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">
              MS<span className="text-blue-600 italic">PRO</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-6">
            {/* Categories */}
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-blue-600 py-2">
                Categories <ChevronDown size={14} />
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

          {/* Desktop Right Icons */}
          <div className="hidden lg:flex items-center gap-4">
            <NavLink
              to="/instructordashboard"
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
            >
              Teach <Sparkles size={14} className="text-blue-500" />
            </NavLink>

            <NavLink to="/cart" className={iconClass}>
              <ShoppingCart size={22} />
            </NavLink>

            <NavLink to="/notifications" className={iconClass}>
              <Bell size={22} />
            </NavLink>

            <NavLink to="/auth" className="text-sm font-bold">
              Log in
            </NavLink>

            <NavLink
              to="/auth"
              className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold"
            >
              Join for Free
            </NavLink>

            <Globe size={18} className="cursor-pointer" />
          </div>

          {/* Mobile Hamburger */}
          <button
            className="lg:hidden p-2 text-slate-700 z-50"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* 🌑 DARK OVERLAY (MOBILE ONLY) */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* 📱 MOBILE DROPDOWN MENU */}
      <div
        className={`fixed top-[72px] left-0 right-0 bg-white z-50 shadow-xl transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "translate-y-0 opacity-100"
            : "-translate-y-6 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-6 py-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              placeholder="Search courses..."
              className="w-full bg-slate-100 rounded-xl py-3 pl-12 pr-4 text-sm outline-none"
            />
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase">
              Categories
            </p>
            {categories.map((cat) => (
              <NavLink
                key={cat}
                to={`/categories/${cat.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="block py-2 font-medium text-slate-700"
              >
                {cat}
              </NavLink>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-4 border-t space-y-3">
            <NavLink
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-3 rounded-xl font-bold bg-slate-900 text-white"
            >
              Join for Free
            </NavLink>

            <NavLink
              to="/auth"
              onClick={() => setMobileOpen(false)}
              className="block text-center py-3 font-semibold"
            >
              Log in
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
