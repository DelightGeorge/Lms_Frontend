import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Search, TrendingUp, Users, Award, CheckCircle, BookOpen,
  ArrowRight, Sparkles, ChevronRight,
  Play, Loader2, GraduationCap, Filter, Clock, Zap, Globe, X,
} from "lucide-react";
import { getAllCourses, getAllCategories } from "../services/courseService";
import API from "../services/api";
import Layout from "../shared/Layout/Layout";


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

// ── Luxury Feature Card ───────────────────────────────
const PremiumFeature = ({ icon, title, desc }) => (
  <div className="group relative">
    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
    <div className="relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/40 rounded-2xl p-8 hover:from-white hover:to-white/95 transition-all duration-500 shadow-xl hover:shadow-2xl h-full">
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/5 to-transparent rounded-bl-3xl" />
      <div className="relative space-y-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed mt-2">{desc}</p>
        </div>
      </div>
    </div>
  </div>
);

// ── Premium Course Card ───────────────────────────────
const PremiumCourseCard = ({ course, idx }) => (
  <Link to={`/courses/${course.id}`} className="group block h-full">
    <div className="h-full bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-100/60 hover:border-amber-200/60">
      <div className="relative overflow-hidden h-48">
        <img
          src={getImg(course, idx)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform duration-500">
            <Play size={22} className="text-amber-600 ml-0.5 fill-current" />
          </div>
        </div>
        <div className="absolute top-4 left-4">
          {course.price === 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-400/30">
              <Sparkles size={12} /> Complimentary
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold border border-amber-400/30">
              <Zap size={12} /> Premium
            </span>
          )}
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-amber-600 transition-colors mb-1.5">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          {course.instructor?.fullName || "Expert Instructor"}
        </p>
        <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
          {course.description}
        </p>
        <div className="border-t border-slate-100/60 pt-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <span key={i} className="text-xs">★</span>)}
              </div>
              <span className="text-xs font-semibold text-slate-700">4.8</span>
            </div>
            {course.category?.name && (
              <span className="text-[10px] bg-slate-100/80 text-slate-700 font-semibold px-2 py-1 rounded-full">
                {course.category.name}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="font-bold text-slate-900">
              {course.price === 0
                ? <span className="text-emerald-600">Complimentary</span>
                : <span className="text-amber-600">${course.price}</span>}
            </p>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock size={11} /> 6h+
            </span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

// ── Skeleton loader ───────────────────────────────
const CourseSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100/60 animate-pulse h-full flex flex-col">
    <div className="w-full h-48 bg-slate-100" />
    <div className="p-5 space-y-3 flex-1">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="mt-auto pt-3 border-t border-slate-100 space-y-2">
        <div className="h-4 bg-slate-100 rounded w-1/3" />
        <div className="h-4 bg-slate-100 rounded w-1/2" />
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
  const searchRef  = useRef(null);
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
        const courses     = cRes.status === "fulfilled"     ? (cRes.value.data?.courses || cRes.value.data || []).slice(0,5)     : [];
        const instructors = iRes.status === "fulfilled"     ? (iRes.value.data?.instructors || iRes.value.data || []).slice(0,3) : [];
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
    setSearchQuery(searchInput);
    setActiveTab("All");
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

  const categoryTabs    = ["All", ...categories.map((c) => c.name)];
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
  const featuredCourses  = publishedCourses.slice(0, 4);
  const featuredIds      = new Set(featuredCourses.map((c) => c.id));
  const publishedCount   = publishedCourses.length;

  // Browse section: exclude featured courses so the two sections are always different
  const browseCourses = publishedCourses.filter((c) => !featuredIds.has(c.id));
  const filteredBrowse = browseCourses.filter((c) => {
    const matchesTab    = activeTab === "All" || c.category?.name?.toLowerCase() === activeTab.toLowerCase();
    const matchesSearch = !searchQuery ||
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const browseVisible  = filteredBrowse.slice(0, 4);
  const browseHasMore  = filteredBrowse.length > 4;

  return (
    <Layout>
      {/* pb-20 gives room for the fixed bottom nav on mobile */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-700/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 text-white">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15 text-sm font-medium backdrop-blur-sm">
                  <span className="relative flex h-2 w-2 bg-emerald-400 rounded-full" />
                  Elevate Your Skills
                </div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
                  Master the skills
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300">
                    that matter
                  </span>
                </h1>
                <p className="text-lg text-slate-300 max-w-xl leading-relaxed">
                  Learn from world-class instructors and industry leaders. Transform your career with courses designed for excellence.
                </p>
              </div>

              <div ref={searchRef} className="relative max-w-lg w-full">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    {liveLoading
                      ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 animate-spin z-10" size={17} />
                      : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={17} />}
                    <input
                      value={searchInput}
                      onChange={(e) => handleLiveSearch(e.target.value)}
                      onFocus={() => { setHeroFocused(true); searchInput.trim() && setShowLive(true); }}
                      onBlur={() => setTimeout(() => { setHeroFocused(false); setShowLive(false); }, 300)}
                      placeholder="Search courses or find an instructor..."
                      className="w-full bg-white/15 border border-white/20 rounded-xl py-4 pl-12 pr-10 outline-none focus:bg-white focus:text-slate-900 focus:border-amber-400 focus:placeholder:text-slate-400 transition placeholder:text-slate-300 text-sm text-white backdrop-blur-sm"
                    />
                    {searchInput && (
                      <button type="button" onClick={clearLive}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition z-10">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button type="submit"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-amber-600/30 whitespace-nowrap text-sm transition-all duration-300 active:scale-95">
                    Explore
                  </button>
                </form>

                {/* Live results dropdown */}
                {showLive && (searchInput.trim()) && (
                  <div onMouseDown={(e) => e.preventDefault()} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[999] overflow-hidden max-h-[420px] overflow-y-auto">
                    {liveLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2">
                        <div className="relative w-8 h-8">
                          <div className="absolute inset-0 rounded-full border-2 border-amber-100" />
                          <div className="absolute inset-0 rounded-full border-2 border-t-amber-500 animate-spin" />
                          <Search size={12} className="absolute inset-0 m-auto text-amber-400" />
                        </div>
                        <p className="text-xs text-slate-400">Finding results…</p>
                      </div>
                    ) : (
                      <>
                        {liveResults.courses.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 px-4 pt-3 pb-1">
                              <BookOpen size={11} className="text-amber-500" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Courses</p>
                              <span className="ml-auto text-[10px] text-slate-300">{liveResults.courses.length} found</span>
                            </div>
                            {liveResults.courses.map((course) => (
                              <Link key={course.id} to={`/courses/${course.id}`}
                                onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition group border-l-2 border-transparent hover:border-amber-500 mx-1 rounded-r-xl">
                                <div className="w-12 h-9 rounded-lg overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                                  {course.thumbnail
                                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center bg-amber-50"><BookOpen size={13} className="text-amber-300" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-700 transition-colors">{course.title}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">{course.instructor?.fullName}</p>
                                </div>
                                <span className={`text-[10px] font-black shrink-0 px-2 py-0.5 rounded-lg ${course.price === 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>
                                  {course.price === 0 ? "Free" : `$${course.price}`}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.instructors.length > 0 && (
                          <div className={liveResults.courses.length > 0 ? "border-t border-slate-100 mt-1 pt-1" : ""}>
                            <div className="flex items-center gap-2 px-4 pt-2 pb-1">
                              <Users size={11} className="text-indigo-500" />
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructors</p>
                            </div>
                            {liveResults.instructors.map((inst) => (
                              <Link key={inst.id} to={`/instructors/${inst.id}`}
                                onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 transition group border-l-2 border-transparent hover:border-indigo-500 mx-1 rounded-r-xl">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-white font-black text-sm ring-2 ring-white shadow-sm">
                                  {inst.avatarUrl ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" /> : inst.fullName?.[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-700">{inst.fullName}</p>
                                  <p className="text-[10px] text-slate-400 truncate">{inst.expertise || "Instructor"}{inst._count?.courses ? ` · ${inst._count.courses} courses` : ""}</p>
                                </div>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg shrink-0 group-hover:bg-indigo-100 transition">View</span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.courses.length === 0 && liveResults.instructors.length === 0 && (
                          <div className="text-center py-10">
                            <Search size={22} className="text-slate-200 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-400">No results for "{searchInput}"</p>
                            <p className="text-xs text-slate-300 mt-1">Try a different keyword</p>
                          </div>
                        )}
                        {(liveResults.courses.length > 0 || liveResults.instructors.length > 0) && (
                          <div className="border-t border-slate-100 p-2 bg-slate-50/50">
                            <div className="flex gap-1">
                              <Link to={`/courses?search=${encodeURIComponent(searchInput)}`}
                                onClick={clearLive}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition">
                                <BookOpen size={11} /> All courses
                              </Link>
                              <Link to={`/instructors?search=${encodeURIComponent(searchInput)}`}
                                onClick={clearLive}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                                <Users size={11} /> All instructors
                              </Link>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 max-w-md">
                <div className="text-center">
                  <p className="text-2xl font-black text-amber-400">{publishedCount || "500+"}</p>
                  <p className="text-xs text-slate-400 mt-1">Premium Courses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-emerald-400">{stats.students}</p>
                  <p className="text-xs text-slate-400 mt-1">Active Learners</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-blue-400">4.9★</p>
                  <p className="text-xs text-slate-400 mt-1">Average Rating</p>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                  alt="Premium Learning"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Success Rate</p>
                    <p className="text-xl font-black text-slate-900">97%</p>
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
              <div className="mb-10">
                <div className="inline-flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Featured</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900">Trending Courses</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {loadingCourses
                  ? [1,2,3,4].map((i) => <CourseSkeleton key={i} />)
                  : featuredCourses.map((course, idx) => (
                      <PremiumCourseCard key={course.id} course={course} idx={idx} />
                    ))}
              </div>
              {!loadingCourses && publishedCount > 4 && (
                <div className="flex justify-center mt-10">
                  <Link to="/courses"
                    className="inline-flex items-center gap-2 border-2 border-amber-500/40 text-amber-600 hover:bg-amber-50 font-black px-8 py-3.5 rounded-xl transition text-sm">
                    See All Trending <ArrowRight size={16} />
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* ── BROWSE COURSES ── */}
          <section className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-slate-100/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div>
                <h2 className="text-4xl font-black text-slate-900">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Courses"}
                </h2>
                <p className="text-slate-600 mt-2">
                  {filteredBrowse.length} course{filteredBrowse.length !== 1 ? "s" : ""} available
                </p>
              </div>
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  className="text-sm font-bold text-red-500 hover:bg-red-50/50 rounded-lg px-4 py-2 transition-colors flex items-center gap-1">
                  <Filter size={14} /> Clear
                </button>
              )}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-hide">
              {categoryTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}>
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
                <BookOpen size={56} className="text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-600 text-xl">
                  {searchQuery ? "No courses found" : "No more courses yet"}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Try different keywords" : "Check back soon!"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {browseVisible.map((course, idx) => (
                    <PremiumCourseCard key={course.id} course={course} idx={idx} />
                  ))}
                </div>
                {browseHasMore && (
                  <div className="flex justify-center mt-10">
                    <Link to="/courses"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black px-8 py-3.5 rounded-xl transition shadow-lg shadow-amber-500/20 text-sm active:scale-95">
                      See All Courses <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── WHY CHOOSE US ── */}
          <section>
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-amber-600 uppercase tracking-widest">Excellence</span>
              </div>
              <h2 className="text-4xl font-black text-slate-900">Why LMSPRO</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <PremiumFeature icon={<TrendingUp size={24} />} title="Career-Focused"    desc="Curated by industry experts. Every course designed for real job market demand." />
              <PremiumFeature icon={<Award size={24} />}      title="Certified Excellence" desc="Earn recognized credentials that employers trust and value worldwide." />
              <PremiumFeature icon={<Users size={24} />}      title="Expert Instruction" desc="Learn from leaders actively working in their fields with decades of experience." />
              <PremiumFeature icon={<Clock size={24} />}      title="Lifetime Access"   desc="Learn at your pace with unlimited access to all course materials forever." />
              <PremiumFeature icon={<Globe size={24} />}      title="Global Community"  desc="Connect with 2M+ learners worldwide. Network and collaborate meaningfully." />
              <PremiumFeature icon={<Sparkles size={24} />}   title="Premium Content"   desc="New, curated courses weekly. Content refreshed by experts monthly." />
            </div>
          </section>

          {/* ── CATEGORIES ── */}
          {categories.length > 0 && (
            <section>
              <div className="mb-10">
                <h2 className="text-4xl font-black text-slate-900">Explore Categories</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                {categories.map((cat, idx) => {
                  const gradients = [
                    "from-blue-600 to-blue-700",    "from-emerald-600 to-teal-700",
                    "from-amber-600 to-orange-700", "from-violet-600 to-purple-700",
                    "from-rose-600 to-pink-700",    "from-cyan-600 to-blue-700",
                    "from-indigo-600 to-blue-700",  "from-fuchsia-600 to-purple-700",
                  ];
                  return (
                    <Link key={cat.id} to={`/categories/${cat.name?.toLowerCase()}`}
                      className="group relative overflow-hidden rounded-2xl p-6 text-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border border-white/10 h-32 flex flex-col justify-between">
                      <div className={`absolute inset-0 bg-gradient-to-br ${gradients[idx % gradients.length]} opacity-95`} />
                      <div className="relative z-10 flex flex-col justify-between h-full">
                        <BookOpen size={24} className="opacity-70" />
                        <div>
                          <p className="font-black text-base leading-tight">{cat.name}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {courses.filter(c => c.category?.name === cat.name && c.status === "PUBLISHED").length} courses
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── CTA ── */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-amber-900/20 to-slate-900 p-12 sm:p-16 text-white text-center shadow-2xl border border-amber-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
            <div className="relative space-y-6">
              <GraduationCap size={48} className="mx-auto opacity-70" />
              <div>
                <h2 className="text-4xl sm:text-5xl font-black mb-3">Ready to Transform?</h2>
                <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                  Join thousands of professionals elevating their careers. Start with any course, finish with confidence.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link to="/auth">
                  <button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black px-8 py-4 rounded-xl transition-all duration-300 shadow-lg shadow-amber-600/30 hover:shadow-xl text-sm active:scale-95">
                    Get Started Free
                  </button>
                </Link>
                <Link to="/courses">
                  <button className="border-2 border-amber-500/40 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/5 transition text-sm flex items-center gap-2 justify-center">
                    Browse Catalog <ArrowRight size={16} />
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