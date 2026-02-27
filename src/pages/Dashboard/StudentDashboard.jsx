import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  BookOpen, Clock, Award, TrendingUp, Play,
  ChevronRight, Loader2, Star, Zap,
  CheckCircle, GraduationCap, Target, RefreshCw,
  Flame, BarChart2, Lock,
} from "lucide-react";
import { getMyEnrollments } from "../../services/enrollmentService";
import { getAllCourses } from "../../services/courseService";
import { useAuth } from "../../Context/AuthContext";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
];
const getImg = (course, idx) => course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];

// ── Progress Ring ─────────────────────────────────────────
const ProgressRing = ({ pct, size = 52 }) => {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? "#10b981" : "#3b82f6"}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition group">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent} shadow-md`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-3xl font-black text-slate-800 leading-none">{value}</p>
    {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
  </div>
);

// ── Mini progress bar ────────────────────────────────────
const ProgressBar = ({ pct, color = "bg-blue-500" }) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
    <div className={`${color} h-1.5 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
  </div>
);

// ── MAIN ──────────────────────────────────────────────────
const StudentDashboard = () => {
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const location      = useLocation();

  const [enrollments,  setEnrollments]  = useState([]);
  const [recommended,  setRecommended]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [loadingRec,   setLoadingRec]   = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  // ── Fetch enrollments ─────────────────────────────────
  // Using useCallback so we can call it manually on refresh too
  const fetchEnrollments = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const r = await getMyEnrollments();
      setEnrollments(Array.isArray(r.data) ? r.data : []);
    } catch (err) {
      console.error("Failed to fetch enrollments:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Re-fetch every time this page is navigated to
  // (handles post-payment redirect, post-enrollment, etc.)
  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchEnrollments();
  }, [user, location.key]); // location.key changes on every navigation

  // Fetch recommended courses
  useEffect(() => {
    if (!user) return;
    getAllCourses()
      .then((r) => {
        const all       = Array.isArray(r.data) ? r.data : [];
        const published = all.filter((c) => c.status === "PUBLISHED");
        const enrolledIds = new Set(enrollments.map((e) => e.courseId));
        // Filter out already enrolled, pick up to 4
        const recs = published.filter((c) => !enrolledIds.has(c.id)).slice(0, 4);
        setRecommended(recs.length > 0 ? recs : published.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoadingRec(false));
  }, [user, enrollments]);

  if (!user) return null;

  // ── Derived stats ────────────────────────────────────
  const total         = enrollments.length;
  const completed     = enrollments.filter((e) => e.progress === 100).length;
  const inProgress    = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const notStarted    = enrollments.filter((e) => e.progress === 0).length;
  const totalLessons  = enrollments.reduce((acc, e) => acc + (e.completedLessons || 0), 0);
  const avgProgress   = total > 0
    ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / total)
    : 0;

  // Continue learning = most recent with progress < 100
  const continueCourse = enrollments.find((e) => e.progress > 0 && e.progress < 100)
    || enrollments.find((e) => e.progress === 0);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white px-4 py-12 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-blue-500/30 rounded-lg flex items-center justify-center">
                    <GraduationCap size={14} className="text-blue-300" />
                  </div>
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Student Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Welcome back, <span className="text-blue-400">{user.fullName?.split(" ")[0]}</span> 👋
                </h1>
                <p className="text-slate-300 mt-1.5 text-sm">
                  {total === 0
                    ? "Start your learning journey — browse courses below"
                    : `You're ${avgProgress}% through your learning goals · ${totalLessons} lessons completed`
                  }
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => fetchEnrollments(true)} disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition">
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
                <Link to="/courses"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30">
                  <Zap size={15} /> Browse Courses
                </Link>
              </div>
            </div>

            {/* Overall progress bar */}
            {total > 0 && (
              <div className="mt-6 bg-white/10 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-300">Overall Progress</span>
                  <span className="text-xs font-black text-blue-300">{avgProgress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-400 to-emerald-400 h-2 rounded-full transition-all duration-700"
                    style={{ width: `${avgProgress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-medium">
                  <span>{completed} completed</span>
                  <span>{inProgress} in progress</span>
                  <span>{notStarted} not started</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}    label="Enrolled"     value={total}        accent="bg-blue-500"    sub={total === 1 ? "course" : "courses"} />
            <StatCard icon={CheckCircle} label="Completed"    value={completed}    accent="bg-emerald-500" sub="100% done" />
            <StatCard icon={Flame}       label="In Progress"  value={inProgress}   accent="bg-amber-500"   sub="keep going!" />
            <StatCard icon={Play}        label="Lessons Done" value={totalLessons} accent="bg-violet-500"  sub="total lessons" />
          </div>

          {/* ── Continue Learning ── */}
          {continueCourse && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-500" /> Continue Learning
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 h-44 sm:h-auto shrink-0 overflow-hidden relative">
                    <img src={getImg(continueCourse.course, 0)} alt={continueCourse.course?.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                    {continueCourse.progress > 0 && (
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-xs font-black px-2.5 py-1 rounded-lg">
                        {continueCourse.progress}% done
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {continueCourse.course?.category?.name && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {continueCourse.course.category.name}
                        </span>
                      )}
                      <h3 className="font-black text-slate-800 text-xl mt-2 mb-1 leading-tight">
                        {continueCourse.course?.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-4">
                        by {continueCourse.course?.instructor?.fullName}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative">
                          <ProgressRing pct={continueCourse.progress} size={56} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">
                            {continueCourse.progress}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <ProgressBar pct={continueCourse.progress} />
                          <p className="text-xs text-slate-400 mt-1.5">
                            {continueCourse.completedLessons || 0} of {continueCourse.totalLessons || 0} lessons complete
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link to={`/courses/${continueCourse.courseId}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition w-fit shadow-md shadow-blue-600/20">
                      <Play size={14} />
                      {continueCourse.progress === 0 ? "Start Course" : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── My Courses ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">My Courses</h2>
                <p className="text-sm text-slate-400">{total} enrolled course{total !== 1 ? "s" : ""}</p>
              </div>
              <Link to="/courses" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                Browse more <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-56 bg-white animate-pulse rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-14 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={28} className="text-blue-400" />
                </div>
                <h3 className="font-black text-slate-800 text-lg mb-1">No courses yet</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
                  Enroll in your first course to start learning and track your progress here.
                </p>
                <Link to="/courses"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                  <Zap size={14} /> Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((e, idx) => (
                  <Link key={e.id} to={`/courses/${e.courseId}`} className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-40 overflow-hidden">
                        <img src={getImg(e.course, idx)} alt={e.course?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                        {/* Progress overlay */}
                        {e.progress === 100 ? (
                          <div className="absolute inset-0 bg-emerald-500/80 flex flex-col items-center justify-center">
                            <CheckCircle size={30} className="text-white mb-1" />
                            <span className="text-white text-xs font-black">Completed!</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <ProgressRing pct={e.progress} size={38} />
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                                {e.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Status chip */}
                        <div className="absolute bottom-3 left-3">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-full ${
                            e.progress === 100
                              ? "bg-emerald-500 text-white"
                              : e.progress > 0
                              ? "bg-blue-500 text-white"
                              : "bg-white/90 text-slate-700"
                          }`}>
                            {e.progress === 100 ? "✓ Done" : e.progress > 0 ? "In Progress" : "Not Started"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {e.course?.title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-3 truncate">{e.course?.instructor?.fullName}</p>
                        <ProgressBar pct={e.progress} color={e.progress === 100 ? "bg-emerald-500" : "bg-blue-500"} />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400">{e.completedLessons || 0}/{e.totalLessons || 0} lessons</span>
                          <span className="text-[10px] font-bold text-blue-600">{e.progress}% complete</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Analytics ── */}
          {total > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <BarChart2 size={20} className="text-violet-500" /> Learning Analytics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Completion rate */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Completion Rate</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ProgressRing pct={total > 0 ? Math.round((completed / total) * 100) : 0} size={64} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-emerald-600">
                        {total > 0 ? Math.round((completed / total) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-800">{completed}<span className="text-slate-300 font-normal">/{total}</span></p>
                      <p className="text-xs text-slate-400">courses finished</p>
                    </div>
                  </div>
                </div>

                {/* Course breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Course Breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: "Completed",   count: completed,   color: "bg-emerald-500", pct: total > 0 ? (completed/total)*100 : 0 },
                      { label: "In Progress", count: inProgress,  color: "bg-blue-500",    pct: total > 0 ? (inProgress/total)*100 : 0 },
                      { label: "Not Started", count: notStarted,  color: "bg-slate-200",   pct: total > 0 ? (notStarted/total)*100 : 0 },
                    ].map(({ label, count, color, pct }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-slate-500 font-medium">{label}</span>
                          <span className="text-xs font-black text-slate-700">{count}</span>
                        </div>
                        <ProgressBar pct={pct} color={color} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson activity */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Activity Summary</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-black text-slate-800">{totalLessons}</p>
                      <p className="text-xs text-slate-400">total lessons completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-blue-600">{avgProgress}%</p>
                      <p className="text-xs text-slate-400">average course progress</p>
                    </div>
                    {completed > 0 && (
                      <div className="bg-emerald-50 rounded-xl p-2.5 flex items-center gap-2">
                        <Award size={14} className="text-emerald-500 shrink-0" />
                        <p className="text-xs font-bold text-emerald-700">{completed} certificate{completed > 1 ? "s" : ""} earned</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── Certificates ── */}
          {completed > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Award size={20} className="text-amber-500" /> Certificates Earned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.filter((e) => e.progress === 100).map((e) => (
                  <div key={e.id}
                    className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/30">
                      <Award size={22} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-sm truncate">{e.course?.title}</p>
                      <p className="text-xs text-amber-600 font-semibold mt-0.5">Certificate of Completion</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <button className="text-xs font-black text-amber-600 hover:text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition shrink-0">
                      View
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Recommended ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Star size={20} className="text-amber-400" /> Recommended For You
              </h2>
              <Link to="/courses" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                See all <ChevronRight size={14} />
              </Link>
            </div>

            {loadingRec ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-44 bg-white animate-pulse rounded-2xl border border-slate-100" />)}
              </div>
            ) : recommended.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
                <p className="text-slate-400 text-sm">No recommendations yet. Browse all courses!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommended.map((course, idx) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-32 overflow-hidden">
                        <img src={getImg(course, idx)} alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute top-2 left-2">
                          {course.price === 0
                            ? <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">FREE</span>
                            : <span className="bg-white/90 text-slate-700 text-[9px] font-black px-2 py-0.5 rounded-full">${course.price}</span>
                          }
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-black text-slate-800 text-xs line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate">{course.instructor?.fullName}</p>
                        {course.category?.name && (
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full mt-1.5 inline-block">
                            {course.category.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── Recent Activity ── */}
          {enrollments.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> Recent Activity
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {enrollments.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                      <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                        <img src={getImg(e.course, 0)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{e.course?.title}</p>
                        <p className="text-xs text-slate-400">
                          Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block text-right">
                          <p className={`text-sm font-black ${e.progress === 100 ? "text-emerald-600" : "text-blue-600"}`}>
                            {e.progress}%
                          </p>
                          <p className="text-[10px] text-slate-400">complete</p>
                        </div>
                        <Link to={`/courses/${e.courseId}`}
                          className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                          <ChevronRight size={15} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
