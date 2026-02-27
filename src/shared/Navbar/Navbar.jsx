import { useState, useEffect } from "react";
import {
  Search, ShoppingCart, Bell, ChevronDown, Menu, X,
  Sparkles, LogOut, User, LayoutDashboard, BookOpen,
  GraduationCap, ShieldCheck, Home,
} from "lucide-react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled,   setIsScrolled]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [cartCount,    setCartCount]    = useState(0);
  const [notifCount,   setNotifCount]   = useState(0);
  const [searchQuery,  setSearchQuery]  = useState("");

  const categories = ["Development", "Business", "Design", "Marketing"];

  // ── scroll listener ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── close mobile on resize ────────────────────────────────
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // ── close dropdown on outside click ──────────────────────
  useEffect(() => {
    const onClick = (e) => { if (!e.target.closest("#profile-menu")) setProfileOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ── close mobile menu on route change ────────────────────
  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  // ── fetch cart count (students only) ─────────────────────
  useEffect(() => {
    if (!user || user.role !== "STUDENT") { setCartCount(0); return; }
    API.get("/cart")
      .then((r) => setCartCount(r.data?.items?.length || 0))
      .catch(() => setCartCount(0));
  }, [user, location.pathname]); // re-fetch on route change so cart stays fresh

  // ── fetch notification count ──────────────────────────────
  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    API.get("/notifications")
      .then((r) => {
        const notifs = Array.isArray(r.data) ? r.data : r.data?.notifications || [];
        setNotifCount(notifs.filter((n) => !n.isRead).length);
      })
      .catch(() => setNotifCount(0));
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
      setMobileOpen(false);
    }
  };

  // ── Avatar ────────────────────────────────────────────────
  const Avatar = ({ size = "md" }) => {
    const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
    return user?.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.fullName}
        className={`${dim} rounded-full object-cover ring-2 ring-blue-500 ring-offset-1`} />
    ) : (
      <div className={`${dim} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black shadow-md`}>
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  // ── Role badge ────────────────────────────────────────────
  const roleBadge = {
    ADMIN:      "bg-red-100 text-red-600",
    INSTRUCTOR: "bg-blue-100 text-blue-600",
    STUDENT:    "bg-emerald-100 text-emerald-600",
  }[user?.role] || "bg-slate-100 text-slate-600";

  // ── Dropdown links by role ────────────────────────────────
  const getDropdownLinks = () => {
    const base = [{ to: "/profile", icon: <User size={15} />, label: "My Profile" }];
    if (user?.role === "ADMIN")      base.unshift({ to: "/admindashboard",      icon: <ShieldCheck size={15} />,   label: "Admin Panel"    });
    if (user?.role === "INSTRUCTOR") base.unshift({ to: "/instructordashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard"    },
                                                  { to: "/my-courses",          icon: <BookOpen size={15} />,       label: "My Courses"   });
    if (user?.role === "STUDENT")    base.unshift({ to: "/StudentDashboard",    icon: <GraduationCap size={15} />,  label: "My Learning"  });
    return base;
  };

  // ── Cart badge ────────────────────────────────────────────
  const CartIcon = ({ mobile = false }) => (
    <Link to="/cart" className={`relative ${mobile ? "flex items-center gap-2 py-2 text-sm font-medium text-slate-700" : "p-2 rounded-xl hover:bg-slate-100 transition text-slate-600 hover:text-blue-600"}`}>
      <ShoppingCart size={mobile ? 18 : 20} />
      {cartCount > 0 && (
        <span className={`${mobile ? "ml-1" : "absolute -top-1 -right-1"} bg-blue-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center`}>
          {cartCount > 9 ? "9+" : cartCount}
        </span>
      )}
      {mobile && <span>Cart {cartCount > 0 && `(${cartCount})`}</span>}
    </Link>
  );

  // ── Notif badge ───────────────────────────────────────────
  const NotifIcon = ({ mobile = false }) => (
    <Link to="/notifications" className={`relative ${mobile ? "flex items-center gap-2 py-2 text-sm font-medium text-slate-700" : "p-2 rounded-xl hover:bg-slate-100 transition text-slate-600 hover:text-blue-600"}`}>
      <Bell size={mobile ? 18 : 20} />
      {notifCount > 0 && (
        <span className={`${mobile ? "ml-1" : "absolute -top-1 -right-1"} bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center`}>
          {notifCount > 9 ? "9+" : notifCount}
        </span>
      )}
      {mobile && <span>Notifications {notifCount > 0 && `(${notifCount})`}</span>}
    </Link>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg shadow-slate-200/50 py-2" : "bg-white py-3"
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">

          {/* ── Logo ── */}
          <Link to="/" className="group flex items-center gap-1.5 shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:rotate-12 transition-transform shadow-md shadow-blue-600/30">
              L
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 hidden sm:block">
              MS<span className="text-blue-600 italic">PRO</span>
            </span>
          </Link>

          {/* ── Desktop center: categories + search ── */}
          <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl">
            {/* Categories dropdown */}
            <div className="relative group shrink-0">
              <button className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-600 py-2 px-1 transition">
                Categories <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-56 bg-white shadow-2xl rounded-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-2 group-hover:translate-y-0 p-2 mt-1">
                {categories.map((cat) => (
                  <NavLink key={cat} to={`/categories/${cat.toLowerCase()}`}
                    className="flex items-center gap-2 p-2.5 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl font-medium transition">
                    {cat}
                  </NavLink>
                ))}
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <NavLink to="/categories"
                    className="flex items-center gap-2 p-2.5 text-sm text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition">
                    View All →
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, topics, instructors..."
                className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
              />
            </form>
          </div>

          {/* ── Desktop right ── */}
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              <>
                {/* Greeting */}
                <span className="text-sm text-slate-500 mr-2 hidden xl:block">
                  Hi, <span className="font-bold text-slate-800">{user.fullName?.split(" ")[0]}</span> 👋
                </span>

                {/* Role-based dashboard link */}
                {user.role === "ADMIN" && (
                  <NavLink to="/admindashboard"
                    className="flex items-center gap-1.5 text-sm font-bold text-red-600 hover:text-red-700 px-3 py-2 rounded-xl hover:bg-red-50 transition mr-1">
                    <ShieldCheck size={15} /> Admin
                  </NavLink>
                )}
                {user.role === "INSTRUCTOR" && (
                  <NavLink to="/instructordashboard"
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition mr-1">
                    <LayoutDashboard size={15} /> Dashboard
                  </NavLink>
                )}
                {user.role === "STUDENT" && (
                  <NavLink to="/StudentDashboard"
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition mr-1">
                    <GraduationCap size={15} /> My Learning
                  </NavLink>
                )}

                {/* Cart — always visible */}
                <CartIcon />

                {/* Notifications */}
                <NotifIcon />

                {/* Profile dropdown */}
                <div id="profile-menu" className="relative ml-1">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer">
                    <Avatar />
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-black text-slate-800 leading-tight max-w-[100px] truncate">{user.fullName?.split(" ")[0]}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${roleBadge}`}>{user.role}</span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {/* User info */}
                      <div className="px-3 py-3 mb-1 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" />
                          <div className="min-w-0">
                            <p className="font-black text-sm text-slate-800 truncate">{user.fullName}</p>
                            <p className="text-xs text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full mt-2 inline-block ${roleBadge}`}>
                          {user.role}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        {getDropdownLinks().map(({ to, icon, label }) => (
                          <NavLink key={to} to={to} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition font-medium">
                            <span className="text-slate-400">{icon}</span> {label}
                          </NavLink>
                        ))}
                      </div>

                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition font-medium">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <NavLink to="/instructordashboard"
                  className="flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition">
                  Teach <Sparkles size={13} className="text-blue-500" />
                </NavLink>

                {/* Cart visible for guests too */}
                <CartIcon />
                <NotifIcon />

                <NavLink to="/auth" className="text-sm font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition text-slate-700">
                  Log in
                </NavLink>
                <NavLink to="/auth"
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md">
                  Join Free
                </NavLink>
              </>
            )}
          </div>

          {/* ── Mobile right: cart + hamburger ── */}
          <div className="flex lg:hidden items-center gap-1">
            <CartIcon />
            <NotifIcon />
            <button className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile overlay ── */}
      <div onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} />

      {/* ── Mobile menu ── */}
      <div className={`fixed top-[60px] left-0 right-0 bg-white z-50 shadow-2xl transition-all duration-300 lg:hidden overflow-y-auto max-h-[85vh] ${
        mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
      }`}>
        <div className="px-5 py-5 space-y-5">

          {/* Greeting banner (logged in) */}
          {user && (
            <div className="flex items-center gap-3 bg-blue-50 rounded-2xl p-4">
              <Avatar />
              <div className="min-w-0">
                <p className="font-black text-slate-800 text-sm">Hi, {user.fullName?.split(" ")[0]}! 👋</p>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${roleBadge}`}>{user.role}</span>
              </div>
            </div>
          )}

          {/* Mobile search */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses..."
              className="w-full bg-slate-100 rounded-xl py-3 pl-10 pr-4 text-sm outline-none" />
          </form>

          {/* Categories */}
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <NavLink key={cat} to={`/categories/${cat.toLowerCase()}`}
                  className="block py-2.5 px-3 font-semibold text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition">
                  {cat}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Auth section */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            {user ? (
              <>
                {/* Quick links */}
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Navigation</p>

                <Link to="/" className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                  <Home size={16} className="text-slate-400" /> Home
                </Link>

                {getDropdownLinks().map(({ to, icon, label }) => (
                  <NavLink key={to} to={to}
                    className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                    <span className="text-slate-400">{icon}</span> {label}
                  </NavLink>
                ))}

                <div className="pt-1">
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 py-2.5 px-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl transition">
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <NavLink to="/auth"
                  className="block text-center py-3 rounded-xl font-black bg-slate-900 text-white text-sm hover:bg-blue-700 transition">
                  Join for Free
                </NavLink>
                <NavLink to="/auth"
                  className="block text-center py-3 font-bold text-sm text-slate-700 hover:text-blue-600 transition">
                  Log in
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
