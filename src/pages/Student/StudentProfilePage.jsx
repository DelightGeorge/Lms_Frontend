// src/pages/Student/StudentProfilePage.jsx
// Route: /profile  (or /profile/:userId for public profiles)
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";
import Layout from "../../shared/Layout/Layout";
import {
  Award, BookOpen, CheckCircle, Star, Zap, Flame,
  Target, TrendingUp, Trophy, Medal, Shield,
  Calendar, ArrowRight, Loader2, GraduationCap,
  BarChart2, Clock, User, Edit3,
} from "lucide-react";

// ── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

// ── Achievement definitions ──────────────────────────────────────────────────
const getAchievements = ({ total, completed, totalLessons, avgProgress, quizAttempts }) => [
  {
    id: "first_enroll",
    icon: BookOpen,
    label: "First Steps",
    desc: "Enrolled in your first course",
    unlocked: total >= 1,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
  },
  {
    id: "first_complete",
    icon: CheckCircle,
    label: "Graduate",
    desc: "Completed your first course",
    unlocked: completed >= 1,
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
  },
  {
    id: "three_courses",
    icon: Trophy,
    label: "Committed",
    desc: "Enrolled in 3+ courses",
    unlocked: total >= 3,
    color: "from-violet-500 to-purple-600",
    bg: "bg-violet-50",
    textColor: "text-violet-600",
  },
  {
    id: "five_complete",
    icon: Medal,
    label: "Scholar",
    desc: "Completed 5 courses",
    unlocked: completed >= 5,
    color: "from-amber-500 to-yellow-600",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
  },
  {
    id: "fifty_lessons",
    icon: Flame,
    label: "On Fire",
    desc: "Completed 50 lessons",
    unlocked: totalLessons >= 50,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50",
    textColor: "text-orange-600",
  },
  {
    id: "hundred_lessons",
    icon: Zap,
    label: "Speed Learner",
    desc: "Completed 100+ lessons",
    unlocked: totalLessons >= 100,
    color: "from-yellow-400 to-amber-500",
    bg: "bg-yellow-50",
    textColor: "text-yellow-600",
  },
  {
    id: "perfect_progress",
    icon: Star,
    label: "Perfectionist",
    desc: "100% average progress",
    unlocked: avgProgress === 100 && total > 0,
    color: "from-pink-500 to-rose-500",
    bg: "bg-pink-50",
    textColor: "text-pink-600",
  },
  {
    id: "quiz_taker",
    icon: Target,
    label: "Quiz Master",
    desc: "Attempted 10+ quizzes",
    unlocked: (quizAttempts || 0) >= 10,
    color: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-50",
    textColor: "text-indigo-600",
  },
  {
    id: "ten_complete",
    icon: Shield,
    label: "Elite Learner",
    desc: "Completed 10 courses",
    unlocked: completed >= 10,
    color: "from-slate-700 to-slate-900",
    bg: "bg-slate-100",
    textColor: "text-slate-700",
  },
];

// ── Sub-components ───────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value, color }) => (
  <div className={`flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition`}>
    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

const AchievementBadge = ({ achievement }) => {
  const { icon: Icon, label, desc, unlocked, color, bg, textColor } = achievement;
  return (
    <div className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
      unlocked
        ? "border-transparent shadow-md hover:shadow-lg hover:-translate-y-0.5"
        : "border-slate-200 opacity-40 grayscale"
    } ${unlocked ? bg : "bg-slate-50"}`}>
      {unlocked && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow">
          <CheckCircle size={12} className="text-white" />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
        unlocked ? `bg-gradient-to-br ${color}` : "bg-slate-300"
      }`}>
        <Icon size={26} className="text-white" />
      </div>
      <div className="text-center">
        <p className={`text-xs font-black ${unlocked ? textColor : "text-slate-500"}`}>{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{desc}</p>
      </div>
    </div>
  );
};

const ProgressRing = ({ pct, size = 56, stroke = 5 }) => {
  const r    = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? "#10b981" : "#f59e0b"}
        strokeWidth={stroke}
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
    </svg>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StudentProfilePage() {
  const { userId: paramUserId } = useParams();
  const { user: currentUser }   = useAuth();
  const navigate                = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [loading, setLoading]          = useState(true);

  const isOwnProfile = !paramUserId || paramUserId === currentUser?.id;

  useEffect(() => {
    if (!currentUser) { navigate("/auth"); return; }

    const load = async () => {
      try {
        // Always fetch own enrollments (backend filters by JWT)
        const [enrollRes, profileRes] = await Promise.all([
          API.get("/enrollments/my"),
          isOwnProfile
            ? API.get("/users/me")
            : API.get(`/users/${paramUserId}`).catch(() => ({ data: null })),
        ]);

        setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
        setProfileUser(isOwnProfile ? currentUser : (profileRes.data || currentUser));

        // Rough quiz attempt count (sum from quizzes endpoint if available)
        // We'll skip a dedicated endpoint and approximate from what we have
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser, paramUserId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <Loader2 size={36} className="animate-spin text-amber-500" />
        </div>
      </Layout>
    );
  }

  const user = profileUser || currentUser;

  // Derived stats
  const total        = enrollments.length;
  const completed    = enrollments.filter((e) => e.progress === 100).length;
  const inProgress   = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const totalLessons = enrollments.reduce((a, e) => a + (e.completedLessons || 0), 0);
  const avgProgress  = total > 0
    ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / total)
    : 0;
  const unlockedCount = getAchievements({ total, completed, totalLessons, avgProgress, quizAttempts })
    .filter((a) => a.unlocked).length;
  const level = completed >= 10 ? "Elite" : completed >= 5 ? "Scholar" : completed >= 1 ? "Graduate" : total >= 1 ? "Beginner" : "Newcomer";
  const levelColor = {
    Elite: "from-slate-700 to-slate-900", Scholar: "from-amber-500 to-yellow-600",
    Graduate: "from-emerald-500 to-teal-600", Beginner: "from-blue-500 to-blue-600",
    Newcomer: "from-slate-400 to-slate-500",
  }[level];

  const achievements = getAchievements({ total, completed, totalLessons, avgProgress, quizAttempts });

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-50">

        {/* ── Hero banner ──────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 pt-28 pb-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center sm:items-end gap-6 relative">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <span className="text-4xl font-black text-white">{user?.fullName?.[0]}</span>
                }
              </div>
              {/* Level badge */}
              <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-gradient-to-r ${levelColor} text-white text-[9px] font-black uppercase tracking-wider shadow-lg`}>
                {level}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black text-white mb-1">{user?.fullName}</h1>
              <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-full">
                  <Trophy size={12} /> {unlockedCount} / {achievements.length} Achievements
                </span>
                {user?.createdAt && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/10 px-3 py-1 rounded-full">
                    <Calendar size={12} /> Member since {fmtDate(user.createdAt)}
                  </span>
                )}
                {isOwnProfile && (
                  <Link
                    to="/profile"
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition border border-white/20"
                  >
                    <Edit3 size={11} /> Edit Profile
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <div className="max-w-4xl mx-auto px-4 -mt-10 pb-16 space-y-8">

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatPill icon={BookOpen}   label="Courses Enrolled"  value={total}        color="from-blue-500 to-blue-600" />
            <StatPill icon={CheckCircle} label="Completed"        value={completed}    color="from-emerald-500 to-teal-600" />
            <StatPill icon={Flame}      label="Lessons Done"      value={totalLessons} color="from-orange-500 to-orange-600" />
            <StatPill icon={TrendingUp} label="Avg Progress"      value={`${avgProgress}%`} color="from-violet-500 to-purple-600" />
          </div>

          {/* Progress overview */}
          <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
            <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
              <BarChart2 size={20} className="text-violet-500" /> Learning Progress
            </h2>

            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <ProgressRing pct={avgProgress} size={80} stroke={7} />
                <span className="absolute inset-0 flex items-center justify-center text-base font-black text-slate-900">
                  {avgProgress}%
                </span>
              </div>
              <div className="flex-1 space-y-3">
                {[
                  { label: "Completed",   count: completed,  total, color: "bg-emerald-500" },
                  { label: "In Progress", count: inProgress, total, color: "bg-amber-500" },
                  { label: "Not Started", count: total - completed - inProgress, total, color: "bg-slate-300" },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <p className="text-xs text-slate-500 w-24 shrink-0">{label}</p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${color} rounded-full transition-all duration-700`}
                        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-700 w-6 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Award size={20} className="text-amber-500" /> Achievements
              </h2>
              <span className="text-xs font-bold text-slate-500">
                {unlockedCount} / {achievements.length} unlocked
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-700"
                  style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                {achievements.length - unlockedCount} more to go!
              </p>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {achievements.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
            </div>
          </div>

          {/* Certificates */}
          {completed > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
                <GraduationCap size={20} className="text-blue-500" /> Certificates
              </h2>
              <div className="space-y-3">
                {enrollments
                  .filter((e) => e.progress === 100)
                  .map((e) => (
                    <div
                      key={e.id}
                      className="flex items-center gap-4 p-4 rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-yellow-50 hover:shadow-md transition group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-200 shrink-0 group-hover:scale-105 transition-transform">
                        <Award size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 text-sm truncate">{e.course?.title}</p>
                        <p className="text-xs text-amber-700 font-semibold">
                          by {e.course?.instructor?.fullName} · {e.totalLessons} lessons
                        </p>
                      </div>
                      <Link
                        to={`/certificate/${e.courseId}`}
                        className="flex items-center gap-1.5 text-xs font-black text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-2 rounded-xl transition shrink-0"
                      >
                        View <ArrowRight size={12} />
                      </Link>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Enrolled courses list */}
          {total > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-7 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-500" /> All Courses
                </h2>
                <Link to="/StudentDashboard" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                  Dashboard <ArrowRight size={13} />
                </Link>
              </div>
              <div className="space-y-3">
                {enrollments.map((e) => (
                  <Link key={e.id} to={`/courses/${e.courseId}`} className="group block">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition">
                      {e.course?.thumbnail ? (
                        <img src={e.course.thumbnail} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                          <BookOpen size={20} className="text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {e.course?.title}
                        </p>
                        <p className="text-xs text-slate-400">{e.completedLessons}/{e.totalLessons} lessons</p>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              e.progress === 100 ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                            style={{ width: `${e.progress}%` }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.progress === 100 ? (
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">✓ Done</span>
                        ) : (
                          <span className="text-xs font-black text-amber-600">{e.progress}%</span>
                        )}
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-blue-400 transition" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {total === 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-amber-400" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">No courses yet</h3>
              <p className="text-slate-500 text-sm mb-6">Start learning to earn achievements and certificates</p>
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:from-amber-400 hover:to-amber-500 transition shadow-lg"
              >
                <Zap size={16} /> Browse Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO App.jsx:
// import StudentProfilePage from "./pages/Student/StudentProfilePage";
// <Route path="/student-profile"       element={<StudentProfilePage />} />
// <Route path="/student-profile/:userId" element={<StudentProfilePage />} />
// ─────────────────────────────────────────────────────────────────────────────
