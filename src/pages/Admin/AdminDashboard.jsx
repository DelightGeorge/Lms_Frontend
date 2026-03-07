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
  ClipboardCheck,
} from "lucide-react";

import {
  getPendingCourses,
  getAdminNotifications,
  approveCourse,
  rejectCourse,
  markNotificationAsRead,
  getPendingCoursesCount,
} from "../../services/notificationService";
import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalInstructors: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
  });

  const [pendingCourses, setPendingCourses] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingPending, setLoadingPending] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch stats
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchStats = async () => {
      try {
        const [coursesRes, usersRes, instructorsRes, revenueRes, pendingRes] =
          await Promise.all([
            API.get("/courses").catch(() => ({ data: [] })),
            API.get("/users").catch(() => ({ data: [] })),
            API.get("/users?role=INSTRUCTOR").catch(() => ({ data: [] })),
            API.get("/payments/total").catch(() => ({ data: { total: 0 } })),
            getPendingCoursesCount().catch(() => ({ data: { count: 0 } })),
          ]);

        const courses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
        const users = Array.isArray(usersRes.data) ? usersRes.data : [];
        const instructors = Array.isArray(instructorsRes.data)
          ? instructorsRes.data
          : [];

        setStats({
          totalCourses: courses.length,
          totalUsers: users.length,
          totalInstructors: instructors.length,
          pendingApprovals: pendingRes.data?.count || 0,
          totalRevenue: revenueRes.data?.total || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, [user]);

  // Fetch pending courses
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchPending = async () => {
      setLoadingPending(true);
      try {
        const res = await getPendingCourses();
        setPendingCourses(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching pending courses:", error);
        showToast("Failed to load pending courses", "error");
      } finally {
        setLoadingPending(false);
      }
    };

    fetchPending();
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    if (user?.role !== "ADMIN") return;

    const fetchNotifications = async () => {
      try {
        const res = await getAdminNotifications();
        setNotifications(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const handleApproveCourse = async (courseId, courseTitle) => {
    setApprovingId(courseId);
    try {
      await approveCourse(courseId);
      setPendingCourses(pendingCourses.filter((c) => c.id !== courseId));
      showToast(`"${courseTitle}" approved successfully!`);
      // Refresh stats
      const pendingRes = await getPendingCoursesCount().catch(() => ({
        data: { count: 0 },
      }));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: pendingRes.data?.count || 0,
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to approve course",
        "error",
      );
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectCourse = async () => {
    if (!showRejectModal || !rejectReason.trim()) {
      showToast("Please provide a rejection reason", "error");
      return;
    }

    setRejectingId(showRejectModal.id);
    try {
      await rejectCourse(showRejectModal.id, rejectReason);
      setPendingCourses(
        pendingCourses.filter((c) => c.id !== showRejectModal.id),
      );
      showToast(
        `"${showRejectModal.title}" rejected. Instructor will be notified.`,
      );
      setShowRejectModal(null);
      setRejectReason("");
      // Refresh stats
      const pendingRes = await getPendingCoursesCount().catch(() => ({
        data: { count: 0 },
      }));
      setStats((prev) => ({
        ...prev,
        pendingApprovals: pendingRes.data?.count || 0,
      }));
    } catch (error) {
      showToast(
        error.response?.data?.message || "Failed to reject course",
        "error",
      );
    } finally {
      setRejectingId(null);
    }
  };

  const filteredCourses = pendingCourses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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

  return (
    <Layout hideFloatingBar={true}>
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
              Manage courses, users, and platform settings
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                icon: TrendingUp,
                color: "purple",
              },
              {
                label: "Pending Approvals",
                value: stats.pendingApprovals,
                icon: Clock,
                color: "amber",
              },
              {
                label: "Total Revenue",
                value: `$${stats.totalRevenue?.toLocaleString() || 0}`,
                icon: TrendingUp,
                color: "green",
              },
            ].map((stat, i) => {
              const Icon = stat.icon;
              const colorMap = {
                blue: "bg-blue-50 text-blue-600 border-blue-100",
                emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
                purple: "bg-purple-50 text-purple-600 border-purple-100",
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
                      <p className="text-3xl font-black mt-2">{stat.value}</p>
                    </div>
                    <Icon size={24} className="opacity-50" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pending Courses Section */}
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
                    {filteredCourses.length} course
                    {filteredCourses.length !== 1 ? "s" : ""} waiting for review
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
              <button className="flex items-center gap-2 px-6 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold hover:bg-slate-200 transition">
                <Filter size={18} /> Filter
              </button>
            </div>

            {/* Pending Courses List */}
            {loadingPending ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={40} className="animate-spin text-amber-500" />
              </div>
            ) : filteredCourses.length === 0 ? (
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
                {filteredCourses.map((course) => (
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
                        <span className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-semibold">
                          ⏳ Pending Review
                        </span>
                        {course.createdAt && (
                          <span className="text-xs text-slate-500">
                            Created{" "}
                            {new Date(course.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() =>
                          handleApproveCourse(course.id, course.title)
                        }
                        disabled={approvingId === course.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition"
                      >
                        {approvingId === course.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        {approvingId === course.id ? "Approving..." : "Approve"}
                      </button>

                      <button
                        onClick={() => setShowRejectModal(course)}
                        disabled={rejectingId === course.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-bold text-sm transition"
                      >
                        {rejectingId === course.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <X size={14} />
                        )}
                        {rejectingId === course.id ? "Rejecting..." : "Reject"}
                      </button>

                      <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition">
                        <Eye size={14} />
                        Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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

            {loading ? (
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
                    className={`p-4 rounded-xl border transition ${
                      notif.read
                        ? "bg-slate-50 border-slate-100"
                        : "bg-blue-50 border-blue-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {notif.createdAt
                            ? new Date(notif.createdAt).toLocaleString()
                            : "Just now"}
                        </p>
                      </div>
                      {!notif.read && (
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
