import { useState, useEffect } from "react";
import {
  Users, BookOpen, Clock, CheckCircle, XCircle,
  TrendingUp, Shield, Loader2, Trash2, Menu,
  LayoutDashboard, GraduationCap, AlertCircle,
  ChevronRight, Home, ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdminStats,
  getPendingCourses,
  getAllUsers,
  getAllCourses,
  reviewCourse,
  deleteUser,
} from "../../services/adminService";

// ── helpers ───────────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    PUBLISHED:      "bg-emerald-100 text-emerald-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    DRAFT:          "bg-slate-100 text-slate-600",
    REJECTED:       "bg-red-100 text-red-600",
    ADMIN:          "bg-red-100 text-red-700",
    INSTRUCTOR:     "bg-blue-100 text-blue-700",
    STUDENT:        "bg-emerald-100 text-emerald-700",
  };
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, loading }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      {loading
        ? <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1" />
        : <p className="text-2xl font-black text-slate-800">{value ?? "—"}</p>
      }
    </div>
  </div>
);

const TABS = ["Overview", "Pending Courses", "All Courses", "All Users"];

// ── main ─────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab,      setActiveTab]      = useState("Overview");
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [stats,          setStats]          = useState(null);
  const [pending,        setPending]        = useState([]);
  const [allCourses,     setAllCourses]     = useState([]);
  const [users,          setUsers]          = useState([]);
  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUsers,   setLoadingUsers]   = useState(true);
  const [actionLoading,  setActionLoading]  = useState({});
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getAdminStats()
      .then((r) => setStats(r.data))
      .catch((e) => { console.error(e); showToast("Failed to load stats", "error"); })
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    getPendingCourses()
      .then((r) => {
        console.log("pending:", r.data); // ← debug
        setPending(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => { console.error(e); showToast("Failed to load pending courses", "error"); })
      .finally(() => setLoadingPending(false));
  }, []);

  useEffect(() => {
    getAllCourses()
      .then((r) => setAllCourses(Array.isArray(r.data) ? r.data : []))
      .catch((e) => { console.error(e); showToast("Failed to load courses", "error"); })
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    getAllUsers()
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch((e) => { console.error(e); showToast("Failed to load users", "error"); })
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleReview = async (courseId, approve) => {
    setActionLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await reviewCourse(courseId, { approve });
      setPending((p) => p.filter((c) => c.id !== courseId));
      setStats((s) => s && ({
        ...s,
        pendingCourses:   s.pendingCourses - 1,
        publishedCourses: approve ? s.publishedCourses + 1 : s.publishedCourses,
      }));
      showToast(approve ? "Course approved!" : "Course rejected.");
    } catch (e) {
      console.error(e);
      showToast("Action failed. Try again.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await deleteUser(userId);
      setUsers((u) => u.filter((usr) => usr.id !== userId));
      showToast("User deleted.");
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [userId]: false }));
    }
  };

  const NavItem = ({ tab }) => (
    <button
      onClick={() => { setActiveTab(tab); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        activeTab === tab ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {tab === "Overview"        && <LayoutDashboard size={16} />}
      {tab === "Pending Courses" && <Clock size={16} />}
      {tab === "All Courses"     && <BookOpen size={16} />}
      {tab === "All Users"       && <Users size={16} />}
      {tab}
      {tab === "Pending Courses" && pending.length > 0 && (
        <span className="ml-auto bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
          {pending.length}
        </span>
      )}
    </button>
  );

  const Skeleton = ({ rows = 3 }) => (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-10 bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-white font-bold shadow-lg
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex min-h-screen">

        {/* Sidebar overlay mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ── */}
        <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>

          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">LMS PRO</p>
                <p className="text-[11px] text-slate-400 font-medium">Admin Panel</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {TABS.map((tab) => <NavItem key={tab} tab={tab} />)}
          </nav>

          {/* Back to Home */}
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition w-full"
            >
              <Home size={16} /> Back to Home
            </Link>
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600">Admin Access</span>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* Top bar */}
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-black text-slate-900">{activeTab}</h1>
                <p className="text-xs text-slate-400 hidden sm:block">LMS Admin Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition">
                <ArrowLeft size={13} /> Home
              </Link>
              <span className="hidden sm:block text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">

            {/* ══ OVERVIEW ══ */}
            {activeTab === "Overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <StatCard icon={Users}     label="Total Users"    value={stats?.totalUsers}      color="bg-blue-500"   loading={loadingStats} />
                  <StatCard icon={BookOpen}  label="Total Courses"  value={stats?.totalCourses}    color="bg-violet-500" loading={loadingStats} />
                  <StatCard icon={Clock}     label="Pending Review" value={stats?.pendingCourses}  color="bg-amber-500"  loading={loadingStats} />
                  <StatCard icon={TrendingUp} label="Published"     value={stats?.publishedCourses} color="bg-emerald-500" loading={loadingStats} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending preview */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-black text-slate-800">Pending Courses</h2>
                      <button onClick={() => setActiveTab("Pending Courses")} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    {loadingPending ? <Skeleton /> : pending.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-400 font-medium">All clear! No pending courses.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {pending.slice(0, 4).map((c) => (
                          <div key={c.id} className="px-5 py-3 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">{c.title}</p>
                              <p className="text-xs text-slate-400">{c.instructor?.fullName}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => handleReview(c.id, true)} disabled={actionLoading[c.id]}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition">
                                {actionLoading[c.id] ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                              </button>
                              <button onClick={() => handleReview(c.id, false)} disabled={actionLoading[c.id]}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition">
                                <XCircle size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent users preview */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-black text-slate-800">Recent Users</h2>
                      <button onClick={() => setActiveTab("All Users")} className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    {loadingUsers ? <Skeleton /> : (
                      <div className="divide-y divide-slate-50">
                        {users.slice(0, 5).map((u) => (
                          <div key={u.id} className="px-5 py-3 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 overflow-hidden">
                              {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.fullName?.charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-slate-800 truncate">{u.fullName}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email}</p>
                            </div>
                            <Badge status={u.role} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ══ PENDING COURSES ══ */}
            {activeTab === "Pending Courses" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                  {pending.length} course{pending.length !== 1 ? "s" : ""} awaiting review
                </p>
                {loadingPending ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100" />)}
                  </div>
                ) : pending.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <CheckCircle size={40} className="text-emerald-400 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">No pending courses</p>
                    <p className="text-sm text-slate-400 mt-1">All courses have been reviewed.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-black text-slate-800 text-sm">{course.title}</h3>
                              <Badge status={course.status} />
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{course.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <GraduationCap size={12} /> {course.instructor?.fullName}
                              </span>
                              {course.category?.name && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-full">{course.category.name}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleReview(course.id, true)} disabled={actionLoading[course.id]}
                              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-60">
                              {actionLoading[course.id] ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                              Approve
                            </button>
                            <button onClick={() => handleReview(course.id, false)} disabled={actionLoading[course.id]}
                              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition disabled:opacity-60">
                              <XCircle size={13} /> Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ALL COURSES ══ */}
            {activeTab === "All Courses" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">{allCourses.length} total courses</p>
                {loadingCourses ? (
                  <div className="space-y-3">
                    {[1,2,3].map((i) => <div key={i} className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100" />)}
                  </div>
                ) : allCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
                    <p className="font-bold text-slate-700">No courses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCourses.map((course) => (
                      <div key={course.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-black text-slate-800 text-sm">{course.title}</h3>
                              <Badge status={course.status} />
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-2">{course.description}</p>
                            <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                              <span className="flex items-center gap-1">
                                <GraduationCap size={12} /> {course.instructor?.fullName}
                              </span>
                              {course.category?.name && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded-full">{course.category.name}</span>
                              )}
                              <span>${course.price ?? 0}</span>
                            </div>
                          </div>
                          {/* Allow admin to approve/reject from here too */}
                          {course.status === "PENDING_REVIEW" && (
                            <div className="flex gap-2 shrink-0">
                              <button onClick={() => handleReview(course.id, true)} disabled={actionLoading[course.id]}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition disabled:opacity-60">
                                {actionLoading[course.id] ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                                Approve
                              </button>
                              <button onClick={() => handleReview(course.id, false)} disabled={actionLoading[course.id]}
                                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-xl transition disabled:opacity-60">
                                <XCircle size={13} /> Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ALL USERS ══ */}
            {activeTab === "All Users" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">{users.length} total users</p>

                {/* Desktop table */}
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["User", "Role", "Verified", "Joined", ""].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loadingUsers ? (
                        [1,2,3,4,5].map((i) => (
                          <tr key={i}><td colSpan={5} className="px-5 py-4"><div className="h-6 bg-slate-100 animate-pulse rounded" /></td></tr>
                        ))
                      ) : users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 overflow-hidden">
                                {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.fullName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">{u.fullName}</p>
                                <p className="text-xs text-slate-400">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3"><Badge status={u.role} /></td>
                          <td className="px-5 py-3">
                            {u.isEmailVerified
                              ? <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold"><CheckCircle size={13} /> Verified</span>
                              : <span className="text-amber-500 flex items-center gap-1 text-xs font-bold"><AlertCircle size={13} /> Pending</span>
                            }
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-400">
                            {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDeleteUser(u.id)} disabled={actionLoading[u.id]}
                              className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                              {actionLoading[u.id] ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {loadingUsers ? (
                    [1,2,3].map((i) => <div key={i} className="h-20 bg-white animate-pulse rounded-2xl border border-slate-100" />)
                  ) : users.map((u) => (
                    <div key={u.id} className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0 overflow-hidden">
                        {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.fullName?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{u.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge status={u.role} />
                          {u.isEmailVerified
                            ? <span className="text-[10px] text-emerald-500 font-bold">✓ Verified</span>
                            : <span className="text-[10px] text-amber-500 font-bold">⚠ Unverified</span>
                          }
                        </div>
                      </div>
                      <button onClick={() => handleDeleteUser(u.id)} disabled={actionLoading[u.id]}
                        className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                        {actionLoading[u.id] ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;