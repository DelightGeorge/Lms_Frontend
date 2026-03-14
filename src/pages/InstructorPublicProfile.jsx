// src/pages/InstructorPublicProfile.jsx
// Route: /instructors/:instructorId
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import {
  BookOpen, Users, Star, ArrowLeft, Loader2,
  Globe, Award, CheckCircle, TrendingUp, Zap,
  GraduationCap, Calendar,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n ?? 0));
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const Stars = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={12}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} />
    ))}
  </div>
);

export default function InstructorPublicProfile() {
  const { instructorId } = useParams();
  const navigate         = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [instRes, coursesRes] = await Promise.all([
          API.get(`/users/instructors/${instructorId}`),
          API.get(`/courses?instructorId=${instructorId}&status=PUBLISHED`),
        ]);
        setInstructor(instRes.data?.instructor || instRes.data);
        const list = coursesRes.data?.courses || coursesRes.data || [];
        setCourses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error(e);
        navigate("/instructors");
      } finally {
        setLoading(false);
      }
    })();
  }, [instructorId]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    </Layout>
  );

  if (!instructor) return null;

  const totalStudents = instructor._count?.enrollments || instructor.totalStudents || 0;
  const totalCourses  = courses.length;
  const avgRating     = instructor.avgRating ? parseFloat(instructor.avgRating).toFixed(1) : null;

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pt-16">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Back */}
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white text-xs font-medium transition mb-8">
              <ArrowLeft size={14} /> All Instructors
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
              {/* Avatar */}
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-4xl shrink-0">
                {instructor.avatarUrl
                  ? <img src={instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : instructor.fullName?.[0]}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
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

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start text-sm text-slate-300">
                  {avgRating && (
                    <div className="flex items-center gap-1.5">
                      <Stars rating={avgRating} />
                      <span className="font-black text-amber-400">{avgRating}</span>
                      <span className="text-slate-400 text-xs">rating</span>
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
                  {instructor.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-slate-400 text-xs">Since {fmtDate(instructor.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-16">
          <div className="flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT — bio + stats */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">

              {/* Stats card */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <TrendingUp size={13} className="text-violet-500" /> Stats
                </h3>
                <div className="space-y-3">
                  {[
                    { icon: BookOpen,     label: "Courses",  value: totalCourses,     color: "text-blue-500"    },
                    { icon: Users,        label: "Students", value: fmt(totalStudents), color: "text-emerald-500" },
                    { icon: Award,        label: "Avg Rating", value: avgRating || "—", color: "text-amber-500"   },
                    { icon: Globe,        label: "Expertise", value: instructor.expertise || "—", color: "text-violet-500", small: true },
                  ].map(({ icon: Icon, label, value, color, small }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0`}>
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
                    {courses.map((course) => (
                      <Link key={course.id} to={`/courses/${course.id}`}
                        className="group flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
                        <div className="w-16 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><BookOpen size={18} className="text-slate-300" /></div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 leading-snug truncate group-hover:text-blue-700 transition-colors">
                            {course.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {course._count?.reviews > 0 && (
                              <div className="flex items-center gap-1">
                                <Star size={10} className="text-amber-400 fill-amber-400" />
                                <span className="text-[10px] font-bold text-amber-600">
                                  {course.avgRating ? parseFloat(course.avgRating).toFixed(1) : "—"}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
