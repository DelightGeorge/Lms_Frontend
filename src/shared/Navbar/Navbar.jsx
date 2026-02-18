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
  LogOut,
  User,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";


const Navbar = () => {
  const { user, logout } = useAuth(); // ← replaces localStorage read
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

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

  // ✅ Close profile dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest("#profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const iconClass =
    "cursor-pointer text-slate-700 hover:text-blue-600 transition";

  // Role-based nav links (desktop top bar)
  const getRoleLinks = () => {
    if (!user) return null;

    if (user.role === "ADMIN") {
      return (
        <NavLink
          to="/admindashboard"
          className="flex items-center gap-1 text-sm font-semibold text-red-600 hover:text-red-700"
        >
          <ShieldCheck size={16} /> Admin Panel
        </NavLink>
      );
    }

    if (user.role === "INSTRUCTOR") {
      return (
        <NavLink
          to="/instructordashboard"
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
      );
    }

    if (user.role === "STUDENT") {
      return (
        <NavLink
          to="/studentdashboard"
          className="flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600"
        >
          <GraduationCap size={16} /> My Learning
        </NavLink>
      );
    }
  };

  // Profile dropdown links by role
  const getDropdownLinks = () => {
    const base = [
      { to: "/profile", icon: <User size={15} />, label: "My Profile" },
    ];

    if (user?.role === "ADMIN") {
      base.unshift({
        to: "/admindashboard",
        icon: <ShieldCheck size={15} />,
        label: "Admin Panel",
      });
    }

    if (user?.role === "INSTRUCTOR") {
      base.unshift(
        {
          to: "/instructordashboard",
          icon: <LayoutDashboard size={15} />,
          label: "Dashboard",
        },
        {
          to: "/my-courses",
          icon: <BookOpen size={15} />,
          label: "My Courses",
        }
      );
    }

    if (user?.role === "STUDENT") {
      base.unshift({
        to: "/studentdashboard",
        icon: <GraduationCap size={15} />,
        label: "My Learning",
      });
    }

    return base;
  };

  // Avatar component
  const Avatar = () =>
    user?.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className="w-9 h-9 rounded-full object-cover border-2 border-blue-500"
      />
    ) : (
      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>
    );

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
            {/* Categories Dropdown */}
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
            {user ? (
              <>
                {/* Role-based link */}
                {getRoleLinks()}

                {/* Show Teach link only for students */}
                {user.role === "STUDENT" && (
                  <NavLink
                    to="/become-instructor"
                    className="flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-blue-600"
                  >
                    Teach <Sparkles size={14} className="text-blue-500" />
                  </NavLink>
                )}

                {/* Cart (students only) */}
                {user.role === "STUDENT" && (
                  <NavLink to="/cart" className={iconClass}>
                    <ShoppingCart size={22} />
                  </NavLink>
                )}

                {/* Notifications (all roles) */}
                <NavLink to="/notifications" className={iconClass}>
                  <Bell size={22} />
                </NavLink>

                {/* Profile Dropdown */}
                <div id="profile-menu" className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Avatar />
                    <ChevronDown size={14} className="text-slate-500" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
                      {/* User info header */}
                      <div className="px-3 py-2 mb-2 border-b border-slate-100">
                        <p className="font-bold text-sm text-slate-800 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.email}
                        </p>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                            user.role === "ADMIN"
                              ? "bg-red-100 text-red-600"
                              : user.role === "INSTRUCTOR"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-emerald-100 text-emerald-600"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>

                      {/* Role-based links */}
                      {getDropdownLinks().map(({ to, icon, label }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl"
                        >
                          {icon} {label}
                        </NavLink>
                      ))}

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl mt-1"
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Guest links */}
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
              </>
            )}
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

          {/* Mobile Auth Section */}
          {user ? (
            <div className="pt-4 border-t space-y-2">
              {/* User info */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar />
                <div>
                  <p className="font-bold text-slate-800">{user.fullName}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block ${
                      user.role === "ADMIN"
                        ? "bg-red-100 text-red-600"
                        : user.role === "INSTRUCTOR"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Role-based links */}
              {getDropdownLinks().map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700"
                >
                  {icon} {label}
                </NavLink>
              ))}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 py-2 text-sm font-medium text-red-500 w-full"
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;