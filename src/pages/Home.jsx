import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search, TrendingUp, Users, Award, CheckCircle, BookOpen,
  User, Home as HomeIcon, ArrowRight, Sparkles, ChevronRight,
  Play, Loader2, GraduationCap, Filter, Clock, Zap, Globe,
} from "lucide-react";
import { getAllCourses, getAllCategories } from "../services/courseService";

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

// ── Bottom nav item ───────────────────────────────
const BottomNavItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 py-1 flex-1 min-w-0 transition-colors ${
      active ? "text-amber-600" : "text-slate-400 active:text-amber-500"
    }`}
  >
    <div className={`p-1.5 rounded-xl transition-colors ${active ? "bg-amber-50" : ""}`}>
      {icon}
    </div>
    <span className="text-[10px] font-semibold leading-none truncate">{label}</span>
  </Link>
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

  const handleSearch = (e) => {
    e.preventDefault();
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
  const featuredCourses = courses.filter((c) => c.status === "PUBLISHED").slice(0, 4);
  const publishedCount  = courses.filter((c) => c.status === "PUBLISHED").length;

  return (
    <Layout>
      {/* pb-20 gives room for the fixed bottom nav on mobile */}
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50 pb-20 sm:pb-0 overflow-x-hidden">

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

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search courses, topics..."
                    className="w-full bg-white/8 border border-white/15 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-amber-400/50 focus:bg-white/12 transition placeholder:text-slate-400 text-sm text-white backdrop-blur-sm"
                  />
                </div>
                <button type="submit"
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold py-4 px-8 rounded-xl shadow-xl shadow-amber-600/30 whitespace-nowrap text-sm transition-all duration-300 active:scale-95">
                  Explore
                </button>
              </form>

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
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
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
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen size={56} className="text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-600 text-xl">
                  {searchQuery ? "No courses found" : "No published courses yet"}
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  {searchQuery ? "Try different keywords" : "Check back soon!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredCourses.map((course, idx) => (
                  <PremiumCourseCard key={course.id} course={course} idx={idx} />
                ))}
              </div>
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

        {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────────
            Fixed to the bottom. Uses grid-cols-4 so each item gets exactly
            equal width — no squeezing or clipping on any screen size.
            pb-safe ensures it clears the iOS home indicator.
        ── */}
        <nav className="fixed bottom-0 inset-x-0 z-50 sm:hidden bg-white/97 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-4 px-2 py-2 pb-[env(safe-area-inset-bottom,8px)]">
            <BottomNavItem
              to="/"
              icon={<HomeIcon size={21} />}
              label="Home"
              active={location.pathname === "/"}
            />
            <BottomNavItem
              to="/courses"
              icon={<BookOpen size={21} />}
              label="Courses"
              active={location.pathname === "/courses"}
            />
            <BottomNavItem
              to="/instructors"
              icon={<Users size={21} />}
              label="Instructors"
              active={location.pathname.startsWith("/instructors")}
            />
            <BottomNavItem
              to="/student-profile"
              icon={<User size={21} />}
              label="Profile"
              active={location.pathname.startsWith("/student-profile") || location.pathname === "/profile"}
            />
          </div>
        </nav>
      </div>
    </Layout>
  );
};

export default Home;