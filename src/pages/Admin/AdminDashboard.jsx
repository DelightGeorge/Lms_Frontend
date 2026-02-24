import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  Loader2,
  Trash2,
  Menu,
  LayoutDashboard,
  GraduationCap,
  AlertCircle,
  ChevronRight,
  Home,
  ArrowLeft,
  DollarSign,
  BarChart2,
  Play,
  FileText,
  Edit2,
  X,
  Save,
  Eye,
  UserCheck,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  getAdminStats,
  getAnalytics,
  getPendingCourses,
  getAllCourses,
  getCourseDetail,
  reviewCourse,
  editCourse,
  deleteCourse,
  getAllUsers,
  deleteUser,
} from "../../services/adminService";

// ── tiny helpers ──────────────────────────────────
const Badge = ({ status }) => {
  const map = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    PENDING_REVIEW: "bg-amber-100 text-amber-700",
    DRAFT: "bg-slate-100 text-slate-600",
    REJECTED: "bg-red-100 text-red-600",
    ADMIN: "bg-red-100 text-red-700",
    INSTRUCTOR: "bg-blue-100 text-blue-700",
    STUDENT: "bg-emerald-100 text-emerald-700",
  };
  return (
    <span
      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${map[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  color,
  loading,
  prefix = "",
  suffix = "",
}) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition">
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
    >
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {label}
      </p>
      {loading ? (
        <div className="h-7 w-16 bg-slate-100 animate-pulse rounded mt-1" />
      ) : (
        <p className="text-2xl font-black text-slate-800">
          {prefix}
          {value ?? "—"}
          {suffix}
        </p>
      )}
    </div>
  </div>
);

// ── simple bar chart (no library needed) ─────────
const BarChart = ({ data, dataKey, color = "bg-blue-500", label }) => {
  const max = Math.max(...data.map((d) => d[dataKey] || 0), 1);
  return (
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
        {label}
      </p>
      <div className="flex items-end gap-1.5 h-28">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[9px] text-slate-400 font-bold">
              {d[dataKey] || 0}
            </span>
            <div
              className={`w-full rounded-t-md ${color} transition-all duration-500`}
              style={{ height: `${Math.max((d[dataKey] / max) * 88, 4)}px` }}
            />
            <span className="text-[9px] text-slate-400 font-medium">
              {d.month}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const TABS = [
  "Overview",
  "Analytics",
  "Pending Courses",
  "All Courses",
  "All Users",
];

// ── MAIN ──────────────────────────────────────────
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [pending, setPending] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [toast, setToast] = useState(null);

  // course detail modal
  const [courseDetail, setCourseDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // edit course modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  // reject reason
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectCourseId, setRejectCourseId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getAdminStats()
      .then((r) => setStats(r.data))
      .catch(() => showToast("Failed to load stats", "error"))
      .finally(() => setLoadingStats(false));
  }, []);

  useEffect(() => {
    getAnalytics()
      .then((r) => setAnalytics(r.data))
      .catch(() => showToast("Failed to load analytics", "error"))
      .finally(() => setLoadingAnalytics(false));
  }, []);

  useEffect(() => {
    getPendingCourses()
      .then((r) => setPending(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load pending courses", "error"))
      .finally(() => setLoadingPending(false));
  }, []);

  useEffect(() => {
    getAllCourses()
      .then((r) => setAllCourses(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load courses", "error"))
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    getAllUsers()
      .then((r) => setUsers(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load users", "error"))
      .finally(() => setLoadingUsers(false));
  }, []);

  // ── actions ───────────────────────────────────
  const handleReview = async (courseId, approve, reason = "") => {
    setActionLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await reviewCourse(courseId, { approve, rejectionReason: reason });
      setPending((p) => p.filter((c) => c.id !== courseId));
      setAllCourses((p) =>
        p.map((c) =>
          c.id === courseId
            ? { ...c, status: approve ? "PUBLISHED" : "REJECTED" }
            : c,
        ),
      );
      setStats(
        (s) =>
          s && {
            ...s,
            pendingCourses: s.pendingCourses - 1,
            publishedCourses: approve
              ? s.publishedCourses + 1
              : s.publishedCourses,
          },
      );
      showToast(approve ? "Course approved!" : "Course rejected.");
      if (detailOpen && courseDetail?.id === courseId) {
        setCourseDetail((p) => ({
          ...p,
          status: approve ? "PUBLISHED" : "REJECTED",
        }));
      }
    } catch {
      showToast("Action failed.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: false }));
      setRejectOpen(false);
      setRejectReason("");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course permanently?")) return;
    setActionLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await deleteCourse(courseId);
      setAllCourses((p) => p.filter((c) => c.id !== courseId));
      setPending((p) => p.filter((c) => c.id !== courseId));
      setDetailOpen(false);
      showToast("Course deleted.");
    } catch {
      showToast("Failed to delete course.", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [courseId]: false }));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Delete this user? Cannot be undone.")) return;
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

  const openCourseDetail = async (courseId) => {
    setDetailOpen(true);
    setLoadingDetail(true);
    try {
      const r = await getCourseDetail(courseId);
      setCourseDetail(r.data);
    } catch {
      showToast("Failed to load course detail.", "error");
      setDetailOpen(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const openEditCourse = (course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      price: course.price,
    });
    setEditOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const r = await editCourse(editingCourse.id, editForm);
      setAllCourses((p) =>
        p.map((c) =>
          c.id === editingCourse.id ? { ...c, ...r.data.course } : c,
        ),
      );
      if (courseDetail?.id === editingCourse.id)
        setCourseDetail((p) => ({ ...p, ...r.data.course }));
      setEditOpen(false);
      showToast("Course updated!");
    } catch {
      showToast("Failed to update course.", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── nav ───────────────────────────────────────
  const NavItem = ({ tab }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
        activeTab === tab
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {tab === "Overview" && <LayoutDashboard size={16} />}
      {tab === "Analytics" && <BarChart2 size={16} />}
      {tab === "Pending Courses" && <Clock size={16} />}
      {tab === "All Courses" && <BookOpen size={16} />}
      {tab === "All Users" && <Users size={16} />}
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

  // ── course card (reusable) ────────────────────
  const CourseCard = ({ course, showActions = true }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Thumbnail */}
        <div className="w-full sm:w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen size={20} className="text-slate-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-black text-slate-800 text-sm">
              {course.title}
            </h3>
            <Badge status={course.status} />
          </div>
          <p className="text-xs text-slate-500 line-clamp-2 mb-2">
            {course.description}
          </p>
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <GraduationCap size={11} /> {course.instructor?.fullName}
            </span>
            {course.category?.name && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                {course.category.name}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users size={11} /> {course._count?.enrollments || 0}
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={11} /> {course._count?.lessons || 0} lessons
            </span>
            <span className="font-bold text-slate-600">
              {course.price === 0 ? "Free" : `$${course.price}`}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => openCourseDetail(course.id)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold transition"
            >
              <Eye size={12} /> View
            </button>
            <button
              onClick={() => openEditCourse(course)}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition"
            >
              <Edit2 size={12} /> Edit
            </button>
            {course.status === "PENDING_REVIEW" && (
              <>
                <button
                  onClick={() => handleReview(course.id, true)}
                  disabled={actionLoading[course.id]}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold transition disabled:opacity-60"
                >
                  {actionLoading[course.id] ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCircle size={12} />
                  )}{" "}
                  Approve
                </button>
                <button
                  onClick={() => {
                    setRejectCourseId(course.id);
                    setRejectOpen(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
                >
                  <XCircle size={12} /> Reject
                </button>
              </>
            )}
            <button
              onClick={() => handleDeleteCourse(course.id)}
              disabled={actionLoading[course.id]}
              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition"
            >
              {actionLoading[course.id] ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[999] px-5 py-3 rounded-xl text-white font-bold shadow-lg
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── Course Detail Modal ── */}
      {detailOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setDetailOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-black text-slate-900">
                  Course Detail
                </h2>
                <button
                  onClick={() => setDetailOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              {loadingDetail ? (
                <div className="p-8 flex items-center justify-center">
                  <Loader2 size={32} className="animate-spin text-blue-500" />
                </div>
              ) : (
                courseDetail && (
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    {courseDetail.thumbnail && (
                      <img
                        src={courseDetail.thumbnail}
                        alt=""
                        className="w-full h-48 object-cover rounded-2xl"
                      />
                    )}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900">
                            {courseDetail.title}
                          </h3>
                          <Badge status={courseDetail.status} />
                        </div>
                        <p className="text-sm text-slate-500">
                          {courseDetail.description}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => {
                            openEditCourse(courseDetail);
                            setDetailOpen(false);
                          }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition"
                        >
                          <Edit2 size={14} /> Edit
                        </button>
                        {courseDetail.status === "PENDING_REVIEW" && (
                          <>
                            <button
                              onClick={() =>
                                handleReview(courseDetail.id, true)
                              }
                              disabled={actionLoading[courseDetail.id]}
                              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-600 transition disabled:opacity-60"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button
                              onClick={() => {
                                setRejectCourseId(courseDetail.id);
                                setRejectOpen(true);
                                setDetailOpen(false);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        {
                          label: "Students",
                          value: courseDetail._count?.enrollments || 0,
                          icon: Users,
                        },
                        {
                          label: "Lessons",
                          value: courseDetail._count?.lessons || 0,
                          icon: BookOpen,
                        },
                        {
                          label: "Reviews",
                          value: courseDetail._count?.reviews || 0,
                          icon: Star,
                        },
                        {
                          label: "Price",
                          value:
                            courseDetail.price === 0
                              ? "Free"
                              : `$${courseDetail.price}`,
                          icon: DollarSign,
                        },
                      ].map(({ label, value, icon: Icon }) => (
                        <div
                          key={label}
                          className="bg-slate-50 rounded-2xl p-4 text-center"
                        >
                          <Icon
                            size={18}
                            className="mx-auto mb-1 text-slate-400"
                          />
                          <p className="text-xl font-black text-slate-800">
                            {value}
                          </p>
                          <p className="text-xs text-slate-400 font-medium">
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Instructor */}
                    <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black shrink-0 overflow-hidden">
                        {courseDetail.instructor?.avatarUrl ? (
                          <img
                            src={courseDetail.instructor.avatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          courseDetail.instructor?.fullName?.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm">
                          {courseDetail.instructor?.fullName}
                        </p>
                        <p className="text-xs text-slate-400">
                          {courseDetail.instructor?.email}
                        </p>
                      </div>
                      <Badge status="INSTRUCTOR" />
                    </div>

                    {/* Lessons */}
                    {courseDetail.lessons?.length > 0 && (
                      <div>
                        <h4 className="font-black text-slate-800 mb-3">
                          Lessons{" "}
                          <span className="text-slate-400 font-normal text-sm">
                            ({courseDetail.lessons.length})
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {courseDetail.lessons.map((lesson, idx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                              <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0">
                                {idx + 1}
                              </div>
                              {lesson.type === "VIDEO" ? (
                                <Play
                                  size={13}
                                  className="text-violet-500 shrink-0"
                                />
                              ) : (
                                <FileText
                                  size={13}
                                  className="text-blue-500 shrink-0"
                                />
                              )}
                              <p className="text-sm font-semibold text-slate-700 flex-1 truncate">
                                {lesson.title}
                              </p>
                              <span className="text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                {lesson.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enrolled students */}
                    {courseDetail.enrollments?.length > 0 && (
                      <div>
                        <h4 className="font-black text-slate-800 mb-3">
                          Enrolled Students{" "}
                          <span className="text-slate-400 font-normal text-sm">
                            ({courseDetail._count?.enrollments})
                          </span>
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {courseDetail.enrollments.map((e) => (
                            <div
                              key={e.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-600 shrink-0 overflow-hidden">
                                {e.user?.avatarUrl ? (
                                  <img
                                    src={e.user.avatarUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  e.user?.fullName?.charAt(0)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-700 truncate">
                                  {e.user?.fullName}
                                </p>
                                <p className="text-xs text-slate-400 truncate">
                                  {e.user?.email}
                                </p>
                              </div>
                              <span className="text-[10px] text-slate-400">
                                {new Date(e.enrolledAt).toLocaleDateString(
                                  "en-US",
                                  { month: "short", day: "numeric" },
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {courseDetail.resources?.length > 0 && (
                      <div>
                        <h4 className="font-black text-slate-800 mb-3">
                          Resources
                        </h4>
                        <div className="space-y-2">
                          {courseDetail.resources.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                            >
                              <FileText
                                size={14}
                                className="text-violet-500 shrink-0"
                              />
                              <p className="text-sm font-semibold text-slate-700 flex-1">
                                {r.title}
                              </p>
                              <a
                                href={r.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-500 hover:underline font-bold"
                              >
                                Open
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Delete */}
                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleDeleteCourse(courseDetail.id)}
                        disabled={actionLoading[courseDetail.id]}
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition w-full justify-center"
                      >
                        {actionLoading[courseDetail.id] ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                        Delete This Course
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Edit Course Modal ── */}
      {editOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setEditOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h2 className="text-lg font-black text-slate-900">
                  Edit Course
                </h2>
                <button
                  onClick={() => setEditOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleEditSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editForm.title || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, title: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={editForm.description || ""}
                    onChange={(e) =>
                      setEditForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.price ?? ""}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, price: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    {savingEdit ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Save size={16} />
                    )}
                    {savingEdit ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

      {/* ── Reject Reason Modal ── */}
      {rejectOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setRejectOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6">
              <h2 className="text-lg font-black text-slate-900 mb-1">
                Reject Course
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Provide a reason so the instructor can improve their course.
              </p>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Content needs more detail, missing video lessons..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none transition mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectOpen(false)}
                  className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleReview(rejectCourseId, false, rejectReason)
                  }
                  disabled={actionLoading[rejectCourseId]}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {actionLoading[rejectCourseId] ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <XCircle size={16} />
                  )}
                  Reject Course
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex min-h-screen">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-100 z-40 flex flex-col transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}
        >
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
                <Shield size={18} className="text-white" />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm">LMS PRO</p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Admin Panel
                </p>
              </div>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {TABS.map((tab) => (
              <NavItem key={tab} tab={tab} />
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <Link
              to="/"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition w-full"
            >
              <Home size={16} /> Back to Home
            </Link>
            <div className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-red-600">
                Admin Access
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-lg font-black text-slate-900">
                  {activeTab}
                </h1>
                <p className="text-xs text-slate-400 hidden sm:block">
                  LMS Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
              >
                <ArrowLeft size={13} /> Home
              </Link>
              <span className="hidden sm:block text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          </header>

          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            {/* ══ OVERVIEW ══ */}
            {activeTab === "Overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  <StatCard
                    icon={Users}
                    label="Total Users"
                    value={stats?.totalUsers}
                    color="bg-blue-500"
                    loading={loadingStats}
                  />
                  <StatCard
                    icon={BookOpen}
                    label="Total Courses"
                    value={stats?.totalCourses}
                    color="bg-violet-500"
                    loading={loadingStats}
                  />
                  <StatCard
                    icon={Clock}
                    label="Pending"
                    value={stats?.pendingCourses}
                    color="bg-amber-500"
                    loading={loadingStats}
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Published"
                    value={stats?.publishedCourses}
                    color="bg-emerald-500"
                    loading={loadingStats}
                  />
                  <StatCard
                    icon={UserCheck}
                    label="Enrollments"
                    value={stats?.totalEnrollments}
                    color="bg-cyan-500"
                    loading={loadingStats}
                  />
                  <StatCard
                    icon={DollarSign}
                    label="Total Revenue"
                    value={stats?.totalRevenue?.toFixed(0)}
                    prefix="$"
                    color="bg-rose-500"
                    loading={loadingStats}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending preview */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-black text-slate-800">
                        Pending Courses
                      </h2>
                      <button
                        onClick={() => setActiveTab("Pending Courses")}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    {loadingPending ? (
                      <Skeleton />
                    ) : pending.length === 0 ? (
                      <div className="p-8 text-center">
                        <CheckCircle
                          size={32}
                          className="text-emerald-400 mx-auto mb-2"
                        />
                        <p className="text-sm text-slate-400 font-medium">
                          All clear!
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {pending.slice(0, 4).map((c) => (
                          <div
                            key={c.id}
                            className="px-5 py-3 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-slate-800 truncate">
                                {c.title}
                              </p>
                              <p className="text-xs text-slate-400">
                                {c.instructor?.fullName}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => openCourseDetail(c.id)}
                                className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => handleReview(c.id, true)}
                                disabled={actionLoading[c.id]}
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition"
                              >
                                {actionLoading[c.id] ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle size={13} />
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  setRejectCourseId(c.id);
                                  setRejectOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition"
                              >
                                <XCircle size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent users */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <h2 className="font-black text-slate-800">
                        Recent Users
                      </h2>
                      <button
                        onClick={() => setActiveTab("All Users")}
                        className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline"
                      >
                        View all <ChevronRight size={12} />
                      </button>
                    </div>
                    {loadingUsers ? (
                      <Skeleton />
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {users.slice(0, 5).map((u) => (
                          <div
                            key={u.id}
                            className="px-5 py-3 flex items-center gap-3"
                          >
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 overflow-hidden">
                              {u.avatarUrl ? (
                                <img
                                  src={u.avatarUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                u.fullName?.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm text-slate-800 truncate">
                                {u.fullName}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {u.email}
                              </p>
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

            {/* ══ ANALYTICS ══ */}
            {activeTab === "Analytics" && (
              <div className="space-y-8">
                {loadingAnalytics ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="h-48 bg-white animate-pulse rounded-2xl border border-slate-100"
                      />
                    ))}
                  </div>
                ) : analytics ? (
                  <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Enrollments chart */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-1">
                          Enrollments
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Last 6 months
                        </p>
                        <BarChart
                          data={analytics.enrollmentsByMonth}
                          dataKey="count"
                          color="bg-blue-500"
                          label="Students enrolled"
                        />
                      </div>

                      {/* Revenue chart */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-1">
                          Revenue
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                          Last 6 months
                        </p>
                        <BarChart
                          data={analytics.enrollmentsByMonth}
                          dataKey="revenue"
                          color="bg-emerald-500"
                          label="Revenue ($)"
                        />
                      </div>

                      {/* User growth */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-1">
                          User Growth
                        </h3>
                        <p className="text-xs text-slate-400 mb-4">
                          New users per month
                        </p>
                        <BarChart
                          data={analytics.usersByMonth}
                          dataKey="count"
                          color="bg-violet-500"
                          label="New users"
                        />
                      </div>

                      {/* Top courses */}
                      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4">
                          Top Performing Courses
                        </h3>
                        {analytics.topCourses.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">
                            No data yet
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {analytics.topCourses.map((c, idx) => (
                              <div
                                key={c.id}
                                className="flex items-center gap-3"
                              >
                                <span
                                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0
                                  ${idx === 0 ? "bg-amber-400" : idx === 1 ? "bg-slate-400" : "bg-orange-300"}`}
                                >
                                  {idx + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-800 truncate">
                                    {c.title}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {c.instructor}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-black text-slate-800">
                                    {c.enrollments} students
                                  </p>
                                  <p className="text-xs text-emerald-600 font-bold">
                                    ${c.revenue.toFixed(0)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top instructors */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                      <h3 className="font-black text-slate-800 mb-4">
                        Most Active Instructors
                      </h3>
                      {analytics.topInstructors.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No instructors yet
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-100">
                                {[
                                  "Instructor",
                                  "Courses",
                                  "Students",
                                  "Revenue",
                                ].map((h) => (
                                  <th
                                    key={h}
                                    className="text-left py-3 px-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {analytics.topInstructors.map((i) => (
                                <tr
                                  key={i.id}
                                  className="hover:bg-slate-50 transition"
                                >
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden">
                                        {i.avatarUrl ? (
                                          <img
                                            src={i.avatarUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          i.fullName?.charAt(0)
                                        )}
                                      </div>
                                      <div>
                                        <p className="font-bold text-slate-800">
                                          {i.fullName}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                          {i.email}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-700">
                                    {i.courseCount}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-slate-700">
                                    {i.totalStudents}
                                  </td>
                                  <td className="py-3 px-3 font-bold text-emerald-600">
                                    ${i.totalRevenue.toFixed(0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">
                    No analytics data available.
                  </p>
                )}
              </div>
            )}

            {/* ══ PENDING COURSES ══ */}
            {activeTab === "Pending Courses" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                  {pending.length} course{pending.length !== 1 ? "s" : ""}{" "}
                  awaiting review
                </p>
                {loadingPending ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100"
                      />
                    ))}
                  </div>
                ) : pending.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <CheckCircle
                      size={40}
                      className="text-emerald-400 mx-auto mb-3"
                    />
                    <p className="font-bold text-slate-700">
                      All courses reviewed
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pending.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ALL COURSES ══ */}
            {activeTab === "All Courses" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                  {allCourses.length} total courses
                </p>
                {loadingCourses ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-white animate-pulse rounded-2xl border border-slate-100"
                      />
                    ))}
                  </div>
                ) : allCourses.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <BookOpen
                      size={40}
                      className="text-slate-300 mx-auto mb-3"
                    />
                    <p className="font-bold text-slate-700">No courses yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ══ ALL USERS ══ */}
            {activeTab === "All Users" && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500 font-medium">
                  {users.length} total users
                </p>
                <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          "User",
                          "Role",
                          "Courses",
                          "Enrollments",
                          "Verified",
                          "Joined",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {loadingUsers
                        ? [1, 2, 3, 4, 5].map((i) => (
                            <tr key={i}>
                              <td colSpan={7} className="px-4 py-4">
                                <div className="h-6 bg-slate-100 animate-pulse rounded" />
                              </td>
                            </tr>
                          ))
                        : users.map((u) => (
                            <tr
                              key={u.id}
                              className="hover:bg-slate-50 transition"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 shrink-0 overflow-hidden">
                                    {u.avatarUrl ? (
                                      <img
                                        src={u.avatarUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      u.fullName?.charAt(0)
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-800">
                                      {u.fullName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {u.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <Badge status={u.role} />
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-600">
                                {u._count?.courses || 0}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-slate-600">
                                {u._count?.enrollments || 0}
                              </td>
                              <td className="px-4 py-3">
                                {u.isEmailVerified ? (
                                  <span className="text-emerald-500 flex items-center gap-1 text-xs font-bold">
                                    <CheckCircle size={12} /> Yes
                                  </span>
                                ) : (
                                  <span className="text-amber-500 flex items-center gap-1 text-xs font-bold">
                                    <AlertCircle size={12} /> No
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-slate-400">
                                {new Date(u.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={actionLoading[u.id]}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                                >
                                  {actionLoading[u.id] ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="sm:hidden space-y-3">
                  {loadingUsers
                    ? [1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 bg-white animate-pulse rounded-2xl border border-slate-100"
                        />
                      ))
                    : users.map((u) => (
                        <div
                          key={u.id}
                          className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-3 shadow-sm"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-sm text-slate-600 shrink-0 overflow-hidden">
                            {u.avatarUrl ? (
                              <img
                                src={u.avatarUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              u.fullName?.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">
                              {u.fullName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {u.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <Badge status={u.role} />
                              <span className="text-[10px] text-slate-400">
                                {u._count?.enrollments || 0} enrollments
                              </span>
                              {u.isEmailVerified ? (
                                <span className="text-[10px] text-emerald-500 font-bold">
                                  ✓ Verified
                                </span>
                              ) : (
                                <span className="text-[10px] text-amber-500 font-bold">
                                  ⚠ Unverified
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={actionLoading[u.id]}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                          >
                            {actionLoading[u.id] ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Trash2 size={14} />
                            )}
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
