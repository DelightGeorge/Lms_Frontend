import React, { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle, Trash2, Loader2, Bell, Users,
  BookOpen, Clock, X, Award, DollarSign, Activity,
  Search, Banknote, ShieldCheck, TrendingUp, BarChart3,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

// ── All API calls go directly through API (no adminService dependency issues) ─
const adminAPI = {
  getStats:        () => API.get("/admin/stats"),
  getAnalytics:    () => API.get("/admin/analytics"),
  getPending:      () => API.get("/admin/courses/pending"),
  getAllCourses:    () => API.get("/admin/courses"),
  reviewCourse:    (id, body) => API.patch(`/admin/courses/${id}/review`, body),
  getAllUsers:      () => API.get("/admin/users"),
  deleteUser:      (id) => API.delete(`/admin/users/${id}`),
  getPayouts:      () => API.get("/wallet/admin/payouts"),
  approvePayout:   (id, note) => API.patch(`/wallet/admin/payouts/${id}/approve`, { adminNote: note }),
  rejectPayout:    (id, note) => API.patch(`/wallet/admin/payouts/${id}/reject`,  { adminNote: note }),
  getNotifications:() => API.get("/notifications"),
};

const AdminDashboard = () => {
  const { user } = useAuth();

  // ── State ───────────────────────────────────────────────────────────────────
  const [stats,          setStats]          = useState({ totalCourses: 0, totalUsers: 0, totalInstructors: 0, pendingApprovals: 0, totalRevenue: 0, totalEnrollments: 0 });
  const [analytics,      setAnalytics]      = useState(null);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses,     setAllCourses]     = useState([]);
  const [users,          setUsers]          = useState([]);
  const [payouts,        setPayouts]        = useState([]);
  const [notifications,  setNotifications]  = useState([]);

  const [loadingStats,   setLoadingStats]   = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingNotifs,  setLoadingNotifs]  = useState(false);

  const [approvingId,      setApprovingId]      = useState(null);
  const [rejectingId,      setRejectingId]      = useState(null);
  const [deletingId,       setDeletingId]       = useState(null);
  const [processingPayout, setProcessingPayout] = useState(null);

  const [toast,           setToast]           = useState(null);
  const [rejectModal,     setRejectModal]     = useState(null);
  const [rejectReason,    setRejectReason]    = useState("");
  const [payoutModal,     setPayoutModal]     = useState(null);
  const [payoutNote,      setPayoutNote]      = useState("");
  const [activeTab,       setActiveTab]       = useState("overview");
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");

  const toast$ = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // ── Fetch stats + analytics on mount ───────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    Promise.all([
      adminAPI.getStats().catch(() => ({ data: {} })),
      adminAPI.getAnalytics().catch(() => ({ data: {} })),
      adminAPI.getNotifications().catch(() => ({ data: [] })),
    ]).then(([s, a, n]) => {
      const sd = s.data || {};
      setStats({
        totalCourses:    sd.totalCourses    || 0,
        totalUsers:      sd.totalUsers      || 0,
        totalEnrollments:sd.totalEnrollments|| 0,
        pendingApprovals:sd.pendingCourses  || 0,
        totalRevenue:    sd.totalRevenue    || 0,
        totalInstructors:(a.data?.topInstructors?.length) || 0,
      });
      setAnalytics(a.data || null);
      setNotifications(Array.isArray(n.data) ? n.data : []);
    }).finally(() => setLoadingStats(false));
  }, [user]);

  // ── Fetch tab content ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    if (activeTab === "overview") return;
    setLoadingContent(true);
    const fetchers = {
      pending:  () => adminAPI.getPending().then((r)      => setPendingCourses(Array.isArray(r.data) ? r.data : [])),
      courses:  () => adminAPI.getAllCourses().then((r)    => setAllCourses(Array.isArray(r.data) ? r.data : [])),
      users:    () => adminAPI.getAllUsers().then((r)      => setUsers(Array.isArray(r.data) ? r.data : [])),
      payouts:  () => adminAPI.getPayouts().then((r)      => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.payouts || r.data?.requests || []);
        setPayouts(list);
      }),
    };
    (fetchers[activeTab] || (() => Promise.resolve()))()
      .catch((e) => toast$(e.response?.data?.message || "Failed to load", "error"))
      .finally(() => setLoadingContent(false));
  }, [user, activeTab]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const approveCourse = async (id, title) => {
    setApprovingId(id);
    try {
      await adminAPI.reviewCourse(id, { status: "PUBLISHED" });
      setPendingCourses((p) => p.filter((c) => c.id !== id));
      setStats((s) => ({ ...s, pendingApprovals: Math.max(0, s.pendingApprovals - 1) }));
      toast$(`"${title}" approved!`);
    } catch (e) { toast$(e.response?.data?.message || "Failed", "error"); }
    finally { setApprovingId(null); }
  };

  const rejectCourse = async () => {
    if (!rejectModal || !rejectReason.trim()) { toast$("Please provide a reason", "error"); return; }
    setRejectingId(rejectModal.id);
    try {
      await adminAPI.reviewCourse(rejectModal.id, { status: "REJECTED", rejectionReason: rejectReason });
      setPendingCourses((p) => p.filter((c) => c.id !== rejectModal.id));
      setStats((s) => ({ ...s, pendingApprovals: Math.max(0, s.pendingApprovals - 1) }));
      toast$(`"${rejectModal.title}" rejected.`);
      setRejectModal(null); setRejectReason("");
    } catch (e) { toast$(e.response?.data?.message || "Failed", "error"); }
    finally { setRejectingId(null); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? Cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      setStats((s) => ({ ...s, totalUsers: Math.max(0, s.totalUsers - 1) }));
      toast$("User deleted.");
    } catch (e) { toast$(e.response?.data?.message || "Failed", "error"); }
    finally { setDeletingId(null); }
  };

  const processPayout = async (action) => {
    if (!payoutModal) return;
    setProcessingPayout(payoutModal.id);
    try {
      if (action === "approve") await adminAPI.approvePayout(payoutModal.id, payoutNote);
      else                      await adminAPI.rejectPayout(payoutModal.id, payoutNote);
      setPayouts((p) => p.map((x) => x.id === payoutModal.id ? { ...x, status: action === "approve" ? "APPROVED" : "REJECTED" } : x));
      toast$(`Payout ${action === "approve" ? "approved" : "rejected"}!`);
      setPayoutModal(null); setPayoutNote("");
    } catch (e) { toast$(e.response?.data?.message || "Failed", "error"); }
    finally { setProcessingPayout(null); }
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filteredPending = pendingCourses.filter((c) =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredCourses = allCourses.filter((c) => {
    const ms = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mf = filterStatus === "all" || c.status === filterStatus;
    return ms && mf;
  });
  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredPayouts  = payouts.filter((p) => filterStatus === "all" || p.status === filterStatus);
  const pendingPayoutCount = payouts.filter((p) => p.status === "PENDING").length;

  if (user?.role !== "ADMIN") return (
    <Layout hideFloatingBar>
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 text-sm">Only administrators can access this dashboard</p>
        </div>
      </div>
    </Layout>
  );

  const tabs = [
    { id: "overview", label: "Overview",          icon: BarChart3  },
    { id: "pending",  label: "Pending Approvals", icon: Clock,     badge: stats.pendingApprovals },
    { id: "courses",  label: "All Courses",       icon: BookOpen                                 },
    { id: "users",    label: "Users",             icon: Users                                    },
    { id: "payouts",  label: "Payouts",           icon: Banknote,  badge: pendingPayoutCount     },
  ];

  return (
    <Layout hideFloatingBar>
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-xl text-white font-bold shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-20">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <ShieldCheck size={24} className="text-red-300" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-slate-300 text-sm">Manage courses, users, payouts and platform analytics</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* Stats row */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {Array.from({length:6}).map((_,i) => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Courses",   value: stats.totalCourses,                               icon: BookOpen,   color: "bg-blue-50 text-blue-600 border-blue-100"      },
                { label: "Total Users",     value: stats.totalUsers,                                 icon: Users,      color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                { label: "Enrollments",     value: stats.totalEnrollments,                           icon: Award,      color: "bg-purple-50 text-purple-600 border-purple-100" },
                { label: "Instructors",     value: stats.totalInstructors,                           icon: Activity,   color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                { label: "Pending Reviews", value: stats.pendingApprovals,                           icon: Clock,      color: "bg-amber-50 text-amber-600 border-amber-100"    },
                { label: "Total Revenue",   value: `$${(stats.totalRevenue||0).toLocaleString()}`,   icon: DollarSign, color: "bg-green-50 text-green-600 border-green-100"    },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`${color} border rounded-2xl p-5 shadow-sm hover:shadow-md transition`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                      <p className="text-2xl font-black mt-2">{value}</p>
                    </div>
                    <Icon size={22} className="opacity-40" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => { setActiveTab(id); setSearchTerm(""); setFilterStatus("all"); }}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}>
                <Icon size={15} /> {label}
                {badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>}
              </button>
            ))}
          </div>

          {/* ── Overview ───────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Top courses */}
              {analytics?.topCourses?.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" /> Top Performing Courses
                  </h2>
                  <div className="space-y-3">
                    {analytics.topCourses.map((c, i) => (
                      <div key={c.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                        <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center shrink-0">{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{c.title}</p>
                          <p className="text-xs text-slate-400">{c.instructor} · {c.enrollments} students</p>
                        </div>
                        <span className="font-black text-emerald-600 text-sm shrink-0">${(c.revenue||0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top instructors */}
              {analytics?.topInstructors?.length > 0 && (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                  <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                    <Award size={18} className="text-amber-500" /> Top Instructors
                  </h2>
                  <div className="space-y-3">
                    {analytics.topInstructors.map((inst, i) => (
                      <div key={inst.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                          {inst.avatarUrl ? <img src={inst.avatarUrl} alt="" className="w-full h-full object-cover" /> : inst.fullName?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 text-sm">{inst.fullName}</p>
                          <p className="text-xs text-slate-400">{inst.courseCount} courses · {inst.totalStudents} students</p>
                        </div>
                        <span className="font-black text-emerald-600 text-sm shrink-0">${(inst.totalRevenue||0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent notifications */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
                <h2 className="text-xl font-black text-slate-900 mb-5 flex items-center gap-2">
                  <Bell size={18} className="text-blue-500" /> Recent Activity
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No notifications yet</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.slice(0,10).map((n) => (
                      <div key={n.id} className={`p-4 rounded-xl border transition ${n.isRead ? "bg-slate-50 border-slate-100" : "bg-blue-50 border-blue-100"}`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{n.title}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                          {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Pending Approvals ───────────────────────────────────────────── */}
          {activeTab === "pending" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Pending Approvals</h2>
                <span className="text-3xl font-black text-amber-600">{stats.pendingApprovals}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title or instructor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-amber-500 transition text-sm" />
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12"><Loader2 size={36} className="animate-spin text-amber-500" /></div>
              ) : filteredPending.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="text-emerald-300 mx-auto mb-3" />
                  <p className="text-slate-600 font-semibold">{searchTerm ? "No matches" : "All caught up! No pending courses"}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPending.map((course) => (
                    <div key={course.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex gap-5 items-start hover:shadow-md transition">
                      <img src={course.thumbnail || "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=200&q=80"}
                        alt={course.title} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 mb-1 line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-slate-500 mb-2">by {course.instructor?.fullName}</p>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                        <div className="flex gap-2 flex-wrap">
                          {course.category && <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-semibold">{course.category.name}</span>}
                          {course.price > 0 && <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold">${course.price}</span>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => approveCourse(course.id, course.title)} disabled={approvingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition">
                          {approvingId === course.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                          {approvingId === course.id ? "..." : "Approve"}
                        </button>
                        <button onClick={() => { setRejectModal(course); setRejectReason(""); }} disabled={rejectingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition">
                          {rejectingId === course.id ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                          {rejectingId === course.id ? "..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── All Courses ─────────────────────────────────────────────────── */}
          {activeTab === "courses" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">All Courses</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search courses..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 text-sm">
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12"><Loader2 size={36} className="animate-spin text-blue-500" /></div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12"><BookOpen size={48} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-600 font-semibold">No courses found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-200">
                      {["Title","Instructor","Status","Price","Students"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-600">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredCourses.map((c) => (
                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-900 max-w-xs truncate">{c.title}</td>
                          <td className="py-3.5 px-4 text-slate-500">{c.instructor?.fullName}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              c.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                              c.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700" :
                              c.status === "DRAFT" ? "bg-slate-100 text-slate-600" : "bg-red-100 text-red-700"
                            }`}>{c.status}</span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{c.price ? `$${c.price}` : "Free"}</td>
                          <td className="py-3.5 px-4 text-slate-500">{c._count?.enrollments || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Users ───────────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">All Users <span className="text-slate-400 font-normal text-lg">({filteredUsers.length})</span></h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm" />
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12"><Loader2 size={36} className="animate-spin text-emerald-500" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12"><Users size={48} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-600 font-semibold">No users found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-slate-200">
                      {["Name","Email","Role","Status","Enrolled","Action"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-600">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{u.fullName}</td>
                          <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              u.role === "ADMIN" ? "bg-red-100 text-red-700" :
                              u.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{u.status}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">{u._count?.enrollments || 0}</td>
                          <td className="py-3.5 px-4">
                            <button onClick={() => deleteUser(u.id)} disabled={deletingId === u.id}
                              className="text-red-500 hover:text-red-700 font-bold disabled:opacity-40 flex items-center gap-1">
                              {deletingId === u.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Payouts ─────────────────────────────────────────────────────── */}
          {activeTab === "payouts" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Payout Requests</h2>
                {pendingPayoutCount > 0 && <span className="bg-amber-100 text-amber-700 text-sm font-black px-3 py-1.5 rounded-full">{pendingPayoutCount} pending</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all","PENDING","APPROVED","REJECTED","PAID"].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${filterStatus === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12"><Loader2 size={36} className="animate-spin text-blue-500" /></div>
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-12"><Banknote size={48} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-600 font-semibold">No payout requests</p></div>
              ) : (
                <div className="space-y-3">
                  {filteredPayouts.map((p) => (
                    <div key={p.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p className="font-black text-slate-900 text-lg">${p.amount?.toFixed(2)}</p>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              p.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                              p.status === "APPROVED" ? "bg-blue-100 text-blue-700" :
                              p.status === "PAID" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                            }`}>{p.status}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-700">{p.instructor?.fullName}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {p.payoutMethod === "bank_transfer" ? "🏦" : "💳"} {p.bankName && `${p.bankName} · `}{p.accountNumber && `****${p.accountNumber.slice(-4)}`}{p.paypalEmail}
                          </p>
                          <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</p>
                          {p.adminNote && <p className="text-xs text-slate-500 italic mt-1">"{p.adminNote}"</p>}
                        </div>
                        {p.status === "PENDING" && (
                          <button onClick={() => { setPayoutModal(p); setPayoutNote(""); }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shrink-0">
                            <CheckCircle size={13} /> Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reject Course Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Reject Course</h3>
              <button onClick={() => setRejectModal(null)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <div><p className="font-semibold text-slate-700">{rejectModal.title}</p><p className="text-sm text-slate-400">by {rejectModal.instructor?.fullName}</p></div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this course? The instructor will be notified..."
                rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition resize-none text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 border border-slate-200 rounded-xl py-3 text-slate-700 font-bold hover:bg-slate-50 transition text-sm">Cancel</button>
              <button onClick={rejectCourse} disabled={rejectingId === rejectModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2 text-sm">
                {rejectingId === rejectModal.id ? <Loader2 size={15} className="animate-spin" /> : <X size={15} />}
                {rejectingId === rejectModal.id ? "Rejecting..." : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Review Modal */}
      {payoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900">Review Payout</h3>
              <button onClick={() => setPayoutModal(null)} className="text-slate-400 hover:text-slate-600"><X size={22} /></button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 text-sm">
              {[
                ["Instructor",  payoutModal.instructor?.fullName],
                ["Amount",      `$${payoutModal.amount?.toFixed(2)}`],
                ["Method",      payoutModal.payoutMethod?.replace("_"," ")],
                payoutModal.bankName     && ["Bank",        payoutModal.bankName],
                payoutModal.accountName  && ["Account Name",payoutModal.accountName],
                payoutModal.accountNumber && ["Account No.", payoutModal.accountNumber],
                payoutModal.paypalEmail  && ["PayPal",      payoutModal.paypalEmail],
              ].filter(Boolean).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-bold text-slate-800">{val}</span>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Admin Note (optional)</label>
              <input value={payoutNote} onChange={(e) => setPayoutNote(e.target.value)} placeholder="e.g. Sent via bank transfer on Mar 17"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => processPayout("reject")} disabled={processingPayout === payoutModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2 text-sm">
                {processingPayout === payoutModal.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Reject
              </button>
              <button onClick={() => processPayout("approve")} disabled={processingPayout === payoutModal.id}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2 text-sm">
                {processingPayout === payoutModal.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />} Approve & Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;