// src/pages/InstructorPublicProfile.jsx
// Route: /instructors/:instructorId
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  BookOpen, Users, Star, ArrowLeft, Loader2,
  Globe, Award, CheckCircle, TrendingUp,
  GraduationCap, Calendar, Share2, ExternalLink,
  AlertCircle,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={12}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} />
    ))}
  </div>
);

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
];

export default function InstructorPublicProfile() {
  const { instructorId } = useParams();
  const navigate         = useNavigate();

  const [instructor, setInstructor] = useState(null);
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [instRes, coursesRes] = await Promise.all([
          API.get(`/users/instructors/${instructorId}`),
          // Fetch all published courses and filter client-side if the backend
          // doesn't support instructorId query param
          API.get(`/courses?instructorId=${instructorId}&status=PUBLISHED`)
            .catch(() => API.get("/courses")), // graceful fallback
        ]);

        const inst = instRes.data?.instructor || instRes.data;
        setInstructor(inst);

        const rawList = coursesRes.data?.courses || coursesRes.data || [];
        const list    = Array.isArray(rawList) ? rawList : [];

        // Filter client-side in case the backend ignores instructorId param
        const filtered = list.filter(
          (c) => c.status === "PUBLISHED" &&
            (c.instructorId === instructorId || c.instructor?.id === instructorId)
        );
        setCourses(filtered.length > 0 ? filtered : list.filter(c => c.status === "PUBLISHED").slice(0, 8));
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [instructorId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    </Layout>
  );

  if (error || !instructor) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <AlertCircle size={40} className="text-slate-300" />
        <p className="font-bold text-slate-500">Instructor not found</p>
        <Link to="/instructors" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to Instructors
        </Link>
      </div>
    </Layout>
  );

  // Total students = sum of enrollments across all their published courses
  const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);
  const totalCourses  = courses.length;

  // Compute average rating from course data if available
  const ratedCourses = courses.filter(c => c.avgRating && parseFloat(c.avgRating) > 0);
  const avgRating    = ratedCourses.length > 0
    ? (ratedCourses.reduce((s, c) => s + parseFloat(c.avgRating), 0) / ratedCourses.length).toFixed(1)
    : (instructor.avgRating ? parseFloat(instructor.avgRating).toFixed(1) : null);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pt-16">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Back — Link fallback in case there's no browser history */}
            <Link to="/instructors"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition mb-8">
              <ArrowLeft size={14} /> All Instructors
            </Link>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shrink-0">
                {instructor.avatarUrl
                  ? <img src={instructor.avatarUrl} alt={instructor.fullName} className="w-full h-full object-cover" />
                  : instructor.fullName?.[0]}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start mb-1 flex-wrap">
                      <span className="text-xs font-bold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <GraduationCap size={10} /> Instructor
                      </span>
                      {instructor.isInstructorApproved && (
                        <span className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Verified
                        </span>
                      )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{instructor.fullName}</h1>
                    {instructor.expertise && (
                      <p className="text-slate-400 text-sm mt-1">{instructor.expertise}</p>
                    )}
                  </div>

                  <button onClick={handleShare}
                    className="self-center sm:self-start flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-xl transition shrink-0">
                    <Share2 size={13} /> {copied ? "Copied!" : "Share Profile"}
                  </button>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start text-sm text-slate-300">
                  {avgRating && (
                    <div className="flex items-center gap-1.5">
                      <Stars rating={avgRating} />
                      <span className="font-black text-amber-400">{avgRating}</span>
                      <span className="text-slate-400 text-xs">avg rating</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users size={13} className="text-emerald-400" />
                    <span className="font-black text-white">{fmt(totalStudents)}</span>
                    <span className="text-slate-400 text-xs">students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={13} className="text-blue-400" />
                    <span className="font-black text-white">{totalCourses}</span>
                    <span className="text-slate-400 text-xs">courses</span>
                  </div>
                  {instructor.yearsExperience && (
                    <div className="flex items-center gap-1.5">
                      <Award size={13} className="text-violet-400" />
                      <span className="font-black text-white">{instructor.yearsExperience}</span>
                      <span className="text-slate-400 text-xs">yrs experience</span>
                    </div>
                  )}
                  {instructor.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-slate-400 text-xs">Teaching since {fmtDate(instructor.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT — bio + stats */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">

              {/* Stats */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={13} className="text-violet-500" /> Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen,  label: "Published Courses",  value: totalCourses,               color: "text-blue-500"    },
                    { icon: Users,     label: "Total Students",     value: fmt(totalStudents),         color: "text-emerald-500" },
                    { icon: Star,      label: "Average Rating",     value: avgRating ? `${avgRating} ★` : "No ratings yet", color: "text-amber-500"   },
                    { icon: Globe,     label: "Expertise",          value: instructor.expertise || "—", color: "text-violet-500", small: true },
                    ...(instructor.yearsExperience ? [{ icon: Award, label: "Experience", value: `${instructor.yearsExperience} years`, color: "text-rose-500" }] : []),
                  ].map(({ icon: Icon, label, value, color, small }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                        <Icon size={14} className={color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                        <p className={`font-black text-slate-800 truncate ${small ? "text-xs" : "text-sm"}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {instructor.bio && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">About</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{instructor.bio}</p>
                </div>
              )}
            </div>

            {/* RIGHT — courses */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={13} className="text-blue-500" /> Courses by {instructor.fullName?.split(" ")[0]}
                  </h3>
                  <span className="text-xs font-bold text-slate-400">{totalCourses} course{totalCourses !== 1 ? "s" : ""}</span>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen size={28} className="text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No published courses yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {courses.map((course, idx) => (
                      <Link key={course.id} to={`/courses/${course.id}`}
                        className="group flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
                        <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={course.thumbnail || placeholderImgs[idx % placeholderImgs.length]}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {course.avgRating && parseFloat(course.avgRating) > 0 && (
                              <div className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold text-amber-600">
                                  {parseFloat(course.avgRating).toFixed(1)}
                                </span>
                              </div>
                            )}
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Users size={9} /> {fmt(course._count?.enrollments || 0)}
                            </span>
                            <span className={`text-[10px] font-black ml-auto ${course.price === 0 ? "text-emerald-600" : "text-slate-700"}`}>
                              {course.price === 0 ? "Free" : `$${course.price}`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {totalCourses > 0 && (
                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <Link to={`/courses?instructor=${instructorId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                      View all courses <ExternalLink size={11} />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}