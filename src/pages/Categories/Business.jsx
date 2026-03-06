import React, { useState, useEffect } from "react";
import { BookOpen, Star, Users, Zap, ArrowRight, Filter, Search, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllCourses } from "../../services/courseService";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=400&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=400&q=80",
];

const getImg = (course, idx) => course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];

const CourseCard = ({ course, idx }) => (
  <Link to={`/courses/${course.id}`} className="group block">
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <img
          src={getImg(course, idx)}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-emerald-600 ml-0.5 fill-current" />
          </div>
        </div>
        {course.price === 0 && (
          <span className="absolute top-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-400/30">
            🎁 Free
          </span>
        )}
        {course.price > 0 && (
          <span className="absolute top-4 left-4 bg-emerald-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-bold border border-emerald-500/30">
            ⭐ Premium
          </span>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 line-clamp-2 mb-1.5 group-hover:text-emerald-600 transition-colors text-sm">
          {course.title}
        </h3>
        <p className="text-xs text-slate-500 mb-3">{course.instructor?.fullName}</p>

        <p className="text-xs text-slate-600 line-clamp-2 mb-auto flex-1">{course.description}</p>

        <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xs">★</span>
              ))}
            </div>
            <span className="text-xs font-bold text-slate-700">4.8</span>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-black text-slate-900">
              {course.price === 0 ? (
                <span className="text-emerald-600">Free</span>
              ) : (
                <span className="text-emerald-600">${course.price}</span>
              )}
            </p>
            <span className="text-xs text-slate-500">6h+</span>
          </div>
        </div>
      </div>
    </div>
  </Link>
);

const Business = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    getAllCourses()
      .then((r) => {
        const all = Array.isArray(r.data) ? r.data : [];
        const businessCourses = all.filter(
          (c) =>
            c.status === "PUBLISHED" &&
            (c.category?.name?.toLowerCase() === "business" ||
              c.title?.toLowerCase().includes("business") ||
              c.title?.toLowerCase().includes("entrepreneurship") ||
              c.title?.toLowerCase().includes("management") ||
              c.title?.toLowerCase().includes("leadership"))
        );
        setCourses(businessCourses.length > 0 ? businessCourses : all.filter((c) => c.status === "PUBLISHED").slice(0, 8));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 sm:px-6 py-16 border-t border-slate-100">
      {/* Hero */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
              <TrendingUp size={16} className="text-emerald-600" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Business Skills</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight">
              Grow Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Business Skills</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
              Master entrepreneurship, leadership, and management. Learn from successful founders and executives to build and scale your career.
            </p>

            <div className="flex gap-4 flex-wrap pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Zap size={16} className="text-emerald-500" />
                <span className="font-semibold">Practical strategies</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Users size={16} className="text-teal-500" />
                <span className="font-semibold">Business leaders</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Star size={16} className="text-amber-400" />
                <span className="font-semibold">4.9+ rating</span>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80"
              alt="Business"
              className="rounded-3xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Build Your Career</p>
              <p className="text-slate-900 font-black mt-1">Level Up Now</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search business courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition">
            <Filter size={18} /> Filter
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900">
            {filteredCourses.length} Course{filteredCourses.length !== 1 ? "s" : ""} Available
          </h2>
          <p className="text-slate-600 mt-1 text-sm">
            {searchTerm ? "Search results" : "Popular business courses"}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
            <BookOpen size={48} className="text-slate-200 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-semibold mb-2">No courses found</p>
            <p className="text-slate-500 text-sm">Try adjusting your search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course, idx) => (
              <CourseCard key={course.id} course={course} idx={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Business;
