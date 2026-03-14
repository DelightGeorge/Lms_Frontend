// src/pages/InstructorsPage.jsx
// Route: /instructors
import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
  Search, BookOpen, Users, Star, X, Loader2,
  GraduationCap, TrendingUp, ChevronRight, Zap,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));

// ── Instructor Card ─────────────────────────────────────────────────────────
const InstructorCard = ({ instructor }) => {
  const courses  = instructor._count?.courses     || 0;
  const students = instructor._count?.enrollments || instructor.totalStudents || 0;
  const rating   = instructor.avgRating ? parseFloat(instructor.avgRating).toFixed(1) : null;

  return (
    <Link to={`/instructors/${instructor.id}`}
      className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">

      {/* Top accent strip */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 group-hover:from-blue-400 group-hover:to-violet-400 transition-all" />

      <div className="p-6 flex flex-col flex-1">
        {/* Avatar + name */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shrink-0 shadow-md shadow-blue-200 group-hover:scale-105 transition-transform duration-300">
            {instructor.avatarUrl
              ? <img src={instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
              : instructor.fullName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-slate-900 text-base leading-tight truncate group-hover:text-blue-700 transition-colors">
              {instructor.fullName}
            </h3>
            {instructor.expertise && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{instructor.expertise}</p>
            )}
            {rating && (
              <div className="flex items-center gap-1 mt-1.5">
                <Star size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                <span className="text-xs font-black text-amber-600">{rating}</span>
                <span className="text-[10px] text-slate-400">avg rating</span>
              </div>
            )}
          </div>
        </div>

        {/* Bio snippet */}
        {instructor.bio && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4 flex-1">{instructor.bio}</p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 pt-3 border-t border-slate-100 mt-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <BookOpen size={12} className="text-blue-400 shrink-0" />
            <span><span className="font-black text-slate-700">{courses}</span> course{courses !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Users size={12} className="text-emerald-400 shrink-0" />
            <span><span className="font-black text-slate-700">{fmt(students)}</span> students</span>
          </div>
          <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 ml-auto transition shrink-0" />
        </div>
      </div>
    </Link>
  );
};

// ── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
    <div className="flex items-start gap-4 mb-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-4 bg-slate-100 rounded-lg w-3/4" />
        <div className="h-3 bg-slate-100 rounded-lg w-1/2" />
      </div>
    </div>
    <div className="space-y-1.5 mb-4">
      <div className="h-3 bg-slate-100 rounded-lg" />
      <div className="h-3 bg-slate-100 rounded-lg w-4/5" />
    </div>
    <div className="h-px bg-slate-100 mb-3" />
    <div className="flex gap-4">
      <div className="h-3 bg-slate-100 rounded-lg w-20" />
      <div className="h-3 bg-slate-100 rounded-lg w-20" />
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
export default function InstructorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [instructors, setInstructors]   = useState([]);
  const [loading,     setLoading]       = useState(true);
  const [total,       setTotal]         = useState(0);
  const [query,       setQuery]         = useState(searchParams.get("search") || "");
  const debounceRef = useRef(null);

  const fetchInstructors = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (q.trim()) params.set("search", q.trim());
      const res = await API.get(`/users/instructors?${params}`);
      const data = res.data;
      const list = Array.isArray(data) ? data : (data?.instructors || []);
      setInstructors(list);
      setTotal(data?.total || list.length);
    } catch (e) {
      console.error(e);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors(query);
  }, []);

  const handleQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchParams(val.trim() ? { search: val.trim() } : {});
      fetchInstructors(val);
    }, 300);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pt-16">

        {/* ── Hero ───────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute -top-20 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.05]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
              <GraduationCap size={13} /> Meet Our Instructors
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight">
              Learn from the <span className="text-blue-400">Best</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
              Expert instructors with real-world experience, ready to help you grow
            </p>

            {/* Search */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search instructors by name or expertise…"
                className="w-full bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 rounded-2xl py-3.5 pl-11 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/15 transition-all"
              />
              {query && (
                <button onClick={() => handleQueryChange("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition">
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats strip ────────────────────────────────────────── */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {loading ? (
                <span className="flex items-center gap-2"><Loader2 size={13} className="animate-spin text-blue-500" /> Loading…</span>
              ) : (
                <>
                  <span className="font-black text-slate-900">{total}</span>
                  {" "}instructor{total !== 1 ? "s" : ""}{query && ` matching "${query}"`}
                </>
              )}
            </p>
            <Link to="/courses"
              className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition">
              <Zap size={13} /> Browse Courses
            </Link>
          </div>
        </div>

        {/* ── Grid ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : instructors.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-700 mb-2">No instructors found</h3>
              <p className="text-sm text-slate-400 mb-5">Try a different search term</p>
              {query && (
                <button onClick={() => handleQueryChange("")}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">
                  <X size={14} /> Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {instructors.map((inst) => (
                <InstructorCard key={inst.id} instructor={inst} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
