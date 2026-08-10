import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import { Star, Search, Filter, BookOpen, Clock, Users, Loader2 } from "lucide-react";
import { getAllCourses } from "../../services/courseService";
import { getAllCategories } from "../../services/courseService";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER  = "#EEF1F3";
const LINE   = "#D8DEE3";
const MUTED  = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

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

const CourseSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[16/10] rounded-sm mb-4" style={{ backgroundColor: PAPER }} />
    <div className="space-y-2">
      <div className="h-4 rounded w-3/4" style={{ backgroundColor: PAPER }} />
      <div className="h-3 rounded w-1/2" style={{ backgroundColor: PAPER }} />
      <div className="h-3 rounded w-1/4" style={{ backgroundColor: PAPER }} />
    </div>
  </div>
);

const CourseList = () => {
  const [courses,    setCourses]    = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [activeTab,  setActiveTab]  = useState("All");
  const [sortBy,     setSortBy]     = useState("newest");

  useEffect(() => {
    getAllCourses()
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));

    getAllCategories()
      .then((r) => setCategories(Array.isArray(r.data) ? r.data : []))
      .catch(console.error);
  }, []);

  // only show published
  const published = courses.filter((c) => c.status === "PUBLISHED");

  // filter + search + sort
  const filtered = published
    .filter((c) => {
      const matchCat = activeTab === "All" || c.category?.name === activeTab;
      const matchSearch =
        !search ||
        c.title?.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        c.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-low")  return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
      if (sortBy === "free")       return (a.price || 0) === 0 ? -1 : 1;
      // newest
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const tabs = ["All", ...categories.map((c) => c.name)];

  return (
    <Layout>
      <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
        {/* Header banner */}
        <div className="text-white py-16 px-4 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }} />
          <div className="max-w-7xl mx-auto relative">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: ORANGE, fontFamily: MONO_FONT }}>§ Catalog</p>
            <h1 className="text-4xl sm:text-5xl font-black mb-3 tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>
              All courses
            </h1>
            <p className="mb-8 text-lg text-white/70">
              {published.length} courses to help you grow your skills
            </p>

            {/* Search */}
            <div className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: MUTED }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses or instructors..."
                  className="w-full rounded-sm py-3.5 pl-12 pr-4 outline-none transition text-sm border text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" }}
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-3 rounded-sm text-sm font-bold transition border text-white"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)" }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Filters row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-sm text-sm font-bold whitespace-nowrap transition-colors border"
                  style={activeTab === tab
                    ? { backgroundColor: BLUE, color: "#fff", borderColor: BLUE }
                    : { backgroundColor: "#fff", color: MUTED, borderColor: LINE }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={15} style={{ color: MUTED }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border rounded-sm px-3 py-2 text-sm font-semibold outline-none bg-white"
                style={{ borderColor: LINE, color: INK }}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="free">Free First</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm font-medium mb-6" style={{ color: MUTED }}>
            Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""}
            {activeTab !== "All" && ` in ${activeTab}`}
            {search && ` for "${search}"`}
          </p>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map((i) => <CourseSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <BookOpen size={48} className="mx-auto mb-4" style={{ color: LINE }} />
              <p className="font-bold text-xl" style={{ color: INK }}>No courses found</p>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                {search ? "Try different keywords" : "No published courses in this category yet"}
              </p>
              {(search || activeTab !== "All") && (
                <button
                  onClick={() => { setSearch(""); setActiveTab("All"); }}
                  className="mt-4 px-6 py-2 text-white rounded-sm font-bold text-sm transition"
                  style={{ backgroundColor: BLUE }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((course, idx) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group cursor-pointer">
                  <div className="bg-white border rounded-sm overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{ borderColor: LINE }}>
                    <div className="aspect-[16/10] overflow-hidden relative" style={{ backgroundColor: PAPER }}>
                      <img
                        src={getImg(course, idx)}
                        alt={course.title}
                        className="w-full h-full object-cover grayscale-[10%] group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        {course.price === 0 ? (
                          <span className="text-white px-2 py-1 rounded-sm text-[10px] font-black uppercase" style={{ backgroundColor: MOSS }}>
                            Free
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-sm text-[10px] font-black uppercase" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: INK }}>
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold leading-snug mb-1 line-clamp-2 text-sm" style={{ color: INK }}>
                        {course.title}
                      </h3>
                      <p className="text-xs mb-1 truncate" style={{ color: MUTED, fontFamily: MONO_FONT }}>
                        {course.instructor?.fullName || "Instructor"}
                      </p>
                      <p className="text-xs line-clamp-2 mb-3" style={{ color: MUTED }}>
                        {course.description}
                      </p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-black text-sm" style={{ color: INK }}>4.8</span>
                        <Star size={12} style={{ color: ORANGE }} fill="currentColor" />
                        {course.category?.name && (
                          <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-sm border" style={{ color: BLUE, borderColor: LINE }}>
                            {course.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: LINE }}>
                        <span className="font-black" style={{ fontFamily: MONO_FONT, color: course.price === 0 ? MOSS : ORANGE }}>
                          {course.price === 0 ? "FREE" : `$${course.price}`}
                        </span>
                        <span className="text-xs flex items-center gap-1" style={{ color: MUTED }}>
                          <Clock size={11} /> 6h+
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CourseList;