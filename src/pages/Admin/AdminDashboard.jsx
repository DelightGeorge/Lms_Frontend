import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Loader2,
  Bell,
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  ArrowRight,
  Filter,
  Search,
  X,
  MoreVertical,
  AlertTriangle,
  Award,
  DollarSign,
  Activity,
} from "lucide-react";

import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";
import {
  getAdminStats,
  getAnalytics,
  getPendingCourses,
  getAllCourses,
  getCourseDetail,
  reviewCourse,
  getAllUsers,
  deleteUser,
} from "../../services/adminService";
import {
  getNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

const AdminDashboard = () => {
  const { user } = useAuth();

  // ── State: Stats & Analytics ───────────────────────────────────────────────
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalInstructors: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    activeInstructors: 0,
  });

  // ── State: Courses ─────────────────────────────────────────────────────────
  const [pendingCourses, setPendingCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // ── State: Users ───────────────────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // ── State: Notifications ───────────────────────────────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // ── State: UI ──────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, all, users
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Toast Helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch Stats ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchStats = async () => {
      try {
        const [statsRes, analyticsRes] = await Promise.all([
          getAdminStats().catch(() => ({ data: {} })),
          getAnalytics().catch(() => ({ data: {} })),
        ]);

        setStats({
          totalCourses: statsRes.data?.totalCourses || 0,
          totalUsers: statsRes.data?.totalUsers || 0,
          totalInstructors: statsRes.data?.totalInstructors || 0,
          pendingApprovals: statsRes.data?.pendingApprovals || 0,
          totalRevenue: statsRes.data?.totalRevenue || 0,
          activeInstructors: analyticsRes.data?.activeInstructors || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        showToast("Failed to load dashboard stats", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  // ── Fetch Pending Courses ──────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchPendingCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await getPendingCourses();
        setPendingCourses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching pending courses:", error);
        showToast("Failed to load pending courses", "error");
      } finally {
        setLoadingCourses(false);
      }
    };

    if (activeTab === "pending") {
      fetchPendingCourses();
    }
  }, [user, activeTab]);

  // ── Fetch All Courses ──────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchAllCourses = async () => {
      setLoadingCourses(true);
      try {
        const res = await getAllCourses();
        setAllCourses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching all courses:", error);
        showToast("Failed to load courses", "error");
      } finally {
        setLoadingCourses(false);
      }
    };

    if (activeTab === "all") {
      fetchAllCourses();
    }
  }, [user, activeTab]);

  // ── Fetch All Users ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchAllUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await getAllUsers();
        setUsers(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Failed to load users", "error");
      } finally {
        setLoadingUsers(false);
      }
    };

    if (activeTab === "users") {
      fetchAllUsers();
    }
  }, [user, activeTab]);

  // ── Fetch Notifications ────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchNotifications = async () => {
      setLoadingNotifs(true);
      try {
        const res = await getNotifications();
        setNotifications(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingNotifs(false);
      }
    };

    fetchNotifications();
  }, [user]);

  // ── Handle Approve Course ──────────────────────────────────────────────────
  const handleApproveCourse = async (courseId, courseTitle) => {
    setApprovingId(courseId);
    try {
      await reviewCourse(courseId, { status: "PUBLISHED" });
      setPendingCourses(pendingCourses.filter((c) => c.id !== courseId));
      showToast(`"${courseTitle}" approved successfully!`);

      // Refresh stats
      const statsRes = await getAdminStats().catch(() => ({ data: {} }));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: statsRes.data?.pendingApprovals || 0,
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to approve course",
        "error"
      );
    } finally {
      setApprovingId(null);
    }
  };

  // ── Handle Reject Course ───────────────────────────────────────────────────
  const handleRejectCourse = async () => {
    if (!showRejectModal || !rejectReason.trim()) {
      showToast("Please provide a rejection reason", "error");
      return;
    }

    setRejectingId(showRejectModal.id);
    try {
      await reviewCourse(showRejectModal.id, {
        status: "REJECTED",
        rejectionReason: rejectReason,
      });
      setPendingCourses(
        pendingCourses.filter((c) => c.id !== showRejectModal.id)
      );
      showToast(
        `"${showRejectModal.title}" rejected. Instructor will be notified.`
      );
      setShowRejectModal(null);
      setRejectReason("");

      // Refresh stats
      const statsRes = await getAdminStats().catch(() => ({ data: {} }));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: statsRes.data?.pendingApprovals || 0,
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to reject course",
        "error"
      );
    } finally {
      setRejectingId(null);
    }
  };

  // ── Handle Delete User ─────────────────────────────────────────────────────
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;

    setDeletingUserId(userId);
    try {
      await deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      showToast("User deleted successfully");

      // Refresh stats
      const statsRes = await getAdminStats().catch(() => ({ data: {} }));
      setStats((prev) => ({
        ...prev,
        totalUsers: statsRes.data?.totalUsers || 0,
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to delete user",
        "error"
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  // ── Filter & Search ────────────────────────────────────────────────────────
  const getFilteredCourses = () => {
    const courseList = activeTab === "pending" ? pendingCourses : allCourses;
    return courseList.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor?.fullName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || course.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  };

  const getFilteredUsers = () => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  };

  // ── Access Control ─────────────────────────────────────────────────────────
  if (user?.role !== "ADMIN") {
    return (
      <Layout hideFloatingBar={true}>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 px-4 pt-20">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center max-w-md w-full">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">
              Access Denied
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Only administrators can access this dashboard
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Layout hideFloatingBar={true}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[999] px-6 py-4 rounded-xl text-white font-bold shadow-2xl text-sm backdrop-blur-xl border ${
            toast.type === "error"
              ? "bg-red-500/90 border-red-400/50"
              : "bg-emerald-500/90 border-emerald-400/50"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 pt-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white px-4 py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center border border-red-500/30">
                <AlertCircle size={24} className="text-red-300" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-slate-300 text-sm">
              Manage courses, users, and platform analytics
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {[
              {
                label: "Total Courses",
                value: stats.totalCourses,
                icon: BookOpen,
                color: "blue",
              },
              {
                label: "Total Users",
                value: stats.totalUsers,
                icon: Users,
                color: "emerald",
              },
              {
                label: "Instructors",
                value: stats.totalInstructors,
                icon: Award,
                color: "purple",
              },
              {
                label: "Active Instructors",
                value: stats.activeInstructors,
                icon: Activity,
                color: "indigo",
              },
              {
                label: "Pending Reviews",
                value: stats.pendingApprovals,
                icon: Clock,
                color: "amber",
              },
              {
                label: "Total Revenue",
                value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
                icon: DollarSign,
                color: "green",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              const colorMap = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                purple: "bg-purple-50 text-purple-600 border-purple-100",
                indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
                amber: "bg-amber-50 text-amber-600 border-amber-100",
                green: "bg-green-50 text-green-600 border-green-100",
              };

              return (
                <div
                  key={i}
                  className={`${colorMap[stat.color]} border rounded-2xl p-5 shadow-sm hover:shadow-md transition`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-black mt-2">{stat.value}</p>
                    </div>
                    <Icon size={24} className="opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tabs */}
          <div className="flex gap-3 border-b border-slate-200 pt-4">
            {[
              { id: "pending", label: "Pending Approvals", icon: Clock },
              { id: "all", label: "All Courses", icon: BookOpen },
              { id: "users", label: "Users", icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className={`pb-3 px-4 font-bold text-sm flex items-center gap-2 border-b-2 transition ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Pending Courses Tab ─────────────────────────────────────────────── */}
          {activeTab === "pending" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900">
                      Pending Course Approvals
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {getFilteredCourses().length} course
                      {getFilteredCourses().length !== 1 ? "s" : ""} waiting for
                      review
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-amber-600">
                    {stats.pendingApprovals}
                  </p>
                  <p className="text-xs text-slate-500">pending</p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search by course title or instructor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Pending Courses List */}
              {loadingCourses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={40} className="animate-spin text-amber-500" />
                </div>
              ) : getFilteredCourses().length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle
                    size={48}
                    className="text-emerald-300 mx-auto mb-4"
                  />
                  <p className="text-slate-600 font-semibold">
                    {searchTerm
                      ? "No courses match your search"
                      : "All caught up! No pending courses"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredCourses().map((course) => (
                    <div
                      key={course.id}
                      className="bg-slate-50 rounded-2xl border border-slate-100 p-6 hover:shadow-md transition flex gap-6 items-start"
                    >
                      {/* Course Image */}
                      <img
                        src={
                          course.thumbnail ||
                          "https://images.unsplash.com/photo-1516979187457-635ffe35ff15?auto=format&fit=crop&w=200&q=80"
                        }
                        alt={course.title}
                        className="w-24 h-24 rounded-xl object-cover shrink-0"
                      />

                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 text-lg mb-1 line-clamp-2">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-600 mb-3">
                          by {course.instructor?.fullName}
                        </p>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {course.category && (
                            <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-semibold">
                              {course.category.name}
                            </span>
                          )}
                          {course.price > 0 && (
                            <span className="text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full font-semibold">
                              ${course.price}
                            </span>
                          )}
                          <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                            ⏳ Pending Review
                          </span>
                          {course.createdAt && (
                            <span className="text-xs text-slate-500">
                              {new Date(course.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0 flex-col sm:flex-row">
                        <button
                          onClick={() =>
                            handleApproveCourse(course.id, course.title)
                          }
                          disabled={approvingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition whitespace-nowrap"
                        >
                          {approvingId === course.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          {approvingId === course.id
                            ? "Approving..."
                            : "Approve"}
                        </button>

                        <button
                          onClick={() => setShowRejectModal(course)}
                          disabled={rejectingId === course.id}
                          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition whitespace-nowrap"
                        >
                          {rejectingId === course.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <X size={14} />
                          )}
                          {rejectingId === course.id ? "Rejecting..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── All Courses Tab ─────────────────────────────────────────────────── */}
          {activeTab === "all" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    All Courses
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getFilteredCourses().length} total courses
                  </p>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 transition"
                >
                  <option value="all">All Status</option>
                  <option value="DRAFT">Draft</option>
                  <option value="PENDING_REVIEW">Pending</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>

              {/* Courses Table */}
              {loadingCourses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={40} className="animate-spin text-blue-500" />
                </div>
              ) : getFilteredCourses().length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">
                    No courses found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Title
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Instructor
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Price
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredCourses().map((course) => (
                        <tr
                          key={course.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 font-semibold text-slate-900 text-sm">
                            {course.title}
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm">
                            {course.instructor?.fullName}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                course.status === "PUBLISHED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : course.status === "PENDING_REVIEW"
                                    ? "bg-amber-100 text-amber-700"
                                    : course.status === "DRAFT"
                                      ? "bg-slate-100 text-slate-700"
                                      : "bg-red-100 text-red-700"
                              }`}
                            >
                              {course.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm font-semibold">
                            ${course.price || "Free"}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <button className="text-blue-600 hover:text-blue-700 font-bold">
                              View
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

          {/* ── Users Tab ───────────────────────────────────────────────────────── */}
          {activeTab === "users" && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Users size={20} className="text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    All Users
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {getFilteredUsers().length} total users
                  </p>
                </div>
              </div>

              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>

              {/* Users Table */}
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={40} className="animate-spin text-emerald-500" />
                </div>
              ) : getFilteredUsers().length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 font-semibold">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Email
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Role
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-bold text-slate-700 text-sm">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredUsers().map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition"
                        >
                          <td className="py-4 px-4 font-semibold text-slate-900 text-sm">
                            {u.fullName}
                          </td>
                          <td className="py-4 px-4 text-slate-600 text-sm">
                            {u.email}
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                u.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-sm">
                            <button
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={deletingUserId === u.id}
                              className="text-red-600 hover:text-red-700 font-bold disabled:opacity-50 flex items-center gap-1"
                            >
                              {deletingUserId === u.id ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Trash2 size={14} />
                              )}
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

          {/* Recent Notifications */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Recent Notifications
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {notifications.length} notification
                  {notifications.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {loadingNotifs ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 size={32} className="animate-spin text-blue-500" />
              </div>
            ) : notifications.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No notifications yet
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.slice(0, 10).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition cursor-pointer hover:shadow-md ${
                      notif.isRead
                        ? "bg-slate-50 border-slate-100"
                        : "bg-blue-50 border-blue-100"
                    }`}
                    onClick={() =>
                      !notif.isRead && markNotificationAsRead(notif.id)
                    }
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {notif.title}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString()
                            : "Just now"}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900">
                Reject Course
              </h3>
              <button
                onClick={() => setShowRejectModal(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-slate-700 font-semibold">
                {showRejectModal.title}
              </p>
              <p className="text-sm text-slate-500">
                by {showRejectModal.instructor?.fullName}
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Why are you rejecting this course? This will be sent to the instructor..."
                rows={4}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(null)}
                className="flex-1 border border-slate-200 rounded-xl py-3 text-slate-700 font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectCourse}
                disabled={rejectingId === showRejectModal.id}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl py-3 font-bold transition flex items-center justify-center gap-2"
              >
                {rejectingId === showRejectModal.id ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <X size={16} />
                )}
                {rejectingId === showRejectModal.id
                  ? "Rejecting..."
                  : "Reject Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;
