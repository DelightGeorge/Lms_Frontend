import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import { Star, Search, Filter, BookOpen, Clock, Users, Loader2 } from "lucide-react";
import { getAllCourses } from "../../services/courseService";
import { getAllCategories } from "../../services/courseService";

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
    <div className="aspect-[16/10] bg-slate-100 rounded-2xl mb-4" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-3 bg-slate-100 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-1/4" />
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
      <div className="min-h-screen bg-slate-50">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 tracking-tight">
              All Courses
            </h1>
            <p className="text-slate-300 mb-8 text-lg">
              {published.length} courses to help you grow your skills
            </p>

            {/* Search */}
            <div className="flex gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search courses or instructors..."
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:bg-white/15 focus:border-blue-400 transition text-sm placeholder:text-slate-400"
                />
              </div>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition"
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
                  className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? "bg-slate-900 text-white shadow-md"
                      : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <Filter size={15} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold outline-none bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="free">Free First</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-sm text-slate-400 font-medium mb-6">
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
              <BookOpen size={52} className="text-slate-200 mx-auto mb-4" />
              <p className="font-bold text-slate-500 text-xl">No courses found</p>
              <p className="text-slate-400 mt-1 text-sm">
                {search ? "Try different keywords" : "No published courses in this category yet"}
              </p>
              {(search || activeTab !== "All") && (
                <button
                  onClick={() => { setSearch(""); setActiveTab("All"); }}
                  className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((course, idx) => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group cursor-pointer">
                  <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      <img
                        src={getImg(course, idx)}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        {course.price === 0 ? (
                          <span className="bg-emerald-500 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow">
                            Free
                          </span>
                        ) : (
                          <span className="bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black uppercase shadow">
                            Bestseller
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-900 leading-snug mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 mb-1 truncate">
                        {course.instructor?.fullName || "Instructor"}
                      </p>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                        {course.description}
                      </p>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-amber-500 font-black text-sm">4.8</span>
                        <Star size={12} className="text-amber-400" fill="currentColor" />
                        {course.category?.name && (
                          <span className="ml-auto text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                            {course.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="font-black text-slate-900">
                          {course.price === 0
                            ? <span className="text-emerald-600">Free</span>
                            : `$${course.price}`
                          }
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
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