import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search, TrendingUp, Users, Award, CheckCircle, BookOpen,
  ArrowRight, Sparkles, ChevronRight,
  Play, Loader2, GraduationCap, Filter, Clock, Zap, Globe, X,
} from "lucide-react";
import { getAllCourses, getAllCategories } from "../services/courseService";
import API from "../services/api";

// ── Palette tokens (blueprint direction) ─────────────────
const INK       = "#22262B";
const BLUE      = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER     = "#EEF1F3";
const LINE      = "#D8DEE3";
const MUTED     = "#5B6570";
const ORANGE    = "#D65A2E";
const MOSS      = "#4C7A5C";

const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

// ── Placeholder images ───────────────────────────────────
const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
];

const getImg = (course, idx) =>
  course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];

// ── Signature motif: registration corner marks ───────────
const CornerMarks = ({ color = BLUE, size = 12 }) => (
  <>
    <span className="absolute -top-px -left-px border-t-2 border-l-2 pointer-events-none"
      style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute -top-px -right-px border-t-2 border-r-2 pointer-events-none"
      style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute -bottom-px -left-px border-b-2 border-l-2 pointer-events-none"
      style={{ width: size, height: size, borderColor: color }} />
    <span className="absolute -bottom-px -right-px border-b-2 border-r-2 pointer-events-none"
      style={{ width: size, height: size, borderColor: color }} />
  </>
);

// ── Signature motif: drafting grid background ────────────
const DraftGrid = ({ dark = false, opacity = 0.06 }) => (
  <div
    className="absolute inset-0 pointer-events-none"
    style={{
      backgroundImage: `linear-gradient(${dark ? "255,255,255" : "27,58,92"},${opacity}) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(${dark ? "255,255,255" : "27,58,92"},${opacity}) 1px, transparent 1px)`
        .replace(/linear-gradient\((\d+,\d+,\d+),/, "linear-gradient(rgba($1,"),
      backgroundSize: "44px 44px",
    }}
  />
);

// ── Leader-line stat ──────────────────────────────────────
const LedgerStat = ({ value, label, color = BLUE }) => (
  <div className="flex flex-col gap-1 pl-3 border-l-2" style={{ borderColor: color }}>
    <span className="text-2xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{value}</span>
    <span className="text-[10px] uppercase tracking-widest font-semibold" style={{ fontFamily: MONO_FONT, color: MUTED }}>
      {label}
    </span>
  </div>
);

// ── Feature card ──────────────────────────────────────────
const BlueprintFeature = ({ icon, title, desc, index }) => (
  <div className="relative bg-white border rounded-md p-7 h-full" style={{ borderColor: LINE }}>
    <div className="flex items-start justify-between mb-5">
      <div className="w-11 h-11 rounded-md flex items-center justify-center text-white" style={{ backgroundColor: BLUE }}>
        {icon}
      </div>
      <span className="text-[10px] font-semibold tracking-widest" style={{ fontFamily: MONO_FONT, color: MUTED }}>
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
    <h3 className="font-bold text-base" style={{ color: INK }}>{title}</h3>
    <p className="text-sm leading-relaxed mt-2" style={{ color: MUTED }}>{desc}</p>
  </div>
);

// ── Course card ───────────────────────────────────────────
const BlueprintCourseCard = ({ course, idx }) => {
  const isFree = (course?.price ?? 1) === 0;
  return (
    <Link to={`/courses/${course?.id}`} className="group block h-full">
      <div className="relative h-full bg-white rounded-md overflow-hidden border flex flex-col transition-shadow duration-200 hover:shadow-lg"
        style={{ borderColor: LINE }}>
        <span className="absolute top-3 left-3 z-10">
          <CornerMarks color="#FFFFFF" size={10} />
        </span>
        <div className="relative overflow-hidden h-44">
          <img
            src={getImg(course, idx)}
            alt={course?.title || "Course"}
            className="w-full h-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors duration-300 flex items-center justify-center">
            <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300">
              <Play size={18} style={{ color: BLUE }} className="ml-0.5 fill-current" />
            </div>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-sm line-clamp-2 mb-1" style={{ color: INK }}>
            {course?.title || "Untitled Course"}
          </h3>
          <p className="text-xs mb-3" style={{ color: MUTED, fontFamily: MONO_FONT }}>
            {course?.instructor?.fullName || "Instructor TBD"}
          </p>
          <p className="text-xs line-clamp-2 mb-4 flex-1" style={{ color: MUTED }}>
            {course?.description || ""}
          </p>
          <div className="border-t pt-3 flex items-center justify-between" style={{ borderColor: LINE }}>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: INK }}>4.8</span>
              <span className="text-[10px]" style={{ color: MUTED }}>rating</span>
            </div>
            {course?.category?.name && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm border" style={{ color: MUTED, borderColor: LINE, fontFamily: MONO_FONT }}>
                {course.category.name.toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="font-black text-sm" style={{ fontFamily: MONO_FONT, color: isFree ? MOSS : ORANGE }}>
              {isFree ? "FREE" : `$${course?.price}`}
            </p>
            <span className="text-[10px] flex items-center gap-1" style={{ color: MUTED }}>
              <Clock size={11} /> 6h+
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Skeleton loader ───────────────────────────────
const CourseSkeleton = () => (
  <div className="bg-white rounded-md overflow-hidden border animate-pulse h-full flex flex-col" style={{ borderColor: LINE }}>
    <div className="w-full h-44" style={{ backgroundColor: PAPER }} />
    <div className="p-5 space-y-3 flex-1">
      <div className="h-4 rounded w-3/4" style={{ backgroundColor: PAPER }} />
      <div className="h-3 rounded w-1/2" style={{ backgroundColor: PAPER }} />
      <div className="h-3 rounded w-full" style={{ backgroundColor: PAPER }} />
      <div className="mt-auto pt-3 border-t space-y-2" style={{ borderColor: LINE }}>
        <div className="h-4 rounded w-1/3" style={{ backgroundColor: PAPER }} />
        <div className="h-4 rounded w-1/2" style={{ backgroundColor: PAPER }} />
      </div>
    </div>
  </div>
);

// ── Main Home Component ───────────────────────────
const Home = () => {
  const [courses, setCourses]               = useState([]);
  const [categories, setCategories]         = useState([]);
  const [activeTab, setActiveTab]           = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchInput, setSearchInput]       = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [stats, setStats]                   = useState({ courses: 0, students: "2M+", instructors: "800+" });

  // Live search state
  const [liveResults,   setLiveResults]   = useState({ courses: [], instructors: [] });
  const [liveLoading,   setLiveLoading]   = useState(false);
  const [showLive,      setShowLive]      = useState(false);
  const [heroFocused,   setHeroFocused]   = useState(false);
  const searchRef   = useRef(null);
  const debounceRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    getAllCourses()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setCourses(data);
        setStats((s) => ({ ...s, courses: data.length }));
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    getAllCategories()
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, []);

  // Outside click closes live results
  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowLive(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Debounced live search
  const handleLiveSearch = useCallback((val) => {
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    if (!val.trim()) { setLiveResults({ courses: [], instructors: [] }); setShowLive(false); return; }
    debounceRef.current = setTimeout(async () => {
      setLiveLoading(true);
      try {
        const [cRes, iRes] = await Promise.allSettled([
          API.get(`/courses?search=${encodeURIComponent(val.trim())}&limit=5`),
          API.get(`/users/instructors?search=${encodeURIComponent(val.trim())}&limit=3`),
        ]);
        const courses     = cRes.status === "fulfilled" ? (cRes.value.data?.courses     || cRes.value.data || []).slice(0, 5) : [];
        const instructors = iRes.status === "fulfilled" ? (iRes.value.data?.instructors || iRes.value.data || []).slice(0, 3) : [];
        setLiveResults({ courses, instructors });
        setShowLive(true);
      } catch (_) {}
      finally { setLiveLoading(false); }
    }, 280);
  }, []);

  const clearLive = () => { setSearchInput(""); setLiveResults({ courses: [], instructors: [] }); setShowLive(false); };

  const handleSearch = (e) => {
    e.preventDefault();
    setShowLive(false);
    if (searchInput.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchInput.trim())}`);
    } else {
      document.getElementById("all-courses")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesTab =
      activeTab === "All" ||
      c.category?.name?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch && c.status === "PUBLISHED";
  });

  const categoryTabs     = ["All", ...categories.map((c) => c.name)];
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
  const publishedCount   = publishedCourses.length;

  const featuredCourses = publishedCourses.slice(0, 4);
  const featuredIds     = new Set(featuredCourses.map((c) => c.id));

  const isFiltering     = !!searchQuery || activeTab !== "All";
  const hasExtraCourses = publishedCourses.length > 4;

  const browsePool = (isFiltering || !hasExtraCourses)
    ? publishedCourses
    : publishedCourses.filter((c) => !featuredIds.has(c.id));

  const filteredBrowse = browsePool.filter((c) => {
    const matchesTab    = activeTab === "All" || c.category?.name?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const browseVisible = isFiltering ? filteredBrowse : filteredBrowse.slice(0, 4);
  const browseHasMore = !isFiltering && filteredBrowse.length > 4;

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: PAPER }}>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
          <DraftGrid dark opacity={0.05} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-28 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-white">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-sm text-xs font-semibold tracking-widest"
                  style={{ borderColor: "rgba(255,255,255,0.25)", fontFamily: MONO_FONT }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                  CATALOG — {new Date().getFullYear()}
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
                  style={{ fontFamily: DISPLAY_FONT }}>
                  Build skills
                  <br />
                  <span style={{ color: ORANGE }}>you can ship.</span>
                </h1>
                <p className="text-base text-white/70 max-w-xl leading-relaxed">
                  Courses built by people who do the work. Pick a subject, work through it at your pace, and walk away with something you can use.
                </p>
              </div>

              <div ref={searchRef} className="relative max-w-lg w-full">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    {liveLoading
                      ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 animate-spin z-10" size={16} style={{ color: ORANGE }} />
                      : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 z-10" size={16} />}
                    <input
                      value={searchInput}
                      onChange={(e) => handleLiveSearch(e.target.value)}
                      onFocus={() => { setHeroFocused(true); searchInput.trim() && setShowLive(true); }}
                      onBlur={() => setTimeout(() => { setHeroFocused(false); setShowLive(false); }, 300)}
                      placeholder="Search a course or instructor"
                      className="w-full bg-white/10 border border-white/20 rounded-sm py-3.5 pl-11 pr-10 outline-none focus:bg-white focus:text-slate-900 transition placeholder:text-white/40 text-sm text-white"
                      style={{ borderColor: "rgba(255,255,255,0.2)" }}
                    />
                    {searchInput && (
                      <button type="button" onClick={clearLive}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition z-10">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button type="submit"
                    className="font-bold py-3.5 px-7 rounded-sm whitespace-nowrap text-sm text-white transition-colors active:scale-95"
                    style={{ backgroundColor: ORANGE }}>
                    Search
                  </button>
                </form>

                {/* Live results dropdown */}
                {showLive && searchInput.trim() && (
                  <div onMouseDown={(e) => e.preventDefault()}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-sm shadow-2xl border z-[999] overflow-hidden max-h-[420px] overflow-y-auto"
                    style={{ borderColor: LINE }}>
                    {liveLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <Loader2 size={20} className="animate-spin" style={{ color: BLUE }} />
                        <p className="text-xs" style={{ color: MUTED }}>Searching…</p>
                      </div>
                    ) : (
                      <>
                        {liveResults.courses.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Courses</p>
                              <span className="ml-auto text-[10px]" style={{ color: MUTED }}>{liveResults.courses.length} found</span>
                            </div>
                            {liveResults.courses.map((course) => (
                              <Link key={course.id} to={`/courses/${course.id}`}
                                onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition border-l-2 border-transparent mx-1"
                                style={{ "--tw-border-opacity": 1 }}
                                onMouseEnter={(e) => e.currentTarget.style.borderColor = BLUE}
                                onMouseLeave={(e) => e.currentTarget.style.borderColor = "transparent"}>
                                <div className="w-12 h-9 rounded-sm overflow-hidden bg-slate-100 shrink-0">
                                  {course.thumbnail
                                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={13} style={{ color: LINE }} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate" style={{ color: INK }}>{course.title}</p>
                                  <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>{course.instructor?.fullName}</p>
                                </div>
                                <span className="text-[10px] font-bold shrink-0" style={{ fontFamily: MONO_FONT, color: (course.price ?? 1) === 0 ? MOSS : ORANGE }}>
                                  {(course.price ?? 1) === 0 ? "FREE" : `$${course.price}`}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.instructors.length > 0 && (
                          <div className={liveResults.courses.length > 0 ? "border-t mt-1 pt-1" : ""} style={{ borderColor: LINE }}>
                            <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Instructors</p>
                            </div>
                            {liveResults.instructors.map((inst) => (
                              <Link key={inst.id} to={`/instructors/${inst.id}`}
                                onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition mx-1">
                                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-white font-black text-sm"
                                  style={{ backgroundColor: BLUE }}>
                                  {inst.avatarUrl ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" /> : (inst.fullName?.[0] || "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold truncate" style={{ color: INK }}>{inst.fullName}</p>
                                  <p className="text-[10px] truncate" style={{ color: MUTED }}>{inst.expertise || "Instructor"}{inst._count?.courses ? ` · ${inst._count.courses} courses` : ""}</p>
                                </div>
                                <span className="text-[10px] font-bold shrink-0" style={{ color: BLUE }}>View</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.courses.length === 0 && liveResults.instructors.length === 0 && (
                          <div className="text-center py-10">
                            <Search size={20} className="mx-auto mb-2" style={{ color: LINE }} />
                            <p className="text-sm font-bold" style={{ color: MUTED }}>No results for "{searchInput}"</p>
                            <p className="text-xs mt-1" style={{ color: MUTED }}>Try a different keyword</p>
                          </div>
                        )}
                        {(liveResults.courses.length > 0 || liveResults.instructors.length > 0) && (
                          <div className="border-t p-2" style={{ borderColor: LINE, backgroundColor: PAPER }}>
                            <div className="flex gap-1">
                              <Link to={`/courses?search=${encodeURIComponent(searchInput)}`}
                                onClick={clearLive}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold hover:bg-white rounded-sm transition"
                                style={{ color: BLUE }}>
                                All courses
                              </Link>
                              <Link to={`/instructors?search=${encodeURIComponent(searchInput)}`}
                                onClick={clearLive}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold hover:bg-white rounded-sm transition"
                                style={{ color: BLUE }}>
                                All instructors
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-8">
                <LedgerStat value={publishedCount || "500+"} label="Courses" color={ORANGE} />
                <LedgerStat value={stats.students} label="Learners" color={MOSS} />
                <LedgerStat value="4.9" label="Avg rating" color="#7B93A8" />
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-sm overflow-hidden">
                <CornerMarks color={ORANGE} size={16} />
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                  alt="Student working through course material"
                  className="w-full h-full object-cover grayscale-[20%]"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(18,40,61,0.5), transparent 50%)" }} />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-sm p-5 shadow-2xl border" style={{ borderColor: LINE }}>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-sm flex items-center justify-center text-white" style={{ backgroundColor: MOSS }}>
                    <CheckCircle size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>Completion rate</p>
                    <p className="text-xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>97%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20 py-20">

          {/* ── FEATURED COURSES ── */}
          {!searchQuery && featuredCourses.length > 0 && (
            <section>
              <div className="mb-10 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ORANGE, fontFamily: MONO_FONT }}>§ 01 — Featured</p>
                  <h2 className="text-4xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Trending this week</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingCourses
                  ? [1,2,3,4].map((i) => <CourseSkeleton key={i} />)
                  : featuredCourses.map((course, idx) => (
                      <BlueprintCourseCard key={course.id} course={course} idx={idx} />
                    ))}
              </div>
              {!loadingCourses && publishedCount > 4 && (
                <div className="flex justify-center mt-10">
                  <Link to="/courses"
                    className="inline-flex items-center gap-2 border-2 font-bold px-7 py-3 rounded-sm transition text-sm hover:bg-white"
                    style={{ borderColor: BLUE, color: BLUE }}>
                    See all trending <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* ── BROWSE COURSES ── */}
          <section id="all-courses" className="bg-white rounded-sm p-8 sm:p-12 border" style={{ borderColor: LINE }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ORANGE, fontFamily: MONO_FONT }}>§ 02 — Catalog</p>
                <h2 className="text-4xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                  {searchQuery ? `Results for "${searchQuery}"` : "All courses"}
                </h2>
                <p className="mt-2" style={{ color: MUTED }}>
                  {isFiltering ? filteredBrowse.length : publishedCount} course{(isFiltering ? filteredBrowse.length : publishedCount) !== 1 ? "s" : ""} available
                </p>
              </div>
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  className="text-sm font-bold rounded-sm px-4 py-2 transition-colors flex items-center gap-1 border"
                  style={{ color: ORANGE, borderColor: ORANGE }}>
                  <Filter size={14} /> Clear
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
              {categoryTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-5 py-2.5 rounded-sm text-sm font-bold whitespace-nowrap transition-colors border"
                  style={activeTab === tab
                    ? { backgroundColor: BLUE, color: "#fff", borderColor: BLUE }
                    : { backgroundColor: "transparent", color: MUTED, borderColor: LINE }}>
                  {tab}
                </button>
              ))}
            </div>

            {loadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4,5,6,7,8].map((i) => <CourseSkeleton key={i} />)}
              </div>
            ) : filteredBrowse.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen size={48} className="mx-auto mb-4" style={{ color: LINE }} />
                <p className="font-bold text-xl" style={{ color: INK }}>
                  {searchQuery ? "No courses found" : "No more courses yet"}
                </p>
                <p className="text-sm mt-2" style={{ color: MUTED }}>
                  {searchQuery ? "Try different keywords" : "Check back soon"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {browseVisible.map((course, idx) => (
                    <BlueprintCourseCard key={course.id} course={course} idx={idx} />
                  ))}
                </div>
                {browseHasMore && (
                  <div className="flex justify-center mt-10">
                    <Link to="/courses"
                      className="inline-flex items-center gap-2 text-white font-bold px-7 py-3 rounded-sm transition text-sm active:scale-95"
                      style={{ backgroundColor: ORANGE }}>
                      See all courses <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── WHY CHOOSE US ── */}
          <section>
            <div className="mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ORANGE, fontFamily: MONO_FONT }}>§ 03 — Specification</p>
              <h2 className="text-4xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>What you're getting</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: <TrendingUp size={20} />, title: "Built for the job market",  desc: "Courses shaped around what teams are actually hiring for right now." },
                { icon: <Award size={20} />,      title: "Certificates that hold up",  desc: "A credential you can put on a resume or LinkedIn without hedging." },
                { icon: <Users size={20} />,      title: "Taught by practitioners",    desc: "Instructors who do this work day to day, not full-time presenters." },
                { icon: <Clock size={20} />,      title: "No expiry",                  desc: "Once you're in, the material is yours — go back to it whenever." },
                { icon: <Globe size={20} />,      title: "800+ instructors",           desc: "A wide enough bench that you're not stuck with one teaching style." },
                { icon: <Sparkles size={20} />,   title: "New material weekly",        desc: "The catalog keeps moving so it doesn't go stale under you." },
              ].map((f, i) => (
                <BlueprintFeature key={f.title} {...f} index={i} />
              ))}
            </div>
          </section>

          {/* ── CATEGORIES ── */}
          {categories.length > 0 && (
            <section>
              <div className="mb-10">
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: ORANGE, fontFamily: MONO_FONT }}>§ 04 — Index</p>
                <h2 className="text-4xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Browse by subject</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const count = courses.filter(c => c.category?.name === cat.name && c.status === "PUBLISHED").length;
                  return (
                    <Link key={cat.id} to={`/categories/${cat.name?.toLowerCase() || ""}`}
                      className="group relative bg-white border rounded-sm p-5 h-28 flex flex-col justify-between transition-colors hover:border-current"
                      style={{ borderColor: LINE, color: BLUE }}>
                      <BookOpen size={20} style={{ color: MUTED }} className="group-hover:opacity-100" />
                      <div>
                        <p className="font-bold text-sm" style={{ color: INK }}>{cat.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>{count} course{count !== 1 ? "s" : ""}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── CTA ── */}
          <section className="relative overflow-hidden rounded-sm p-12 sm:p-16 text-white text-center" style={{ backgroundColor: BLUE_DEEP }}>
            <DraftGrid dark opacity={0.05} />
            <span className="absolute inset-4 pointer-events-none">
              <CornerMarks color={ORANGE} size={18} />
            </span>
            <div className="relative space-y-6">
              <GraduationCap size={40} className="mx-auto" style={{ color: ORANGE }} />
              <div>
                <h2 className="text-4xl sm:text-5xl font-black mb-3" style={{ fontFamily: DISPLAY_FONT }}>Start with one course.</h2>
                <p className="text-white/70 text-base max-w-2xl mx-auto">
                  You don't need a plan for the whole year — pick the thing you need right now and go.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/auth">
                  <button className="text-white font-bold px-8 py-3.5 rounded-sm transition text-sm active:scale-95"
                    style={{ backgroundColor: ORANGE }}>
                    Create free account
                  </button>
                </Link>
                <Link to="/courses">
                  <button className="border-2 border-white/25 hover:border-white/50 text-white font-bold px-8 py-3.5 rounded-sm transition text-sm flex items-center gap-2 justify-center">
                    Browse catalog <ArrowRight size={16} />
                  </button>
                </Link>
              </div>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
};

export default Home;