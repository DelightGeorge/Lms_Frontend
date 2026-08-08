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

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const PAPER  = "#EEF1F3";
const LINE   = "#D8DEE3";
const MUTED  = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

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
    { name: "Development" },
    { name: "Business"    },
    { name: "Design"      },
    { name: "Marketing"   },
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
  const roleBadgeStyle = {
    ADMIN:      { color: "#B23A2E", borderColor: "#E7C6C0", backgroundColor: "#FBF0EE" },
    INSTRUCTOR: { color: BLUE,      borderColor: LINE,      backgroundColor: PAPER     },
    STUDENT:    { color: MOSS,      borderColor: "#D6E3D9", backgroundColor: "#F0F5F1" },
  }[user?.role] || { color: MUTED, borderColor: LINE, backgroundColor: PAPER };

  const dashboardLink = {
    ADMIN:      { to: "/admindashboard",      icon: <ShieldCheck size={14} />,     label: "Admin Panel" },
    INSTRUCTOR: { to: "/instructordashboard", icon: <LayoutDashboard size={14} />, label: "Dashboard"   },
    STUDENT:    { to: "/StudentDashboard",    icon: <GraduationCap size={14} />,   label: "My Learning" },
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
        className={`${dim} rounded-sm object-cover ring-1`} style={{ "--tw-ring-color": BLUE }} />
    ) : (
      <div className={`${dim} rounded-sm text-white flex items-center justify-center font-black shrink-0`}
        style={{ backgroundColor: BLUE, fontFamily: DISPLAY_FONT }}>
        {user?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  const NotifIcon = ({ mobile = false }) => (
    <Link to="/notifications"
      className={`relative flex items-center gap-2 transition-colors
        ${mobile
          ? "py-2.5 px-3 rounded-sm text-sm font-semibold hover:bg-slate-50"
          : "p-2.5 rounded-sm hover:bg-slate-100"
        }`}
      style={{ color: mobile ? INK : MUTED }}>
      <Bell size={mobile ? 16 : 19} />
      {notifCount > 0 && (
        <span className={`text-white text-[9px] font-black rounded-full flex items-center justify-center
          ${mobile ? "w-4 h-4" : "absolute -top-0.5 -right-0.5 w-4 h-4"}`}
          style={{ backgroundColor: ORANGE }}>
          {notifCount > 9 ? "9+" : notifCount}
        </span>
      )}
      {mobile && (
        <span>
          Notifications
          {notifCount > 0 && <span className="ml-1" style={{ color: ORANGE }}>({notifCount})</span>}
        </span>
      )}
    </Link>
  );

  // ── Mobile search results — normal flow, not absolute ───────
  const MobileSearchResults = ({ onResultClick }) => (
    <div
      className="mt-2 bg-white rounded-sm shadow-xl border overflow-hidden"
      style={{ maxHeight: "60vh", overflowY: "auto", borderColor: LINE }}
    >
      {searchLoading ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Loader2 size={20} className="animate-spin" style={{ color: BLUE }} />
          <p className="text-xs" style={{ color: MUTED }}>Searching…</p>
        </div>
      ) : (
        <>
          {searchResults.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Courses</p>
                <span className="ml-auto text-[10px]" style={{ color: MUTED }}>{searchResults.courses.length} found</span>
              </div>
              {searchResults.courses.map((course) => (
                <Link key={course.id} to={`/courses/${course.id}`} onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition mx-1">
                  <div className="w-12 h-9 rounded-sm overflow-hidden bg-slate-100 shrink-0">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={14} style={{ color: LINE }} />
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight" style={{ color: INK }}>{course.title}</p>
                    {course.instructor?.fullName && (
                      <p className="text-[10px] truncate mt-0.5" style={{ color: MUTED }}>{course.instructor.fullName}</p>
                    )}
                  </div>
                  <span className="text-[10px] font-black shrink-0" style={{ fontFamily: MONO_FONT, color: course.price === 0 ? MOSS : INK }}>
                    {course.price === 0 ? "FREE" : `$${course.price}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {searchResults.instructors.length > 0 && (
            <div className={searchResults.courses.length > 0 ? "border-t mt-1 pt-1" : ""} style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Instructors</p>
              </div>
              {searchResults.instructors.map((inst) => (
                <Link key={inst.id} to={`/instructors/${inst.id}`} onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition mx-1">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ backgroundColor: BLUE }}>
                    {inst.avatarUrl
                      ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : inst.fullName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: INK }}>{inst.fullName}</p>
                    {inst.expertise && <p className="text-[10px] truncate mt-0.5" style={{ color: MUTED }}>{inst.expertise}</p>}
                  </div>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: BLUE }}>View</span>
                </Link>
              ))}
            </div>
          )}

          {searchResults.courses.length === 0 && searchResults.instructors.length === 0 && searchQuery.trim() && (
            <div className="text-center py-8">
              <Search size={20} className="mx-auto mb-2" style={{ color: LINE }} />
              <p className="text-sm font-bold" style={{ color: MUTED }}>No results for "{searchQuery}"</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Try a different keyword</p>
            </div>
          )}

          {(searchResults.courses.length > 0 || searchResults.instructors.length > 0) && (
            <div className="border-t p-2" style={{ borderColor: LINE, backgroundColor: PAPER }}>
              <div className="flex gap-1">
                <Link to={`/courses?search=${encodeURIComponent(searchQuery)}`} onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold hover:bg-white active:bg-white rounded-sm transition" style={{ color: BLUE }}>
                  All courses
                </Link>
                <Link to={`/instructors?search=${encodeURIComponent(searchQuery)}`} onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold hover:bg-white active:bg-white rounded-sm transition" style={{ color: BLUE }}>
                  All instructors
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  // ── Shared search results dropdown ────────────────────────
  const SearchDropdown = ({ onResultClick }) => (
    <div
      onMouseEnter={() => { mouseInsideDropdown.current = true;  }}
      onMouseLeave={() => { mouseInsideDropdown.current = false; }}
      onMouseDown={(e) => e.preventDefault()} // prevent input blur
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-sm shadow-2xl border z-[999] overflow-hidden"
      style={{ maxHeight: "520px", overflowY: "auto", borderColor: LINE }}
    >
      {searchLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <Loader2 size={22} className="animate-spin" style={{ color: BLUE }} />
          <p className="text-xs font-medium" style={{ color: MUTED }}>Searching…</p>
        </div>
      ) : (
        <>
          {/* ── Courses ── */}
          {searchResults.courses.length > 0 && (
            <div>
              <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Courses</p>
                <span className="ml-auto text-[10px]" style={{ color: MUTED }}>{searchResults.courses.length} found</span>
              </div>
              {searchResults.courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group mx-1"
                >
                  <div className="w-12 h-9 rounded-sm overflow-hidden bg-slate-100 shrink-0">
                    {course.thumbnail
                      ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={14} style={{ color: LINE }} />
                        </div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-tight" style={{ color: INK }}>
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {course.instructor?.fullName && (
                        <span className="text-[10px] truncate" style={{ color: MUTED }}>{course.instructor.fullName}</span>
                      )}
                      {course._count?.enrollments > 0 && (
                        <span className="text-[10px] flex items-center gap-0.5 shrink-0" style={{ color: MUTED }}>
                          <Users size={8} /> {course._count.enrollments}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-black shrink-0" style={{ fontFamily: MONO_FONT, color: course.price === 0 ? MOSS : INK }}>
                    {course.price === 0 ? "FREE" : `$${course.price}`}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ── Instructors ── */}
          {searchResults.instructors.length > 0 && (
            <div className={searchResults.courses.length > 0 ? "border-t mt-1 pt-1" : ""} style={{ borderColor: LINE }}>
              <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Instructors</p>
                <span className="ml-auto text-[10px]" style={{ color: MUTED }}>{searchResults.instructors.length} found</span>
              </div>
              {searchResults.instructors.map((inst) => (
                <Link
                  key={inst.id}
                  to={`/instructors/${inst.id}`}
                  onClick={onResultClick}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group mx-1"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white font-black text-sm" style={{ backgroundColor: BLUE }}>
                    {inst.avatarUrl
                      ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : inst.fullName?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate transition-colors" style={{ color: INK }}>
                      {inst.fullName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {inst.expertise && (
                        <span className="text-[10px] truncate" style={{ color: MUTED }}>{inst.expertise}</span>
                      )}
                      {inst._count?.courses > 0 && (
                        <span className="text-[10px] font-bold shrink-0 flex items-center gap-0.5" style={{ color: BLUE }}>
                          <BookOpen size={8} /> {inst._count.courses} course{inst._count.courses !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold shrink-0" style={{ color: BLUE }}>
                    View
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* ── No results ── */}
          {!searchLoading && searchResults.courses.length === 0 && searchResults.instructors.length === 0 && searchQuery.trim() && (
            <div className="text-center py-10">
              <Search size={22} className="mx-auto mb-2" style={{ color: LINE }} />
              <p className="text-sm font-bold" style={{ color: MUTED }}>No results for "{searchQuery}"</p>
              <p className="text-xs mt-1" style={{ color: MUTED }}>Try a different keyword</p>
            </div>
          )}

          {/* ── Footer links ── */}
          {(searchResults.courses.length > 0 || searchResults.instructors.length > 0) && (
            <div className="border-t p-2" style={{ borderColor: LINE, backgroundColor: PAPER }}>
              <div className="flex gap-1">
                <Link
                  to={`/courses?search=${encodeURIComponent(searchQuery)}`}
                  onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold hover:bg-white rounded-sm transition"
                  style={{ color: BLUE }}
                >
                  All courses
                </Link>
                <Link
                  to={`/instructors?search=${encodeURIComponent(searchQuery)}`}
                  onClick={onResultClick}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold hover:bg-white rounded-sm transition"
                  style={{ color: BLUE }}
                >
                  All instructors
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
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        isScrolled ? "shadow-md py-2" : "border-b py-3"
      }`} style={{ borderColor: isScrolled ? "transparent" : LINE }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white font-black text-lg" style={{ backgroundColor: BLUE, fontFamily: DISPLAY_FONT }}>
              L
            </div>
            <span className="text-lg font-black tracking-tight hidden sm:block" style={{ color: INK, fontFamily: DISPLAY_FONT }}>
              MS<span style={{ color: ORANGE }}>PRO</span>
            </span>
          </Link>

          {/* Desktop: categories + search */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl mx-4">

            {/* Browse dropdown */}
            <div className="relative group shrink-0">
              <button className="flex items-center gap-1.5 text-sm font-semibold py-2 px-2 rounded-sm hover:bg-slate-50 transition-colors" style={{ color: MUTED }}>
                Browse
                <ChevronDown size={13} className="group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-52 bg-white shadow-2xl rounded-sm border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 translate-y-1 group-hover:translate-y-0 p-2 mt-2 z-50" style={{ borderColor: LINE }}>
                <p className="text-[10px] font-bold uppercase tracking-widest px-2.5 pt-1 pb-2" style={{ color: MUTED, fontFamily: MONO_FONT }}>Categories</p>
                {categories.map((cat) => (
                  <NavLink key={cat.name} to={`/categories/${cat.name.toLowerCase()}`}
                    className="flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-sm font-medium transition-colors hover:bg-slate-50"
                    style={{ color: INK }}>
                    {cat.name}
                  </NavLink>
                ))}
                <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: LINE }}>
                  <NavLink to="/courses"
                    className="flex items-center gap-2 px-2.5 py-2 text-sm font-bold rounded-sm hover:bg-slate-50 transition-colors"
                    style={{ color: ORANGE }}>
                    <Zap size={13} /> All Courses
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Desktop search */}
            <div ref={searchRef} className="relative flex-1">
              <form onSubmit={handleSearch}>
                {searchLoading
                  ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10 animate-spin" size={15} style={{ color: BLUE }} />
                  : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" size={15} style={{ color: MUTED }} />
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
                    setTimeout(() => {
                      if (!mouseInsideDropdown.current) {
                        setSearchFocused(false);
                        setShowDropdown(false);
                      }
                    }, 200);
                  }}
                  placeholder={placeholders[placeholderIdx]}
                  className="w-full rounded-sm py-2.5 pl-9 pr-8 text-sm outline-none transition-all border"
                  style={searchFocused
                    ? { backgroundColor: "#fff", borderColor: BLUE, boxShadow: `0 0 0 1px ${BLUE}` }
                    : { backgroundColor: PAPER, borderColor: "transparent" }}
                />
                {searchQuery && (
                  <button type="button" onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition z-10" style={{ color: MUTED }}>
                    <X size={13} />
                  </button>
                )}
              </form>

              {/* Focus hint — shown when focused with empty input */}
              {!searchQuery && !hasResults && searchFocused && (
                <div className="absolute top-full left-0 mt-2 z-[999]">
                  <div className="flex items-center gap-2 bg-white border shadow-lg rounded-sm px-3 py-2 text-xs whitespace-nowrap" style={{ borderColor: LINE, color: MUTED }}>
                    <Search size={11} className="shrink-0" style={{ color: MUTED }} />
                    <span>Search <span className="font-bold" style={{ color: INK }}>courses</span> or find an <span className="font-bold" style={{ color: INK }}>instructor</span></span>
                    <span className="ml-auto px-1.5 py-0.5 rounded font-mono text-[10px]" style={{ backgroundColor: PAPER, color: MUTED }}>↵</span>
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
                <span className="text-sm mr-2 hidden xl:block" style={{ color: MUTED }}>
                  Hi, <span className="font-bold" style={{ color: INK }}>{user.fullName?.split(" ")[0]}</span>
                </span>

                {dashboardLink && (
                  <NavLink to={dashboardLink.to}
                    className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-sm transition-colors mr-1 hover:bg-slate-50"
                    style={{ color: INK }}>
                    {dashboardLink.icon}
                    <span className="hidden xl:inline">{dashboardLink.label}</span>
                  </NavLink>
                )}

                <NotifIcon />

                <div id="profile-menu" className="relative ml-1">
                  <button onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-sm hover:bg-slate-50 transition-colors">
                    <Avatar />
                    <div className="hidden xl:block text-left">
                      <p className="text-xs font-black leading-none mb-1 max-w-[90px] truncate" style={{ color: INK }}>
                        {user.fullName?.split(" ")[0]}
                      </p>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-sm border" style={roleBadgeStyle}>
                        {user.role}
                      </span>
                    </div>
                    <ChevronDown size={13} className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} style={{ color: MUTED }} />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-sm shadow-2xl border p-2 z-50" style={{ borderColor: LINE }}>
                      <div className="px-3 py-3 mb-1.5 rounded-sm border" style={{ backgroundColor: PAPER, borderColor: LINE }}>
                        <div className="flex items-center gap-3">
                          <Avatar size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm truncate" style={{ color: INK }}>{user.fullName}</p>
                            <p className="text-[10px] truncate" style={{ color: MUTED }}>{user.email}</p>
                          </div>
                        </div>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-sm border mt-2.5 inline-block" style={roleBadgeStyle}>
                          {user.role}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {getDropdownLinks().map(({ to, icon, label }) => (
                          <NavLink key={to} to={to} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors font-medium hover:bg-slate-50"
                            style={{ color: INK }}>
                            <span style={{ color: MUTED }}>{icon}</span> {label}
                          </NavLink>
                        ))}
                      </div>
                      <div className="border-t mt-1.5 pt-1.5" style={{ borderColor: LINE }}>
                        <button onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors font-semibold hover:bg-red-50"
                          style={{ color: "#B23A2E" }}>
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
                  className="text-sm font-semibold px-3 py-2 rounded-sm hover:bg-slate-50 transition-colors" style={{ color: MUTED }}>
                  Explore
                </Link>
                <NavLink to="/auth"
                  className="text-sm font-bold px-3 py-2 rounded-sm hover:bg-slate-50 transition-colors" style={{ color: INK }}>
                  Log in
                </NavLink>
                <NavLink to="/auth"
                  className="px-4 py-2 text-white rounded-sm font-bold text-sm transition-colors ml-1"
                  style={{ backgroundColor: BLUE }}>
                  Join Free
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile: icons */}
          <div className="flex lg:hidden items-center gap-0.5">
            <button onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) clearSearch(); }}
              className="p-2.5 rounded-sm hover:bg-slate-50 transition-colors" style={{ color: MUTED }}>
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
            {user && <NotifIcon />}
            <button className="p-2.5 rounded-sm hover:bg-slate-50 transition-colors ml-0.5" style={{ color: INK }}
              onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        <div className={`lg:hidden transition-all duration-300 ${
          searchOpen ? "opacity-100" : "opacity-0 pointer-events-none h-0 overflow-hidden"
        }`}>
          <div className="px-4 pb-3 pt-2 border-t" style={{ borderColor: LINE }} ref={mobileSearchRef}>
            <form onSubmit={handleSearch} className="relative">
              {searchLoading
                ? <Loader2 className="absolute left-3.5 top-1/2 -translate-y-1/2 animate-spin z-10" size={15} style={{ color: BLUE }} />
                : <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10" size={15} style={{ color: MUTED }} />
              }
              <input
                autoFocus={searchOpen}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => { if (searchQuery.trim()) setShowDropdown(true); }}
                placeholder="Search courses, instructors..."
                className="w-full rounded-sm py-3 pl-9 pr-8 text-sm outline-none transition-all border focus:bg-white"
                style={{ backgroundColor: PAPER, borderColor: "transparent" }}
              />
              {searchQuery && (
                <button type="button" onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition z-10" style={{ color: MUTED }}>
                  <X size={13} />
                </button>
              )}
            </form>

            {/* Mobile results — rendered in normal flow (not absolute) so nothing clips it */}
            {showDropdown && hasResults && (
              <MobileSearchResults onResultClick={handleResultClick} />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div onClick={() => setMobileOpen(false)}
        className={`fixed inset-0 bg-black/40 z-[55] transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`} />

      {/* Mobile menu */}
      <div className={`fixed top-[57px] left-0 right-0 bg-white z-[60] shadow-2xl transition-all duration-300 lg:hidden overflow-y-auto max-h-[calc(100dvh-57px-72px)] ${
        mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0 pointer-events-none"
      }`}>

        {/* User banner / guest CTA */}
        <div className="px-4 pt-4 pb-3">
          {user ? (
            <div className="flex items-center gap-3 rounded-sm p-4 text-white" style={{ backgroundColor: BLUE }}>
              <Avatar />
              <div className="min-w-0 flex-1">
                <p className="font-black text-sm truncate">{user.fullName}</p>
                <p className="text-xs truncate text-white/70">{user.email}</p>
              </div>
              <span className="text-[9px] font-black bg-white/15 text-white px-2 py-1 rounded-sm border border-white/25 shrink-0">
                {user.role}
              </span>
            </div>
          ) : (
            <div className="rounded-sm p-5 text-white" style={{ backgroundColor: "#12283D" }}>
              <p className="font-black text-base mb-0.5">Start learning today</p>
              <p className="text-white/60 text-xs mb-4">Join a course, work through it at your pace.</p>
              <div className="flex gap-2">
                <NavLink to="/auth" className="flex-1 text-center py-2.5 rounded-sm font-black text-white text-sm transition-colors" style={{ backgroundColor: ORANGE }}>
                  Join Free
                </NavLink>
                <NavLink to="/auth" className="flex-1 text-center py-2.5 rounded-sm font-bold bg-white/10 hover:bg-white/20 text-white text-sm border border-white/20 transition-colors">
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
                { icon: <Flame size={15} style={{ color: ORANGE }} />, label: "Streak",     sub: "keep going" },
                { icon: <Star  size={15} style={{ color: BLUE }}   />, label: "My Courses", sub: "enrolled"   },
                { icon: <TrendingUp size={15} style={{ color: MOSS }} />, label: "Progress", sub: "track it"   },
              ].map((s) => (
                <Link key={s.label} to="/StudentDashboard"
                  className="rounded-sm p-3 text-center transition-colors active:scale-95 border hover:bg-slate-50"
                  style={{ backgroundColor: PAPER, borderColor: LINE }}>
                  <div className="flex justify-center mb-1.5">{s.icon}</div>
                  <p className="text-[10px] font-black leading-none" style={{ color: INK }}>{s.label}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: MUTED }}>{s.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Trending tags */}
        <div className="px-4 pb-4">
          <div className="rounded-sm p-3.5 border" style={{ backgroundColor: PAPER, borderColor: LINE }}>
            <div className="flex items-center gap-2 mb-2.5">
              <Flame size={13} style={{ color: ORANGE }} />
              <p className="text-xs font-black" style={{ color: INK }}>Trending now</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Web Dev", "UI/UX", "Python", "Marketing", "AI"].map((tag) => (
                <Link key={tag} to={`/courses?search=${tag}`}
                  className="text-[10px] font-bold bg-white px-2.5 py-1 rounded-sm border active:scale-95 transition-colors"
                  style={{ color: INK, borderColor: LINE }}>
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="px-4 pb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2.5 px-1" style={{ color: MUTED, fontFamily: MONO_FONT }}>Browse categories</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <NavLink key={cat.name} to={`/categories/${cat.name.toLowerCase()}`}
                className="flex items-center gap-2.5 py-3 px-3.5 font-semibold text-sm rounded-sm transition-colors active:scale-95 border hover:bg-slate-50"
                style={{ color: INK, borderColor: LINE }}>
                {cat.name}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Quick links — logged in users */}
        {user && (
          <div className="px-4 pb-3 border-t pt-3" style={{ borderColor: LINE }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: MUTED, fontFamily: MONO_FONT }}>Quick links</p>
            <div className="space-y-0.5">
              <Link to="/" className="flex items-center gap-3 py-2.5 px-3 rounded-sm text-sm font-semibold hover:bg-slate-50 transition-colors" style={{ color: INK }}>
                <Home size={16} style={{ color: MUTED }} className="shrink-0" /> Home
              </Link>
              {getDropdownLinks().map(({ to, icon, label }) => (
                <NavLink key={to} to={to}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-sm text-sm font-semibold hover:bg-slate-50 transition-colors" style={{ color: INK }}>
                  <span className="shrink-0" style={{ color: MUTED }}>{icon}</span> {label}
                </NavLink>
              ))}
              <Link to="/notifications"
                className="flex items-center gap-3 py-2.5 px-3 rounded-sm text-sm font-semibold hover:bg-slate-50 transition-colors" style={{ color: INK }}>
                <Bell size={16} style={{ color: MUTED }} className="shrink-0" />
                Notifications
                {notifCount > 0 && (
                  <span className="ml-auto text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0" style={{ backgroundColor: ORANGE }}>
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
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-sm border transition-colors hover:bg-red-50"
              style={{ color: "#B23A2E", borderColor: "#E7C6C0" }}>
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;