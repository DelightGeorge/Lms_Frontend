import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  BookOpen, Clock, Award, TrendingUp, Play,
  ChevronRight, Star, Zap, CheckCircle, GraduationCap,
  Target, RefreshCw, Flame, BarChart2, ArrowRight,
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

// ── Progress Ring ─────────────────────────────────────
const ProgressRing = ({ pct, size = 52 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={pct === 100 ? "#10b981" : "#f59e0b"}
        strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

// ── Stat Card ─────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/60 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all group">
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{label}</p>
    </div>
    <p className="text-3xl font-black text-slate-900 leading-none">{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-2">{sub}</p>}
  </div>
);

// ── Progress Bar ─────────────────────────────────
const ProgressBar = ({ pct, color = "from-amber-500 to-amber-600" }) => (
  <div className="w-full bg-slate-200/60 rounded-full h-2 overflow-hidden">
    <div className={`bg-gradient-to-r ${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
  </div>
);

// ── MAIN ──────────────────────────────────────────
const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [enrollments, setEnrollments] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRec, setLoadingRec] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch enrollments
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

  // Re-fetch on page visit
  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchEnrollments();
  }, [user, location.key]);

  // Fetch recommended courses
  useEffect(() => {
    if (!user) return;
    getAllCourses()
      .then((r) => {
        const all = Array.isArray(r.data) ? r.data : [];
        const published = all.filter((c) => c.status === "PUBLISHED");
        const enrolledIds = new Set(enrollments.map((e) => e.courseId));
        const recs = published.filter((c) => !enrolledIds.has(c.id)).slice(0, 4);
        setRecommended(recs.length > 0 ? recs : published.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoadingRec(false));
  }, [user, enrollments]);

  if (!user) return null;

  // Derived stats
  const total = enrollments.length;
  const completed = enrollments.filter((e) => e.progress === 100).length;
  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const notStarted = enrollments.filter((e) => e.progress === 0).length;
  const totalLessons = enrollments.reduce((acc, e) => acc + (e.completedLessons || 0), 0);
  const avgProgress = total > 0 ? Math.round(enrollments.reduce((acc, e) => acc + (e.progress || 0), 0) / total) : 0;

  const continueCourse = enrollments.find((e) => e.progress > 0 && e.progress < 100) || enrollments.find((e) => e.progress === 0);

  return (
    <Layout hideFloatingBar={false}>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30">
        {/* ── HERO SECTION ── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-16 sm:py-20 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30">
                  <GraduationCap size={16} className="text-amber-300" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">Learning Dashboard</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                  Welcome back,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-300">
                    {user.fullName?.split(" ")[0]}
                  </span>
                </h1>
                <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
                  {total === 0
                    ? "Start your learning journey with our premium course collection"
                    : `${avgProgress}% progress · ${totalLessons} lessons completed · ${completed} course${completed !== 1 ? "s" : ""} finished`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => fetchEnrollments(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-semibold text-sm transition-all disabled:opacity-50"
                >
                  <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <Link
                  to="/courses"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-600/30"
                >
                  <Zap size={16} /> Browse
                </Link>
              </div>
            </div>

            {/* Overall progress */}
            {total > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-slate-200">Overall Learning Progress</span>
                  <span className="text-lg font-black text-amber-300">{avgProgress}%</span>
                </div>
                <ProgressBar pct={avgProgress} color="from-amber-400 to-yellow-400" />
                <div className="flex items-center justify-between mt-3 text-xs text-slate-300 font-semibold">
                  <span>✓ {completed} completed</span>
                  <span>→ {inProgress} in progress</span>
                  <span>○ {notStarted} not started</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-12">
          {/* ── STATS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={BookOpen}
              label="Enrolled"
              value={total}
              accent="bg-gradient-to-br from-blue-500 to-blue-600"
              sub={`${total} course${total !== 1 ? "s" : ""}`}
            />
            <StatCard
              icon={CheckCircle}
              label="Completed"
              value={completed}
              accent="bg-gradient-to-br from-emerald-500 to-teal-600"
              sub="100% finished"
            />
            <StatCard
              icon={Flame}
              label="In Progress"
              value={inProgress}
              accent="bg-gradient-to-br from-amber-500 to-orange-600"
              sub="keep learning"
            />
            <StatCard
              icon={Play}
              label="Lessons Done"
              value={totalLessons}
              accent="bg-gradient-to-br from-violet-500 to-purple-600"
              sub="completed"
            />
          </div>

          {/* ── CONTINUE LEARNING ── */}
          {continueCourse && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Target size={24} className="text-amber-500" /> Continue Learning
              </h2>
              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-80 h-48 sm:h-auto shrink-0 overflow-hidden relative">
                    <img
                      src={getImg(continueCourse.course, 0)}
                      alt={continueCourse.course?.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                    {continueCourse.progress > 0 && (
                      <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-lg border border-white/20">
                        {continueCourse.progress}% Complete
                      </div>
                    )}
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                      {continueCourse.course?.category?.name && (
                        <span className="text-xs font-black bg-amber-50 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wide w-fit">
                          {continueCourse.course.category.name}
                        </span>
                      )}
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">
                          {continueCourse.course?.title}
                        </h3>
                        <p className="text-sm text-slate-500">
                          by {continueCourse.course?.instructor?.fullName}
                        </p>
                      </div>

                      <div className="flex items-center gap-6 pt-2">
                        <div className="relative">
                          <ProgressRing pct={continueCourse.progress} size={64} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-amber-600">
                            {continueCourse.progress}%
                          </span>
                        </div>
                        <div className="flex-1 space-y-2">
                          <ProgressBar pct={continueCourse.progress} />
                          <p className="text-xs text-slate-500">
                            {continueCourse.completedLessons || 0} of {continueCourse.totalLessons || 0} lessons complete
                          </p>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/courses/${continueCourse.courseId}`}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-amber-600/20 w-fit mt-4"
                    >
                      <Play size={16} />
                      {continueCourse.progress === 0 ? "Start Course" : "Continue Learning"}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── MY COURSES ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900">My Courses</h2>
                <p className="text-sm text-slate-500 mt-1">{total} enrolled</p>
              </div>
              <Link
                to="/courses"
                className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
              >
                Browse More <ChevronRight size={16} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-64 bg-white animate-pulse rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen size={32} className="text-amber-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No courses yet</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
                  Enroll in your first premium course and start your learning journey
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-600/20"
                >
                  <Zap size={16} /> Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrollments.map((e, idx) => (
                  <Link key={e.id} to={`/courses/${e.courseId}`} className="group">
                    <div className="h-full bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={getImg(e.course, idx)}
                          alt={e.course?.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        {e.progress === 100 ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/90 to-teal-600/90 flex flex-col items-center justify-center backdrop-blur-sm">
                            <CheckCircle size={36} className="text-white mb-1" />
                            <span className="text-white text-xs font-black">Completed!</span>
                          </div>
                        ) : (
                          <div className="absolute top-3 right-3">
                            <div className="relative">
                              <ProgressRing pct={e.progress} size={44} />
                              <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white">
                                {e.progress}%
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3">
                          <span
                            className={`text-[9px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm ${
                              e.progress === 100
                                ? "bg-emerald-500 text-white"
                                : e.progress > 0
                                ? "bg-amber-500 text-white"
                                : "bg-white/90 text-slate-700"
                            }`}
                          >
                            {e.progress === 100 ? "✓ Done" : e.progress > 0 ? "→ Progress" : "○ Not Started"}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-black text-slate-900 text-sm line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                          {e.course?.title}
                        </h3>
                        <p className="text-xs text-slate-500 mb-3">{e.course?.instructor?.fullName}</p>
                        <ProgressBar pct={e.progress} color={e.progress === 100 ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600"} />
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-slate-500">{e.completedLessons || 0}/{e.totalLessons || 0} lessons</span>
                          <span className="text-xs font-bold text-amber-600">{e.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* ── ANALYTICS ── */}
          {total > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <BarChart2 size={24} className="text-violet-500" /> Learning Analytics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Completion rate */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-lg transition-all">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Completion Rate</p>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ProgressRing pct={total > 0 ? Math.round((completed / total) * 100) : 0} size={72} />
                      <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-emerald-600">
                        {total > 0 ? Math.round((completed / total) * 100) : 0}%
                      </span>
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-900">
                        {completed}
                        <span className="text-sm text-slate-400 font-normal">/{total}</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">courses finished</p>
                    </div>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Status Breakdown</p>
                  <div className="space-y-4">
                    {[
                      { label: "Completed", count: completed, color: "from-emerald-500 to-teal-600" },
                      { label: "In Progress", count: inProgress, color: "from-amber-500 to-orange-600" },
                      { label: "Not Started", count: notStarted, color: "from-slate-300 to-slate-400" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="text-xs text-slate-600 font-semibold">{label}</span>
                          <span className="text-xs font-black text-slate-800">{count}</span>
                        </div>
                        <ProgressBar pct={(count / total) * 100} color={color} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Activity */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">Activity Summary</p>
                  <div className="space-y-4">
                    <div>
                      <p className="text-3xl font-black text-slate-900">{totalLessons}</p>
                      <p className="text-xs text-slate-500 mt-1">total lessons completed</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-amber-600">{avgProgress}%</p>
                      <p className="text-xs text-slate-500 mt-1">average progress</p>
                    </div>
                    {completed > 0 && (
                      <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                        <Award size={16} className="text-emerald-600 shrink-0" />
                        <p className="text-xs font-bold text-emerald-700">{completed} certificate{completed > 1 ? "s" : ""}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── CERTIFICATES ── */}
          {completed > 0 && (
            <section>
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Award size={24} className="text-amber-500" /> Certificates Earned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments
                  .filter((e) => e.progress === 100)
                  .map((e) => (
                    <div
                      key={e.id}
                      className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all group"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-400/30 group-hover:scale-110 transition-transform">
                        <Award size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm truncate">{e.course?.title}</p>
                        <p className="text-xs text-amber-700 font-semibold mt-0.5">Certificate of Completion</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {new Date(e.enrolledAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button className="text-xs font-black text-amber-700 hover:text-amber-800 border border-amber-300 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition shrink-0">
                        View
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* ── RECOMMENDED ── */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Star size={24} className="text-amber-400" /> Recommended For You
              </h2>
              <Link to="/courses" className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                See all <ChevronRight size={16} />
              </Link>
            </div>

            {loadingRec ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : recommended.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <p className="text-slate-500 text-sm">No additional recommendations at this time</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {recommended.map((course, idx) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group">
                    <div className="h-full bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={getImg(course, idx)}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 left-3">
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm ${
                            course.price === 0
                              ? "bg-emerald-500 text-white"
                              : "bg-white/90 text-slate-700"
                          }`}>
                            {course.price === 0 ? "FREE" : `$${course.price}`}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-slate-900 text-xs line-clamp-2 mb-1 group-hover:text-amber-600 transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-[10px] text-slate-500 truncate">{course.instructor?.fullName}</p>
                        {course.category?.name && (
                          <span className="text-[8px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full mt-2 inline-block">
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
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
