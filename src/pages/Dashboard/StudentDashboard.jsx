import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  BookOpen, Clock, Award, TrendingUp, Play,
  ChevronRight, Loader2, Star, Users, Zap,
  CheckCircle, ArrowRight, GraduationCap, Target,
} from "lucide-react";
import { getMyEnrollments } from "../../services/enrollmentService";
import { getAllCourses } from "../../services/courseService";
import { useAuth } from "../../Context/AuthContext";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80",
];

const getImg = (course, idx) => course?.thumbnail || placeholderImgs[idx % placeholderImgs.length];

const ProgressRing = ({ pct, size = 48 }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#3b82f6" strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
    </svg>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user }         = useAuth();
  const navigate         = useNavigate();
  const [enrollments,    setEnrollments]    = useState([]);
  const [recommended,    setRecommended]    = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [loadingRec,     setLoadingRec]     = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }

    getMyEnrollments()
      .then((r) => setEnrollments(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));

    getAllCourses()
      .then((r) => {
        const all = Array.isArray(r.data) ? r.data : [];
        const published = all.filter((c) => c.status === "PUBLISHED");
        // Recommend courses not yet enrolled
        setRecommended(published.slice(0, 4));
      })
      .catch(console.error)
      .finally(() => setLoadingRec(false));
  }, [user]);

  // Stats
  const totalCourses     = enrollments.length;
  const completed        = enrollments.filter((e) => e.progress === 100).length;
  const inProgress       = enrollments.filter((e) => e.progress > 0 && e.progress < 100).length;
  const totalLessons     = enrollments.reduce((acc, e) => acc + (e.completedLessons || 0), 0);

  // Continue learning = most recently enrolled with progress < 100
  const continueLearning = enrollments
    .filter((e) => e.progress < 100)
    .slice(0, 1)[0];

  // Recent activity = last 3 enrollments
  const recentActivity = enrollments.slice(0, 3);

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20">

        {/* Hero header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white px-4 py-12">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500/30 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-blue-300" />
                </div>
                <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Student Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, {user.fullName?.split(" ")[0]} 👋
              </h1>
              <p className="text-slate-300 mt-1 text-sm">
                {totalCourses === 0 ? "Start your learning journey today" : `You're enrolled in ${totalCourses} course${totalCourses !== 1 ? "s" : ""}`}
              </p>
            </div>
            <Link to="/courses"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/30 shrink-0 self-start sm:self-auto">
              <Zap size={16} /> Browse Courses
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={BookOpen}    label="Enrolled"    value={totalCourses}  accent="bg-blue-500"    />
            <StatCard icon={CheckCircle} label="Completed"   value={completed}     accent="bg-emerald-500" />
            <StatCard icon={TrendingUp}  label="In Progress" value={inProgress}    accent="bg-amber-500"   />
            <StatCard icon={Play}        label="Lessons Done" value={totalLessons} accent="bg-violet-500"  />
          </div>

          {/* Continue Learning */}
          {continueLearning && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                <Target size={20} className="text-blue-500" /> Continue Learning
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition">
                <div className="flex flex-col sm:flex-row gap-0">
                  <div className="sm:w-56 h-36 sm:h-auto shrink-0 overflow-hidden">
                    <img
                      src={getImg(continueLearning.course, 0)}
                      alt={continueLearning.course?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="font-black text-slate-800 text-lg leading-tight">{continueLearning.course?.title}</h3>
                        <div className="relative shrink-0">
                          <ProgressRing pct={continueLearning.progress} size={52} />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-blue-600">
                            {continueLearning.progress}%
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mb-3">
                        {continueLearning.completedLessons || 0} of {continueLearning.totalLessons || 0} lessons complete
                      </p>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${continueLearning.progress}%` }}
                        />
                      </div>
                    </div>
                    <Link
                      to={`/courses/${continueLearning.courseId}`}
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition w-fit"
                    >
                      <Play size={14} /> Continue
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* My Courses */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-slate-900">My Courses</h2>
              <Link to="/courses" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
                Browse more <ChevronRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map((i) => (
                  <div key={i} className="h-48 bg-white animate-pulse rounded-2xl border border-slate-100" />
                ))}
              </div>
            ) : enrollments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
                <BookOpen size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-600">No courses yet</p>
                <p className="text-slate-400 text-sm mt-1 mb-5">Enroll in your first course to get started</p>
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
                      <div className="relative h-36 overflow-hidden">
                        <img
                          src={getImg(e.course, idx)}
                          alt={e.course?.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {e.progress === 100 && (
                          <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                            <div className="text-white text-center">
                              <CheckCircle size={28} className="mx-auto mb-1" />
                              <span className="text-xs font-black">Completed!</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <div className="relative">
                            <ProgressRing pct={e.progress} size={36} />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white">
                              {e.progress}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-black text-slate-800 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {e.course?.title}
                        </h3>
                        <p className="text-xs text-slate-400 mb-3">{e.course?.instructor?.fullName}</p>
                        <div className="w-full bg-slate-100 rounded-full h-1">
                          <div className="bg-blue-500 h-1 rounded-full transition-all" style={{ width: `${e.progress}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400">{e.completedLessons}/{e.totalLessons} lessons</span>
                          <span className={`text-[10px] font-bold ${e.progress === 100 ? "text-emerald-500" : "text-blue-500"}`}>
                            {e.progress === 100 ? "✓ Done" : e.progress > 0 ? "In progress" : "Not started"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Certificates */}
          {completed > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Award size={20} className="text-amber-500" /> Certificates Earned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {enrollments
                  .filter((e) => e.progress === 100)
                  .map((e) => (
                    <div key={e.id} className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center shrink-0 shadow-md shadow-amber-400/30">
                        <Award size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-800 text-sm truncate">{e.course?.title}</p>
                        <p className="text-xs text-amber-600 font-semibold mt-0.5">Certificate of Completion</p>
                      </div>
                      <button className="text-xs font-bold text-amber-600 hover:text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition shrink-0">
                        View
                      </button>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Recommended Courses */}
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
                {[1,2,3,4].map((i) => <div key={i} className="h-40 bg-white animate-pulse rounded-2xl border border-slate-100" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommended.map((course, idx) => (
                  <Link key={course.id} to={`/courses/${course.id}`} className="group">
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                      <div className="h-28 overflow-hidden">
                        <img src={getImg(course, idx)} alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="p-3">
                        <h3 className="font-black text-slate-800 text-xs line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">{course.instructor?.fullName}</span>
                          <span className={`text-[10px] font-black ${course.price === 0 ? "text-emerald-600" : "text-slate-800"}`}>
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <Clock size={20} className="text-slate-400" /> Recent Activity
              </h2>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
                {recentActivity.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img src={getImg(e.course, 0)} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{e.course?.title}</p>
                      <p className="text-xs text-slate-400">
                        Enrolled {new Date(e.enrolledAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-blue-600">{e.progress}%</p>
                        <p className="text-[10px] text-slate-400">complete</p>
                      </div>
                      <Link to={`/courses/${e.courseId}`}
                        className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition">
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;