import { useState, useEffect, useRef } from "react";
import {
  X, Plus, BookOpen, Users, Clock, CheckCircle,
  Send, Loader2, MoreVertical, GraduationCap,
  FileText, Star, Trash2, Edit2, Video,
  Image as ImageIcon, Upload, ChevronDown,
  ChevronRight, Play, FileUp, Link as LinkIcon,
  ArrowLeft, Save,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import {
  getInstructorCourses, createCourse, updateCourse,
  deleteCourse, submitCourse, getLessonsByCourse,
  createLesson, updateLesson, deleteLesson,
  addResource, getResourcesByCourse,
} from "../../services/instructorService";

// ── Cloudinary upload helper ──────────────────────
const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file, resourceType = "auto") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("resource_type", resourceType);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.secure_url;
};

// ── helpers ───────────────────────────────────────
const statusConfig = {
  PUBLISHED:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Published"      },
  DRAFT:          { color: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400",   label: "Draft"          },
  PENDING_REVIEW: { color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500",   label: "Pending Review" },
  REJECTED:       { color: "bg-red-100 text-red-600 border-red-200",             dot: "bg-red-500",     label: "Rejected"       },
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

// ── Upload Button ─────────────────────────────────
const UploadButton = ({ label, accept, onUpload, uploading, preview, type = "image" }) => {
  const ref = useRef();
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <div
        onClick={() => ref.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition group flex flex-col items-center gap-2"
      >
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-blue-500" />
        ) : preview ? (
          type === "image" ? (
            <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              <CheckCircle size={18} /> Uploaded successfully
            </div>
          )
        ) : (
          <>
            <Upload size={24} className="text-slate-300 group-hover:text-blue-400 transition" />
            <span className="text-xs text-slate-400 font-medium">Click to upload {type}</span>
          </>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onUpload(e.target.files[0])} />
      </div>
    </div>
  );
};

// ── VIEWS ─────────────────────────────────────────
const VIEWS = { LIST: "list", COURSE_DETAIL: "course_detail" };

// ── MAIN COMPONENT ────────────────────────────────
const InstructorDashboard = () => {
  const [view,          setView]          = useState(VIEWS.LIST);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses,       setCourses]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [lessons,       setLessons]       = useState([]);
  const [resources,     setResources]     = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(null);
  const [toast,         setToast]         = useState(null);

  // modal states
  const [createCourseOpen,  setCreateCourseOpen]  = useState(false);
  const [editCourseOpen,    setEditCourseOpen]     = useState(false);
  const [createLessonOpen,  setCreateLessonOpen]   = useState(false);
  const [editLessonOpen,    setEditLessonOpen]     = useState(false);
  const [editingLesson,     setEditingLesson]      = useState(null);
  const [addResourceOpen,   setAddResourceOpen]    = useState(false);

  // form states
  const [courseForm,   setCourseForm]   = useState({ title: "", description: "", price: "", category: "Development" });
  const [lessonForm,   setLessonForm]   = useState({ title: "", content: "", type: "TEXT", order: 1 });
  const [resourceForm, setResourceForm] = useState({ title: "", fileUrl: "" });

  // upload states
  const [uploadingThumb,  setUploadingThumb]  = useState(false);
  const [uploadingVideo,  setUploadingVideo]  = useState(false);
  const [uploadingRes,    setUploadingRes]    = useState(false);
  const [thumbPreview,    setThumbPreview]    = useState("");
  const [videoPreview,    setVideoPreview]    = useState("");
  const [resPreview,      setResPreview]      = useState("");

  // action loading
  const [submitting,      setSubmitting]      = useState(false);
  const [submitLoading,   setSubmitLoading]   = useState({});
  const [deleteLoading,   setDeleteLoading]   = useState({});
  const [savingLesson,    setSavingLesson]    = useState(false);
  const [savingCourse,    setSavingCourse]    = useState(false);
  const [savingResource,  setSavingResource]  = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── fetch courses ─────────────────────────────
  useEffect(() => {
    getInstructorCourses()
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(() => showToast("Failed to fetch courses", "error"))
      .finally(() => setLoading(false));
  }, []);

  // ── fetch lessons when entering course detail ─
  useEffect(() => {
    if (view === VIEWS.COURSE_DETAIL && selectedCourse) {
      setLoadingLessons(true);
      getLessonsByCourse(selectedCourse.id)
        .then((r) => setLessons(Array.isArray(r.data) ? r.data : []))
        .catch(() => showToast("Failed to load lessons", "error"))
        .finally(() => setLoadingLessons(false));

      getResourcesByCourse(selectedCourse.id)
        .then((r) => setResources(Array.isArray(r.data) ? r.data : []))
        .catch(console.error);
    }
  }, [view, selectedCourse]);

  // ── open course detail ────────────────────────
  const openCourse = (course) => {
    setSelectedCourse(course);
    setView(VIEWS.COURSE_DETAIL);
    setMenuOpen(null);
  };

  // ── create course ─────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createCourse({
        ...courseForm,
        price: courseForm.price ? Number(courseForm.price) : 0,
        thumbnail: thumbPreview || undefined,
      });
      setCourses((p) => [res.data.course, ...p]);
      setCreateCourseOpen(false);
      setCourseForm({ title: "", description: "", price: "", category: "Development" });
      setThumbPreview("");
      showToast("Course created!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create course", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── edit course ───────────────────────────────
  const openEditCourse = (course) => {
    setCourseForm({
      title:       course.title,
      description: course.description,
      price:       course.price,
      category:    course.category?.name || "Development",
    });
    setThumbPreview(course.thumbnail || "");
    setSelectedCourse(course);
    setEditCourseOpen(true);
    setMenuOpen(null);
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const res = await updateCourse(selectedCourse.id, {
        ...courseForm,
        price:     Number(courseForm.price),
        thumbnail: thumbPreview || undefined,
      });
      setCourses((p) => p.map((c) => c.id === selectedCourse.id ? res.data.course : c));
      if (view === VIEWS.COURSE_DETAIL) setSelectedCourse(res.data.course);
      setEditCourseOpen(false);
      showToast("Course updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update course", "error");
    } finally {
      setSavingCourse(false);
    }
  };

  // ── delete course ─────────────────────────────
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    setDeleteLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await deleteCourse(courseId);
      setCourses((p) => p.filter((c) => c.id !== courseId));
      if (view === VIEWS.COURSE_DETAIL) setView(VIEWS.LIST);
      showToast("Course deleted.");
    } catch {
      showToast("Failed to delete course.", "error");
    } finally {
      setDeleteLoading((p) => ({ ...p, [courseId]: false }));
    }
  };

  // ── submit for review ─────────────────────────
  const handleSubmitForReview = async (courseId) => {
    setSubmitLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await submitCourse(courseId);
      setCourses((p) => p.map((c) => c.id === courseId ? { ...c, status: "PENDING_REVIEW" } : c));
      if (selectedCourse?.id === courseId) setSelectedCourse((p) => ({ ...p, status: "PENDING_REVIEW" }));
      showToast("Submitted for review!");
    } catch {
      showToast("Failed to submit.", "error");
    } finally {
      setSubmitLoading((p) => ({ ...p, [courseId]: false }));
      setMenuOpen(null);
    }
  };

  // ── create lesson ─────────────────────────────
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      const payload = {
        ...lessonForm,
        courseId: selectedCourse.id,
        order:    lessons.length + 1,
        content:  lessonForm.type === "VIDEO" ? (videoPreview || lessonForm.content) : lessonForm.content,
        videoUrl: lessonForm.type === "VIDEO" ? (videoPreview || undefined) : undefined,
      };
      const res = await createLesson(payload);
      setLessons((p) => [...p, res.data.lesson]);
      setCreateLessonOpen(false);
      setLessonForm({ title: "", content: "", type: "TEXT", order: 1 });
      setVideoPreview("");
      showToast("Lesson created!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create lesson", "error");
    } finally {
      setSavingLesson(false);
    }
  };

  // ── edit lesson ───────────────────────────────
  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({ title: lesson.title, content: lesson.content, type: lesson.type, order: lesson.order });
    setVideoPreview(lesson.type === "VIDEO" ? lesson.content : "");
    setEditLessonOpen(true);
  };

  const handleEditLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      const res = await updateLesson(editingLesson.id, {
        ...lessonForm,
        content: lessonForm.type === "VIDEO" ? (videoPreview || lessonForm.content) : lessonForm.content,
      });
      setLessons((p) => p.map((l) => l.id === editingLesson.id ? res.data.lesson : l));
      setEditLessonOpen(false);
      setEditingLesson(null);
      showToast("Lesson updated!");
    } catch {
      showToast("Failed to update lesson.", "error");
    } finally {
      setSavingLesson(false);
    }
  };

  // ── delete lesson ─────────────────────────────
  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDeleteLoading((p) => ({ ...p, [lessonId]: true }));
    try {
      await deleteLesson(lessonId);
      setLessons((p) => p.filter((l) => l.id !== lessonId));
      showToast("Lesson deleted.");
    } catch {
      showToast("Failed to delete lesson.", "error");
    } finally {
      setDeleteLoading((p) => ({ ...p, [lessonId]: false }));
    }
  };

  // ── add resource ──────────────────────────────
  const handleAddResource = async (e) => {
    e.preventDefault();
    setSavingResource(true);
    try {
      const res = await addResource({
        ...resourceForm,
        fileUrl: resPreview || resourceForm.fileUrl,
        courseId: selectedCourse.id,
      });
      setResources((p) => [...p, res.data.resource]);
      setAddResourceOpen(false);
      setResourceForm({ title: "", fileUrl: "" });
      setResPreview("");
      showToast("Resource added!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add resource", "error");
    } finally {
      setSavingResource(false);
    }
  };

  // ── Cloudinary uploads ────────────────────────
  const handleThumbUpload = async (file) => {
    setUploadingThumb(true);
    try {
      const url = await uploadToCloudinary(file, "image");
      setThumbPreview(url);
    } catch { showToast("Image upload failed", "error"); }
    finally { setUploadingThumb(false); }
  };

  const handleVideoUpload = async (file) => {
    setUploadingVideo(true);
    try {
      const url = await uploadToCloudinary(file, "video");
      setVideoPreview(url);
    } catch { showToast("Video upload failed", "error"); }
    finally { setUploadingVideo(false); }
  };

  const handleResUpload = async (file) => {
    setUploadingRes(true);
    try {
      const url = await uploadToCloudinary(file, "auto");
      setResPreview(url);
    } catch { showToast("File upload failed", "error"); }
    finally { setUploadingRes(false); }
  };

  // ── stats ─────────────────────────────────────
  const stats = {
    total:     courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    pending:   courses.filter((c) => c.status === "PENDING_REVIEW").length,
    students:  courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0),
  };

  // ── lesson form modal shared UI ───────────────
  const LessonFormModal = ({ isEdit, onSubmit, onClose }) => (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
        <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900">{isEdit ? "Edit Lesson" : "Add Lesson"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fill in lesson details</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson Title *</label>
              <input
                type="text"
                value={lessonForm.title}
                onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Introduction to React"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Lesson Type *</label>
              <div className="grid grid-cols-2 gap-3">
                {["TEXT", "VIDEO"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLessonForm((p) => ({ ...p, type: t }))}
                    className={`py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition ${
                      lessonForm.type === t
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {t === "VIDEO" ? <Video size={16} /> : <FileText size={16} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {lessonForm.type === "VIDEO" ? (
              <div className="space-y-3">
                <UploadButton
                  label="Upload Video"
                  accept="video/*"
                  onUpload={handleVideoUpload}
                  uploading={uploadingVideo}
                  preview={videoPreview}
                  type="video"
                />
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex-1 h-px bg-slate-200" /> or paste URL <div className="flex-1 h-px bg-slate-200" />
                </div>
                <input
                  type="url"
                  value={videoPreview || lessonForm.content}
                  onChange={(e) => { setVideoPreview(""); setLessonForm((p) => ({ ...p, content: e.target.value })); }}
                  placeholder="https://youtube.com/... or video URL"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Content *</label>
                <textarea
                  rows="5"
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                  placeholder="Write your lesson content here..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  required
                />
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={savingLesson}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
                {savingLesson ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {savingLesson ? "Saving..." : isEdit ? "Save Changes" : "Add Lesson"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  // ── course form modal shared UI ───────────────
  const CourseFormModal = ({ isEdit, onSubmit, onClose }) => (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
        <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div>
              <h2 className="text-xl font-black text-slate-900">{isEdit ? "Edit Course" : "Create New Course"}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{isEdit ? "Update course details" : "Fill in the details to get started"}</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Course Title *</label>
              <input
                type="text"
                value={courseForm.title}
                onChange={(e) => setCourseForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Complete React Mastery"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={courseForm.category}
                  onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {["Development","Design","Business","Marketing"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Price ($)</label>
                <input
                  type="number" min="0"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0 = Free"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Description *</label>
              <textarea
                rows="3"
                value={courseForm.description}
                onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What will students learn?"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                required
              />
            </div>

            {/* Thumbnail upload */}
            <UploadButton
              label="Course Thumbnail"
              accept="image/*"
              onUpload={handleThumbUpload}
              uploading={uploadingThumb}
              preview={thumbPreview}
              type="image"
            />

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={submitting || savingCourse}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
                {(submitting || savingCourse) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isEdit ? "Save Changes" : "Create Course"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );

  // ══════════════════════════════════════════════
  // ── COURSE DETAIL VIEW ────────────────────────
  // ══════════════════════════════════════════════
  if (view === VIEWS.COURSE_DETAIL && selectedCourse) {
    return (
      <Layout>
        {toast && (
          <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
            ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
            {toast.msg}
          </div>
        )}

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pt-28">

            {/* Back button */}
            <button
              onClick={() => { setView(VIEWS.LIST); setSelectedCourse(null); }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm mb-8 transition"
            >
              <ArrowLeft size={16} /> Back to Courses
            </button>

            {/* Course header */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
              {selectedCourse.thumbnail && (
                <img src={selectedCourse.thumbnail} alt="" className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl font-black text-slate-900">{selectedCourse.title}</h1>
                      <StatusBadge status={selectedCourse.status} />
                    </div>
                    <p className="text-slate-500 text-sm">{selectedCourse.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                      {selectedCourse.category?.name && (
                        <span className="bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">
                          {selectedCourse.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {selectedCourse._count?.enrollments || 0} students
                      </span>
                      <span className="font-bold text-slate-600">
                        {selectedCourse.price === 0 ? "Free" : `$${selectedCourse.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => openEditCourse(selectedCourse)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    {(selectedCourse.status === "DRAFT" || selectedCourse.status === "REJECTED") && (
                      <button
                        onClick={() => handleSubmitForReview(selectedCourse.id)}
                        disabled={submitLoading[selectedCourse.id]}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-60"
                      >
                        {submitLoading[selectedCourse.id]
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Send size={14} />
                        }
                        Submit for Review
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      disabled={deleteLoading[selectedCourse.id]}
                      className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition"
                    >
                      {deleteLoading[selectedCourse.id]
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── LESSONS ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Lessons</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => { setLessonForm({ title: "", content: "", type: "TEXT", order: 1 }); setVideoPreview(""); setCreateLessonOpen(true); }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-blue-600/20"
                >
                  <Plus size={16} /> Add Lesson
                </button>
              </div>

              {loadingLessons ? (
                <div className="space-y-3">
                  {[1,2,3].map((i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />)}
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No lessons yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add your first lesson to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition group">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {lesson.type === "VIDEO"
                            ? <Video size={13} className="text-violet-500 shrink-0" />
                            : <FileText size={13} className="text-blue-500 shrink-0" />
                          }
                          <p className="font-bold text-slate-800 text-sm truncate">{lesson.title}</p>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate">{lesson.type} lesson</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                        <button
                          onClick={() => openEditLesson(lesson)}
                          className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          disabled={deleteLoading[lesson.id]}
                          className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                        >
                          {deleteLoading[lesson.id]
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />
                          }
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── RESOURCES ── */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Resources</h2>
                  <p className="text-xs text-slate-400 mt-0.5">{resources.length} resource{resources.length !== 1 ? "s" : ""}</p>
                </div>
                <button
                  onClick={() => { setResourceForm({ title: "", fileUrl: "" }); setResPreview(""); setAddResourceOpen(true); }}
                  className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-violet-600/20"
                >
                  <Plus size={16} /> Add Resource
                </button>
              </div>

              {resources.length === 0 ? (
                <div className="text-center py-10">
                  <FileUp size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No resources yet</p>
                  <p className="text-xs text-slate-400 mt-1">Add PDFs, links, or files for your students</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((res) => (
                    <div key={res.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                      <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                        <LinkIcon size={15} className="text-violet-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm">{res.title}</p>
                        <a href={res.fileUrl} target="_blank" rel="noreferrer"
                          className="text-xs text-blue-500 hover:underline truncate block">
                          {res.fileUrl}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {createLessonOpen && <LessonFormModal isEdit={false} onSubmit={handleCreateLesson} onClose={() => setCreateLessonOpen(false)} />}
        {editLessonOpen   && <LessonFormModal isEdit={true}  onSubmit={handleEditLesson}   onClose={() => { setEditLessonOpen(false); setEditingLesson(null); }} />}
        {editCourseOpen   && <CourseFormModal isEdit={true}  onSubmit={handleEditCourse}    onClose={() => setEditCourseOpen(false)} />}

        {/* Add Resource Modal */}
        {addResourceOpen && (
          <>
            <div onClick={() => setAddResourceOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
            <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
              <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Add Resource</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Upload a file or paste a link</p>
                  </div>
                  <button onClick={() => setAddResourceOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddResource} className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Resource Title *</label>
                    <input
                      type="text"
                      value={resourceForm.title}
                      onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))}
                      placeholder="e.g. Course Notes PDF"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition"
                      required
                    />
                  </div>

                  <UploadButton
                    label="Upload File (PDF, image, video)"
                    accept="*/*"
                    onUpload={handleResUpload}
                    uploading={uploadingRes}
                    preview={resPreview}
                    type="file"
                  />

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <div className="flex-1 h-px bg-slate-200" /> or paste URL <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <input
                    type="url"
                    value={resPreview || resourceForm.fileUrl}
                    onChange={(e) => { setResPreview(""); setResourceForm((p) => ({ ...p, fileUrl: e.target.value })); }}
                    placeholder="https://example.com/resource.pdf"
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition"
                  />

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setAddResourceOpen(false)}
                      className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                      Cancel
                    </button>
                    <button type="submit" disabled={savingResource}
                      className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
                      {savingResource ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                      {savingResource ? "Adding..." : "Add Resource"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </Layout>
    );
  }

  // ══════════════════════════════════════════════
  // ── COURSE LIST VIEW ──────────────────────────
  // ══════════════════════════════════════════════
  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Instructor Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Courses</h1>
              <p className="text-slate-500 mt-1 text-sm">Create, manage and track all your courses</p>
            </div>
            <button
              onClick={() => { setCourseForm({ title: "", description: "", price: "", category: "Development" }); setThumbPreview(""); setCreateCourseOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/25 text-sm shrink-0"
            >
              <Plus size={18} /> New Course
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
            <StatCard icon={BookOpen}    label="Total Courses" value={stats.total}     accent="bg-blue-500"    />
            <StatCard icon={CheckCircle} label="Published"     value={stats.published} accent="bg-emerald-500" />
            <StatCard icon={Clock}       label="Pending"        value={stats.pending}   accent="bg-amber-500"   />
            <StatCard icon={Users}       label="Students"       value={stats.students}  accent="bg-violet-500"  />
          </div>

          {/* Course list */}
          {loading ? (
            <div className="grid gap-4">
              {[1,2,3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-blue-500" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-1">No courses yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first course and start teaching</p>
              <button
                onClick={() => { setCourseForm({ title: "", description: "", price: "", category: "Development" }); setThumbPreview(""); setCreateCourseOpen(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition"
              >
                <Plus size={16} /> Create First Course
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail or icon */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <FileText size={20} className="text-white" />
                        </div>
                      )}
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

                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {course.category?.name && (
                          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">
                            {course.category.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Users size={12} /> {course._count?.enrollments || 0} students
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openCourse(course)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition"
                      >
                        <ChevronRight size={14} /> Manage
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {menuOpen === course.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20">
                              <button onClick={() => openCourse(course)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition">
                                <ChevronRight size={14} /> Manage Course
                              </button>
                              <button onClick={() => openEditCourse(course)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition">
                                <Edit2 size={14} /> Edit Details
                              </button>
                              {(course.status === "DRAFT" || course.status === "REJECTED") && (
                                <button onClick={() => handleSubmitForReview(course.id)} disabled={submitLoading[course.id]}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                  {submitLoading[course.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                  Submit for Review
                                </button>
                              )}
                              <button onClick={() => handleDeleteCourse(course.id)} disabled={deleteLoading[course.id]}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition">
                                {deleteLoading[course.id] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Delete Course
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {createCourseOpen && <CourseFormModal isEdit={false} onSubmit={handleCreateCourse} onClose={() => setCreateCourseOpen(false)} />}
      {editCourseOpen   && <CourseFormModal isEdit={true}  onSubmit={handleEditCourse}   onClose={() => setEditCourseOpen(false)} />}
    </Layout>
  );
};

export default InstructorDashboard;
