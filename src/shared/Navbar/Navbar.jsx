import { useState, useEffect } from "react";
import {
  Search, ShoppingCart, Bell, ChevronDown, Menu, X,
  LogOut, User, LayoutDashboard, BookOpen, GraduationCap,
  ShieldCheck, Home, Sparkles, Zap,
} from "lucide-react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    { name: "Development", icon: "💻" },
    { name: "Business", icon: "📈" },
    { name: "Design", icon: "🎨" },
    { name: "Marketing", icon: "📣" },
  ];

  // Scroll detection
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Resize handler
  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Outside click handler
  useEffect(() => {
    const fn = (e) => {
      if (!e.target.closest("#profile-menu")) setProfileOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Fetch cart count
  useEffect(() => {
    if (!user || user.role !== "STUDENT") {
      setCartCount(0);
      return;
    }
    API.get("/cart")
      .then((r) => setCartCount(r.data?.items?.length || 0))
      .catch(() => setCartCount(0));
  }, [user, location.pathname]);

  // Fetch notifications
  useEffect(() => {
    if (!user) {
      setNotifCount(0);
      return;
    }
    API.get("/notifications/unread")
      .then((r) => setNotifCount(r.data?.count || 0))
      .catch(() => {
        API.get("/notifications")
          .then((r) => {
            const arr = Array.isArray(r.data) ? r.data : [];
            setNotifCount(arr.filter((n) => !n.isRead).length);
          })
          .catch(() => setNotifCount(0));
      });
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  // Role badge styling
  const roleBadge = {
    ADMIN: "bg-red-100/80 text-red-700 border border-red-200/60 font-bold",
    INSTRUCTOR: "bg-blue-100/80 text-blue-700 border border-blue-200/60 font-bold",
    STUDENT: "bg-emerald-100/80 text-emerald-700 border border-emerald-200/60 font-bold",
  }[user?.role] || "bg-slate-100 text-slate-600 font-bold";

  const dashboardLink = {
    ADMIN: {
      to: "/admindashboard",
      icon: <ShieldCheck size={16} />,
      label: "Admin Panel",
      color: "text-red-600 hover:bg-red-50",
    },
    INSTRUCTOR: {
      to: "/instructordashboard",
      icon: <LayoutDashboard size={16} />,
      label: "Dashboard",
      color: "text-blue-600 hover:bg-blue-50",
    },
    STUDENT: {
      to: "/StudentDashboard",
      icon: <GraduationCap size={16} />,
      label: "My Learning",
      color: "text-slate-700 hover:bg-slate-50",
    },
  }[user?.role];

  const getDropdownLinks = () => {
    const base = [{ to: "/profile", icon: <User size={16} />, label: "My Profile" }];
    if (user?.role === "ADMIN")
      base.unshift({ to: "/admindashboard", icon: <ShieldCheck size={16} />, label: "Admin Panel" });
    if (user?.role === "INSTRUCTOR")
      base.unshift(
        { to: "/instructordashboard", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
        { to: "/my-courses", icon: <BookOpen size={16} />, label: "My Courses" }
      );
    if (user?.role === "STUDENT")
      base.unshift({ to: "/StudentDashboard", icon: <GraduationCap size={16} />, label: "My Learning" });
    return base;
  };

  // Avatar component
  const Avatar = ({ size = "md" }) => {
    const dim = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
    return user?.avatarUrl ? (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        className={`${dim} rounded-full object-cover ring-2 ring-amber-400/60 ring-offset-2`}
      />
    ) : (
      <div
        className={`${dim} rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-black shadow-md shrink-0`}
      >
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  // Cart icon
  const CartIcon = ({ mobile = false }) => (
    <Link
      to="/cart"
      className={`relative flex items-center gap-2 transition-colors ${
        mobile
          ? "py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          : "p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-amber-600"
      }`}
    >
      <ShoppingCart size={mobile ? 18 : 20} />
      {cartCount > 0 && (
        <span
          className={`bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ${
            mobile ? "w-5 h-5" : "absolute -top-1 -right-1 w-5 h-5"
          }`}
        >
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
      {mobile && <span>Cart {cartCount > 0 && `(${cartCount})`}</span>}
    </Link>
  );

  // Notification icon
  const NotifIcon = ({ mobile = false }) => (
    <Link
      to="/notifications"
      className={`relative flex items-center gap-2 transition-colors ${
        mobile
          ? "py-3 px-4 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100"
          : "p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-red-500"
      }`}
    >
      <Bell size={mobile ? 18 : 20} />
      {notifCount > 0 && (
        <span
          className={`bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center ${
            mobile ? "w-5 h-5" : "absolute -top-1 -right-1 w-5 h-5"
          }`}
        >
          {notifCount > 9 ? "9+" : notifCount}
        </span>
      )}
      {mobile && <span>Notifications {notifCount > 0 && `(${notifCount})`}</span>}
    </Link>
  );

  return (
    <>
      {/* ── DESKTOP NAVBAR ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-xl shadow-md shadow-black/5 py-3"
            : "bg-white/80 backdrop-blur-sm border-b border-slate-100/60 py-4"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5 shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-600/30">
              L
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 hidden sm:inline">
              LMS<span className="text-amber-600 italic ml-1">ELITE</span>
            </span>
          </Link>

          {/* Desktop: Categories + Search */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl mx-4">
            {/* Categories dropdown */}
            <div className="relative group shrink-0">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-amber-600 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                Browse
                <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-56 bg-white shadow-2xl rounded-2xl border border-slate-100/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-2 p-2 mt-1">
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-3 pt-2 pb-1">Categories</p>
                {categories.map((cat) => (
                  <NavLink
                    key={cat.name}
                    to={`/categories/${cat.name.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg font-medium transition-colors"
                  >
                    <span className="text-lg">{cat.icon}</span> {cat.name}
                  </NavLink>
                ))}
                <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                  <NavLink
                    to="/courses"
                    className="flex items-center gap-2 px-3 py-2.5 text-sm text-amber-600 font-bold rounded-lg hover:bg-amber-50 transition-colors"
                  >
                    <Zap size={14} /> All Courses
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors..."
                className="w-full bg-slate-100/60 hover:bg-slate-100 focus:bg-white focus:ring-2 focus:ring-amber-400/50 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 border border-slate-100/80 focus:border-transparent"
              />
            </form>
          </div>

          {/* Desktop: Right side */}
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              <>
                <span className="text-sm text-slate-500 mr-2 hidden xl:inline">
                  Welcome, <span className="font-bold text-slate-900">{user.fullName?.split(" ")[0]}</span>
                </span>

                {dashboardLink && (
                  <NavLink
                    to={dashboardLink.to}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-lg transition-colors mr-1 ${dashboardLink.color}`}
                  >
                    {dashboardLink.icon}
                    <span className="hidden xl:inline">{dashboardLink.label}</span>
                  </NavLink>
                )}

                <CartIcon />
                <NotifIcon />

                {/* Profile menu */}
                <div id="profile-menu" className="relative ml-2">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <Avatar />
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-bold text-slate-800 leading-none mb-0.5 max-w-[100px] truncate">
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${roleBadge}`}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Profile dropdown */}
                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100/60 p-2 z-50">
                      {/* User info */}
                      <div className="px-3 py-4 bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-lg border border-amber-100/50 mb-2">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-slate-900 truncate">{user.fullName}</p>
                            <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full inline-block ${roleBadge}`}>
                          {user.role}
                        </span>
                      </div>

                      {/* Links */}
                      <div className="space-y-0.5 mb-1.5">
                        {getDropdownLinks().map(({ to, icon, label }) => (
                          <NavLink
                            key={to}
                            to={to}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors font-medium"
                          >
                            <span className="text-slate-500">{icon}</span>
                            {label}
                          </NavLink>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="border-t border-slate-100 pt-1.5 mt-1.5">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50/80 rounded-lg transition-colors font-semibold"
                        >
                          <LogOut size={16} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/courses"
                  className="text-sm font-semibold text-slate-700 hover:text-amber-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Explore
                </Link>
                <CartIcon />
                <NotifIcon />
                <NavLink
                  to="/auth"
                  className="text-sm font-semibold px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 ml-1"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/auth"
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-amber-600/20 ml-1 active:scale-95"
                >
                  Join Free
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile: Search + Cart + Notif + Menu */}
          <div className="flex lg:hidden items-center gap-0.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            >
              {searchOpen ? <X size={20} /> : <Search size={20} />}
            </button>
            <CartIcon />
            <NotifIcon />
            <button
              className="p-2.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors ml-0.5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            searchOpen ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-4 pb-3 pt-2 border-t border-slate-100">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                autoFocus={searchOpen}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-slate-100/60 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber-400/50 focus:bg-white transition-all border border-slate-100/80"
              />
            </form>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ── MOBILE MENU ── */}
      <div
        className={`fixed top-[61px] left-0 right-0 bg-white z-50 shadow-xl transition-all duration-300 lg:hidden overflow-y-auto max-h-[90vh] ${
          mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
        }`}
      >
        {/* User banner or CTA */}
        <div className="px-4 pt-4 pb-3">
          {user ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-amber-600 to-amber-700 rounded-xl p-4 text-white shadow-lg shadow-amber-700/30">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm truncate">{user.fullName}</p>
                <p className="text-amber-100 text-xs truncate">{user.email}</p>
              </div>
              <span className="text-[8px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30 shrink-0">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg">
              <p className="font-bold text-sm mb-0.5">Welcome to LMSPRO</p>
              <p className="text-slate-300 text-xs mb-4">Start learning from industry experts</p>
              <div className="flex gap-2">
                <NavLink
                  to="/auth"
                  className="flex-1 text-center py-2.5 rounded-lg font-bold bg-amber-600 hover:bg-amber-500 text-white text-xs transition-colors"
                >
                  Join Free
                </NavLink>
                <NavLink
                  to="/auth"
                  className="flex-1 text-center py-2.5 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white text-xs border border-white/20 transition-colors"
                >
                  Sign In
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Categories grid */}
        <div className="px-4 pb-4">
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <NavLink
                key={cat.name}
                to={`/categories/${cat.name.toLowerCase()}`}
                className="flex items-center gap-2 py-3 px-3 font-semibold text-sm text-slate-700 bg-slate-50 hover:bg-amber-50 hover:text-amber-700 rounded-lg transition-colors active:scale-95"
              >
                <span className="text-lg">{cat.icon}</span> {cat.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Quick links */}
        {user && (
          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Quick Access</p>
            <div className="space-y-0.5">
              <Link
                to="/"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Home size={16} className="text-slate-500" /> Home
              </Link>
              {getDropdownLinks().map(({ to, icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-slate-500">{icon}</span> {label}
                </NavLink>
              ))}
              <Link
                to="/notifications"
                className="flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Bell size={16} className="text-slate-500" />
                Notifications
                {notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    {notifCount > 9 ? "9+" : notifCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        )}

        {/* Sign out */}
        {user && (
          <div className="px-4 pb-6 pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-600 hover:bg-red-50/80 rounded-lg border border-red-100/60 transition-colors"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
