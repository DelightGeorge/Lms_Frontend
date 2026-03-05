import { useState, useEffect, useRef } from "react";
import {
  X, Plus, BookOpen, Users, Clock, CheckCircle,
  Send, Loader2, MoreVertical, GraduationCap,
  FileText, Trash2, Edit2, Video,
  Upload, ChevronRight, ArrowLeft, Save,
  Star, TrendingUp,
  HelpCircle,
  Trophy,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import {
  getInstructorCourses, createCourse, updateCourse,
  deleteCourse, submitCourse, getLessonsByCourse,
  createLesson, updateLesson, deleteLesson,
  addResource, getResourcesByCourse,
} from "../../services/instructorService";
import API from "../../services/api";

const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const uploadToCloudinary = async (file, resourceType = "auto") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("resource_type", resourceType);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
};

const statusConfig = {
  PUBLISHED:      { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", label: "Published"      },
  DRAFT:          { color: "bg-slate-100 text-slate-600 border-slate-200",       dot: "bg-slate-400",   label: "Draft"          },
  PENDING_REVIEW: { color: "bg-amber-100 text-amber-700 border-amber-200",       dot: "bg-amber-500",   label: "Pending Review" },
  REJECTED:       { color: "bg-red-100 text-red-600 border-red-200",             dot: "bg-red-500",     label: "Rejected"       },
};

// ── Pure display components (module level — never re-created on render) ───────

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent} shrink-0`}>
      <Icon size={20} className="text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl font-black text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const StarRating = ({ rating, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star key={i} size={12}
        className={i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
    ))}
  </div>
);

const UploadButton = ({ label, accept, onUpload, uploading, preview, type = "image" }) => {
  const ref = useRef();
  return (
    <div>
      <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
      <div onClick={() => ref.current.click()}
        className="border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition group flex flex-col items-center gap-2">
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-blue-500" />
        ) : preview ? (
          type === "image"
            ? <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
            : <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm"><CheckCircle size={18} /> Uploaded</div>
        ) : (
          <>
            <Upload size={24} className="text-slate-300 group-hover:text-blue-400 transition" />
            <span className="text-xs text-slate-400 font-medium">Click to upload {type}</span>
          </>
        )}
        <input ref={ref} type="file" accept={accept} className="hidden"
          onChange={(e) => onUpload(e.target.files[0])} />
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL COMPONENTS — defined at MODULE LEVEL so React never treats them as new
// component types between renders. This is the root cause fix for the
// "one keystroke then deselect" bug — defining them inside the parent component
// caused React to unmount/remount modals on every state change.
// ══════════════════════════════════════════════════════════════════════════════

const LessonFormModal = ({
  isEdit, onSubmit, onClose,
  lessonForm, setLessonForm,
  videoPreview, setVideoPreview,
  uploadingVideo, handleVideoUpload,
  savingLesson,
}) => (
  <>
    <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-slate-900">{isEdit ? "Edit Lesson" : "Add Lesson"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title *</label>
            <input
              value={lessonForm.title}
              onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Introduction to React"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Type</label>
            <div className="grid grid-cols-2 gap-3">
              {["TEXT", "VIDEO"].map((t) => (
                <button key={t} type="button" onClick={() => setLessonForm((p) => ({ ...p, type: t }))}
                  className={`py-3 rounded-xl border-2 font-bold text-sm flex items-center justify-center gap-2 transition ${lessonForm.type === t ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-500"}`}>
                  {t === "VIDEO" ? <Video size={16} /> : <FileText size={16} />} {t}
                </button>
              ))}
            </div>
          </div>
          {lessonForm.type === "VIDEO" ? (
            <div className="space-y-3">
              <UploadButton label="Upload Video" accept="video/*" onUpload={handleVideoUpload} uploading={uploadingVideo} preview={videoPreview} type="video" />
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <div className="flex-1 h-px bg-slate-200" /> or paste URL <div className="flex-1 h-px bg-slate-200" />
              </div>
              <input type="url" value={videoPreview || lessonForm.content}
                onChange={(e) => { setVideoPreview(""); setLessonForm((p) => ({ ...p, content: e.target.value })); }}
                placeholder="https://youtube.com/..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Content *</label>
              <textarea rows="5" value={lessonForm.content}
                onChange={(e) => setLessonForm((p) => ({ ...p, content: e.target.value }))}
                placeholder="Write lesson content..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                required />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
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

const CourseFormModal = ({
  isEdit, onSubmit, onClose,
  courseForm, setCourseForm,
  thumbPreview, handleThumbUpload, uploadingThumb,
  submitting, savingCourse,
}) => (
  <>
    <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-black text-slate-900">{isEdit ? "Edit Course" : "Create Course"}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title *</label>
            <input
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
              <select value={courseForm.category} onChange={(e) => setCourseForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition">
                {["Development", "Design", "Business", "Marketing"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Price ($)</label>
              <input type="number" min="0" value={courseForm.price}
                onChange={(e) => setCourseForm((p) => ({ ...p, price: e.target.value }))}
                placeholder="0 = Free"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Description *</label>
            <textarea rows="3" value={courseForm.description}
              onChange={(e) => setCourseForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="What will students learn?"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
              required />
          </div>
          <UploadButton label="Course Thumbnail" accept="image/*" onUpload={handleThumbUpload} uploading={uploadingThumb} preview={thumbPreview} type="image" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
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

const ResourceModal = ({
  onSubmit, onClose,
  resourceForm, setResourceForm,
  resPreview, setResPreview,
  uploadingRes, handleResUpload,
  savingResource,
}) => (
  <>
    <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900">Add Resource</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Title *</label>
            <input
              value={resourceForm.title}
              onChange={(e) => setResourceForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Course Notes PDF"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition"
              required
            />
          </div>
          <UploadButton label="Upload File" accept="*/*" onUpload={handleResUpload} uploading={uploadingRes} preview={resPreview} type="file" />
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="flex-1 h-px bg-slate-200" /> or paste URL <div className="flex-1 h-px bg-slate-200" />
          </div>
          <input type="url" value={resPreview || resourceForm.fileUrl}
            onChange={(e) => { setResPreview(""); setResourceForm((p) => ({ ...p, fileUrl: e.target.value })); }}
            placeholder="https://example.com/file.pdf"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-violet-500 transition" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
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
);

const QuizBuilderModal = ({ onClose, onSubmit, quizForm, setQuizForm, savingQuiz }) => {
  const addQuestion = () => setQuizForm((p) => ({
    ...p,
    questions: [...p.questions, {
      text: "",
      options: [
        { text: "", isCorrect: true  },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    }],
  }));

  const updateQuestion = (qi, text) => setQuizForm((p) => ({
    ...p,
    questions: p.questions.map((q, i) => i === qi ? { ...q, text } : q),
  }));

  const updateOption = (qi, oi, field, value) => setQuizForm((p) => ({
    ...p,
    questions: p.questions.map((q, i) => i !== qi ? q : {
      ...q,
      options: q.options.map((o, j) =>
        field === "isCorrect"
          ? { ...o, isCorrect: j === oi }
          : j === oi ? { ...o, [field]: value } : o
      ),
    }),
  }));

  const removeQuestion = (qi) => setQuizForm((p) => ({
    ...p,
    questions: p.questions.filter((_, i) => i !== qi),
  }));

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
            <div>
              <h2 className="text-xl font-black text-slate-900">Create Quiz</h2>
              <p className="text-xs text-slate-400 mt-0.5">Build a quiz for this course</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Quiz Title *</label>
              <input
                value={quizForm.title}
                onChange={(e) => setQuizForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Module 1 Knowledge Check"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            {quizForm.questions.map((q, qi) => (
              <div key={qi} className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 uppercase tracking-wide">Question {qi + 1}</span>
                  {quizForm.questions.length > 1 && (
                    <button onClick={() => removeQuestion(qi)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Options — select the correct answer</p>
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button type="button" onClick={() => updateOption(qi, oi, "isCorrect", true)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition ${o.isCorrect ? "border-emerald-500 bg-emerald-500" : "border-slate-300 hover:border-emerald-400"}`}>
                        {o.isCorrect && <div className="w-2 h-2 rounded-full bg-white" />}
                      </button>
                      <input
                        value={o.text}
                        onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                        placeholder={`Option ${oi + 1}`}
                        className={`flex-1 border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition ${o.isCorrect ? "border-emerald-300 bg-emerald-50/50" : "border-slate-200 bg-white"}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button onClick={addQuestion}
              className="w-full border-2 border-dashed border-blue-200 hover:border-blue-400 text-blue-500 font-bold text-sm py-3 rounded-2xl transition flex items-center justify-center gap-2">
              <Plus size={16} /> Add Question
            </button>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 shrink-0 flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button onClick={onSubmit} disabled={savingQuiz || !quizForm.title}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
              {savingQuiz ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />}
              {savingQuiz ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════

const VIEWS = { LIST: "list", COURSE_DETAIL: "course_detail" };
const TABS  = { LESSONS: "lessons", RESOURCES: "resources", QUIZZES: "quizzes", REVIEWS: "reviews", STUDENTS: "students" };

const InstructorDashboard = () => {
  const [view,           setView]           = useState(VIEWS.LIST);
  const [activeTab,      setActiveTab]      = useState(TABS.LESSONS);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses,        setCourses]        = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [lessons,        setLessons]        = useState([]);
  const [resources,      setResources]      = useState([]);
  const [quizzes,        setQuizzes]        = useState([]);
  const [reviews,        setReviews]        = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [students,       setStudents]       = useState([]);
  const [loadingTab,     setLoadingTab]     = useState(false);
  const [menuOpen,       setMenuOpen]       = useState(null);
  const [toast,          setToast]          = useState(null);

  // modals
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [editCourseOpen,   setEditCourseOpen]   = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [editLessonOpen,   setEditLessonOpen]   = useState(false);
  const [editingLesson,    setEditingLesson]     = useState(null);
  const [addResourceOpen,  setAddResourceOpen]  = useState(false);
  const [createQuizOpen,   setCreateQuizOpen]   = useState(false);

  // forms
  const [courseForm,   setCourseForm]   = useState({ title: "", description: "", price: "", category: "Development" });
  const [lessonForm,   setLessonForm]   = useState({ title: "", content: "", type: "TEXT", order: 1 });
  const [resourceForm, setResourceForm] = useState({ title: "", fileUrl: "" });
  const [quizForm,     setQuizForm]     = useState({
    title: "",
    questions: [{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }],
  });

  // uploads
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingRes,   setUploadingRes]   = useState(false);
  const [thumbPreview,   setThumbPreview]   = useState("");
  const [videoPreview,   setVideoPreview]   = useState("");
  const [resPreview,     setResPreview]     = useState("");

  // loading states
  const [submitting,     setSubmitting]    = useState(false);
  const [submitLoading,  setSubmitLoading] = useState({});
  const [deleteLoading,  setDeleteLoading] = useState({});
  const [savingLesson,   setSavingLesson]  = useState(false);
  const [savingCourse,   setSavingCourse]  = useState(false);
  const [savingResource, setSavingResource]= useState(false);
  const [savingQuiz,     setSavingQuiz]    = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getInstructorCourses()
      .then((r) => setCourses(Array.isArray(r.data) ? r.data : r.data?.data || []))
      .catch(() => showToast("Failed to fetch courses", "error"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view !== VIEWS.COURSE_DETAIL || !selectedCourse) return;
    setLoadingTab(true);
    const fetchers = {
      [TABS.LESSONS]:   () => getLessonsByCourse(selectedCourse.id).then((r) => setLessons(Array.isArray(r.data) ? r.data : [])),
      [TABS.RESOURCES]: () => getResourcesByCourse(selectedCourse.id).then((r) => setResources(Array.isArray(r.data) ? r.data : [])),
      [TABS.QUIZZES]:   () => API.get(`/quizzes/course/${selectedCourse.id}`).then((r) => setQuizzes(Array.isArray(r.data) ? r.data : [])),
      [TABS.REVIEWS]:   () => API.get(`/reviews/course/${selectedCourse.id}`).then((r) => setReviews(r.data || { reviews: [], averageRating: 0, totalReviews: 0 })),
      [TABS.STUDENTS]:  () => API.get(`/enrollments/course/${selectedCourse.id}`).then((r) => setStudents(Array.isArray(r.data) ? r.data : [])),
    };
    (fetchers[activeTab] || fetchers[TABS.LESSONS])()
      .catch(console.error)
      .finally(() => setLoadingTab(false));
  }, [view, selectedCourse, activeTab]);

  const openCourse = (course) => {
    setSelectedCourse(course);
    setView(VIEWS.COURSE_DETAIL);
    setActiveTab(TABS.LESSONS);
    setMenuOpen(null);
  };

  // ── Course CRUD ──────────────────────────────────────────────────────────────
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createCourse({ ...courseForm, price: Number(courseForm.price) || 0, thumbnail: thumbPreview || undefined });
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

  const openEditCourse = (course) => {
    setCourseForm({ title: course.title, description: course.description, price: course.price, category: course.category?.name || "Development" });
    setThumbPreview(course.thumbnail || "");
    setSelectedCourse(course);
    setEditCourseOpen(true);
    setMenuOpen(null);
  };

  const handleEditCourse = async (e) => {
    e.preventDefault();
    setSavingCourse(true);
    try {
      const res = await updateCourse(selectedCourse.id, { ...courseForm, price: Number(courseForm.price), thumbnail: thumbPreview || undefined });
      setCourses((p) => p.map((c) => c.id === selectedCourse.id ? res.data.course : c));
      if (view === VIEWS.COURSE_DETAIL) setSelectedCourse(res.data.course);
      setEditCourseOpen(false);
      showToast("Course updated!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update", "error");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Delete this course? This cannot be undone.")) return;
    setDeleteLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await deleteCourse(courseId);
      setCourses((p) => p.filter((c) => c.id !== courseId));
      if (view === VIEWS.COURSE_DETAIL) setView(VIEWS.LIST);
      showToast("Course deleted.");
    } catch { showToast("Failed to delete.", "error"); }
    finally { setDeleteLoading((p) => ({ ...p, [courseId]: false })); }
  };

  const handleSubmitForReview = async (courseId) => {
    setSubmitLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await submitCourse(courseId);
      setCourses((p) => p.map((c) => c.id === courseId ? { ...c, status: "PENDING_REVIEW" } : c));
      if (selectedCourse?.id === courseId) setSelectedCourse((p) => ({ ...p, status: "PENDING_REVIEW" }));
      showToast("Submitted for review!");
    } catch { showToast("Failed to submit.", "error"); }
    finally { setSubmitLoading((p) => ({ ...p, [courseId]: false })); setMenuOpen(null); }
  };

  // ── Lesson CRUD ──────────────────────────────────────────────────────────────
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      const payload = {
        ...lessonForm,
        courseId: selectedCourse.id,
        order: lessons.length + 1,
        content: lessonForm.type === "VIDEO" ? (videoPreview || lessonForm.content) : lessonForm.content,
      };
      const res = await createLesson(payload);
      setLessons((p) => [...p, res.data.lesson]);
      setCreateLessonOpen(false);
      setLessonForm({ title: "", content: "", type: "TEXT", order: 1 });
      setVideoPreview("");
      showToast("Lesson created!");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSavingLesson(false); }
  };

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
    } catch { showToast("Failed to update.", "error"); }
    finally { setSavingLesson(false); }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDeleteLoading((p) => ({ ...p, [lessonId]: true }));
    try {
      await deleteLesson(lessonId);
      setLessons((p) => p.filter((l) => l.id !== lessonId));
      showToast("Lesson deleted.");
    } catch { showToast("Failed.", "error"); }
    finally { setDeleteLoading((p) => ({ ...p, [lessonId]: false })); }
  };

  // ── Resource ─────────────────────────────────────────────────────────────────
  const handleAddResource = async (e) => {
    e.preventDefault();
    setSavingResource(true);
    try {
      const res = await addResource({ ...resourceForm, fileUrl: resPreview || resourceForm.fileUrl, courseId: selectedCourse.id });
      setResources((p) => [...p, res.data.resource]);
      setAddResourceOpen(false);
      setResourceForm({ title: "", fileUrl: "" });
      setResPreview("");
      showToast("Resource added!");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSavingResource(false); }
  };

  // ── Quiz ─────────────────────────────────────────────────────────────────────
  const handleCreateQuiz = async () => {
    setSavingQuiz(true);
    try {
      const res = await API.post("/quizzes", { ...quizForm, courseId: selectedCourse.id });
      setQuizzes((p) => [...p, res.data.quiz]);
      setCreateQuizOpen(false);
      setQuizForm({ title: "", questions: [{ text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }] });
      showToast("Quiz created!");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSavingQuiz(false); }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await API.delete(`/quizzes/${quizId}`);
      setQuizzes((p) => p.filter((q) => q.id !== quizId));
      showToast("Quiz deleted.");
    } catch { showToast("Failed.", "error"); }
  };

  // ── Uploads ──────────────────────────────────────────────────────────────────
  const handleThumbUpload = async (f) => { setUploadingThumb(true); try { setThumbPreview(await uploadToCloudinary(f, "image")); } catch { showToast("Upload failed", "error"); } finally { setUploadingThumb(false); } };
  const handleVideoUpload = async (f) => { setUploadingVideo(true); try { setVideoPreview(await uploadToCloudinary(f, "video")); } catch { showToast("Upload failed", "error"); } finally { setUploadingVideo(false); } };
  const handleResUpload   = async (f) => { setUploadingRes(true);   try { setResPreview(await uploadToCloudinary(f, "auto"));   } catch { showToast("Upload failed", "error"); } finally { setUploadingRes(false); } };

  const stats = {
    total:     courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    pending:   courses.filter((c) => c.status === "PENDING_REVIEW").length,
    students:  courses.reduce((a, c) => a + (c._count?.enrollments || 0), 0),
    revenue:   courses.filter((c) => c.status === "PUBLISHED")
      .reduce((a, c) => a + ((c._count?.enrollments || 0) * (c.price || 0)), 0),
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // COURSE DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.COURSE_DETAIL && selectedCourse) {
    const tabList = [
      { key: TABS.LESSONS,   label: "Lessons",   icon: <BookOpen size={14} /> },
      { key: TABS.RESOURCES, label: "Resources", icon: <FileText size={14} /> },
      { key: TABS.QUIZZES,   label: "Quizzes",   icon: <HelpCircle size={14} /> },
      { key: TABS.REVIEWS,   label: "Reviews",   icon: <Star size={14} /> },
      { key: TABS.STUDENTS,  label: "Students",  icon: <Users size={14} /> },
    ];

    return (
      <Layout>
        {toast && (
          <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
            {toast.msg}
          </div>
        )}

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pt-28">

            <button onClick={() => { setView(VIEWS.LIST); setSelectedCourse(null); }}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm mb-6 transition">
              <ArrowLeft size={16} /> Back to Courses
            </button>

            {/* Course header card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-6">
              {selectedCourse.thumbnail && (
                <img src={selectedCourse.thumbnail} alt="" className="w-full h-44 object-cover" />
              )}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1 className="text-2xl font-black text-slate-900">{selectedCourse.title}</h1>
                      <StatusBadge status={selectedCourse.status} />
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{selectedCourse.description}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                      {selectedCourse.category?.name && (
                        <span className="bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{selectedCourse.category.name}</span>
                      )}
                      <span className="flex items-center gap-1"><Users size={12} /> {selectedCourse._count?.enrollments || 0} students</span>
                      <span className="font-bold text-slate-600">{selectedCourse.price === 0 ? "Free" : `$${selectedCourse.price}`}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button onClick={() => openEditCourse(selectedCourse)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold transition">
                      <Edit2 size={14} /> Edit
                    </button>
                    {(selectedCourse.status === "DRAFT" || selectedCourse.status === "REJECTED") && (
                      <button onClick={() => handleSubmitForReview(selectedCourse.id)} disabled={submitLoading[selectedCourse.id]}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition disabled:opacity-60">
                        {submitLoading[selectedCourse.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                        Submit for Review
                      </button>
                    )}
                    <button onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold transition">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
                  {[
                    { label: "Students",   value: selectedCourse._count?.enrollments || 0, icon: <Users size={13} />, color: "text-blue-600" },
                    { label: "Lessons",    value: lessons.length || selectedCourse._count?.lessons || 0, icon: <BookOpen size={13} />, color: "text-violet-600" },
                    { label: "Avg Rating", value: reviews.averageRating ? `${reviews.averageRating}★` : "—", icon: <Star size={13} />, color: "text-amber-500" },
                    { label: "Revenue",    value: `$${((selectedCourse._count?.enrollments || 0) * (selectedCourse.price || 0)).toLocaleString()}`, icon: <TrendingUp size={13} />, color: "text-emerald-600" },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="text-center">
                      <div className={`flex items-center justify-center gap-1 text-xs mb-1 ${color}`}>{icon}</div>
                      <p className="text-lg font-black text-slate-800">{value}</p>
                      <p className="text-[10px] text-slate-400">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-6 overflow-x-auto">
              {tabList.map(({ key, label, icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition whitespace-nowrap flex-1 justify-center
                    ${activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
              {loadingTab ? (
                <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="h-14 bg-slate-100 animate-pulse rounded-xl" />)}</div>
              ) : (
                <>
                  {/* LESSONS */}
                  {activeTab === TABS.LESSONS && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-black text-slate-900">Lessons</h3>
                          <p className="text-xs text-slate-400">{lessons.length} lesson{lessons.length !== 1 ? "s" : ""}</p>
                        </div>
                        <button onClick={() => { setLessonForm({ title: "", content: "", type: "TEXT", order: 1 }); setVideoPreview(""); setCreateLessonOpen(true); }}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition">
                          <Plus size={16} /> Add Lesson
                        </button>
                      </div>
                      {lessons.length === 0 ? (
                        <div className="text-center py-10">
                          <BookOpen size={36} className="text-slate-200 mx-auto mb-3" />
                          <p className="font-bold text-slate-500">No lessons yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, idx) => (
                            <div key={lesson.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/20 transition group">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">{idx + 1}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {lesson.type === "VIDEO" ? <Video size={13} className="text-violet-500 shrink-0" /> : <FileText size={13} className="text-blue-500 shrink-0" />}
                                  <p className="font-bold text-slate-800 text-sm truncate">{lesson.title}</p>
                                </div>
                                <p className="text-xs text-slate-400 mt-0.5">{lesson.type} lesson</p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                <button onClick={() => openEditLesson(lesson)} className="p-2 rounded-lg hover:bg-blue-100 text-slate-400 hover:text-blue-600 transition"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteLesson(lesson.id)} disabled={deleteLoading[lesson.id]}
                                  className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition">
                                  {deleteLoading[lesson.id] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* RESOURCES */}
                  {activeTab === TABS.RESOURCES && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-black text-slate-900">Resources</h3>
                          <p className="text-xs text-slate-400">{resources.length} resource{resources.length !== 1 ? "s" : ""}</p>
                        </div>
                        <button onClick={() => { setResourceForm({ title: "", fileUrl: "" }); setResPreview(""); setAddResourceOpen(true); }}
                          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition">
                          <Plus size={16} /> Add Resource
                        </button>
                      </div>
                      {resources.length === 0 ? (
                        <div className="text-center py-10">
                          <FileText size={36} className="text-slate-200 mx-auto mb-3" />
                          <p className="font-bold text-slate-500">No resources yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {resources.map((res) => (
                            <div key={res.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                              <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                                <FileText size={15} className="text-violet-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 text-sm">{res.title}</p>
                                <a href={res.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline truncate block">{res.fileUrl}</a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* QUIZZES */}
                  {activeTab === TABS.QUIZZES && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3 className="font-black text-slate-900">Quizzes</h3>
                          <p className="text-xs text-slate-400">{quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}</p>
                        </div>
                        <button onClick={() => setCreateQuizOpen(true)}
                          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition">
                          <Plus size={16} /> Create Quiz
                        </button>
                      </div>
                      {quizzes.length === 0 ? (
                        <div className="text-center py-10">
                          <HelpCircle size={36} className="text-slate-200 mx-auto mb-3" />
                          <p className="font-bold text-slate-500">No quizzes yet</p>
                          <p className="text-xs text-slate-400 mt-1">Create a quiz to test your students</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quizzes.map((quiz) => (
                            <div key={quiz.id} className="border border-slate-100 rounded-2xl p-5">
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                  <h4 className="font-black text-slate-900">{quiz.title}</h4>
                                  <p className="text-xs text-slate-400 mt-0.5">{quiz.questions?.length || 0} questions · {quiz._count?.quizAttempts || 0} attempts</p>
                                </div>
                                <button onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="p-2 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition shrink-0">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              <div className="space-y-2">
                                {quiz.questions?.slice(0, 3).map((q, idx) => (
                                  <div key={q.id} className="flex items-start gap-2 text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                                    <span className="font-black text-slate-400 shrink-0">{idx + 1}.</span>
                                    <span className="truncate">{q.text}</span>
                                  </div>
                                ))}
                                {quiz.questions?.length > 3 && (
                                  <p className="text-xs text-slate-400 text-center">+{quiz.questions.length - 3} more questions</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* REVIEWS */}
                  {activeTab === TABS.REVIEWS && (
                    <>
                      <div className="mb-5">
                        <h3 className="font-black text-slate-900">Student Reviews</h3>
                        {reviews.totalReviews > 0 && (
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-3xl font-black text-slate-900">{reviews.averageRating}</span>
                            <div>
                              <StarRating rating={reviews.averageRating} />
                              <p className="text-xs text-slate-400 mt-0.5">{reviews.totalReviews} review{reviews.totalReviews !== 1 ? "s" : ""}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      {!reviews.reviews?.length ? (
                        <div className="text-center py-10">
                          <Star size={36} className="text-slate-200 mx-auto mb-3" />
                          <p className="font-bold text-slate-500">No reviews yet</p>
                          <p className="text-xs text-slate-400 mt-1">Students will see a review form after enrolling</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.reviews.map((r) => (
                            <div key={r.id} className="border border-slate-100 rounded-2xl p-4">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                                  {r.user?.avatarUrl
                                    ? <img src={r.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    : r.user?.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-bold text-slate-800 text-sm">{r.user?.fullName}</p>
                                    <StarRating rating={r.rating} />
                                  </div>
                                  {r.comment && <p className="text-sm text-slate-600 mt-1 leading-relaxed">{r.comment}</p>}
                                  <p className="text-[10px] text-slate-400 mt-1.5">{new Date(r.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* STUDENTS */}
                  {activeTab === TABS.STUDENTS && (
                    <>
                      <div className="mb-5">
                        <h3 className="font-black text-slate-900">Enrolled Students</h3>
                        <p className="text-xs text-slate-400">{students.length} student{students.length !== 1 ? "s" : ""} enrolled</p>
                      </div>
                      {students.length === 0 ? (
                        <div className="text-center py-10">
                          <Users size={36} className="text-slate-200 mx-auto mb-3" />
                          <p className="font-bold text-slate-500">No students yet</p>
                          <p className="text-xs text-slate-400 mt-1">Share your course to get your first student</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {students.map((enrollment) => {
                            const student  = enrollment.user || enrollment;
                            const progress = enrollment.progress || 0;
                            return (
                              <div key={enrollment.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50/50 transition">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black shrink-0 overflow-hidden">
                                  {student?.avatarUrl ? <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" /> : student?.fullName?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-slate-800 text-sm">{student?.fullName || "Unknown"}</p>
                                  <p className="text-xs text-slate-400">{student?.email}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                                      <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 shrink-0">{progress}%</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  {progress === 100 ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                      <Trophy size={10} /> Done
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">{new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modals rendered at Layout root — never inside conditional tab content */}
        {createLessonOpen && (
          <LessonFormModal
            isEdit={false} onSubmit={handleCreateLesson} onClose={() => setCreateLessonOpen(false)}
            lessonForm={lessonForm} setLessonForm={setLessonForm}
            videoPreview={videoPreview} setVideoPreview={setVideoPreview}
            uploadingVideo={uploadingVideo} handleVideoUpload={handleVideoUpload}
            savingLesson={savingLesson}
          />
        )}
        {editLessonOpen && (
          <LessonFormModal
            isEdit={true} onSubmit={handleEditLesson} onClose={() => { setEditLessonOpen(false); setEditingLesson(null); }}
            lessonForm={lessonForm} setLessonForm={setLessonForm}
            videoPreview={videoPreview} setVideoPreview={setVideoPreview}
            uploadingVideo={uploadingVideo} handleVideoUpload={handleVideoUpload}
            savingLesson={savingLesson}
          />
        )}
        {editCourseOpen && (
          <CourseFormModal
            isEdit={true} onSubmit={handleEditCourse} onClose={() => setEditCourseOpen(false)}
            courseForm={courseForm} setCourseForm={setCourseForm}
            thumbPreview={thumbPreview} handleThumbUpload={handleThumbUpload} uploadingThumb={uploadingThumb}
            submitting={submitting} savingCourse={savingCourse}
          />
        )}
        {addResourceOpen && (
          <ResourceModal
            onSubmit={handleAddResource} onClose={() => setAddResourceOpen(false)}
            resourceForm={resourceForm} setResourceForm={setResourceForm}
            resPreview={resPreview} setResPreview={setResPreview}
            uploadingRes={uploadingRes} handleResUpload={handleResUpload}
            savingResource={savingResource}
          />
        )}
        {createQuizOpen && (
          <QuizBuilderModal
            onClose={() => setCreateQuizOpen(false)} onSubmit={handleCreateQuiz}
            quizForm={quizForm} setQuizForm={setQuizForm}
            savingQuiz={savingQuiz}
          />
        )}
      </Layout>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // COURSE LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Instructor Portal</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Your Courses</h1>
              <p className="text-slate-500 mt-1 text-sm">Create, manage and grow your teaching business</p>
            </div>
            <button
              onClick={() => { setCourseForm({ title: "", description: "", price: "", category: "Development" }); setThumbPreview(""); setCreateCourseOpen(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/25 text-sm shrink-0">
              <Plus size={18} /> New Course
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            <StatCard icon={BookOpen}    label="Total"     value={stats.total}     accent="bg-blue-500"    />
            <StatCard icon={CheckCircle} label="Published" value={stats.published} accent="bg-emerald-500" />
            <StatCard icon={Clock}       label="Pending"   value={stats.pending}   accent="bg-amber-500"   />
            <StatCard icon={Users}       label="Students"  value={stats.students}  accent="bg-violet-500"  />
            <StatCard icon={TrendingUp}  label="Revenue"   value={`$${stats.revenue.toLocaleString()}`} accent="bg-rose-500" />
          </div>

          {/* Course list */}
          {loading ? (
            <div className="grid gap-4">{[1,2,3].map((i) => <div key={i} className="h-28 bg-white rounded-2xl border border-slate-100 animate-pulse" />)}</div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen size={28} className="text-blue-500" />
              </div>
              <h3 className="font-black text-slate-800 text-lg mb-1">No courses yet</h3>
              <p className="text-slate-400 text-sm mb-6">Create your first course and start teaching</p>
              <button onClick={() => { setCourseForm({ title: "", description: "", price: "", category: "Development" }); setThumbPreview(""); setCreateCourseOpen(true); }}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                <Plus size={16} /> Create First Course
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 hover:shadow-md transition-shadow group">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                      {course.thumbnail
                        ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center"><FileText size={20} className="text-white" /></div>
                      }
                    </div>
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
                          <span className="text-xs bg-blue-50 text-blue-600 font-semibold px-2.5 py-1 rounded-lg">{course.category.name}</span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400"><Users size={12} /> {course._count?.enrollments || 0} students</span>
                        <span className="text-xs text-slate-400 font-semibold">{course.price === 0 ? "Free" : `$${course.price}`}</span>
                        <span className="text-xs text-slate-400">{course._count?.lessons || 0} lessons</span>
                        {course.averageRating > 0 && (
                          <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                            <Star size={11} className="fill-amber-400" /> {course.averageRating}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openCourse(course)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold transition">
                        <ChevronRight size={14} /> Manage
                      </button>
                      <div className="relative">
                        <button onClick={() => setMenuOpen(menuOpen === course.id ? null : course.id)}
                          className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === course.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                            <div className="absolute right-0 top-10 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-20">
                              <button onClick={() => openCourse(course)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"><ChevronRight size={14} /> Manage Course</button>
                              <button onClick={() => openEditCourse(course)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"><Edit2 size={14} /> Edit Details</button>
                              {(course.status === "DRAFT" || course.status === "REJECTED") && (
                                <button onClick={() => handleSubmitForReview(course.id)} disabled={submitLoading[course.id]}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition">
                                  {submitLoading[course.id] ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Submit for Review
                                </button>
                              )}
                              <button onClick={() => handleDeleteCourse(course.id)} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={14} /> Delete Course</button>
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

      {createCourseOpen && (
        <CourseFormModal
          isEdit={false} onSubmit={handleCreateCourse} onClose={() => setCreateCourseOpen(false)}
          courseForm={courseForm} setCourseForm={setCourseForm}
          thumbPreview={thumbPreview} handleThumbUpload={handleThumbUpload} uploadingThumb={uploadingThumb}
          submitting={submitting} savingCourse={savingCourse}
        />
      )}
      {editCourseOpen && (
        <CourseFormModal
          isEdit={true} onSubmit={handleEditCourse} onClose={() => setEditCourseOpen(false)}
          courseForm={courseForm} setCourseForm={setCourseForm}
          thumbPreview={thumbPreview} handleThumbUpload={handleThumbUpload} uploadingThumb={uploadingThumb}
          submitting={submitting} savingCourse={savingCourse}
        />
      )}
    </Layout>
  );
};

export default InstructorDashboard;