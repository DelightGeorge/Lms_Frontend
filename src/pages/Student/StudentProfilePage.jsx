// src/pages/Student/StudentProfilePage.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";
import Layout from "../../shared/Layout/Layout";
import {
  Award, BookOpen, CheckCircle, Star, Zap, Flame,
  Target, TrendingUp, Trophy, Medal, Shield,
  Calendar, ArrowRight, Loader2, GraduationCap,
  BarChart2, Edit3, Lock,
} from "lucide-react";

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });

const getAchievements = ({ total, completed, totalLessons, avgProgress, quizAttempts }) => [
  { id: "first_enroll",    icon: BookOpen,    label: "First Steps",   desc: "Enrolled in first course",   unlocked: total >= 1,                       color: "from-sky-400 to-blue-500"      },
  { id: "first_complete",  icon: CheckCircle, label: "Graduate",      desc: "Completed first course",     unlocked: completed >= 1,                   color: "from-emerald-400 to-teal-500"  },
  { id: "three_courses",   icon: Trophy,      label: "Committed",     desc: "Enrolled in 3+ courses",     unlocked: total >= 3,                       color: "from-violet-400 to-purple-500" },
  { id: "five_complete",   icon: Medal,       label: "Scholar",       desc: "Completed 5 courses",        unlocked: completed >= 5,                   color: "from-amber-400 to-orange-500"  },
  { id: "fifty_lessons",   icon: Flame,       label: "On Fire",       desc: "50 lessons completed",       unlocked: totalLessons >= 50,               color: "from-orange-400 to-red-500"    },
  { id: "hundred_lessons", icon: Zap,         label: "Speed Learner", desc: "100+ lessons done",          unlocked: totalLessons >= 100,              color: "from-yellow-400 to-amber-400"  },
  { id: "perfectionist",   icon: Star,        label: "Perfectionist", desc: "100% average progress",      unlocked: avgProgress === 100 && total > 0, color: "from-pink-400 to-rose-500"     },
  { id: "quiz_taker",      icon: Target,      label: "Quiz Master",   desc: "Attempted 10+ quizzes",      unlocked: (quizAttempts || 0) >= 10,        color: "from-indigo-400 to-blue-500"   },
  { id: "ten_complete",    icon: Shield,      label: "Elite Learner", desc: "Completed 10 courses",       unlocked: completed >= 10,                  color: "from-slate-600 to-slate-800"   },
];

const Ring = ({ pct, size = 72, stroke = 6, color = "#f59e0b" }) => {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={`${(pct/100)*c} ${c}`}
        style={{ transition: "stroke-dasharray .9s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

const Stat = ({ icon: Icon, label, value, grad }) => (
  <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition group">
    <div className={`w-10 h-10 rounded-xl ${grad} flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={18} className="text-white" />
    </div>
    <p className="text-2xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
    <p className="text-xs text-slate-400 mt-1 font-medium">{label}</p>
  </div>
);

const Badge = ({ a }) => (
  <div className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl transition-all
    ${a.unlocked
      ? "bg-white border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
      : "bg-slate-50 border border-slate-100 opacity-40 grayscale"}`}>
    {a.unlocked && (
      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow">
        <CheckCircle size={10} className="text-white" />
      </span>
    )}
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-br ${a.color}`}>
      <a.icon size={22} className="text-white" />
    </div>
    <div className="text-center">
      <p className="text-[11px] font-black text-slate-700 leading-tight">{a.label}</p>
      <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{a.desc}</p>
    </div>
  </div>
);

export default function StudentProfilePage() {
  const { userId: paramUserId } = useParams();
  const { user: currentUser }   = useAuth();
  const navigate                = useNavigate();

  const [enrollments,  setEnrollments]  = useState([]);
  const [profileUser,  setProfileUser]  = useState(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [loading,      setLoading]      = useState(true);

  const isOwn = !paramUserId || paramUserId === currentUser?.id;

  useEffect(() => {
    if (!currentUser) { navigate("/auth"); return; }
    (async () => {
      try {
        const [enrollRes, profileRes] = await Promise.all([
          API.get("/enrollments/my"),
          isOwn
            ? API.get("/users/me").catch(() => ({ data: null }))
            : API.get(`/users/${paramUserId}`).catch(() => ({ data: null })),
        ]);
        setEnrollments(Array.isArray(enrollRes.data) ? enrollRes.data : []);
        setProfileUser(isOwn ? (profileRes.data || currentUser) : (profileRes.data || currentUser));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [currentUser, paramUserId]);

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <Loader2 size={32} className="animate-spin text-amber-500" />
      </div>
    </Layout>
  );

  const user         = profileUser || currentUser;
  const total        = enrollments.length;
  const completed    = enrollments.filter(e => e.progress === 100).length;
  const inProgress   = enrollments.filter(e => e.progress > 0 && e.progress < 100).length;
  const totalLessons = enrollments.reduce((a, e) => a + (e.completedLessons || 0), 0);
  const avgProgress  = total > 0 ? Math.round(enrollments.reduce((a, e) => a + (e.progress || 0), 0) / total) : 0;
  const achievements = getAchievements({ total, completed, totalLessons, avgProgress, quizAttempts });
  const unlocked     = achievements.filter(a => a.unlocked).length;

  const level    = completed >= 10 ? "Elite" : completed >= 5 ? "Scholar" : completed >= 1 ? "Graduate" : total >= 1 ? "Beginner" : "Newcomer";
  const levelCfg = {
    Elite:    "bg-slate-800 text-white",
    Scholar:  "bg-amber-500 text-white",
    Graduate: "bg-emerald-500 text-white",
    Beginner: "bg-blue-500 text-white",
    Newcomer: "bg-slate-200 text-slate-600",
  }[level];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 pt-16">

        {/* ── Hero — full self-contained section, no overlap ─── */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-4xl font-black text-white">{user?.fullName?.[0]}</span>}
                </div>
                <span className={`absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg ${levelCfg}`}>
                  {level}
                </span>
              </div>
              {/* Name + meta */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{user?.fullName}</h1>
                    <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
                  </div>
                  {isOwn && (
                    <Link to="/profile"
                      className="self-center sm:self-start flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-2 rounded-xl transition shrink-0">
                      <Edit3 size={13} /> Edit Profile
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-3 py-1.5 rounded-full">
                    <Trophy size={11} /> {unlocked}/{achievements.length} Achievements
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-300 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full">
                    <BookOpen size={11} /> {total} Courses
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full">
                    <CheckCircle size={11} /> {completed} Completed
                  </span>
                  {user?.createdAt && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-400 bg-white/10 border border-white/10 px-3 py-1.5 rounded-full">
                      <Calendar size={11} /> Since {fmtDate(user.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-6">

          {/* ── Stats row ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <Stat icon={BookOpen}    label="Enrolled"     value={total}             grad="bg-gradient-to-br from-blue-500 to-blue-600"     />
            <Stat icon={CheckCircle} label="Completed"    value={completed}         grad="bg-gradient-to-br from-emerald-500 to-teal-500"  />
            <Stat icon={Flame}       label="Lessons Done" value={totalLessons}      grad="bg-gradient-to-br from-orange-400 to-red-500"    />
            <Stat icon={TrendingUp}  label="Avg Progress" value={`${avgProgress}%`} grad="bg-gradient-to-br from-violet-500 to-purple-600" />
          </div>

          {/* ── Two-column body ────────────────────────────────── */}
          <div className="flex flex-col lg:flex-row gap-6 pb-16 items-start">

            {/* LEFT col — fixed width on desktop */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5">

              {/* Progress */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <BarChart2 size={13} className="text-violet-500" /> Progress Overview
                </h3>
                <div className="flex items-center gap-4 mb-2">
                  <div className="relative shrink-0">
                    <Ring pct={avgProgress} size={68} stroke={7} color={avgProgress === 100 ? "#10b981" : "#f59e0b"} />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-900">
                      {avgProgress}%
                    </span>
                  </div>
                  <div className="flex-1 space-y-2.5">
                    {[
                      { label: "Done",        count: completed,                      color: "bg-emerald-500" },
                      { label: "In Progress", count: inProgress,                     color: "bg-amber-400"  },
                      { label: "Not Started", count: total - completed - inProgress, color: "bg-slate-200"  },
                    ].map(({ label, count, color }) => (
                      <div key={label}>
                        <div className="flex justify-between mb-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">{label}</span>
                          <span className="text-[10px] font-black text-slate-700">{count}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all duration-700`}
                            style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <GraduationCap size={13} className="text-amber-500" /> Certificates
                </h3>
                {completed === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <Lock size={18} className="text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Complete a course to earn your first certificate</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollments.filter(e => e.progress === 100).map(e => (
                      <div key={e.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-100 hover:border-amber-300 transition group">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                          <Award size={16} className="text-white" />
                        </div>
                        <p className="flex-1 text-xs font-bold text-slate-800 truncate min-w-0">{e.course?.title}</p>
                        <Link to={`/certificate/${e.courseId}`}
                          className="shrink-0 text-[10px] font-black text-amber-600 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-lg transition">
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT col — grows to fill remaining space */}
            <div className="flex-1 min-w-0 space-y-5">

              {/* Achievements */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Award size={13} className="text-amber-500" /> Achievements
                  </h3>
                  <span className="text-xs font-bold text-slate-400">{unlocked} / {achievements.length} unlocked</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-5">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-700"
                    style={{ width: `${(unlocked / achievements.length) * 100}%` }} />
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {achievements.map(a => <Badge key={a.id} a={a} />)}
                </div>
              </div>

              {/* All Courses */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={13} className="text-blue-500" /> My Courses
                  </h3>
                  <Link to="/StudentDashboard" className="text-[11px] font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 transition">
                    Dashboard <ArrowRight size={11} />
                  </Link>
                </div>

                {total === 0 ? (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <BookOpen size={22} className="text-amber-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-500 mb-1">No courses yet</p>
                    <p className="text-xs text-slate-400 mb-4">Start learning to earn achievements</p>
                    <Link to="/courses"
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm">
                      <Zap size={13} /> Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {enrollments.map(e => (
                      <Link key={e.id} to={`/courses/${e.courseId}`}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition">
                        {e.course?.thumbnail
                          ? <img src={e.course.thumbnail} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm" />
                          : <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                              <BookOpen size={17} className="text-slate-400" />
                            </div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                            {e.course?.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full transition-all duration-700 ${e.progress === 100 ? "bg-emerald-500" : "bg-amber-400"}`}
                                style={{ width: `${e.progress}%` }} />
                            </div>
                            <span className={`text-[10px] font-black shrink-0 ${e.progress === 100 ? "text-emerald-600" : "text-amber-600"}`}>
                              {e.progress === 100 ? "✓ Done" : `${e.progress}%`}
                            </span>
                          </div>
                        </div>
                        <ArrowRight size={13} className="text-slate-300 group-hover:text-blue-400 shrink-0 transition" />
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