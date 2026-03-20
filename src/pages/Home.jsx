import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search, TrendingUp, Users, Award, CheckCircle, BookOpen,
  ArrowRight, Sparkles, Clock, Globe, X, Play, Loader2, GraduationCap,
} from "lucide-react";
import { getAllCourses, getAllCategories } from "../services/courseService";
import API from "../services/api";

// ── Placeholder images ────────────────────────────────────────────────────────
const PLACEHOLDER_IMGS = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
];
const getImg = (course, idx) =>
  course?.thumbnail || PLACEHOLDER_IMGS[idx % PLACEHOLDER_IMGS.length];

// ── StatBlock ─────────────────────────────────────────────────────────────────
const StatBlock = ({ value, label }) => (
  <div>
    <p className="text-3xl font-black text-blue-600 tabular-nums">{value}</p>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
  </div>
);

// ── SectionLabel ──────────────────────────────────────────────────────────────
const SectionLabel = ({ text }) => (
  <p className="text-xs font-black text-blue-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
    <span className="w-4 h-px bg-blue-600 inline-block" />{text}
  </p>
);

// ── CourseCard ────────────────────────────────────────────────────────────────
const CourseCard = ({ course, idx }) => (
  <Link to={`/courses/${course?.id}`} className="group flex flex-col h-full bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div className="relative overflow-hidden aspect-video bg-slate-100">
      <img
        src={getImg(course, idx)}
        alt={course?.title || "Course"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
        <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
          <Play size={16} className="text-blue-600 ml-0.5 fill-current" />
        </div>
      </div>
      <div className="absolute top-3 left-3">
        {(course?.price ?? 1) === 0
          ? <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-wider">Free</span>
          : <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 uppercase tracking-wider">Premium</span>
        }
      </div>
    </div>
    <div className="p-5 flex flex-col flex-1 gap-2">
      <h3 className="font-black text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
        {course?.title || "Untitled Course"}
      </h3>
      <p className="text-xs text-slate-400 font-medium">{course?.instructor?.fullName || "Expert Instructor"}</p>
      <p className="text-xs text-slate-500 line-clamp-2 flex-1">{course?.description || ""}</p>
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="font-black text-sm">
          {(course?.price ?? 1) === 0
            ? <span className="text-emerald-600">Free</span>
            : <span className="text-slate-900">${course?.price}</span>}
        </span>
        {course?.category?.name && (
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 uppercase tracking-wider">
            {course.category.name}
          </span>
        )}
      </div>
    </div>
  </Link>
);

// ── CourseSkeleton ────────────────────────────────────────────────────────────
const CourseSkeleton = () => (
  <div className="bg-white border border-slate-200 overflow-hidden animate-pulse flex flex-col">
    <div className="aspect-video bg-slate-100" />
    <div className="p-5 space-y-3 flex-1">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="pt-3 border-t border-slate-100 flex justify-between">
        <div className="h-4 bg-slate-100 rounded w-1/4" />
        <div className="h-4 bg-slate-100 rounded w-1/4" />
      </div>
    </div>
  </div>
);

// ── FeatureCard ───────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc }) => (
  <div className="group flex flex-col gap-4 p-8 border-r border-b border-slate-200 bg-white hover:bg-blue-600 transition-all duration-300">
    <div className="w-11 h-11 flex items-center justify-center bg-blue-50 text-blue-600 group-hover:bg-white group-hover:text-blue-600 transition-all duration-300">
      {icon}
    </div>
    <div>
      <h3 className="font-black text-slate-900 group-hover:text-white text-sm mb-2 transition-colors">{title}</h3>
      <p className="text-slate-500 group-hover:text-blue-100 text-sm leading-relaxed transition-colors">{desc}</p>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
const Home = () => {
  const [courses,       setCourses]       = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [activeTab,     setActiveTab]     = useState("All");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchInput,   setSearchInput]   = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [publishedCount, setPublishedCount] = useState(0);

  const [liveResults, setLiveResults] = useState({ courses: [], instructors: [] });
  const [liveLoading, setLiveLoading] = useState(false);
  const [showLive,    setShowLive]    = useState(false);

  const searchRef   = useRef(null);
  const debounceRef = useRef(null);
  const navigate    = useNavigate();

  // Fetch courses
  useEffect(() => {
    getAllCourses()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setCourses(data);
        setPublishedCount(data.filter((c) => c.status === "PUBLISHED").length);
      })
      .catch(console.error)
      .finally(() => setLoadingCourses(false));
  }, []);

  // Fetch categories
  useEffect(() => {
    getAllCategories()
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, []);

  // Close live results on outside click
  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowLive(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  // Live search debounce
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
    if (searchInput.trim()) navigate(`/courses?search=${encodeURIComponent(searchInput.trim())}`);
    else document.getElementById("all-courses")?.scrollIntoView({ behavior: "smooth" });
  };

  // Derived data
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
  const featuredCourses  = publishedCourses.slice(0, 4);
  const featuredIds      = new Set(featuredCourses.map((c) => c.id));
  const categoryTabs     = ["All", ...categories.map((c) => c.name)];
  const isFiltering      = !!searchQuery || activeTab !== "All";
  const hasExtraCourses  = publishedCourses.length > 4;

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

  const browseVisible = isFiltering ? filteredBrowse : filteredBrowse.slice(0, 8);
  const browseHasMore = !isFiltering && filteredBrowse.length > 8;

  return (
    <Layout>
      <div className="min-h-screen bg-white">

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="bg-white border-b-2 border-slate-900">
          {/* Blue accent line at top */}
          <div className="h-1.5 bg-blue-600" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28 grid lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="space-y-8">
              <div>
                <SectionLabel text="LMSPRO Learning Platform" />
                <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight mt-3">
                  Master the<br />
                  <span className="text-blue-600">skills that</span><br />
                  matter most.
                </h1>
              </div>

              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                World-class instructors. Industry-relevant curriculum. The skills top companies actually hire for.
              </p>

              {/* Search */}
              <div ref={searchRef} className="relative max-w-lg">
                <form onSubmit={handleSearch} className="flex gap-0">
                  <div className="relative flex-1">
                    {liveLoading
                      ? <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin z-10" size={16} />
                      : <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={16} />}
                    <input
                      value={searchInput}
                      onChange={(e) => handleLiveSearch(e.target.value)}
                      onFocus={() => { searchInput.trim() && setShowLive(true); }}
                      onBlur={() => setTimeout(() => setShowLive(false), 300)}
                      placeholder="Search courses or instructors..."
                      className="w-full border-2 border-r-0 border-slate-900 focus:border-blue-600 bg-white py-3.5 pl-11 pr-9 text-sm outline-none transition-colors placeholder:text-slate-400 text-slate-900"
                    />
                    {searchInput && (
                      <button type="button" onClick={clearLive} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 z-10">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <button type="submit" className="bg-slate-900 hover:bg-blue-600 text-white font-black px-6 py-3.5 text-sm uppercase tracking-wider transition-colors border-2 border-slate-900 whitespace-nowrap">
                    Search
                  </button>
                </form>

                {/* Live dropdown */}
                {showLive && searchInput.trim() && (
                  <div onMouseDown={(e) => e.preventDefault()}
                    className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-900 shadow-2xl z-[999] overflow-hidden max-h-[420px] overflow-y-auto">
                    {liveLoading ? (
                      <div className="flex items-center justify-center gap-2 py-6">
                        <Loader2 className="animate-spin text-blue-400" size={18} />
                        <span className="text-xs text-slate-400">Searching…</span>
                      </div>
                    ) : (
                      <>
                        {liveResults.courses.length > 0 && (
                          <div>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                              <BookOpen size={10} className="text-blue-500" />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Courses</p>
                            </div>
                            {liveResults.courses.map((course) => (
                              <Link key={course.id} to={`/courses/${course.id}`} onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition group border-b border-slate-100 last:border-0">
                                <div className="w-12 h-9 overflow-hidden bg-slate-100 shrink-0">
                                  {course.thumbnail
                                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={12} className="text-slate-300" /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700">{course.title}</p>
                                  <p className="text-[10px] text-slate-400">{course.instructor?.fullName}</p>
                                </div>
                                <span className={`text-[10px] font-black shrink-0 px-2 py-0.5 ${(course.price ?? 1) === 0 ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                                  {(course.price ?? 1) === 0 ? "Free" : `$${course.price}`}
                                </span>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.instructors.length > 0 && (
                          <div className={liveResults.courses.length > 0 ? "border-t-2 border-slate-200" : ""}>
                            <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                              <Users size={10} className="text-slate-400" />
                              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instructors</p>
                            </div>
                            {liveResults.instructors.map((inst) => (
                              <Link key={inst.id} to={`/instructors/${inst.id}`} onClick={clearLive}
                                className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition group">
                                <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center shrink-0 text-slate-500 font-black text-sm">
                                  {inst.avatarUrl
                                    ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : (inst.fullName?.[0] || "?")}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700">{inst.fullName}</p>
                                  <p className="text-[10px] text-slate-400">{inst.expertise || "Instructor"}{inst._count?.courses ? ` · ${inst._count.courses} courses` : ""}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                        {liveResults.courses.length === 0 && liveResults.instructors.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-sm font-bold text-slate-400">No results for "{searchInput}"</p>
                          </div>
                        )}
                        {(liveResults.courses.length > 0 || liveResults.instructors.length > 0) && (
                          <div className="border-t-2 border-slate-200 flex bg-slate-50">
                            <Link to={`/courses?search=${encodeURIComponent(searchInput)}`} onClick={clearLive}
                              className="flex-1 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 text-center transition flex items-center justify-center gap-1">
                              <BookOpen size={11} /> All courses
                            </Link>
                            <div className="w-px bg-slate-200" />
                            <Link to={`/instructors?search=${encodeURIComponent(searchInput)}`} onClick={clearLive}
                              className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 text-center transition flex items-center justify-center gap-1">
                              <Users size={11} /> All instructors
                            </Link>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-6 border-t-2 border-slate-200">
                <StatBlock value={publishedCount || "500+"} label="Courses"        />
                <StatBlock value="2M+"                      label="Active Learners" />
                <StatBlock value="4.9★"                     label="Avg Rating"      />
              </div>
            </div>

            {/* Right: image collage */}
            <div className="hidden lg:grid grid-cols-2 gap-3 relative">
              <div className="col-span-2 overflow-hidden" style={{ height: "220px" }}>
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
                  alt="Learning" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={{ height: "180px" }}>
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80"
                  alt="Students" className="w-full h-full object-cover" />
              </div>
              <div className="overflow-hidden" style={{ height: "180px" }}>
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80"
                  alt="Coding" className="w-full h-full object-cover" />
              </div>
              {/* Floating stat */}
              <div className="absolute -bottom-5 -left-5 bg-white border-2 border-slate-900 px-5 py-4 shadow-2xl z-10">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Completion Rate</p>
                <p className="text-2xl font-black text-blue-600">97%</p>
              </div>
            </div>

          </div>
        </section>

        {/* ── TRUST BAR ─────────────────────────────────────────────────────── */}
        <div className="bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            {["Industry-certified courses", "Expert-led instruction", "Learn at your pace", "Lifetime access guaranteed"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-slate-300 text-xs font-semibold">
                <CheckCircle size={12} className="text-blue-400 shrink-0" /> {item}
              </div>
            ))}
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-24 py-20">

          {/* ── FEATURED COURSES ─────────────────────────────────────────────── */}
          {!searchQuery && featuredCourses.length > 0 && (
            <section>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <SectionLabel text="Trending Now" />
                  <h2 className="text-3xl font-black text-slate-900">Featured Courses</h2>
                </div>
                {!loadingCourses && publishedCount > 4 && (
                  <Link to="/courses" className="text-sm font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                    See all <ArrowRight size={14} />
                  </Link>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {loadingCourses
                  ? [1,2,3,4].map((i) => <CourseSkeleton key={i} />)
                  : featuredCourses.map((course, idx) => <CourseCard key={course.id} course={course} idx={idx} />)}
              </div>
            </section>
          )}

          {/* ── BROWSE ALL ───────────────────────────────────────────────────── */}
          <section id="all-courses">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <SectionLabel text="Browse" />
                <h2 className="text-3xl font-black text-slate-900">
                  {searchQuery ? `Results for "${searchQuery}"` : "All Courses"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isFiltering ? filteredBrowse.length : publishedCount} course{((isFiltering ? filteredBrowse.length : publishedCount) !== 1) ? "s" : ""} available
                </p>
              </div>
              {searchQuery && (
                <button onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1 self-start">
                  <X size={12} /> Clear
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-0 overflow-x-auto pb-0 mb-8 border-b-2 border-slate-200">
              {categoryTabs.map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-all border-b-2 -mb-0.5 ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}>
                  {tab}
                </button>
              ))}
            </div>

            {loadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4,5,6,7,8].map((i) => <CourseSkeleton key={i} />)}
              </div>
            ) : filteredBrowse.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-slate-200">
                <BookOpen size={36} className="text-slate-300 mx-auto mb-4" />
                <p className="font-bold text-slate-600 text-lg">{searchQuery ? "No courses found" : "No courses yet"}</p>
                <p className="text-slate-400 text-sm mt-2">{searchQuery ? "Try different keywords" : "Check back soon"}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {browseVisible.map((course, idx) => <CourseCard key={course.id} course={course} idx={idx} />)}
                </div>
                {browseHasMore && (
                  <div className="flex justify-center mt-10">
                    <Link to="/courses"
                      className="inline-flex items-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black px-8 py-3 uppercase tracking-wider text-sm transition-all duration-200">
                      See All Courses <ArrowRight size={15} />
                    </Link>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── WHY LMSPRO ───────────────────────────────────────────────────── */}
          <section>
            <div className="mb-10">
              <SectionLabel text="Why LMSPRO" />
              <h2 className="text-3xl font-black text-slate-900">Built for serious learners</h2>
            </div>
            {/* Grid with shared borders — no individual card shadows */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 border-l border-t border-slate-200">
              {[
                { icon: <TrendingUp size={20} />, title: "Career-Focused",       desc: "Curated by industry experts. Every course built for real job market demand." },
                { icon: <Award size={20} />,      title: "Certified Excellence",  desc: "Earn credentials employers worldwide trust and actively seek out." },
                { icon: <Users size={20} />,      title: "Expert Instructors",    desc: "Learn from practitioners who are actively working in their fields." },
                { icon: <Clock size={20} />,      title: "Lifetime Access",       desc: "Learn at your pace. Unlimited access to all materials, forever." },
                { icon: <Globe size={20} />,      title: "Global Community",      desc: "Connect with 2M+ learners. Network, collaborate, and grow." },
                { icon: <Sparkles size={20} />,   title: "Fresh Content",         desc: "New courses added weekly. Content refreshed by experts monthly." },
              ].map(({ icon, title, desc }) => (
                <FeatureCard key={title} icon={icon} title={title} desc={desc} />
              ))}
            </div>
          </section>

          {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
          {categories.length > 0 && (
            <section>
              <div className="mb-10">
                <SectionLabel text="Categories" />
                <h2 className="text-3xl font-black text-slate-900">Explore by topic</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {categories.map((cat, idx) => {
                  const count = courses.filter(c => c.category?.name === cat.name && c.status === "PUBLISHED").length;
                  return (
                    <Link key={cat.id} to={`/categories/${cat.name?.toLowerCase() || ""}`}
                      className="group flex flex-col justify-between p-6 border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-600 bg-white transition-all duration-200 h-28">
                      <BookOpen size={18} className="text-slate-400 group-hover:text-blue-200 transition-colors" />
                      <div>
                        <p className="font-black text-slate-900 group-hover:text-white text-sm transition-colors leading-tight">{cat.name}</p>
                        <p className="text-[11px] text-slate-400 group-hover:text-blue-200 transition-colors mt-0.5">{count} course{count !== 1 ? "s" : ""}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── CTA ──────────────────────────────────────────────────────────── */}
          <section className="bg-slate-900 p-12 sm:p-16">
            <div className="max-w-2xl">
              <SectionLabel text="Get Started" />
              <h2 className="text-4xl sm:text-5xl font-black text-white mt-2 mb-4 leading-tight">
                Ready to transform<br />your career?
              </h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-md">
                Join thousands of professionals elevating their skills. Start any course, learn at your pace.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/auth"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-black px-8 py-4 uppercase tracking-wider text-sm transition-colors">
                  Get Started Free <ArrowRight size={15} />
                </Link>
                <Link to="/courses"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-bold px-8 py-4 uppercase tracking-wider text-sm transition-colors">
                  Browse Catalog
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