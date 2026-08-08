import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  BookOpen, Clock, Award, TrendingUp, Play,
  ChevronRight, Loader2, Star, Zap,
  CheckCircle, GraduationCap, Target, RefreshCw,
  Flame, BarChart2, Lock, User,
} from "lucide-react";
import { getMyEnrollments } from "../../services/enrollmentService";
import { getAllCourses } from "../../services/courseService";
import { useAuth } from "../../Context/AuthContext";

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
];
const getImg = (course, idx) => course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];

// ── Progress Ring ─────────────────────────────────────────
const ProgressRing = ({ pct, size = 52 }) => {
  const r    = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={LINE} strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? MOSS : BLUE}
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
  <div className="bg-white rounded-sm border p-5" style={{ borderColor: LINE }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: accent }}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>{label}</p>
    </div>
    <p className="text-3xl font-black leading-none" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{value}</p>
    {sub && <p className="text-xs mt-1" style={{ color: MUTED }}>{sub}</p>}
  </div>
);

// ── Mini progress bar ────────────────────────────────────
const ProgressBar = ({ pct, color = BLUE }) => (
  <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: LINE }}>
    <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
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
      <div className="min-h-screen" style={{ backgroundColor: PAPER }}>

        {/* ── Hero ── */}
        <div className="text-white px-4 py-12 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }} />

          <div className="max-w-6xl mx-auto relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <GraduationCap size={14} style={{ color: ORANGE }} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ORANGE, fontFamily: MONO_FONT }}>Student Portal</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>
                  Welcome back, {user.fullName?.split(" ")[0]}
                </h1>
                <p className="mt-1.5 text-sm text-white/70">
                  {total === 0
                    ? "Start your learning journey — browse courses below"
                    : `You're ${avgProgress}% through your learning goals · ${totalLessons} lessons completed`
                  }
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => fetchEnrollments(true)} disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: LINE_ALPHA(), color: "#fff" }}>
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  Refresh
                </button>
                <Link to="/student-profile"
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: LINE_ALPHA(), color: "#fff" }}>
                  <User size={13} /> Profile
                </Link>
                <Link to="/courses"
                  className="flex items-center gap-2 text-white px-5 py-2.5 rounded-sm font-bold text-sm transition"
                  style={{ backgroundColor: ORANGE }}>
                  <Zap size={15} /> Browse
                </Link>
              </div>
            </div>

            {/* Overall progress bar */}
            {total > 0 && (
              <div className="mt-6 rounded-sm p-4 border" style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: LINE_ALPHA() }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white/80">Overall progress</span>
                  <span className="text-xs font-black" style={{ color: ORANGE }}>{avgProgress}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${avgProgress}%`, backgroundColor: ORANGE }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] font-medium text-white/50">
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
            <StatCard icon={BookOpen}    label="Enrolled"     value={total}        accent={BLUE}   sub={total === 1 ? "course" : "courses"} />
            <StatCard icon={CheckCircle} label="Completed"    value={completed}    accent={MOSS}   sub="100% done" />
            <StatCard icon={Flame}       label="In Progress"  value={inProgress}   accent={ORANGE} sub="keep going" />
            <StatCard icon={Play}        label="Lessons Done" value={totalLessons} accent="#5B4A8C" sub="total lessons" />
          </div>

          {/* ── Continue Learning ── */}
          {continueCourse && (
            <section>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                <Target size={18} style={{ color: BLUE }} /> Continue learning
              </h2>
              <div className="bg-white rounded-sm border overflow-hidden" style={{ borderColor: LINE }}>
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-64 h-44 sm:h-auto shrink-0 overflow-hidden relative">
                    <img src={getImg(continueCourse.course, 0)} alt={continueCourse.course?.title}
                      className="w-full h-full object-cover" />
                    {continueCourse.progress > 0 && (
                      <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs font-black px-2.5 py-1 rounded-sm">
                        {continueCourse.progress}% done
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {continueCourse.course?.category?.name && (
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-sm uppercase tracking-wide border"
                          style={{ color: BLUE, borderColor: LINE }}>
                          {continueCourse.course.category.name}
                        </span>
                      )}
                      <h3 className="font-black text-xl mt-2 mb-1 leading-tight" style={{ color: INK }}>
                        {continueCourse.course?.title}
                      </h3>
                      <p className="text-sm mb-4" style={{ color: MUTED }}>
                        by {continueCourse.course?.instructor?.fullName}
                      </p>

                      <div className="flex items-center gap-4 mb-3">
                        <div className="relative">
                          <ProgressRing pct={continueCourse.progress} size={56} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black" style={{ color: BLUE }}>
                            {continueCourse.progress}%
                          </span>
                        </div>
                        <div className="flex-1">
                          <ProgressBar pct={continueCourse.progress} />
                          <p className="text-xs mt-1.5" style={{ color: MUTED }}>
                            {continueCourse.completedLessons || 0} of {continueCourse.totalLessons || 0} lessons complete
                          </p>
                        </div>
                      </div>
                    </div>
                    <Link to={`/courses/${continueCourse.courseId}`}
                      className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-sm font-bold text-sm transition w-fit"
                      style={{ backgroundColor: ORANGE }}>
                      <Play size={14} />
                      {continueCourse.progress === 0 ? "Start course" : "Continue learning"}
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
                <h2 className="text-xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>My courses</h2>
                <p className="text-sm" style={{ color: MUTED }}>{total} enrolled course{total !== 1 ? "s" : ""}</p>
              </div>
              <Link to="/courses" className="text-sm font-bold flex items-center gap-1" style={{ color: BLUE }}>
                Browse more <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-56 bg-white animate-pulse rounded-sm border" style={{ borderColor: LINE }} />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-sm border p-14 text-center" style={{ borderColor: LINE }}>
                <div className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: PAPER }}>
                  <BookOpen size={24} style={{ color: MUTED }} />
                </div>
                <h3 className="font-black text-lg mb-1" style={{ color: INK }}>No courses yet</h3>
                <p className="text-sm mb-6 max-w-xs mx-auto" style={{ color: MUTED }}>
                  Enroll in your first course to start learning and track your progress here.
                </p>
                <Link to="/courses"
                  className="inline-flex items-center gap-2 text-white px-5 py-2.5 rounded-sm font-bold text-sm transition"
                  style={{ backgroundColor: BLUE }}>
                  <Zap size={14} /> Explore courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((e, idx) => (
                  <Link key={e.id} to={`/courses/${e.courseId}`} className="group">
                    <div className="bg-white rounded-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{ borderColor: LINE }}>
                      <div className="relative h-40 overflow-hidden">
                        <img src={getImg(e.course, idx)} alt={e.course?.title}
                          className="w-full h-full object-cover" />

                        {/* Progress overlay */}
                        {e.progress === 100 ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: "rgba(76,122,93,0.85)" }}>
                            <CheckCircle size={26} className="text-white mb-1" />
                            <span className="text-white text-xs font-black">Completed</span>
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
                          <span className="text-[9px] font-black px-2 py-1 rounded-sm"
                            style={e.progress === 100
                              ? { backgroundColor: MOSS, color: "#fff" }
                              : e.progress > 0
                              ? { backgroundColor: BLUE, color: "#fff" }
                              : { backgroundColor: "rgba(255,255,255,0.9)", color: INK }}>
                            {e.progress === 100 ? "Done" : e.progress > 0 ? "In progress" : "Not started"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-black text-sm line-clamp-2 mb-1" style={{ color: INK }}>
                          {e.course?.title}
                        </h3>
                        <p className="text-xs mb-3 truncate" style={{ color: MUTED }}>{e.course?.instructor?.fullName}</p>
                        <ProgressBar pct={e.progress} color={e.progress === 100 ? MOSS : BLUE} />
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px]" style={{ color: MUTED }}>{e.completedLessons || 0}/{e.totalLessons || 0} lessons</span>
                          <span className="text-[10px] font-bold" style={{ color: BLUE }}>{e.progress}% complete</span>
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
              <h2 className="text-xl font-black mb-5 flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                <BarChart2 size={18} style={{ color: "#5B4A8C" }} /> Learning analytics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Completion rate */}
                <div className="bg-white rounded-sm border p-5" style={{ borderColor: LINE }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: MUTED, fontFamily: MONO_FONT }}>Completion rate</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ProgressRing pct={total > 0 ? Math.round((completed / total) * 100) : 0} size={64} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-black" style={{ color: MOSS }}>
                        {total > 0 ? Math.round((completed / total) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-2xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{completed}<span style={{ color: LINE }} className="font-normal">/{total}</span></p>
                      <p className="text-xs" style={{ color: MUTED }}>courses finished</p>
                    </div>
                  </div>
                </div>

                {/* Course breakdown */}
                <div className="bg-white rounded-sm border p-5" style={{ borderColor: LINE }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: MUTED, fontFamily: MONO_FONT }}>Course breakdown</p>
                  <div className="space-y-3">
                    {[
                      { label: "Completed",   count: completed,   color: MOSS,  pct: total > 0 ? (completed/total)*100 : 0 },
                      { label: "In Progress", count: inProgress,  color: BLUE,  pct: total > 0 ? (inProgress/total)*100 : 0 },
                      { label: "Not Started", count: notStarted,  color: LINE,  pct: total > 0 ? (notStarted/total)*100 : 0 },
                    ].map(({ label, count, color, pct }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs font-medium" style={{ color: MUTED }}>{label}</span>
                          <span className="text-xs font-black" style={{ color: INK }}>{count}</span>
                        </div>
                        <ProgressBar pct={pct} color={color} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lesson activity */}
                <div className="bg-white rounded-sm border p-5" style={{ borderColor: LINE }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: MUTED, fontFamily: MONO_FONT }}>Activity summary</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{totalLessons}</p>
                      <p className="text-xs" style={{ color: MUTED }}>total lessons completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black" style={{ color: BLUE, fontFamily: DISPLAY_FONT }}>{avgProgress}%</p>
                      <p className="text-xs" style={{ color: MUTED }}>average course progress</p>
                    </div>
                    {completed > 0 && (
                      <div className="rounded-sm p-2.5 flex items-center gap-2 border" style={{ backgroundColor: "rgba(76,122,93,0.08)", borderColor: "rgba(76,122,93,0.25)" }}>
                        <Award size={14} className="shrink-0" style={{ color: MOSS }} />
                        <p className="text-xs font-bold" style={{ color: MOSS }}>{completed} certificate{completed > 1 ? "s" : ""} earned</p>
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
              <h2 className="text-xl font-black mb-5 flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                <Award size={18} style={{ color: ORANGE }} /> Certificates earned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments.filter((e) => e.progress === 100).map((e) => (
                  <div key={e.id}
                    className="border rounded-sm p-5 flex items-center gap-4" style={{ backgroundColor: "rgba(214,90,46,0.05)", borderColor: "rgba(214,90,46,0.25)" }}>
                    <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0" style={{ backgroundColor: ORANGE }}>
                      <Award size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate" style={{ color: INK }}>{e.course?.title}</p>
                      <p className="text-xs font-semibold mt-0.5" style={{ color: ORANGE }}>Certificate of completion</p>
                      <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
                        Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <Link
                      to={`/certificate/${e.courseId}`}
                      className="text-xs font-black border px-3 py-1.5 rounded-sm transition shrink-0"
                      style={{ color: ORANGE, borderColor: "rgba(214,90,46,0.3)" }}
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Recommended ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-black flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                <Star size={18} style={{ color: ORANGE }} /> Recommended for you
              </h2>
              <Link to="/courses" className="text-sm font-bold flex items-center gap-1" style={{ color: BLUE }}>
                See all <ChevronRight size={14} />
              </Link>
            </div>

            {loadingRec ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map((i) => <div key={i} className="h-44 bg-white animate-pulse rounded-sm border" style={{ borderColor: LINE }} />)}
              </div>
            ) : recommended.length === 0 ? (
              <div className="bg-white rounded-sm border p-10 text-center" style={{ borderColor: LINE }}>
                <p className="text-sm" style={{ color: MUTED }}>No recommendations yet. Browse all courses.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommended.map((course, idx) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group">
                    <div className="bg-white rounded-sm border overflow-hidden hover:shadow-lg transition-shadow duration-300" style={{ borderColor: LINE }}>
                      <div className="relative h-32 overflow-hidden">
                        <img src={getImg(course, idx)} alt={course.title}
                          className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2">
                          {course.price === 0
                            ? <span className="text-white text-[9px] font-black px-2 py-0.5 rounded-sm" style={{ backgroundColor: MOSS }}>FREE</span>
                            : <span className="text-[9px] font-black px-2 py-0.5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.92)", color: INK }}>${course.price}</span>
                          }
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-black text-xs line-clamp-2 mb-1" style={{ color: INK }}>
                          {course.title}
                        </h3>
                        <p className="text-[10px] truncate" style={{ color: MUTED }}>{course.instructor?.fullName}</p>
                        {course.category?.name && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm mt-1.5 inline-block border" style={{ color: BLUE, borderColor: LINE }}>
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
              <h2 className="text-xl font-black mb-5 flex items-center gap-2" style={{ fontFamily: DISPLAY_FONT, color: INK }}>
                <Clock size={18} style={{ color: MUTED }} /> Recent activity
              </h2>
              <div className="bg-white rounded-sm border overflow-hidden" style={{ borderColor: LINE }}>
                <div className="divide-y" style={{ borderColor: LINE }}>
                  {enrollments.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                      <div className="w-11 h-11 rounded-sm overflow-hidden shrink-0" style={{ backgroundColor: PAPER }}>
                        <img src={getImg(e.course, 0)} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: INK }}>{e.course?.title}</p>
                        <p className="text-xs" style={{ color: MUTED }}>
                          Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="hidden sm:block text-right">
                          <p className="text-sm font-black" style={{ color: e.progress === 100 ? MOSS : BLUE }}>
                            {e.progress}%
                          </p>
                          <p className="text-[10px]" style={{ color: MUTED }}>complete</p>
                        </div>
                        <Link to={`/courses/${e.courseId}`}
                          className="p-2 rounded-sm transition" style={{ backgroundColor: PAPER, color: BLUE }}>
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

// Helper kept as a function since it's used before LINE's alpha variant would otherwise need a second constant
function LINE_ALPHA() { return "rgba(255,255,255,0.14)"; }

export default StudentDashboard;