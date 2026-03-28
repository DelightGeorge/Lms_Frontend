import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search, Bell, ChevronDown, Menu, X,
  LogOut, User, LayoutDashboard, BookOpen,
  GraduationCap, ShieldCheck, Home, TrendingUp,
  Flame, Zap, Star, Users, Loader2,
} from "lucide-react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileOpen,      setMobileOpen]       = useState(false);
  const [profileOpen,     setProfileOpen]      = useState(false);
  const [notifCount,      setNotifCount]       = useState(0);
  const [searchQuery,     setSearchQuery]      = useState("");
  const [placeholderIdx,  setPlaceholderIdx]   = useState(0);
  const [placeholderFade, setPlaceholderFade]  = useState(true);
  const [searchOpen,      setSearchOpen]       = useState(false);
  const [searchResults,   setSearchResults]    = useState({ courses: [], instructors: [] });
  const [searchLoading,   setSearchLoading]    = useState(false);
  const [showDropdown,    setShowDropdown]     = useState(false);
  const [searchFocused,   setSearchFocused]    = useState(false);

  const searchRef      = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchTimerRef = useRef(null);
  // Track whether we're interacting with dropdown — prevents blur from hiding it
  const mouseInsideDropdown = useRef(false);

  const placeholders = [
    "Search courses...",
    "Find an instructor...",
    "Try 'React', 'Python'...",
    "Explore by topic...",
    "Who teaches design?",
  ];

  const categories = [
    { name: "Development", emoji: "💻" },
    { name: "Business",    emoji: "📈" },
    { name: "Design",      emoji: "🎨" },
    { name: "Marketing",   emoji: "📣" },
  ];

  // ── Scroll ────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Resize ────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // ── Outside click closes profile ──────────────────────────
  useEffect(() => {
    const fn = (e) => { if (!e.target.closest("#profile-menu")) setProfileOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // ── Route change closes everything ────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setSearchOpen(false);
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults({ courses: [], instructors: [] });
  }, [location.pathname]);

  // ── Placeholder rotation ──────────────────────────────────
  useEffect(() => {
    if (searchQuery) return;
    const id = setInterval(() => {
      setPlaceholderFade(false);
      setTimeout(() => {
        setPlaceholderIdx(i => (i + 1) % placeholders.length);
        setPlaceholderFade(true);
      }, 200);
    }, 2800);
    return () => clearInterval(id);
  }, [searchQuery]);

  // ── Unread notifications ──────────────────────────────────
  useEffect(() => {
    if (!user) { setNotifCount(0); return; }
    API.get("/notifications/unread")
      .then((r) => setNotifCount(r.data?.count || 0))
      .catch(() =>
        API.get("/notifications")
          .then((r) => {
            const arr = Array.isArray(r.data) ? r.data : [];
            setNotifCount(arr.filter((n) => !n.isRead).length);
          })
          .catch(() => setNotifCount(0))
      );
  }, [user, location.pathname]);

  // ── Outside click closes search dropdown ─────────────────
  useEffect(() => {
    const fn = (e) => {
      if (
        searchRef.current && !searchRef.current.contains(e.target) &&
        mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  // ── Live search ───────────────────────────────────────────
  const handleSearchChange = useCallback((val) => {
    setSearchQuery(val);
    clearTimeout(searchTimerRef.current);

    if (!val.trim()) {
      setSearchResults({ courses: [], instructors: [] });
      setShowDropdown(false);
      return;
    }

    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const [coursesRes, instructorsRes] = await Promise.allSettled([
          API.get(`/courses?search=${encodeURIComponent(val.trim())}&limit=5`),
          API.get(`/users/instructors?search=${encodeURIComponent(val.trim())}&limit=4`),
        ]);
        const courses = coursesRes.status === "fulfilled"
          ? (coursesRes.value.data?.courses || coursesRes.value.data || []).slice(0, 5)
          : [];
        const instructors = instructorsRes.status === "fulfilled"
          ? (instructorsRes.value.data?.instructors || instructorsRes.value.data || []).slice(0, 4)
          : [];
        setSearchResults({ courses, instructors });
        setShowDropdown(true);
      } catch (_) {}
      finally { setSearchLoading(false); }
    }, 280);
  }, []);

  // Submit — navigate to courses page with search param
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    setShowDropdown(false);
    // Don't clear the input immediately so user can see what they searched
  };

  // Called when clicking a result link — close everything cleanly
  const handleResultClick = () => {
    setShowDropdown(false);
    setSearchQuery("");
    setSearchResults({ courses: [], instructors: [] });
    setSearchOpen(false);
    setMobileOpen(false);
    mouseInsideDropdown.current = false;
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowDropdown(false);
    setSearchResults({ courses: [], instructors: [] });
  };

  // ── Role helpers ──────────────────────────────────────────
  const roleBadge = {
    ADMIN:      "bg-red-100 text-red-600 border border-red-200",
    INSTRUCTOR: "bg-blue-100 text-blue-600 border border-blue-200",
    STUDENT:    "bg-emerald-100 text-emerald-600 border border-emerald-200",
  }[user?.role] || "bg-slate-100 text-slate-500";

  const dashboardLink = {
    ADMIN:      { to: "/admindashboard",      icon: <ShieldCheck size={14} />,     label: "Admin Panel", color: "text-red-600 hover:bg-red-50"     },
    INSTRUCTOR: { to: "/instructordashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard",   color: "text-slate-700 hover:bg-slate-100" },
    STUDENT:    { to: "/StudentDashboard",    icon: <GraduationCap size={14} />,   label: "My Learning", color: "text-slate-700 hover:bg-slate-100" },
  }[user?.role];

  const getDropdownLinks = () => {
    const base = [{ to: "/profile", icon: <User size={15} />, label: "My Profile" }];
    if (user?.role === "ADMIN")
      base.unshift({ to: "/admindashboard", icon: <ShieldCheck size={15} />, label: "Admin Panel" });
    if (user?.role === "INSTRUCTOR")
      base.unshift({ to: "/instructordashboard", icon: <LayoutDashboard size={15} />, label: "Dashboard" });
    if (user?.role === "STUDENT")
      base.unshift({ to: "/StudentDashboard", icon: <GraduationCap size={15} />, label: "My Learning" });
    return base;
  };

  // ── Sub-components ────────────────────────────────────────
  const Avatar = ({ size = "md" }) => {
    const dim = size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
    return user?.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.fullName}
        className={`${dim} rounded-full object-cover ring-2 ring-blue-500 ring-offset-1`} />
    ) : (
      <div className={`${dim} rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black shadow-md shrink-0`}>
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  const NotifIcon = ({ mobile = false }) => (
    <Link to="/notifications"
      className={`relative flex items-center gap-2 transition
        ${mobile
          ? "py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
          : "p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600"
        }`}>
      <Bell size={mobile ? 16 : 19} />
      {notifCount > 0 && (
        <span className={`bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center
          ${mobile ? "w-4 h-4" : "absolute -top-0.5 -right-0.5 w-4 h-4"}`}>
          {notifCount > 9 ? "9+" : notifCount}
        </span>
      )}
      {mobile && (
        <span>
          Notifications
          {notifCount > 0 && <span className="text-red-500 ml-1">({notifCount})</span>}
        </span>
      )}
    </Link>
  );

  // ── Shared search results dropdown ────────────────────────
  const SearchDropdown = ({ onResultClick }) => (
    <div
      onMouseEnter={() => { mouseInsideDropdown.current = true;  }}
      onMouseLeave={() => { mouseInsideDropdown.current = false; }}
      onMouseDown={(e) => e.preventDefault()} // prevent input blur
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden"
      style={{ maxHeight: "520px", overflowY: "auto" }}
    >
      {searchLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
            <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
            <Search size={14} className="absolute inset-0 m-auto text-blue-400" />
          </div>
          <p className="text-xs text-slate-400 font-medium">Finding results…</p>
        </div>
      ) : (
        <>
          {/* ── Courses ── */}
          {searchResults.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <BookOpen size={11} className="text-blue-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses</p>
                <span className="ml-auto text-[10px] text-slate-300">{searchResults.courses.length} found</span>
              </div>
              {searchResults.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group border-l-2 border-transparent hover:border-blue-500 mx-1 rounded-r-xl"
                >
                  <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                          <BookOpen size={14} className="text-slate-400" />
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors leading-tight">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {course.instructor?.fullName && (
                        <span className="text-[10px] text-slate-400 truncate">{course.instructor.fullName}</span>
                      )}
                      {course._count?.enrollments > 0 && (
                        <span className="text-[10px] text-slate-300 flex items-center gap-0.5 shrink-0">
                          <Users size={8} /> {course._count.enrollments}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[11px] font-black shrink-0 px-2 py-0.5 rounded-lg ${
                    course.price === 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-700"
                  }`}>
                    {course.price === 0 ? "Free" : `$${course.price}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ── Instructors ── */}
          {searchResults.instructors.length > 0 && (
            <div className={searchResults.courses.length > 0 ? "border-t border-slate-100 mt-1 pt-1" : ""}>
              <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                <Users size={11} className="text-indigo-500" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructors</p>
                <span className="ml-auto text-[10px] text-slate-300">{searchResults.instructors.length} found</span>
              </div>
              {searchResults.instructors.map((inst) => (
                <Link
                  key={inst.id}
                  to={`/instructors/${inst.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group border-l-2 border-transparent hover:border-indigo-500 mx-1 rounded-r-xl"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white font-black text-sm ring-2 ring-white shadow-sm">
                    {inst.avatarUrl
                      ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : inst.fullName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                      {inst.fullName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {inst.expertise && (
                        <span className="text-[10px] text-slate-400 truncate">{inst.expertise}</span>
                      )}
                      {inst._count?.courses > 0 && (
                        <span className="text-[10px] text-indigo-400 font-bold shrink-0 flex items-center gap-0.5">
                          <BookOpen size={8} /> {inst._count.courses} course{inst._count.courses !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0 group-hover:bg-indigo-100 transition">
                    View
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ── No results ── */}
          {!searchLoading && searchResults.courses.length === 0 && searchResults.instructors.length === 0 && searchQuery.trim() && (
            <div className="text-center py-10">
              <Search size={24} className="text-slate-200 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-400">No results for "{searchQuery}"</p>
              <p className="text-xs text-slate-300 mt-1">Try a different keyword</p>
            </div>
          )}

          {/* ── Footer links ── */}
          {(searchResults.courses.length > 0 || searchResults.instructors.length > 0) && (
            <div className="border-t border-slate-100 p-2 bg-slate-50/50">
              <div className="flex gap-1">
                <Link
                  to={`/courses?search=${encodeURIComponent(searchQuery)}`}
                  onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition"
                >
                  <BookOpen size={11} /> All courses
                </Link>
                <Link
                  to={`/instructors?search=${encodeURIComponent(searchQuery)}`}
                  onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                >
                  <Users size={11} /> All instructors
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  const hasResults = searchResults.courses.length > 0 || searchResults.instructors.length > 0 || searchLoading;

  return (
    <>
      {/* ── Top nav ───────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/96 backdrop-blur-xl shadow-lg shadow-black/5 py-2"
          : "bg-white border-b border-slate-100/80 py-3"
      }`}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-blue-600/30">
              L
            </div>
            <span className="text-lg font-black tracking-tight text-slate-900 hidden sm:block">
              MS<span className="text-blue-600 italic">PRO</span>
            </span>
          </Link>

          {/* Desktop: categories + search */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl mx-4">

            {/* Browse dropdown */}
            <div className="relative group shrink-0">
              <button className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-blue-600 py-2 px-2 rounded-lg hover:bg-slate-50 transition">
                Browse
                <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-52 bg-white shadow-2xl rounded-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 p-2 mt-2 z-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-2.5 pt-1 pb-2">Categories</p>
                {categories.map((cat) => (
                  <NavLink key={cat.name} to={`/categories/${cat.name.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-600 hover:bg-blue-50 hover:text-blue-700 rounded-xl font-medium transition">
                    <span>{cat.emoji}</span> {cat.name}
                  </NavLink>
                ))}
                <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                  <NavLink to="/courses"
                    className="flex items-center gap-2 px-2.5 py-2 text-sm text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition">
                    <Zap size={13} /> All Courses
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Desktop search */}
            <div ref={searchRef} className="relative flex-1">
              <form onSubmit={handleSearch}>
                {searchLoading
                  ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none z-10 animate-spin" size={15} />
                  : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={15} />
                }
                <input
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    setSearchFocused(true);
                    if (searchQuery.trim()) setShowDropdown(true);
                  }}
                  onBlur={() => {
                    // Delay long enough for mousedown on dropdown to register first
                    // mouseInsideDropdown prevents closing when clicking results
                    setTimeout(() => {
                      if (!mouseInsideDropdown.current) {
                        setSearchFocused(false);
                        setShowDropdown(false);
                      }
                    }, 200);
                  }}
                  placeholder={placeholders[placeholderIdx]}
                  className={`w-full rounded-xl py-2.5 pl-9 pr-8 text-sm outline-none transition-all
                    ${searchFocused
                      ? "bg-white ring-2 ring-blue-500 shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200/70"
                    }`}
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition z-10">
                    <X size={13} />
                  </button>
                )}
              </form>

              {/* Focus hint — shown when focused with empty input */}
              {!searchQuery && !hasResults && searchFocused && (
                <div className="absolute top-full left-0 mt-2 z-[999]">
                  <div className="flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-2xl px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                    <Search size={11} className="text-slate-400 shrink-0" />
                    <span>Search <span className="font-bold text-slate-700">courses</span> or find an <span className="font-bold text-slate-700">instructor</span> by name</span>
                    <span className="ml-auto bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-mono text-[10px]">↵</span>
                  </div>
                </div>
              )}

              {/* Desktop results dropdown */}
              {showDropdown && hasResults && (
                <SearchDropdown onResultClick={handleResultClick} />
              )}
            </div>
          </div>

          {/* Desktop: right side */}
          <div className="hidden lg:flex items-center gap-0.5">
            {user ? (
              <>
                <span className="text-sm text-slate-400 mr-2 hidden xl:block">
                  Hi, <span className="font-bold text-slate-800">{user.fullName?.split(" ")[0]}</span> 👋
                </span>

                {dashboardLink && (
                  <NavLink to={dashboardLink.to}
                    className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition mr-1 ${dashboardLink.color}`}>
                    {dashboardLink.icon}
                    <span className="hidden xl:inline">{dashboardLink.label}</span>
                  </NavLink>
                )}

                <NotifIcon />

                <div id="profile-menu" className="relative ml-1">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition">
                    <Avatar />
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-black text-slate-800 leading-none mb-0.5 max-w-[90px] truncate">
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${roleBadge}`}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50">
                      <div className="px-3 py-3 mb-1.5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm text-slate-900 truncate">{user.fullName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full mt-2.5 inline-block ${roleBadge}`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {getDropdownLinks().map(({ to, icon, label }) => (
                          <NavLink key={to} to={to} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition font-medium">
                            <span className="text-slate-400">{icon}</span> {label}
                          </NavLink>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 mt-1.5 pt-1.5">
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition font-semibold">
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/courses"
                  className="text-sm font-semibold text-slate-600 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-slate-100 transition">
                  Explore
                </Link>
                <NavLink to="/auth"
                  className="text-sm font-bold px-3 py-2 rounded-xl hover:bg-slate-100 transition text-slate-700">
                  Log in
                </NavLink>
                <NavLink to="/auth"
                  className="px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition shadow-md ml-1">
                  Join Free
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile: icons */}
          <div className="flex lg:hidden items-center gap-0.5">
            <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) clearSearch(); }}
              className="p-2.5 rounded-xl hover:bg-slate-100 transition text-slate-500">
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
            {user && <NotifIcon />}
            <button className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition ml-0.5"
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${searchOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="px-4 pb-3 pt-2 border-t border-slate-100 relative" ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="relative">
              {searchLoading
                ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400 animate-spin z-10" size={15} />
                : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={15} />
              }
              <input
                autoFocus={searchOpen}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                placeholder="Search courses, instructors..."
                className="w-full bg-slate-100 rounded-xl py-3 pl-9 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition z-10">
                  <X size={13} />
                </button>
              )}
            </form>

            {/* Mobile results */}
            {showDropdown && hasResults && (
              <div className="mt-2 max-h-[60vh] overflow-y-auto">
                <SearchDropdown onResultClick={handleResultClick} />
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} />

      {/* Mobile menu */}
      <div className={`fixed top-[57px] left-0 right-0 bg-white z-[60] shadow-2xl transition-all duration-300 lg:hidden overflow-y-auto max-h-[calc(100dvh-57px-72px)] ${
        mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
      }`}>

        {/* User banner / guest CTA */}
        <div className="px-4 pt-4 pb-3">
          {user ? (
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 text-white shadow-lg shadow-blue-600/20">
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm truncate">{user.fullName}</p>
                <p className="text-blue-200 text-xs truncate">{user.email}</p>
              </div>
              <span className="text-[9px] font-black bg-white/20 text-white px-2 py-1 rounded-full border border-white/30 shrink-0">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-2xl p-5 text-white shadow-lg">
              <p className="font-black text-base mb-0.5">Start Learning Today</p>
              <p className="text-slate-300 text-xs mb-4">Join thousands of students on LMSPRO</p>
              <div className="flex gap-2">
                <NavLink to="/auth" className="flex-1 text-center py-2.5 rounded-xl font-black bg-blue-600 hover:bg-blue-500 text-white text-sm transition">
                  Join Free
                </NavLink>
                <NavLink to="/auth" className="flex-1 text-center py-2.5 rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 transition">
                  Log in
                </NavLink>
              </div>
            </div>
          )}
        </div>

        {/* Student quick-stats */}
        {user?.role === "STUDENT" && (
          <div className="px-4 pb-3">
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: <Flame size={15} className="text-orange-500" />,     label: "Streak",     sub: "keep going" },
                { icon: <Star  size={15} className="text-amber-500"  />,     label: "My Courses", sub: "enrolled"   },
                { icon: <TrendingUp size={15} className="text-blue-500" />,  label: "Progress",   sub: "track it"   },
              ].map((s) => (
                <Link key={s.label} to="/StudentDashboard"
                  className="bg-slate-50 hover:bg-blue-50 active:scale-95 rounded-xl p-3 text-center transition">
                  <div className="flex justify-center mb-1.5">{s.icon}</div>
                  <p className="text-[10px] font-black text-slate-700 leading-none">{s.label}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{s.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending tags */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <Flame size={13} className="text-orange-500" />
              <p className="text-xs font-black text-slate-700">Trending Now</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Web Dev", "UI/UX", "Python", "Marketing", "AI"].map((tag) => (
                <Link key={tag} to={`/courses?search=${tag}`}
                  className="text-[10px] font-bold bg-white text-slate-600 hover:bg-orange-500 hover:text-white active:scale-95 px-2.5 py-1 rounded-full border border-amber-200 hover:border-orange-500 transition">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5 px-1">Browse Categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <NavLink key={cat.name} to={`/categories/${cat.name.toLowerCase()}`}
                className="flex items-center gap-2.5 py-3 px-3.5 font-semibold text-sm text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition active:scale-95">
                <span className="text-lg">{cat.emoji}</span> {cat.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Quick links — logged in users */}
        {user && (
          <div className="px-4 pb-3 border-t border-slate-100 pt-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Quick Links</p>
            <div className="space-y-0.5">
              <Link to="/" className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                <Home size={16} className="text-slate-400 shrink-0" /> Home
              </Link>
              {getDropdownLinks().map(({ to, icon, label }) => (
                <NavLink key={to} to={to}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                  <span className="text-slate-400 shrink-0">{icon}</span> {label}
                </NavLink>
              ))}
              <Link to="/notifications"
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
                <Bell size={16} className="text-slate-400 shrink-0" />
                Notifications
                {notifCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">
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
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl border border-red-100 transition">
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;