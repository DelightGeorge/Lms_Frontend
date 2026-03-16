import React, { useState, useEffect } from "react";
import {
  AlertCircle, CheckCircle, Trash2, Loader2, Bell, Users,
  BookOpen, TrendingUp, Clock, X, Award, DollarSign, Activity,
  Search, Banknote, ShieldCheck, Eye,
} from "lucide-react";

import {
  getAdminStats, getAnalytics, getPendingCourses, getAllCourses,
  reviewCourse, getAllUsers, deleteUser,
} from "../../services/adminService";
import { getNotifications, markNotificationAsRead } from "../../services/notificationService";
import API from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalCourses: 0, totalUsers: 0, totalInstructors: 0,
    pendingApprovals: 0, totalRevenue: 0, activeInstructors: 0,
  });

  const [pendingCourses,  setPendingCourses]  = useState([]);
  const [allCourses,      setAllCourses]      = useState([]);
  const [users,           setUsers]           = useState([]);
  const [notifications,   setNotifications]   = useState([]);
  const [payouts,         setPayouts]         = useState([]);

  const [loadingCourses,  setLoadingCourses]  = useState(false);
  const [loadingUsers,    setLoadingUsers]    = useState(false);
  const [loadingNotifs,   setLoadingNotifs]   = useState(false);
  const [loadingPayouts,  setLoadingPayouts]  = useState(false);
  const [loading,         setLoading]         = useState(true);

  const [approvingId,     setApprovingId]     = useState(null);
  const [rejectingId,     setRejectingId]     = useState(null);
  const [deletingUserId,  setDeletingUserId]  = useState(null);
  const [processingPayout, setProcessingPayout] = useState(null);

  const [toast,           setToast]           = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason,    setRejectReason]    = useState("");
  const [showPayoutModal, setShowPayoutModal] = useState(null);
  const [payoutNote,      setPayoutNote]      = useState("");
  const [activeTab,       setActiveTab]       = useState("pending");
  const [searchTerm,      setSearchTerm]      = useState("");
  const [filterStatus,    setFilterStatus]    = useState("all");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    (async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          getAdminStats().catch(() => ({ data: {} })),
          getAnalytics().catch(() => ({ data: {} })),
        ]);
        setStats({
          totalCourses:      statsRes.data?.totalCourses      || 0,
          totalUsers:        statsRes.data?.totalUsers        || 0,
          totalInstructors:  statsRes.data?.totalInstructors  || 0,
          pendingApprovals:  statsRes.data?.pendingApprovals  || 0,
          totalRevenue:      statsRes.data?.totalRevenue      || 0,
          activeInstructors: analyticsRes.data?.activeInstructors || 0,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [user]);

  // ── Pending courses ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN" || activeTab !== "pending") return;
    setLoadingCourses(true);
    getPendingCourses()
      .then((r) => setPendingCourses(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load pending courses", "error"))
      .finally(() => setLoadingCourses(false));
  }, [user, activeTab]);

  // ── All courses ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN" || activeTab !== "all") return;
    setLoadingCourses(true);
    getAllCourses()
      .then((r) => setAllCourses(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load courses", "error"))
      .finally(() => setLoadingCourses(false));
  }, [user, activeTab]);

  // ── Users ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN" || activeTab !== "users") return;
    setLoadingUsers(true);
    getAllUsers()
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load users", "error"))
      .finally(() => setLoadingUsers(false));
  }, [user, activeTab]);

  // ── Payouts ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN" || activeTab !== "payouts") return;
    setLoadingPayouts(true);
    API.get("/wallet/admin/payouts")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : (r.data?.payouts || r.data?.requests || []);
        setPayouts(list);
      })
      .catch(() => showToast("Failed to load payouts", "error"))
      .finally(() => setLoadingPayouts(false));
  }, [user, activeTab]);

  // ── Notifications ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    setLoadingNotifs(true);
    getNotifications()
      .then((r) => setNotifications(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoadingNotifs(false));
  }, [user]);

  // ── Approve course ─────────────────────────────────────────────────────────
  const handleApproveCourse = async (courseId, courseTitle) => {
    setApprovingId(courseId);
    try {
      await reviewCourse(courseId, { status: "PUBLISHED" });
      setPendingCourses((p) => p.filter((c) => c.id !== courseId));
      showToast(`"${courseTitle}" approved!`);
      const statsRes = await getAdminStats().catch(() => ({ data: {} }));
      setStats((s) => ({ ...s, pendingApprovals: statsRes.data?.pendingApprovals || 0 }));
    } catch (e) { showToast(e.response?.data?.message || "Failed to approve", "error"); }
    finally { setApprovingId(null); }
  };

  // ── Reject course ──────────────────────────────────────────────────────────
  const handleRejectCourse = async () => {
    if (!showRejectModal || !rejectReason.trim()) { showToast("Please provide a reason", "error"); return; }
    setRejectingId(showRejectModal.id);
    try {
      await reviewCourse(showRejectModal.id, { status: "REJECTED", rejectionReason: rejectReason });
      setPendingCourses((p) => p.filter((c) => c.id !== showRejectModal.id));
      showToast(`"${showRejectModal.title}" rejected.`);
      setShowRejectModal(null); setRejectReason("");
    } catch (e) { showToast(e.response?.data?.message || "Failed to reject", "error"); }
    finally { setRejectingId(null); }
  };

  // ── Delete user ────────────────────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? Cannot be undone.")) return;
    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      setUsers((u) => u.filter((x) => x.id !== userId));
      showToast("User deleted.");
    } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setDeletingUserId(null); }
  };

  // ── Process payout ─────────────────────────────────────────────────────────
  const handleProcessPayout = async (action) => {
    if (!showPayoutModal) return;
    setProcessingPayout(showPayoutModal.id);
    try {
      await API.patch(`/wallet/admin/payouts/${showPayoutModal.id}/${action}`, {
        adminNote: payoutNote,
      });
      setPayouts((p) => p.map((x) =>
        x.id === showPayoutModal.id
          ? { ...x, status: action === "approve" ? "APPROVED" : "REJECTED" }
          : x
      ));
      showToast(`Payout ${action === "approve" ? "approved" : "rejected"}!`);
      setShowPayoutModal(null); setPayoutNote("");
    } catch (e) { showToast(e.response?.data?.message || "Failed", "error"); }
    finally { setProcessingPayout(null); }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const filteredCourses = (activeTab === "pending" ? pendingCourses : allCourses).filter((c) => {
    const matchSearch = c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredUsers = users.filter((u) =>
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayouts = payouts.filter((p) =>
    filterStatus === "all" || p.status === filterStatus
  );

  const pendingPayoutsCount = payouts.filter((p) => p.status === "PENDING").length;

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
    { id: "pending",  label: "Pending Approvals", icon: Clock,    badge: stats.pendingApprovals },
    { id: "all",      label: "All Courses",        icon: BookOpen, badge: null },
    { id: "users",    label: "Users",              icon: Users,    badge: null },
    { id: "payouts",  label: "Payouts",            icon: Banknote, badge: pendingPayoutsCount || null },
  ];

  return (
    <Layout hideFloatingBar>
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-xl text-white font-bold shadow-2xl text-sm ${
          toast.type === "error" ? "bg-red-500" : "bg-emerald-500"
        }`}>{toast.msg}</div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-20">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <ShieldCheck size={24} className="text-red-300" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Admin Dashboard</h1>
            </div>
            <p className="text-slate-300 text-sm">Manage courses, users, payouts and platform analytics</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              { label: "Total Courses",      value: stats.totalCourses,                                      icon: BookOpen,   color: "bg-blue-50 text-blue-600 border-blue-100"     },
              { label: "Total Users",        value: stats.totalUsers,                                        icon: Users,      color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
              { label: "Instructors",        value: stats.totalInstructors,                                  icon: Award,      color: "bg-purple-50 text-purple-600 border-purple-100" },
              { label: "Active Instructors", value: stats.activeInstructors,                                 icon: Activity,   color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
              { label: "Pending Reviews",    value: stats.pendingApprovals,                                  icon: Clock,      color: "bg-amber-50 text-amber-600 border-amber-100"   },
              { label: "Total Revenue",      value: `$${(stats.totalRevenue || 0).toLocaleString()}`,        icon: DollarSign, color: "bg-green-50 text-green-600 border-green-100"   },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className={`${color} border rounded-2xl p-5 shadow-sm hover:shadow-md transition`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
                    <p className="text-2xl font-black mt-2">{value}</p>
                  </div>
                  <Icon size={24} className="opacity-50" />
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => { setActiveTab(id); setSearchTerm(""); setFilterStatus("all"); }}
                className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  activeTab === id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-600 hover:text-slate-900"
                }`}>
                <Icon size={16} /> {label}
                {badge > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{badge}</span>
                )}
              </button>
            ))}
          </div>

          {/* ── Pending Courses ─────────────────────────────────────────────── */}
          {activeTab === "pending" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">Pending Course Approvals</h2>
                <span className="text-3xl font-black text-amber-600">{stats.pendingApprovals}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or instructor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500 transition" />
              </div>
              {loadingCourses ? (
                <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-amber-500" /></div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle size={48} className="text-emerald-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">{searchTerm ? "No matches" : "All caught up! No pending courses"}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div key={course.id} className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex gap-6 items-start hover:shadow-md transition">
                      <img src={course.thumbnail || "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=200&q=80"}
                        alt={course.title} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-lg mb-1 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">by {course.instructor?.fullName}</p>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{course.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {course.category && <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">{course.category.name}</span>}
                          {course.price > 0 && <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">${course.price}</span>}
                          <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">⏳ Pending</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button onClick={() => handleApproveCourse(course.id, course.title)} disabled={approvingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition">
                          {approvingId === course.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                          {approvingId === course.id ? "Approving..." : "Approve"}
                        </button>
                        <button onClick={() => setShowRejectModal(course)} disabled={rejectingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition">
                          {rejectingId === course.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
                          {rejectingId === course.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── All Courses ─────────────────────────────────────────────────── */}
          {activeTab === "all" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <h2 className="text-2xl font-black text-slate-900">All Courses</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search courses..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700">
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {loadingCourses ? (
                <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12"><BookOpen size={48} className="text-slate-300 mx-auto mb-4" /><p className="text-slate-600 font-semibold">No courses found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-200">
                      {["Title", "Instructor", "Status", "Price", "Students"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-700 text-sm">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredCourses.map((course) => (
                        <tr key={course.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-semibold text-slate-900 text-sm max-w-xs truncate">{course.title}</td>
                          <td className="py-4 px-4 text-slate-600 text-sm">{course.instructor?.fullName}</td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              course.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" :
                              course.status === "PENDING_REVIEW" ? "bg-amber-100 text-amber-700" :
                              course.status === "DRAFT" ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"
                            }`}>{course.status}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm font-semibold">{course.price ? `$${course.price}` : "Free"}</td>
                          <td className="py-4 px-4 text-slate-600 text-sm">{course._count?.enrollments || 0}</td>
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
              <h2 className="text-2xl font-black text-slate-900">All Users</h2>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name or email..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
              {loadingUsers ? (
                <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-emerald-500" /></div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12"><Users size={48} className="text-slate-300 mx-auto mb-4" /><p className="text-slate-600 font-semibold">No users found</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead><tr className="border-b border-slate-200">
                      {["Name", "Email", "Role", "Status", "Enrolled", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 font-bold text-slate-700 text-sm">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                          <td className="py-4 px-4 font-semibold text-slate-900 text-sm">{u.fullName}</td>
                          <td className="py-4 px-4 text-slate-600 text-sm">{u.email}</td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              u.role === "ADMIN" ? "bg-red-100 text-red-700" :
                              u.role === "INSTRUCTOR" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                            }`}>{u.role}</span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{u.status}</span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm">{u._count?.enrollments || 0}</td>
                          <td className="py-4 px-4 text-sm">
                            <button onClick={() => handleDeleteUser(u.id)} disabled={deletingUserId === u.id}
                              className="text-red-600 hover:text-red-700 font-bold disabled:opacity-50 flex items-center gap-1">
                              {deletingUserId === u.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                              Delete
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
                {pendingPayoutsCount > 0 && (
                  <span className="bg-amber-100 text-amber-700 text-sm font-black px-3 py-1.5 rounded-full">
                    {pendingPayoutsCount} pending
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {["all", "PENDING", "APPROVED", "REJECTED", "PAID"].map((s) => (
                  <button key={s} onClick={() => setFilterStatus(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
                      filterStatus === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}>
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              {loadingPayouts ? (
                <div className="flex justify-center py-12"><Loader2 size={40} className="animate-spin text-blue-500" /></div>
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <Banknote size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">No payout requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayouts.map((payout) => (
                    <div key={payout.id} className="border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <p className="font-black text-slate-900 text-lg">${payout.amount?.toFixed(2)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              payout.status === "PENDING"  ? "bg-amber-100 text-amber-700"   :
                              payout.status === "APPROVED" ? "bg-blue-100 text-blue-700"     :
                              payout.status === "PAID"     ? "bg-emerald-100 text-emerald-700" :
                                                             "bg-red-100 text-red-700"
                            }`}>{payout.status}</span>
                          </div>
                          <p className="text-sm text-slate-600 font-semibold">{payout.instructor?.fullName}</p>
                          <p className="text-xs text-slate-400 mt-1">
                            {payout.payoutMethod === "bank_transfer" ? "🏦 Bank Transfer" : "💳 PayPal"} ·
                            {payout.bankName && ` ${payout.bankName} ·`}
                            {payout.accountNumber && ` ****${payout.accountNumber.slice(-4)}`}
                            {payout.paypalEmail && ` ${payout.paypalEmail}`}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Requested {new Date(payout.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          {payout.adminNote && (
                            <p className="text-xs text-slate-500 mt-2 italic">Note: {payout.adminNote}</p>
                          )}
                        </div>
                        {payout.status === "PENDING" && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => { setShowPayoutModal(payout); setPayoutNote(""); }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition">
                              <CheckCircle size={14} /> Review
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

          {/* Notifications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Recent Notifications</h2>
            </div>
            {loadingNotifs ? (
              <div className="flex justify-center py-8"><Loader2 size={32} className="animate-spin text-blue-500" /></div>
            ) : notifications.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No notifications yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notif) => (
                  <div key={notif.id} onClick={() => !notif.isRead && markNotificationAsRead(notif.id)}
                    className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition ${notif.isRead ? "bg-slate-50 border-slate-100" : "bg-blue-50 border-blue-100"}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{notif.title}</p>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-500 mt-2">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>
                      {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Course Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Reject Course</h3>
              <button onClick={() => setShowRejectModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div>
              <p className="font-semibold text-slate-700">{showRejectModal.title}</p>
              <p className="text-sm text-slate-500">by {showRejectModal.instructor?.fullName}</p>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Rejection Reason *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this course? This will be sent to the instructor..."
                rows={4} className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 transition resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRejectModal(null)} className="flex-1 border border-slate-200 rounded-xl py-3 text-slate-700 font-bold hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleRejectCourse} disabled={rejectingId === showRejectModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2">
                {rejectingId === showRejectModal.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                {rejectingId === showRejectModal.id ? "Rejecting..." : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Review Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">Review Payout</h3>
              <button onClick={() => setShowPayoutModal(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Instructor</span>
                <span className="font-bold text-slate-800 text-sm">{showPayoutModal.instructor?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Amount</span>
                <span className="font-black text-emerald-600 text-lg">${showPayoutModal.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">Method</span>
                <span className="font-bold text-slate-800 text-sm">{showPayoutModal.payoutMethod}</span>
              </div>
              {showPayoutModal.bankName && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Bank</span>
                  <span className="font-bold text-slate-800 text-sm">{showPayoutModal.bankName}</span>
                </div>
              )}
              {showPayoutModal.accountNumber && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Account</span>
                  <span className="font-bold text-slate-800 text-sm">{showPayoutModal.accountNumber}</span>
                </div>
              )}
              {showPayoutModal.accountName && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Name</span>
                  <span className="font-bold text-slate-800 text-sm">{showPayoutModal.accountName}</span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Admin Note (optional)</label>
              <input value={payoutNote} onChange={(e) => setPayoutNote(e.target.value)}
                placeholder="e.g. Payment sent via bank transfer"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition text-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleProcessPayout("reject")} disabled={processingPayout === showPayoutModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2">
                {processingPayout === showPayoutModal.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                Reject
              </button>
              <button onClick={() => handleProcessPayout("approve")} disabled={processingPayout === showPayoutModal.id}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2">
                {processingPayout === showPayoutModal.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                Approve & Mark Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;