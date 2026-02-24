import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Layout from "../shared/Layout/Layout";
import {
  Search, Star, TrendingUp, Users, Award, CheckCircle,
  BookOpen, Layers, User, Home as HomeIcon, ArrowRight,
  Clock, Sparkles, ChevronRight, Play, Loader2,
  GraduationCap, Zap, Globe, Filter,
} from "lucide-react";
import { getAllCourses, getAllCategories } from "../services/courseService";

// ── helpers ───────────────────────────────────────
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

// ── sub-components ────────────────────────────────
const Feature = ({ icon, title, desc, accent }) => (
  <div className={`rounded-2xl p-6 border ${accent} hover:shadow-lg transition-shadow`}>
    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center mb-4 text-blue-600">
      {icon}
    </div>
    <h3 className="font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

const CourseCard = ({ course, idx }) => (
  <Link to={`/courses/${course.id}`} className="group block">
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={getImg(course, idx)}
          alt={course.title}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play size={18} className="text-blue-600 ml-1" />
          </div>
        </div>
        {course.price === 0 && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold">
            Free
          </span>
        )}
        {course.price > 0 && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
            Bestseller
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-slate-400 mb-2 truncate">
          {course.instructor?.fullName || "Instructor"}
        </p>
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">{course.description}</p>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star size={13} fill="currentColor" /> 4.8
          </span>
          {course.category?.name && (
            <span className="text-[11px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
              {course.category.name}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
          <p className="font-black text-slate-800">
            {course.price === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              `$${course.price}`
            )}
          </p>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} /> 6h+
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const CourseSkeleton = () => (
  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden animate-pulse">
    <div className="w-full h-44 bg-slate-100" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-full" />
      <div className="h-6 bg-slate-100 rounded w-1/4" />
    </div>
  </div>
);

const BottomNavItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex flex-col items-center text-xs gap-0.5 ${active ? "text-blue-600 font-bold" : "text-slate-400"}`}>
    {icon}
    <span>{label}</span>
  </Link>
);

// ── main ─────────────────────────────────────────
const Home = () => {
  const [courses,       setCourses]       = useState([]);
  const [categories,    setCategories]    = useState([]);
  const [activeTab,     setActiveTab]     = useState("All");
  const [searchQuery,   setSearchQuery]   = useState("");
  const [searchInput,   setSearchInput]   = useState("");
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [stats,         setStats]         = useState({ courses: 0, students: "2M+", instructors: "800+" });

  const location  = useLocation();
  const navigate  = useNavigate();

  // fetch courses
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

  // fetch categories
  useEffect(() => {
    getAllCategories()
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setCategories(data);
      })
      .catch(console.error);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    setActiveTab("All");
  };

  // filter courses by tab + search
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

  // category tabs — "All" + real categories from backend
  const categoryTabs = ["All", ...categories.map((c) => c.name)];

  // featured = first 4 published courses
  const featuredCourses = courses
    .filter((c) => c.status === "PUBLISHED")
    .slice(0, 4);

  // stats
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;

  return (
    <Layout>
      <div className="min-h-screen bg-[#f8f9fb] pb-24 sm:pb-0 overflow-x-hidden">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
          {/* decorative blobs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 -left-24 w-96 h-96 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 grid lg:grid-cols-2 gap-14 items-center">
            {/* Text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium backdrop-blur-sm">
                <Sparkles size={14} className="text-yellow-400" /> Learn smarter, not harder
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Build skills that <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                  change your future
                </span>
              </h1>

              <p className="text-slate-300 max-w-xl leading-relaxed">
                Practical courses, real projects, and expert instructors — all in one place.
                Join millions of learners building the skills that matter.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Search courses, skills, topics..."
                    className="w-full bg-white/10 border border-white/20 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-400 focus:bg-white/15 transition placeholder:text-slate-400 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 active:scale-95 transition text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-600/30 whitespace-nowrap text-sm"
                >
                  Search
                </button>
              </form>

              {/* Trust row */}
              <div className="flex flex-wrap gap-5 pt-2 text-sm text-slate-300">
                <span className="flex items-center gap-1.5"><Users size={15} className="text-blue-400" />{stats.students} learners</span>
                <span className="flex items-center gap-1.5"><Award size={15} className="text-emerald-400" />{stats.instructors} instructors</span>
                <span className="flex items-center gap-1.5"><BookOpen size={15} className="text-amber-400" />{publishedCount || "100+"} courses</span>
                <span className="flex items-center gap-1.5"><CheckCircle size={15} className="text-cyan-400" />Verified content</span>
              </div>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
                alt="Learning"
                className="rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              {/* floating card */}
              <div className="absolute -bottom-6 left-6 bg-white text-slate-900 rounded-2xl p-4 shadow-2xl flex gap-3 items-center">
                <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">Success rate</p>
                  <p className="font-black text-lg leading-tight">94% completion</p>
                </div>
              </div>
              {/* floating badge */}
              <div className="absolute -top-4 -right-4 bg-amber-400 text-slate-900 rounded-2xl p-3 shadow-xl">
                <div className="text-center">
                  <p className="text-2xl font-black leading-none">#1</p>
                  <p className="text-[10px] font-bold uppercase">Platform</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom wave */}
          <div className="h-8 bg-gradient-to-b from-transparent to-[#f8f9fb]" />
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16 py-12">

          {/* ── FEATURED / TRENDING ── */}
          {!searchQuery && featuredCourses.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Zap size={16} className="text-amber-500" />
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">Featured</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Trending now</h2>
                </div>
                <Link to="/courses" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline">
                  View all <ChevronRight size={16} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {loadingCourses
                  ? [1,2,3,4].map((i) => <CourseSkeleton key={i} />)
                  : featuredCourses.map((course, idx) => (
                    <CourseCard key={course.id} course={course} idx={idx} />
                  ))
                }
              </div>
            </section>
          )}

          {/* ── BROWSE BY CATEGORY + ALL COURSES ── */}
          <section className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {searchQuery ? `Results for "${searchQuery}"` : "Browse courses"}
                </h2>
                <p className="text-slate-500 mt-1 text-sm">
                  {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} available
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(""); setSearchInput(""); }}
                  className="text-sm font-bold text-red-500 hover:underline flex items-center gap-1"
                >
                  <Filter size={14} /> Clear search
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
              {categoryTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Course grid */}
            {loadingCourses ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1,2,3,4,5,6,7,8].map((i) => <CourseSkeleton key={i} />)}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-500 text-lg">
                  {searchQuery ? "No courses match your search" : "No published courses yet"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery ? "Try different keywords" : "Check back soon!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredCourses.map((course, idx) => (
                  <CourseCard key={course.id} course={course} idx={idx} />
                ))}
              </div>
            )}
          </section>

          {/* ── WHY CHOOSE US ── */}
          <section>
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Why LMS Pro</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Everything you need to succeed
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Feature
                icon={<TrendingUp size={22} />}
                title="Career-focused learning"
                desc="Every course is designed around skills employers actually hire for."
                accent="bg-blue-50 border-blue-100"
              />
              <Feature
                icon={<Clock size={22} />}
                title="Learn at your own pace"
                desc="Lifetime access to all courses. Watch anytime, anywhere, on any device."
                accent="bg-emerald-50 border-emerald-100"
              />
              <Feature
                icon={<Users size={22} />}
                title="Expert instructors"
                desc="Learn from industry professionals with real-world experience."
                accent="bg-amber-50 border-amber-100"
              />
              <Feature
                icon={<Globe size={22} />}
                title="Global community"
                desc="Join a worldwide network of learners and build connections that matter."
                accent="bg-violet-50 border-violet-100"
              />
              <Feature
                icon={<Award size={22} />}
                title="Certificates of completion"
                desc="Earn verified certificates to showcase your skills to employers."
                accent="bg-rose-50 border-rose-100"
              />
              <Feature
                icon={<Zap size={22} />}
                title="New courses weekly"
                desc="Fresh content added every week across all categories."
                accent="bg-cyan-50 border-cyan-100"
              />
            </div>
          </section>

          {/* ── CATEGORIES GRID ── */}
          {categories.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Browse categories</h2>
                <Link to="/categories" className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:underline">
                  All categories <ChevronRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((cat, idx) => {
                  const colors = [
                    "from-blue-500 to-blue-600",
                    "from-emerald-500 to-emerald-600",
                    "from-amber-500 to-orange-500",
                    "from-violet-500 to-purple-600",
                    "from-rose-500 to-pink-500",
                    "from-cyan-500 to-teal-500",
                  ];
                  return (
                    <Link
                      key={cat.id}
                      to={`/categories/${cat.name?.toLowerCase()}`}
                      className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${colors[idx % colors.length]} opacity-90`} />
                      <div className="relative z-10">
                        <BookOpen size={24} className="mb-3 opacity-80" />
                        <p className="font-black text-lg leading-tight">{cat.name}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {courses.filter((c) => c.category?.name === cat.name && c.status === "PUBLISHED").length} courses
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── CTA BANNER ── */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl shadow-blue-600/20">
            <GraduationCap size={40} className="mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">
              Ready to start learning?
            </h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join over 2 million learners worldwide. Get access to hundreds of courses across every category.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <button className="bg-white text-blue-700 font-black px-8 py-4 rounded-2xl hover:bg-blue-50 transition shadow-lg text-sm">
                  Get started for free
                </button>
              </Link>
              <Link to="/courses">
                <button className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition text-sm flex items-center gap-2 justify-center">
                  Browse courses <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </section>

        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 sm:hidden z-50 safe-area-pb">
          <div className="flex justify-around py-3 px-4">
            <BottomNavItem to="/"           icon={<HomeIcon size={20} />}   label="Home"       active={location.pathname === "/"} />
            <BottomNavItem to="/courses"    icon={<Layers size={20} />}     label="Courses"    active={location.pathname === "/courses"} />
            <BottomNavItem to="/categories" icon={<BookOpen size={20} />}   label="Categories" active={location.pathname.startsWith("/categories")} />
            <BottomNavItem to="/profile"    icon={<User size={20} />}       label="Profile"    active={location.pathname === "/profile"} />
          </div>
        </nav>

      </div>
    </Layout>
  );
};

export default Home;