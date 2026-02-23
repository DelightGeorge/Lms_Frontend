import { useState, useEffect } from "react";
import {
  X, Plus, BookOpen, Users, Clock, CheckCircle,
  AlertCircle, Send, Loader2, TrendingUp,
  MoreVertical, ChevronRight, GraduationCap,
  FileText, Star,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import {
  getInstructorCourses,
  createCourse,
  submitCourse,
} from "../../services/instructorService";

// ── helpers ───────────────────────────────────────
const statusConfig = {
  PUBLISHED:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200",  dot: "bg-emerald-500",  label: "Published"       },
  DRAFT:          { color: "bg-slate-100 text-slate-600 border-slate-200",        dot: "bg-slate-400",    label: "Draft"           },
  PENDING_REVIEW: { color: "bg-amber-100 text-amber-700 border-amber-200",        dot: "bg-amber-500",    label: "Pending Review"  },
  REJECTED:       { color: "bg-red-100 text-red-600 border-red-200",              dot: "bg-red-500",      label: "Rejected"        },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-black text-slate-800 leading-tight">{value}</p>
    </div>
  </div>
);

// ── main component ────────────────────────────────
const InstructorDashboard = () => {
  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [open, setOpen]           = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitLoading, setSubmitLoading] = useState({});
  const [toast, setToast]         = useState(null);
  const [menuOpen, setMenuOpen]   = useState(null);
  const [formData, setFormData]   = useState({
    title: "", category: "Development", description: "", price: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── fetch courses ─────────────────────────────
  useEffect(() => {
    getInstructorCourses()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setCourses(data);
      })
      .catch(() => showToast("Failed to fetch courses.", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ── create course ─────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createCourse({
        ...formData,
        price: formData.price ? Number(formData.price) : 0,
      });
      setCourses((prev) => [res.data.course, ...prev]);
      setOpen(false);
      setFormData({ title: "", category: "Development", description: "", price: "" });
      showToast("Course created successfully!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create course.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── submit for review ─────────────────────────
  const handleSubmit = async (courseId) => {
    setSubmitLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await submitCourse(courseId);
      setCourses((prev) =>
        prev.map((c) => c.id === courseId ? { ...c, status: "PENDING_REVIEW" } : c)
      );
      showToast("Course submitted for review!");
    } catch {
      showToast("Failed to submit course.", "error");
    } finally {
      setSubmitLoading((p) => ({ ...p, [courseId]: false }));
      setMenuOpen(null);
    }
  };

  // ── stats ─────────────────────────────────────
  const stats = {
    total:     courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    pending:   courses.filter((c) => c.status === "PENDING_REVIEW").length,
    students:  courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0),
  };

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm transition-all
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">

          {/* ── Header ── */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Instructor Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Your Courses
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                Create, manage and track all your courses
              </p>
            </div>
            <button
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/25 text-sm shrink-0"
            >
              <Plus size={18} /> New Course
            </button>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <StatCard icon={BookOpen}    label="Total Courses" value={stats.total}     accent="bg-blue-500"    />
            <StatCard icon={CheckCircle} label="Published"     value={stats.published} accent="bg-emerald-500" />
            <StatCard icon={Clock}       label="Pending"        value={stats.pending}   accent="bg-amber-500"   />
            <StatCard icon={Users}       label="Students"       value={stats.students}  accent="bg-violet-500"  />
          </div>

          {/* ── Course List ── */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-blue-500" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-1">No courses yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first course and start teaching</p>
              <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
              >
                <Plus size={16} /> Create First Course
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                      <FileText size={18} className="text-white" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-black text-slate-800 text-base truncate">{course.title}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{course.description}</p>
                        </div>
                        <StatusBadge status={course.status} />
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {course.category?.name && (
                          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">
                            {course.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users size={12} />
                          {course._count?.enrollments || 0} students
                        </span>
                        {course.price !== undefined && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Star size={12} />
                            {course.price === 0 ? "Free" : `$${course.price}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                        className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuOpen === course.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20">
                            {course.status === "DRAFT" && (
                              <button
                                onClick={() => handleSubmit(course.id)}
                                disabled={submitLoading[course.id]}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              >
                                {submitLoading[course.id]
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Send size={14} />
                                }
                                Submit for Review
                              </button>
                            )}
                            {course.status === "REJECTED" && (
                              <button
                                onClick={() => handleSubmit(course.id)}
                                disabled={submitLoading[course.id]}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 rounded-xl transition"
                              >
                                {submitLoading[course.id]
                                  ? <Loader2 size={14} className="animate-spin" />
                                  : <Send size={14} />
                                }
                                Resubmit Course
                              </button>
                            )}
                            {course.status === "PENDING_REVIEW" && (
                              <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-amber-600">
                                <Clock size={14} /> Awaiting Review
                              </div>
                            )}
                            {course.status === "PUBLISHED" && (
                              <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-emerald-600">
                                <CheckCircle size={14} /> Live & Published
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Create Course Modal ── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Create New Course</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Fill in the details to get started</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Course Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Complete React Mastery"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      <option>Development</option>
                      <option>Design</option>
                      <option>Business</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Price ($)</label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                      placeholder="0 = Free"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    placeholder="What will students learn in this course?"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {submitting ? "Creating..." : "Create Course"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};

export default InstructorDashboard;