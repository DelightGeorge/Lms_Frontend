import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Trash2,
  Loader2,
  Bell,
  Users,
  BookOpen,
  Clock,
  X,
  Award,
  DollarSign,
  Activity,
  Search,
  Banknote,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  GraduationCap,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const INK = "#22262B";
const BLUE = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER = "#EEF1F3";
const LINE = "#D8DEE3";
const MUTED = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS = "#4C7A5C";
const RUST = "#B23A2E";
const PLUM = "#5B4A8C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

// ── Document viewer utility ────────────────────────────────────────────────
const getFileType = (url = "") => {
  const lower = url.toLowerCase();
  if (lower.includes("/raw/upload/")) return "raw";
  if (
    lower.includes("/video/upload/") ||
    /\.(mp4|mov|webm|avi)(\?|$)/.test(lower)
  )
    return "video";
  const ext = lower.split("?")[0].split(".").pop();
  if (["doc", "docx"].includes(ext)) return "raw";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
  if (lower.includes(".pdf")) return "pdf";
  if (lower.includes("/image/upload/")) return "image";
  return "unknown";
};

const getViewableUrl = (url = "") => {
  if (!url) return null;
  const type = getFileType(url);
  if (type === "raw" || type === "pdf") {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
  }
  return url;
};

const openDocument = (url) => {
  const viewUrl = getViewableUrl(url);
  if (viewUrl) window.open(viewUrl, "_blank", "noopener,noreferrer");
};

const DocLink = ({ label, url, icon: Icon = FileText, color = BLUE }) => {
  if (!url) return null;
  const type = getFileType(url);
  return (
    <button
      onClick={() => openDocument(url)}
      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-sm border transition"
      style={{
        color,
        backgroundColor: `${color}0D`,
        borderColor: `${color}30`,
      }}
    >
      <Icon size={12} />
      {label}
      {type === "video" ? <Eye size={10} /> : <ExternalLink size={10} />}
    </button>
  );
};

const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  getAnalytics: () => API.get("/admin/analytics"),
  getPending: () => API.get("/admin/courses/pending"),
  getAllCourses: () => API.get("/admin/courses/all"),
  reviewCourse: (id, body) => API.patch(`/admin/courses/${id}/review`, body),
  getAllUsers: () => API.get("/admin/users"),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getPayouts: () => API.get("/wallet/admin/payouts"),
  approvePayout: (id, note) =>
    API.patch(`/wallet/admin/payouts/${id}/approve`, { adminNote: note }),
  rejectPayout: (id, note) =>
    API.patch(`/wallet/admin/payouts/${id}/reject`, { adminNote: note }),
  getNotifications: () => API.get("/notifications"),
  getApplications: () => API.get("/instructor-applications"),
  reviewApplication: (id, body) =>
    API.patch(`/instructor-applications/${id}/review`, body),
};

const AdminDashboard = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalInstructors: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
  });
  const [analytics, setAnalytics] = useState(null);
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);

  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [processingPayout, setProcessingPayout] = useState(null);
  const [processingApp, setProcessingApp] = useState(null);
  const [appModal, setAppModal] = useState(null);
  const [appRejectReason, setAppRejectReason] = useState("");

  const [toast, setToast] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [payoutModal, setPayoutModal] = useState(null);
  const [payoutNote, setPayoutNote] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const toast$ = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    Promise.all([
      adminAPI.getStats().catch(() => ({ data: {} })),
      adminAPI.getAnalytics().catch(() => ({ data: {} })),
      adminAPI.getNotifications().catch(() => ({ data: [] })),
    ])
      .then(([s, a, n]) => {
        const sd = s.data || {};
        setStats({
          totalCourses: sd.totalCourses || 0,
          totalUsers: sd.totalUsers || 0,
          totalEnrollments: sd.totalEnrollments || 0,
          pendingApprovals: sd.pendingCourses || 0,
          totalRevenue: sd.totalRevenue || 0,
          totalInstructors: a.data?.topInstructors?.length || 0,
        });
        adminAPI
          .getApplications()
          .then((r) => {
            setApplications(Array.isArray(r.data) ? r.data : []);
          })
          .catch(() => {});
        setAnalytics(a.data || null);
        setNotifications(Array.isArray(n.data) ? n.data : []);
      })
      .finally(() => setLoadingStats(false));
  }, [user]);

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    if (activeTab === "overview") return;
    setLoadingContent(true);
    const fetchers = {
      pending: () =>
        adminAPI
          .getPending()
          .then((r) => setPendingCourses(Array.isArray(r.data) ? r.data : [])),
      courses: () =>
        adminAPI
          .getAllCourses()
          .then((r) => setAllCourses(Array.isArray(r.data) ? r.data : [])),
      users: () =>
        adminAPI
          .getAllUsers()
          .then((r) => setUsers(Array.isArray(r.data) ? r.data : [])),
      applications: () =>
        adminAPI
          .getApplications()
          .then((r) => setApplications(Array.isArray(r.data) ? r.data : [])),
      payouts: () =>
        adminAPI.getPayouts().then((r) => {
          const list = Array.isArray(r.data)
            ? r.data
            : r.data?.payouts || r.data?.requests || [];
          setPayouts(list);
        }),
    };
    (fetchers[activeTab] || (() => Promise.resolve()))()
      .catch((e) =>
        toast$(e.response?.data?.message || "Failed to load", "error"),
      )
      .finally(() => setLoadingContent(false));
  }, [user, activeTab]);

  const approveCourse = async (id, title) => {
    setApprovingId(id);
    try {
      await adminAPI.reviewCourse(id, { approve: true });
      setPendingCourses((p) => p.filter((c) => c.id !== id));
      setStats((s) => ({
        ...s,
        pendingApprovals: Math.max(0, s.pendingApprovals - 1),
      }));
      toast$(`"${title}" approved!`);
    } catch (e) {
      toast$(e.response?.data?.message || "Failed", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const rejectCourse = async () => {
    if (!rejectModal || !rejectReason.trim()) {
      toast$("Please provide a reason", "error");
      return;
    }
    setRejectingId(rejectModal.id);
    try {
      await adminAPI.reviewCourse(rejectModal.id, {
        approve: false,
        rejectionReason: rejectReason,
      });
      setPendingCourses((p) => p.filter((c) => c.id !== rejectModal.id));
      setStats((s) => ({
        ...s,
        pendingApprovals: Math.max(0, s.pendingApprovals - 1),
      }));
      toast$(`"${rejectModal.title}" rejected.`);
      setRejectModal(null);
      setRejectReason("");
    } catch (e) {
      toast$(e.response?.data?.message || "Failed", "error");
    } finally {
      setRejectingId(null);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user? Cannot be undone.")) return;
    setDeletingId(id);
    try {
      await adminAPI.deleteUser(id);
      setUsers((u) => u.filter((x) => x.id !== id));
      setStats((s) => ({ ...s, totalUsers: Math.max(0, s.totalUsers - 1) }));
      toast$("User deleted.");
    } catch (e) {
      toast$(e.response?.data?.message || "Failed", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const reviewApp = async (approve) => {
    if (!appModal) return;
    if (!approve && !appRejectReason.trim()) {
      toast$("Please provide a rejection reason", "error");
      return;
    }
    setProcessingApp(appModal.id);
    try {
      await adminAPI.reviewApplication(appModal.id, {
        approve,
        rejectionReason: approve ? undefined : appRejectReason,
      });
      setApplications((prev) =>
        prev.map((a) =>
          a.id === appModal.id
            ? { ...a, status: approve ? "APPROVED" : "REJECTED" }
            : a,
        ),
      );
      toast$(
        approve
          ? `${appModal.user?.fullName} approved as instructor!`
          : "Application rejected.",
      );
      setAppModal(null);
      setAppRejectReason("");
    } catch (e) {
      toast$(e.response?.data?.message || "Failed", "error");
    } finally {
      setProcessingApp(null);
    }
  };

  const processPayout = async (action) => {
    if (!payoutModal) return;
    setProcessingPayout(payoutModal.id);
    try {
      if (action === "approve")
        await adminAPI.approvePayout(payoutModal.id, payoutNote);
      else await adminAPI.rejectPayout(payoutModal.id, payoutNote);
      setPayouts((p) =>
        p.map((x) =>
          x.id === payoutModal.id
            ? { ...x, status: action === "approve" ? "APPROVED" : "REJECTED" }
            : x,
        ),
      );
      toast$(`Payout ${action === "approve" ? "approved" : "rejected"}!`);
      setPayoutModal(null);
      setPayoutNote("");
    } catch (e) {
      toast$(e.response?.data?.message || "Failed", "error");
    } finally {
      setProcessingPayout(null);
    }
  };

  const filteredPending = pendingCourses.filter(
    (c) =>
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredCourses = allCourses.filter((c) => {
    const ms =
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructor?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const mf = filterStatus === "all" || c.status === filterStatus;
    return ms && mf;
  });
  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const filteredPayouts = payouts.filter(
    (p) => filterStatus === "all" || p.status === filterStatus,
  );
  const pendingPayoutCount = payouts.filter(
    (p) => p.status === "PENDING",
  ).length;
  const pendingAppsCount = applications.filter(
    (a) => a.status === "PENDING",
  ).length;

  if (user?.role !== "ADMIN")
    return (
      <Layout hideFloatingBar>
        <div className="min-h-screen flex items-center justify-center pt-20">
          <div
            className="bg-white rounded-sm border p-12 text-center max-w-md"
            style={{ borderColor: LINE }}
          >
            <AlertCircle
              size={44}
              style={{ color: RUST }}
              className="mx-auto mb-4"
            />
            <h2
              className="text-2xl font-black mb-2"
              style={{ fontFamily: DISPLAY_FONT, color: INK }}
            >
              Access denied
            </h2>
            <p className="text-sm" style={{ color: MUTED }}>
              Only administrators can access this dashboard
            </p>
          </div>
        </div>
      </Layout>
    );

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    {
      id: "pending",
      label: "Pending Approvals",
      icon: Clock,
      badge: stats.pendingApprovals,
    },
    { id: "courses", label: "All Courses", icon: BookOpen },
    { id: "users", label: "Users", icon: Users },
    {
      id: "payouts",
      label: "Payouts",
      icon: Banknote,
      badge: pendingPayoutCount,
    },
    {
      id: "applications",
      label: "Instructor Apps",
      icon: GraduationCap,
      badge: pendingAppsCount,
    },
  ];

  const statusPillStyle = (status) => {
    const map = {
      PUBLISHED: MOSS,
      APPROVED: MOSS,
      PAID: MOSS,
      PENDING_REVIEW: ORANGE,
      PENDING: ORANGE,
      DRAFT: MUTED,
      REJECTED: RUST,
      ADMIN: RUST,
      INSTRUCTOR: BLUE,
      STUDENT: MOSS,
      ACTIVE: MOSS,
    };
    const c = map[status] || MUTED;
    return { color: c, backgroundColor: `${c}14` };
  };

  const modalInputCls =
    "w-full border rounded-sm px-4 py-3 outline-none transition resize-none text-sm";

  return (
    <Layout hideFloatingBar>
      {toast && (
        <div
          className="fixed top-6 right-6 z-[999] px-6 py-4 rounded-sm text-white font-bold shadow-2xl text-sm"
          style={{ backgroundColor: toast.type === "error" ? RUST : MOSS }}
        >
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen pt-20" style={{ backgroundColor: PAPER }}>
        {/* Header */}
        <div
          className="text-white px-4 py-14 relative overflow-hidden"
          style={{ backgroundColor: BLUE_DEEP }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-sm flex items-center justify-center border"
                style={{
                  backgroundColor: "rgba(178,58,46,0.15)",
                  borderColor: "rgba(178,58,46,0.35)",
                }}
              >
                <ShieldCheck size={22} style={{ color: "#E3A79E" }} />
              </div>
              <h1
                className="text-4xl sm:text-5xl font-black tracking-tight"
                style={{ fontFamily: DISPLAY_FONT }}
              >
                Admin dashboard
              </h1>
            </div>
            <p className="text-sm text-white/70">
              Manage courses, users, payouts and platform analytics
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-8">
          {/* Stats */}
          {loadingStats ? (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 bg-white rounded-sm border animate-pulse"
                  style={{ borderColor: LINE }}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              {[
                {
                  label: "Total courses",
                  value: stats.totalCourses,
                  icon: BookOpen,
                  color: BLUE,
                },
                {
                  label: "Total users",
                  value: stats.totalUsers,
                  icon: Users,
                  color: MOSS,
                },
                {
                  label: "Enrollments",
                  value: stats.totalEnrollments,
                  icon: Award,
                  color: PLUM,
                },
                {
                  label: "Instructors",
                  value: stats.totalInstructors,
                  icon: Activity,
                  color: "#3E6E8C",
                },
                {
                  label: "Pending reviews",
                  value: stats.pendingApprovals,
                  icon: Clock,
                  color: ORANGE,
                },
                {
                  label: "Total revenue",
                  value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
                  icon: DollarSign,
                  color: MOSS,
                },
              ].map(({ label, value, icon: Icon, color }) => (
                <div
                  key={label}
                  className="border rounded-sm p-5 bg-white"
                  style={{ borderColor: LINE }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p
                        className="text-[10px] font-bold uppercase tracking-wider"
                        style={{ color: MUTED, fontFamily: MONO_FONT }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-2xl font-black mt-2"
                        style={{ fontFamily: DISPLAY_FONT, color: INK }}
                      >
                        {value}
                      </p>
                    </div>
                    <Icon size={20} style={{ color }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div
            className="flex gap-1 border-b overflow-x-auto"
            style={{ borderColor: LINE }}
          >
            {tabs.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition whitespace-nowrap"
                style={
                  activeTab === id
                    ? { borderColor: BLUE, color: BLUE }
                    : { borderColor: "transparent", color: MUTED }
                }
              >
                <Icon size={15} /> {label}
                {badge > 0 && (
                  <span
                    className="text-white text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: RUST }}
                  >
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── Overview ───────────────────────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {analytics?.topCourses?.length > 0 && (
                <div
                  className="bg-white rounded-sm border p-8"
                  style={{ borderColor: LINE }}
                >
                  <h2
                    className="text-xl font-black mb-5 flex items-center gap-2"
                    style={{ fontFamily: DISPLAY_FONT, color: INK }}
                  >
                    <TrendingUp size={18} style={{ color: BLUE }} /> Top
                    performing courses
                  </h2>
                  <div className="space-y-3">
                    {analytics.topCourses.map((c, i) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-4 p-3 rounded-sm hover:bg-slate-50 transition"
                      >
                        <span
                          className="w-7 h-7 rounded-full font-black text-sm flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${BLUE}14`, color: BLUE }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-sm truncate"
                            style={{ color: INK }}
                          >
                            {c.title}
                          </p>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {c.instructor} · {c.enrollments} students
                          </p>
                        </div>
                        <span
                          className="font-black text-sm shrink-0"
                          style={{ color: MOSS, fontFamily: MONO_FONT }}
                        >
                          ${(c.revenue || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {analytics?.topInstructors?.length > 0 && (
                <div
                  className="bg-white rounded-sm border p-8"
                  style={{ borderColor: LINE }}
                >
                  <h2
                    className="text-xl font-black mb-5 flex items-center gap-2"
                    style={{ fontFamily: DISPLAY_FONT, color: INK }}
                  >
                    <Award size={18} style={{ color: ORANGE }} /> Top
                    instructors
                  </h2>
                  <div className="space-y-3">
                    {analytics.topInstructors.map((inst) => (
                      <div
                        key={inst.id}
                        className="flex items-center gap-4 p-3 rounded-sm hover:bg-slate-50 transition"
                      >
                        <div
                          className="w-10 h-10 rounded-full text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                          style={{ backgroundColor: BLUE }}
                        >
                          {inst.avatarUrl ? (
                            <img
                              src={inst.avatarUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            inst.fullName?.[0]
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-bold text-sm"
                            style={{ color: INK }}
                          >
                            {inst.fullName}
                          </p>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {inst.courseCount} courses · {inst.totalStudents}{" "}
                            students
                          </p>
                        </div>
                        <span
                          className="font-black text-sm shrink-0"
                          style={{ color: MOSS, fontFamily: MONO_FONT }}
                        >
                          ${(inst.totalRevenue || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div
                className="bg-white rounded-sm border p-8"
                style={{ borderColor: LINE }}
              >
                <h2
                  className="text-xl font-black mb-5 flex items-center gap-2"
                  style={{ fontFamily: DISPLAY_FONT, color: INK }}
                >
                  <Bell size={18} style={{ color: BLUE }} /> Recent activity
                </h2>
                {notifications.length === 0 ? (
                  <p className="text-center py-8" style={{ color: MUTED }}>
                    No notifications yet
                  </p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {notifications.slice(0, 10).map((n) => (
                      <div
                        key={n.id}
                        className="p-4 rounded-sm border transition"
                        style={
                          n.isRead
                            ? { backgroundColor: PAPER, borderColor: LINE }
                            : {
                                backgroundColor: `${BLUE}0D`,
                                borderColor: `${BLUE}30`,
                              }
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p
                              className="font-semibold text-sm"
                              style={{ color: INK }}
                            >
                              {n.title}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: MUTED }}
                            >
                              {n.message}
                            </p>
                            <p
                              className="text-[10px] mt-1"
                              style={{ color: MUTED, fontFamily: MONO_FONT }}
                            >
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!n.isRead && (
                            <div
                              className="w-2 h-2 rounded-full shrink-0 mt-1"
                              style={{ backgroundColor: BLUE }}
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Pending Approvals ──────────────────────────────────────────── */}
          {activeTab === "pending" && (
            <div
              className="bg-white rounded-sm border p-8 space-y-6"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-black"
                  style={{ fontFamily: DISPLAY_FONT, color: INK }}
                >
                  Pending approvals
                </h2>
                <span
                  className="text-3xl font-black"
                  style={{ fontFamily: DISPLAY_FONT, color: ORANGE }}
                >
                  {stats.pendingApprovals}
                </span>
              </div>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: MUTED }}
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title or instructor..."
                  className="w-full border rounded-sm py-3 pl-11 pr-4 outline-none transition text-sm"
                  style={{ backgroundColor: PAPER, borderColor: LINE }}
                />
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: ORANGE }}
                  />
                </div>
              ) : filteredPending.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle
                    size={44}
                    style={{ color: MOSS }}
                    className="mx-auto mb-3 opacity-60"
                  />
                  <p className="font-semibold" style={{ color: INK }}>
                    {searchTerm
                      ? "No matches"
                      : "All caught up — no pending courses"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPending.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-sm border p-6 flex gap-5 items-start transition"
                      style={{ backgroundColor: PAPER, borderColor: LINE }}
                    >
                      <img
                        src={
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={course.title}
                        className="w-20 h-20 rounded-sm object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-black mb-1 line-clamp-1"
                          style={{ color: INK }}
                        >
                          {course.title}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: MUTED }}>
                          by {course.instructor?.fullName}
                        </p>
                        <p
                          className="text-sm line-clamp-2 mb-3"
                          style={{ color: MUTED }}
                        >
                          {course.description}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {course.category && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-sm font-semibold border"
                              style={{
                                color: BLUE,
                                borderColor: LINE,
                                backgroundColor: "#fff",
                              }}
                            >
                              {course.category.name}
                            </span>
                          )}
                          {course.price > 0 && (
                            <span
                              className="text-xs px-2.5 py-1 rounded-sm font-semibold border"
                              style={{
                                color: MOSS,
                                borderColor: `${MOSS}30`,
                                backgroundColor: "#fff",
                              }}
                            >
                              ${course.price}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 shrink-0">
                        <button
                          onClick={() => approveCourse(course.id, course.title)}
                          disabled={approvingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 disabled:opacity-50 text-white rounded-sm font-bold text-sm transition"
                          style={{ backgroundColor: MOSS }}
                        >
                          {approvingId === course.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle size={13} />
                          )}
                          {approvingId === course.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => {
                            setRejectModal(course);
                            setRejectReason("");
                          }}
                          disabled={rejectingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 disabled:opacity-50 text-white rounded-sm font-bold text-sm transition"
                          style={{ backgroundColor: RUST }}
                        >
                          {rejectingId === course.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <X size={13} />
                          )}
                          {rejectingId === course.id ? "..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── All Courses ────────────────────────────────────────────────── */}
          {activeTab === "courses" && (
            <div
              className="bg-white rounded-sm border p-8 space-y-6"
              style={{ borderColor: LINE }}
            >
              <h2
                className="text-2xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                All courses
              </h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    size={16}
                    style={{ color: MUTED }}
                  />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full border rounded-sm py-3 pl-11 pr-4 outline-none transition text-sm"
                    style={{ backgroundColor: PAPER, borderColor: LINE }}
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 border rounded-sm outline-none font-bold text-sm"
                  style={{
                    backgroundColor: PAPER,
                    borderColor: LINE,
                    color: INK,
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: BLUE }}
                  />
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen
                    size={44}
                    className="mx-auto mb-3"
                    style={{ color: LINE }}
                  />
                  <p className="font-semibold" style={{ color: MUTED }}>
                    No courses found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: LINE }}>
                        {[
                          "Title",
                          "Instructor",
                          "Status",
                          "Price",
                          "Students",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-3 px-4 font-bold"
                            style={{ color: MUTED, fontFamily: MONO_FONT }}
                          >
                            {h.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((c) => (
                        <tr
                          key={c.id}
                          className="border-b hover:bg-slate-50 transition"
                          style={{ borderColor: LINE }}
                        >
                          <td
                            className="py-3.5 px-4 font-semibold max-w-xs truncate"
                            style={{ color: INK }}
                          >
                            {c.title}
                          </td>
                          <td className="py-3.5 px-4" style={{ color: MUTED }}>
                            {c.instructor?.fullName}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className="px-2.5 py-1 rounded-sm text-xs font-bold"
                              style={statusPillStyle(c.status)}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td
                            className="py-3.5 px-4 font-semibold"
                            style={{ color: INK }}
                          >
                            {c.price ? `$${c.price}` : "Free"}
                          </td>
                          <td className="py-3.5 px-4" style={{ color: MUTED }}>
                            {c._count?.enrollments || 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Users ─────────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div
              className="bg-white rounded-sm border p-8 space-y-6"
              style={{ borderColor: LINE }}
            >
              <h2
                className="text-2xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                All users{" "}
                <span className="font-normal text-lg" style={{ color: MUTED }}>
                  ({filteredUsers.length})
                </span>
              </h2>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  size={16}
                  style={{ color: MUTED }}
                />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full border rounded-sm py-3 pl-11 pr-4 outline-none transition text-sm"
                  style={{ backgroundColor: PAPER, borderColor: LINE }}
                />
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: MOSS }}
                  />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users
                    size={44}
                    className="mx-auto mb-3"
                    style={{ color: LINE }}
                  />
                  <p className="font-semibold" style={{ color: MUTED }}>
                    No users found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: LINE }}>
                        {[
                          "Name",
                          "Email",
                          "Role",
                          "Status",
                          "Enrolled",
                          "Action",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-3 px-4 font-bold"
                            style={{ color: MUTED, fontFamily: MONO_FONT }}
                          >
                            {h.toUpperCase()}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b hover:bg-slate-50 transition"
                          style={{ borderColor: LINE }}
                        >
                          <td
                            className="py-3.5 px-4 font-semibold"
                            style={{ color: INK }}
                          >
                            {u.fullName}
                          </td>
                          <td className="py-3.5 px-4" style={{ color: MUTED }}>
                            {u.email}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className="px-2.5 py-1 rounded-sm text-xs font-bold"
                              style={statusPillStyle(u.role)}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className="px-2.5 py-1 rounded-sm text-xs font-bold"
                              style={
                                u.status === "ACTIVE"
                                  ? statusPillStyle("ACTIVE")
                                  : statusPillStyle("REJECTED")
                              }
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4" style={{ color: MUTED }}>
                            {u._count?.enrollments || 0}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => deleteUser(u.id)}
                              disabled={deletingId === u.id}
                              className="font-bold disabled:opacity-40 flex items-center gap-1"
                              style={{ color: RUST }}
                            >
                              {deletingId === u.id ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <Trash2 size={13} />
                              )}{" "}
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

          {/* ── Payouts ───────────────────────────────────────────────────── */}
          {activeTab === "payouts" && (
            <div
              className="bg-white rounded-sm border p-8 space-y-6"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-black"
                  style={{ fontFamily: DISPLAY_FONT, color: INK }}
                >
                  Payout requests
                </h2>
                {pendingPayoutCount > 0 && (
                  <span
                    className="text-sm font-black px-3 py-1.5 rounded-sm"
                    style={{ color: ORANGE, backgroundColor: `${ORANGE}14` }}
                  >
                    {pendingPayoutCount} pending
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "PENDING", "APPROVED", "REJECTED", "PAID"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="px-4 py-2 rounded-sm text-sm font-bold transition"
                    style={
                      filterStatus === s
                        ? { backgroundColor: BLUE, color: "#fff" }
                        : { backgroundColor: PAPER, color: MUTED }
                    }
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: BLUE }}
                  />
                </div>
              ) : filteredPayouts.length === 0 ? (
                <div className="text-center py-12">
                  <Banknote
                    size={44}
                    className="mx-auto mb-3"
                    style={{ color: LINE }}
                  />
                  <p className="font-semibold" style={{ color: MUTED }}>
                    No payout requests
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayouts.map((p) => (
                    <div
                      key={p.id}
                      className="border rounded-sm p-5 transition"
                      style={{ borderColor: LINE }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <p
                              className="font-black text-lg"
                              style={{ fontFamily: DISPLAY_FONT, color: INK }}
                            >
                              ${p.amount?.toFixed(2)}
                            </p>
                            <span
                              className="px-2.5 py-1 rounded-sm text-xs font-bold"
                              style={statusPillStyle(p.status)}
                            >
                              {p.status}
                            </span>
                          </div>
                          <p
                            className="text-sm font-semibold"
                            style={{ color: INK }}
                          >
                            {p.instructor?.fullName}
                          </p>
                          <p className="text-xs mt-1" style={{ color: MUTED }}>
                            {p.payoutMethod === "bank_transfer"
                              ? "Bank transfer"
                              : "PayPal"}{" "}
                            {p.bankName && `· ${p.bankName} `}
                            {p.accountNumber &&
                              `· ****${p.accountNumber.slice(-4)}`}
                            {p.paypalEmail}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: MUTED, fontFamily: MONO_FONT }}
                          >
                            {new Date(p.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          {p.adminNote && (
                            <p
                              className="text-xs italic mt-1"
                              style={{ color: MUTED }}
                            >
                              "{p.adminNote}"
                            </p>
                          )}
                        </div>
                        {p.status === "PENDING" && (
                          <button
                            onClick={() => {
                              setPayoutModal(p);
                              setPayoutNote("");
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-white rounded-sm font-bold text-sm transition shrink-0"
                            style={{ backgroundColor: MOSS }}
                          >
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

          {/* ── Instructor Applications ────────────────────────────────────── */}
          {activeTab === "applications" && (
            <div
              className="bg-white rounded-sm border p-8 space-y-6"
              style={{ borderColor: LINE }}
            >
              <div className="flex items-center justify-between">
                <h2
                  className="text-2xl font-black"
                  style={{ fontFamily: DISPLAY_FONT, color: INK }}
                >
                  Instructor applications
                </h2>
                {pendingAppsCount > 0 && (
                  <span
                    className="text-sm font-black px-3 py-1.5 rounded-sm"
                    style={{ color: ORANGE, backgroundColor: `${ORANGE}14` }}
                  >
                    {pendingAppsCount} pending
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {["all", "PENDING", "APPROVED", "REJECTED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className="px-4 py-2 rounded-sm text-sm font-bold transition"
                    style={
                      filterStatus === s
                        ? { backgroundColor: BLUE, color: "#fff" }
                        : { backgroundColor: PAPER, color: MUTED }
                    }
                  >
                    {s === "all" ? "All" : s}
                  </button>
                ))}
              </div>
              {loadingContent ? (
                <div className="flex justify-center py-12">
                  <Loader2
                    size={32}
                    className="animate-spin"
                    style={{ color: BLUE }}
                  />
                </div>
              ) : applications.filter(
                  (a) => filterStatus === "all" || a.status === filterStatus,
                ).length === 0 ? (
                <div className="text-center py-12">
                  <GraduationCap
                    size={44}
                    className="mx-auto mb-3"
                    style={{ color: LINE }}
                  />
                  <p className="font-semibold" style={{ color: MUTED }}>
                    No applications found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter(
                      (a) =>
                        filterStatus === "all" || a.status === filterStatus,
                    )
                    .map((app) => (
                      <div
                        key={app.id}
                        className="border rounded-sm p-6 transition"
                        style={{ borderColor: LINE }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-12 h-12 rounded-sm overflow-hidden text-white flex items-center justify-center font-black text-lg shrink-0"
                            style={{ backgroundColor: BLUE }}
                          >
                            {app.user?.avatarUrl ? (
                              <img
                                src={app.user.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              app.user?.fullName?.[0]
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 flex-wrap">
                              <div>
                                <p
                                  className="font-black"
                                  style={{ color: INK }}
                                >
                                  {app.user?.fullName}
                                </p>
                                <p className="text-sm" style={{ color: MUTED }}>
                                  {app.user?.email}
                                </p>
                              </div>
                              <span
                                className="text-xs font-black px-3 py-1.5 rounded-sm shrink-0"
                                style={statusPillStyle(app.status)}
                              >
                                {app.status}
                              </span>
                            </div>
                            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div
                                className="rounded-sm p-3"
                                style={{ backgroundColor: PAPER }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                  style={{
                                    color: MUTED,
                                    fontFamily: MONO_FONT,
                                  }}
                                >
                                  Headline
                                </p>
                                <p
                                  className="text-sm font-semibold line-clamp-2"
                                  style={{ color: INK }}
                                >
                                  {app.headline}
                                </p>
                              </div>
                              <div
                                className="rounded-sm p-3"
                                style={{ backgroundColor: PAPER }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                  style={{
                                    color: MUTED,
                                    fontFamily: MONO_FONT,
                                  }}
                                >
                                  Expertise
                                </p>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: INK }}
                                >
                                  {app.expertise}
                                </p>
                              </div>
                              <div
                                className="rounded-sm p-3"
                                style={{ backgroundColor: PAPER }}
                              >
                                <p
                                  className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                  style={{
                                    color: MUTED,
                                    fontFamily: MONO_FONT,
                                  }}
                                >
                                  Experience
                                </p>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: INK }}
                                >
                                  {app.yearsExperience} year
                                  {app.yearsExperience !== 1 ? "s" : ""}
                                </p>
                              </div>
                            </div>
                            <div
                              className="mt-3 rounded-sm p-3"
                              style={{ backgroundColor: PAPER }}
                            >
                              <p
                                className="text-[10px] font-bold uppercase tracking-wider mb-1"
                                style={{ color: MUTED, fontFamily: MONO_FONT }}
                              >
                                Bio
                              </p>
                              <p
                                className="text-sm line-clamp-3"
                                style={{ color: MUTED }}
                              >
                                {app.bio}
                              </p>
                            </div>

                            <div className="mt-3 flex gap-2 flex-wrap">
                              <DocLink
                                label="ID Document"
                                url={app.idDocumentUrl}
                                icon={FileText}
                                color={BLUE}
                              />
                              <DocLink
                                label="CV / Resume"
                                url={app.cvUrl}
                                icon={FileText}
                                color={PLUM}
                              />
                              <DocLink
                                label="Portfolio"
                                url={app.portfolioUrl}
                                icon={ExternalLink}
                                color={MOSS}
                              />
                              <DocLink
                                label="Sample Video"
                                url={app.sampleVideoUrl}
                                icon={Eye}
                                color={ORANGE}
                              />
                            </div>

                            {app.status === "REJECTED" &&
                              app.rejectionReason && (
                                <div
                                  className="mt-3 border rounded-sm p-3"
                                  style={{
                                    backgroundColor: `${RUST}0D`,
                                    borderColor: `${RUST}30`,
                                  }}
                                >
                                  <p
                                    className="text-xs font-bold mb-1"
                                    style={{ color: RUST }}
                                  >
                                    Rejection reason
                                  </p>
                                  <p
                                    className="text-sm"
                                    style={{ color: "#8C3D33" }}
                                  >
                                    {app.rejectionReason}
                                  </p>
                                </div>
                              )}
                            <p
                              className="text-xs mt-3"
                              style={{ color: MUTED, fontFamily: MONO_FONT }}
                            >
                              Submitted{" "}
                              {new Date(app.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                              {app.reviewedBy &&
                                ` · Reviewed by ${app.reviewedBy.fullName}`}
                            </p>
                          </div>
                        </div>
                        {app.status === "PENDING" && (
                          <div
                            className="flex gap-3 mt-4 pt-4 border-t"
                            style={{ borderColor: LINE }}
                          >
                            <button
                              onClick={() => {
                                setAppModal(app);
                                setAppRejectReason("");
                              }}
                              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-sm font-bold text-sm transition"
                              style={{ backgroundColor: BLUE }}
                            >
                              <Eye size={14} /> Review application
                            </button>
                          </div>
                        )}
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
          <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3
                className="text-xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                Reject course
              </h3>
              <button
                onClick={() => setRejectModal(null)}
                style={{ color: MUTED }}
              >
                <X size={22} />
              </button>
            </div>
            <div>
              <p className="font-semibold" style={{ color: INK }}>
                {rejectModal.title}
              </p>
              <p className="text-sm" style={{ color: MUTED }}>
                by {rejectModal.instructor?.fullName}
              </p>
            </div>
            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: INK }}
              >
                Rejection reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this course? The instructor will be notified..."
                rows={4}
                className={modalInputCls}
                style={{ borderColor: LINE }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 border rounded-sm py-3 font-bold transition text-sm"
                style={{ borderColor: LINE, color: INK }}
              >
                Cancel
              </button>
              <button
                onClick={rejectCourse}
                disabled={rejectingId === rejectModal.id}
                className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 font-bold transition flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: RUST }}
              >
                {rejectingId === rejectModal.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <X size={15} />
                )}
                {rejectingId === rejectModal.id
                  ? "Rejecting..."
                  : "Reject course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Review Modal */}
      {payoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-md w-full p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h3
                className="text-xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                Review payout
              </h3>
              <button
                onClick={() => setPayoutModal(null)}
                style={{ color: MUTED }}
              >
                <X size={22} />
              </button>
            </div>
            <div
              className="rounded-sm p-4 space-y-2.5 text-sm"
              style={{ backgroundColor: PAPER }}
            >
              {[
                ["Instructor", payoutModal.instructor?.fullName],
                ["Amount", `$${payoutModal.amount?.toFixed(2)}`],
                ["Method", payoutModal.payoutMethod?.replace("_", " ")],
                payoutModal.bankName && ["Bank", payoutModal.bankName],
                payoutModal.accountName && [
                  "Account Name",
                  payoutModal.accountName,
                ],
                payoutModal.accountNumber && [
                  "Account No.",
                  payoutModal.accountNumber,
                ],
                payoutModal.paypalEmail && ["PayPal", payoutModal.paypalEmail],
              ]
                .filter(Boolean)
                .map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span style={{ color: MUTED }}>{label}</span>
                    <span className="font-bold" style={{ color: INK }}>
                      {val}
                    </span>
                  </div>
                ))}
            </div>
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: INK }}
              >
                Admin note (optional)
              </label>
              <input
                value={payoutNote}
                onChange={(e) => setPayoutNote(e.target.value)}
                placeholder="e.g. Sent via bank transfer on Mar 17"
                className="w-full border rounded-sm px-4 py-3 outline-none transition text-sm"
                style={{ borderColor: LINE }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => processPayout("reject")}
                disabled={processingPayout === payoutModal.id}
                className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 font-bold transition flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: RUST }}
              >
                {processingPayout === payoutModal.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <X size={14} />
                )}{" "}
                Reject
              </button>
              <button
                onClick={() => processPayout("approve")}
                disabled={processingPayout === payoutModal.id}
                className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 font-bold transition flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: MOSS }}
              >
                {processingPayout === payoutModal.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}{" "}
                Approve & paid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructor Application Review Modal */}
      {appModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-sm shadow-2xl max-w-lg w-full p-8 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3
                className="text-xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                Review application
              </h3>
              <button
                onClick={() => setAppModal(null)}
                style={{ color: MUTED }}
              >
                <X size={22} />
              </button>
            </div>
            <div
              className="flex items-center gap-3 rounded-sm p-4"
              style={{ backgroundColor: PAPER }}
            >
              <div
                className="w-12 h-12 rounded-sm overflow-hidden text-white flex items-center justify-center font-black shrink-0"
                style={{ backgroundColor: BLUE }}
              >
                {appModal.user?.avatarUrl ? (
                  <img
                    src={appModal.user.avatarUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  appModal.user?.fullName?.[0]
                )}
              </div>
              <div>
                <p className="font-black" style={{ color: INK }}>
                  {appModal.user?.fullName}
                </p>
                <p className="text-sm" style={{ color: MUTED }}>
                  {appModal.user?.email}
                </p>
                <p className="text-xs" style={{ color: MUTED }}>
                  {appModal.expertise} · {appModal.yearsExperience} yrs exp
                </p>
              </div>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: MUTED, fontFamily: MONO_FONT }}
              >
                Teaching motivation
              </p>
              <p
                className="text-sm leading-relaxed rounded-sm p-4"
                style={{ color: MUTED, backgroundColor: PAPER }}
              >
                {appModal.teachingMotivation}
              </p>
            </div>

            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: MUTED, fontFamily: MONO_FONT }}
              >
                Submitted documents
              </p>
              <div className="flex flex-col gap-2">
                {[
                  {
                    label: "ID Document",
                    url: appModal.idDocumentUrl,
                    required: true,
                  },
                  { label: "CV / Resume", url: appModal.cvUrl, required: true },
                  {
                    label: "Portfolio",
                    url: appModal.portfolioUrl,
                    required: false,
                  },
                  {
                    label: "Sample Video",
                    url: appModal.sampleVideoUrl,
                    required: false,
                  },
                ]
                  .filter(({ url }) => !!url)
                  .map(({ label, url, required }) => (
                    <button
                      key={label}
                      onClick={() => openDocument(url)}
                      className="flex items-center justify-between border rounded-sm px-4 py-3 transition group text-left"
                      style={{
                        backgroundColor: `${BLUE}0D`,
                        borderColor: `${BLUE}30`,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={15} style={{ color: BLUE }} />
                        <span
                          className="text-sm font-bold"
                          style={{ color: BLUE }}
                        >
                          {label}
                        </span>
                        {required && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-sm font-bold text-white"
                            style={{ backgroundColor: BLUE }}
                          >
                            Required
                          </span>
                        )}
                      </div>
                      <ExternalLink size={13} style={{ color: BLUE }} />
                    </button>
                  ))}
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: INK }}
              >
                Rejection reason{" "}
                <span className="font-normal" style={{ color: MUTED }}>
                  (only needed if rejecting)
                </span>
              </label>
              <textarea
                value={appRejectReason}
                onChange={(e) => setAppRejectReason(e.target.value)}
                placeholder="Explain why the application is not approved..."
                rows={3}
                className={modalInputCls}
                style={{ borderColor: LINE }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => reviewApp(false)}
                disabled={processingApp === appModal.id}
                className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 font-bold transition flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: RUST }}
              >
                {processingApp === appModal.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <X size={15} />
                )}{" "}
                Reject
              </button>
              <button
                onClick={() => reviewApp(true)}
                disabled={processingApp === appModal.id}
                className="flex-1 disabled:opacity-50 text-white rounded-sm py-3 font-bold transition flex items-center justify-center gap-2 text-sm"
                style={{ backgroundColor: MOSS }}
              >
                {processingApp === appModal.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}{" "}
                Approve as instructor
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
