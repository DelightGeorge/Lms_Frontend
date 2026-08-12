import { useState, useEffect, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  X,
  Plus,
  BookOpen,
  Users,
  Clock,
  CheckCircle,
  Send,
  Loader2,
  MoreVertical,
  GraduationCap,
  FileText,
  Trash2,
  Edit2,
  Video,
  Upload,
  ChevronRight,
  ArrowLeft,
  Save,
  Star,
  TrendingUp,
  HelpCircle,
  Trophy,
  Wallet,
  DollarSign,
  Tag,
  Copy,
  ExternalLink,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import {
  getInstructorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  submitCourse,
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
  addResource,
  getResourcesByCourse,
} from "../../services/instructorService";
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

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL || window.location.origin;

const uploadToCloudinary = async (file, resourceType = "auto") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("resource_type", resourceType);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    { method: "POST", body: fd },
  );
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
};

const fmt = (n) =>
  `₦${(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const statusConfig = {
  PUBLISHED: { color: MOSS, label: "Published" },
  DRAFT: { color: MUTED, label: "Draft" },
  PENDING_REVIEW: { color: ORANGE, label: "Pending Review" },
  REJECTED: { color: RUST, label: "Rejected" },
};

// ── Pure display components ───────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.DRAFT;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-sm border"
      style={{ color: cfg.color, borderColor: `${cfg.color}40` }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div
    className="bg-white rounded-sm border p-5 flex items-center gap-4"
    style={{ borderColor: LINE }}
  >
    <div
      className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0"
      style={{ backgroundColor: accent }}
    >
      <Icon size={18} className="text-white" />
    </div>
    <div className="min-w-0">
      <p
        className="text-[10px] font-bold uppercase tracking-wide truncate"
        style={{ color: MUTED, fontFamily: MONO_FONT }}
      >
        {label}
      </p>
      <p
        className="text-2xl font-black leading-tight"
        style={{ fontFamily: DISPLAY_FONT, color: INK }}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[10px] mt-0.5" style={{ color: MUTED }}>
          {sub}
        </p>
      )}
    </div>
  </div>
);

const StarRating = ({ rating, max = 5 }) => (
  <div className="flex items-center gap-0.5">
    {Array.from({ length: max }).map((_, i) => (
      <Star
        key={i}
        size={12}
        style={{ color: i < Math.round(rating) ? ORANGE : LINE }}
        className={i < Math.round(rating) ? "fill-current" : ""}
      />
    ))}
  </div>
);

const UploadButton = ({
  label,
  accept,
  onUpload,
  uploading,
  preview,
  type = "image",
}) => {
  const ref = useRef();
  return (
    <div>
      <label className="block text-sm font-bold mb-1.5" style={{ color: INK }}>
        {label}
      </label>
      <div
        onClick={() => ref.current.click()}
        className="border-2 border-dashed rounded-sm p-4 cursor-pointer transition group flex flex-col items-center gap-2"
        style={{ borderColor: LINE }}
      >
        {uploading ? (
          <Loader2 size={22} className="animate-spin" style={{ color: BLUE }} />
        ) : preview ? (
          type === "image" ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-32 object-cover rounded-sm"
            />
          ) : (
            <div
              className="flex items-center gap-2 font-bold text-sm"
              style={{ color: MOSS }}
            >
              <CheckCircle size={18} /> Uploaded
            </div>
          )
        ) : (
          <>
            <Upload size={22} style={{ color: LINE }} />
            <span className="text-xs font-medium" style={{ color: MUTED }}>
              Click to upload {type}
            </span>
          </>
        )}
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onUpload(e.target.files[0])}
        />
      </div>
    </div>
  );
};

// ── Wallet Summary Card ───────────────────────────────────────────────────────
const WalletSummary = ({ wallet }) => {
  if (!wallet) return null;
  return (
    <div
      className="rounded-sm p-5 text-white relative overflow-hidden"
      style={{ backgroundColor: BLUE_DEEP }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet size={15} style={{ color: ORANGE }} />
            <span
              className="text-xs font-black uppercase tracking-widest"
              style={{ color: ORANGE, fontFamily: MONO_FONT }}
            >
              Wallet
            </span>
          </div>
          <RouterLink
            to="/instructor/wallet"
            className="text-[10px] font-bold px-2.5 py-1 rounded-sm transition flex items-center gap-1 border text-white/80"
            style={{ borderColor: "rgba(255,255,255,0.16)" }}
          >
            Manage <ExternalLink size={9} />
          </RouterLink>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] font-medium text-white/50">Available</p>
            <p
              className="text-xl font-black leading-tight"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {fmt(wallet.availableBalance)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium text-white/50">
              Pending (30d)
            </p>
            <p
              className="text-xl font-black leading-tight"
              style={{ fontFamily: DISPLAY_FONT }}
            >
              {fmt(wallet.pendingBalance)}
            </p>
          </div>
        </div>
        <p className="text-[10px] mt-2" style={{ color: ORANGE }}>
          Lifetime: {fmt(wallet.totalEarned)}
        </p>
      </div>
    </div>
  );
};

// ── Referral Link Card ────────────────────────────────────────────────────────
const ReferralLinkCard = ({ courseId, courseTitle }) => {
  const [copied, setCopied] = useState(false);
  const url = `${FRONTEND_URL}/courses/${courseId}?ref=instructor`;

  const copy = () => {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="border rounded-sm p-4"
      style={{ backgroundColor: `${PLUM}0D`, borderColor: `${PLUM}40` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <DollarSign size={13} style={{ color: PLUM }} />
        <p
          className="text-xs font-black uppercase tracking-widest"
          style={{ color: PLUM, fontFamily: MONO_FONT }}
        >
          Referral link — earn 97%
        </p>
      </div>
      <p className="text-[11px] mb-3" style={{ color: PLUM }}>
        Share this link and earn 97% of every sale (vs 37% from platform
        traffic).
      </p>
      <div className="flex items-center gap-2">
        <div
          className="flex-1 bg-white border rounded-sm px-3 py-2 text-xs truncate"
          style={{
            borderColor: `${PLUM}40`,
            color: MUTED,
            fontFamily: MONO_FONT,
          }}
        >
          {url}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition shrink-0 text-white"
          style={{ backgroundColor: copied ? MOSS : PLUM }}
        >
          <Copy size={12} />
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// MODAL COMPONENTS
// ══════════════════════════════════════════════════════════════════════════════

const modalInputCls =
  "w-full border rounded-sm px-4 py-3 text-sm outline-none transition";
const modalInputStyle = { borderColor: LINE };

const LessonFormModal = ({
  isEdit,
  onSubmit,
  onClose,
  lessonForm,
  setLessonForm,
  videoPreview,
  setVideoPreview,
  uploadingVideo,
  handleVideoUpload,
  savingLesson,
}) => (
  <>
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-sm sm:rounded-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div
          className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: LINE }}
        >
          <h2
            className="text-xl font-black"
            style={{ fontFamily: DISPLAY_FONT, color: INK }}
          >
            {isEdit ? "Edit lesson" : "Add lesson"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-sm hover:bg-slate-50"
            style={{ color: MUTED }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-bold mb-1.5"
              style={{ color: INK }}
            >
              Title *
            </label>
            <input
              value={lessonForm.title}
              onChange={(e) =>
                setLessonForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Introduction to React"
              className={modalInputCls}
              style={modalInputStyle}
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-bold mb-1.5"
              style={{ color: INK }}
            >
              Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["TEXT", "VIDEO"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setLessonForm((p) => ({ ...p, type: t }))}
                  className="py-3 rounded-sm border-2 font-bold text-sm flex items-center justify-center gap-2 transition"
                  style={
                    lessonForm.type === t
                      ? {
                          borderColor: BLUE,
                          backgroundColor: `${BLUE}0D`,
                          color: BLUE,
                        }
                      : { borderColor: LINE, color: MUTED }
                  }
                >
                  {t === "VIDEO" ? <Video size={16} /> : <FileText size={16} />}{" "}
                  {t}
                </button>
              ))}
            </div>
          </div>
          {lessonForm.type === "VIDEO" ? (
            <div className="space-y-3">
              <UploadButton
                label="Upload video"
                accept="video/*"
                onUpload={handleVideoUpload}
                uploading={uploadingVideo}
                preview={videoPreview}
                type="video"
              />
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: MUTED }}
              >
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: LINE }}
                />{" "}
                or paste URL{" "}
                <div
                  className="flex-1 h-px"
                  style={{ backgroundColor: LINE }}
                />
              </div>
              <input
                type="url"
                value={videoPreview || lessonForm.content}
                onChange={(e) => {
                  setVideoPreview("");
                  setLessonForm((p) => ({ ...p, content: e.target.value }));
                }}
                placeholder="https://youtube.com/..."
                className={modalInputCls}
                style={modalInputStyle}
              />
            </div>
          ) : (
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: INK }}
              >
                Content *
              </label>
              <textarea
                rows="5"
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm((p) => ({ ...p, content: e.target.value }))
                }
                placeholder="Write lesson content..."
                className={`${modalInputCls} resize-none`}
                style={modalInputStyle}
                required
              />
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-sm py-3 text-sm font-bold transition"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingLesson}
              className="flex-1 disabled:opacity-60 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2"
              style={{ backgroundColor: ORANGE }}
            >
              {savingLesson ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {savingLesson
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Add lesson"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
);

const CourseFormModal = ({
  isEdit,
  onSubmit,
  onClose,
  courseForm,
  setCourseForm,
  thumbPreview,
  handleThumbUpload,
  uploadingThumb,
  submitting,
  savingCourse,
}) => (
  <>
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-sm sm:rounded-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div
          className="flex items-center justify-between px-6 py-5 border-b sticky top-0 bg-white z-10"
          style={{ borderColor: LINE }}
        >
          <h2
            className="text-xl font-black"
            style={{ fontFamily: DISPLAY_FONT, color: INK }}
          >
            {isEdit ? "Edit course" : "Create course"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-sm hover:bg-slate-50"
            style={{ color: MUTED }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-bold mb-1.5"
              style={{ color: INK }}
            >
              Title *
            </label>
            <input
              value={courseForm.title}
              onChange={(e) =>
                setCourseForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Complete React Mastery"
              className={modalInputCls}
              style={modalInputStyle}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: INK }}
              >
                Category
              </label>
              <select
                value={courseForm.category}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, category: e.target.value }))
                }
                className={modalInputCls}
                style={modalInputStyle}
              >
                {["Development", "Design", "Business", "Marketing"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: INK }}
              >
                Price ($)
              </label>
              <input
                type="number"
                min="0"
                value={courseForm.price}
                onChange={(e) =>
                  setCourseForm((p) => ({ ...p, price: e.target.value }))
                }
                placeholder="0 = Free"
                className={modalInputCls}
                style={modalInputStyle}
              />
            </div>
          </div>
          <div>
            <label
              className="block text-sm font-bold mb-1.5"
              style={{ color: INK }}
            >
              Description *
            </label>
            <textarea
              rows="3"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="What will students learn?"
              className={`${modalInputCls} resize-none`}
              style={modalInputStyle}
              required
            />
          </div>
          <UploadButton
            label="Course thumbnail"
            accept="image/*"
            onUpload={handleThumbUpload}
            uploading={uploadingThumb}
            preview={thumbPreview}
            type="image"
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-sm py-3 text-sm font-bold transition"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || savingCourse}
              className="flex-1 disabled:opacity-60 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2"
              style={{ backgroundColor: ORANGE }}
            >
              {submitting || savingCourse ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEdit ? "Save changes" : "Create course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
);

const ResourceModal = ({
  onSubmit,
  onClose,
  resourceForm,
  setResourceForm,
  resPreview,
  setResPreview,
  uploadingRes,
  handleResUpload,
  savingResource,
}) => (
  <>
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
    />
    <div className="fixed inset-x-0 bottom-0 sm:inset-0 z-50 flex sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-lg rounded-t-sm sm:rounded-sm shadow-2xl overflow-hidden">
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: LINE }}
        >
          <h2
            className="text-xl font-black"
            style={{ fontFamily: DISPLAY_FONT, color: INK }}
          >
            Add resource
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-sm hover:bg-slate-50"
            style={{ color: MUTED }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label
              className="block text-sm font-bold mb-1.5"
              style={{ color: INK }}
            >
              Title *
            </label>
            <input
              value={resourceForm.title}
              onChange={(e) =>
                setResourceForm((p) => ({ ...p, title: e.target.value }))
              }
              placeholder="e.g. Course Notes PDF"
              className={modalInputCls}
              style={modalInputStyle}
              required
            />
          </div>
          <UploadButton
            label="Upload file"
            accept="*/*"
            onUpload={handleResUpload}
            uploading={uploadingRes}
            preview={resPreview}
            type="file"
          />
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: MUTED }}
          >
            <div className="flex-1 h-px" style={{ backgroundColor: LINE }} /> or
            paste URL{" "}
            <div className="flex-1 h-px" style={{ backgroundColor: LINE }} />
          </div>
          <input
            type="url"
            value={resPreview || resourceForm.fileUrl}
            onChange={(e) => {
              setResPreview("");
              setResourceForm((p) => ({ ...p, fileUrl: e.target.value }));
            }}
            placeholder="https://example.com/file.pdf"
            className={modalInputCls}
            style={modalInputStyle}
          />
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border rounded-sm py-3 text-sm font-bold transition"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={savingResource}
              className="flex-1 disabled:opacity-60 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2"
              style={{ backgroundColor: PLUM }}
            >
              {savingResource ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              {savingResource ? "Adding..." : "Add resource"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </>
);

const QuizBuilderModal = ({
  onClose,
  onSubmit,
  quizForm,
  setQuizForm,
  savingQuiz,
}) => {
  const addQuestion = () =>
    setQuizForm((p) => ({
      ...p,
      questions: [
        ...p.questions,
        {
          text: "",
          options: [
            { text: "", isCorrect: true },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
        },
      ],
    }));
  const updateQuestion = (qi, text) =>
    setQuizForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) => (i === qi ? { ...q, text } : q)),
    }));
  const updateOption = (qi, oi, field, value) =>
    setQuizForm((p) => ({
      ...p,
      questions: p.questions.map((q, i) =>
        i !== qi
          ? q
          : {
              ...q,
              options: q.options.map((o, j) =>
                field === "isCorrect"
                  ? { ...o, isCorrect: j === oi }
                  : j === oi
                    ? { ...o, [field]: value }
                    : o,
              ),
            },
      ),
    }));
  const removeQuestion = (qi) =>
    setQuizForm((p) => ({
      ...p,
      questions: p.questions.filter((_, i) => i !== qi),
    }));

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          <div
            className="flex items-center justify-between px-6 py-5 border-b shrink-0"
            style={{ borderColor: LINE }}
          >
            <div>
              <h2
                className="text-xl font-black"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                Create quiz
              </h2>
              <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                Build a quiz for this course
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-sm hover:bg-slate-50"
              style={{ color: MUTED }}
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <label
                className="block text-sm font-bold mb-1.5"
                style={{ color: INK }}
              >
                Quiz title *
              </label>
              <input
                value={quizForm.title}
                onChange={(e) =>
                  setQuizForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Module 1 Knowledge Check"
                className={modalInputCls}
                style={modalInputStyle}
              />
            </div>
            {quizForm.questions.map((q, qi) => (
              <div
                key={qi}
                className="rounded-sm p-4 space-y-3 border"
                style={{ backgroundColor: PAPER, borderColor: LINE }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-black uppercase tracking-wide"
                    style={{ color: BLUE, fontFamily: MONO_FONT }}
                  >
                    Question {qi + 1}
                  </span>
                  {quizForm.questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="p-1.5 rounded-sm hover:bg-red-50 transition"
                      style={{ color: MUTED }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <input
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, e.target.value)}
                  placeholder="Enter your question..."
                  className="w-full bg-white border rounded-sm px-4 py-2.5 text-sm outline-none transition"
                  style={{ borderColor: LINE }}
                />
                <div className="space-y-2">
                  <p
                    className="text-[10px] font-black uppercase tracking-wide"
                    style={{ color: MUTED, fontFamily: MONO_FONT }}
                  >
                    Options — select the correct answer
                  </p>
                  {q.options.map((o, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateOption(qi, oi, "isCorrect", true)}
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition"
                        style={
                          o.isCorrect
                            ? { borderColor: MOSS, backgroundColor: MOSS }
                            : { borderColor: LINE }
                        }
                      >
                        {o.isCorrect && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </button>
                      <input
                        value={o.text}
                        onChange={(e) =>
                          updateOption(qi, oi, "text", e.target.value)
                        }
                        placeholder={`Option ${oi + 1}`}
                        className="flex-1 border rounded-sm px-3 py-2 text-sm outline-none transition"
                        style={
                          o.isCorrect
                            ? {
                                borderColor: `${MOSS}60`,
                                backgroundColor: `${MOSS}0D`,
                              }
                            : { borderColor: LINE, backgroundColor: "#fff" }
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              onClick={addQuestion}
              className="w-full border-2 border-dashed font-bold text-sm py-3 rounded-sm transition flex items-center justify-center gap-2"
              style={{ borderColor: `${BLUE}40`, color: BLUE }}
            >
              <Plus size={16} /> Add question
            </button>
          </div>
          <div
            className="px-6 py-4 border-t shrink-0 flex gap-3"
            style={{ borderColor: LINE }}
          >
            <button
              onClick={onClose}
              className="flex-1 border rounded-sm py-3 text-sm font-bold transition"
              style={{ borderColor: LINE, color: MUTED }}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={savingQuiz || !quizForm.title}
              className="flex-1 disabled:opacity-60 text-white rounded-sm py-3 text-sm font-bold transition flex items-center justify-center gap-2"
              style={{ backgroundColor: PLUM }}
            >
              {savingQuiz ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <HelpCircle size={16} />
              )}
              {savingQuiz ? "Creating..." : "Create quiz"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════

const VIEWS = { LIST: "list", COURSE_DETAIL: "course_detail" };
const TABS = {
  LESSONS: "lessons",
  RESOURCES: "resources",
  QUIZZES: "quizzes",
  REVIEWS: "reviews",
  STUDENTS: "students",
};

const InstructorDashboard = () => {
  const navigate = useNavigate();

  const [view, setView] = useState(VIEWS.LIST);
  const [activeTab, setActiveTab] = useState(TABS.LESSONS);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState([]);
  const [resources, setResources] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [reviews, setReviews] = useState({
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
  });
  const [students, setStudents] = useState([]);
  const [loadingTab, setLoadingTab] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null);
  const [toast, setToast] = useState(null);
  const [wallet, setWallet] = useState(null);

  // modals
  const [createCourseOpen, setCreateCourseOpen] = useState(false);
  const [editCourseOpen, setEditCourseOpen] = useState(false);
  const [createLessonOpen, setCreateLessonOpen] = useState(false);
  const [editLessonOpen, setEditLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [createQuizOpen, setCreateQuizOpen] = useState(false);

  // forms
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Development",
  });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    type: "TEXT",
    order: 1,
  });
  const [resourceForm, setResourceForm] = useState({ title: "", fileUrl: "" });
  const [quizForm, setQuizForm] = useState({
    title: "",
    questions: [
      {
        text: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      },
    ],
  });

  // uploads
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingRes, setUploadingRes] = useState(false);
  const [thumbPreview, setThumbPreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const [resPreview, setResPreview] = useState("");

  // loading states
  const [submitting, setSubmitting] = useState(false);
  const [submitLoading, setSubmitLoading] = useState({});
  const [deleteLoading, setDeleteLoading] = useState({});
  const [savingLesson, setSavingLesson] = useState(false);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingResource, setSavingResource] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    getInstructorCourses()
      .then((r) =>
        setCourses(Array.isArray(r.data) ? r.data : r.data?.data || []),
      )
      .catch(() => showToast("Failed to fetch courses", "error"))
      .finally(() => setLoading(false));

    // Fetch wallet summary
    API.get("/wallet/me")
      .then((r) => setWallet(r.data?.wallet || null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (view !== VIEWS.COURSE_DETAIL || !selectedCourse) return;
    setLoadingTab(true);
    const fetchers = {
      [TABS.LESSONS]: () =>
        getLessonsByCourse(selectedCourse.id).then((r) =>
          setLessons(Array.isArray(r.data) ? r.data : []),
        ),
      [TABS.RESOURCES]: () =>
        getResourcesByCourse(selectedCourse.id).then((r) =>
          setResources(Array.isArray(r.data) ? r.data : []),
        ),
      [TABS.QUIZZES]: () =>
        API.get(`/quizzes/course/${selectedCourse.id}`).then((r) =>
          setQuizzes(Array.isArray(r.data) ? r.data : []),
        ),
      [TABS.REVIEWS]: () =>
        API.get(`/reviews/course/${selectedCourse.id}`).then((r) =>
          setReviews(
            r.data || { reviews: [], averageRating: 0, totalReviews: 0 },
          ),
        ),
      [TABS.STUDENTS]: () =>
        API.get(`/enrollments/course/${selectedCourse.id}`).then((r) =>
          setStudents(Array.isArray(r.data) ? r.data : []),
        ),
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
      const res = await createCourse({
        ...courseForm,
        price: Number(courseForm.price) || 0,
        thumbnail: thumbPreview || undefined,
      });
      setCourses((p) => [res.data.course, ...p]);
      setCreateCourseOpen(false);
      setCourseForm({
        title: "",
        description: "",
        price: "",
        category: "Development",
      });
      setThumbPreview("");
      showToast("Course created!");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to create course",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditCourse = (course) => {
    setCourseForm({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category?.name || "Development",
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
        price: Number(courseForm.price),
        thumbnail: thumbPreview || undefined,
      });
      setCourses((p) =>
        p.map((c) => (c.id === selectedCourse.id ? res.data.course : c)),
      );
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
    } catch {
      showToast("Failed to delete.", "error");
    } finally {
      setDeleteLoading((p) => ({ ...p, [courseId]: false }));
    }
  };

  const handleSubmitForReview = async (courseId) => {
    setSubmitLoading((p) => ({ ...p, [courseId]: true }));
    try {
      await submitCourse(courseId);
      setCourses((p) =>
        p.map((c) =>
          c.id === courseId ? { ...c, status: "PENDING_REVIEW" } : c,
        ),
      );
      if (selectedCourse?.id === courseId)
        setSelectedCourse((p) => ({ ...p, status: "PENDING_REVIEW" }));
      showToast("Submitted for review!");
    } catch {
      showToast("Failed to submit.", "error");
    } finally {
      setSubmitLoading((p) => ({ ...p, [courseId]: false }));
      setMenuOpen(null);
    }
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
        content:
          lessonForm.type === "VIDEO"
            ? videoPreview || lessonForm.content
            : lessonForm.content,
      };
      const res = await createLesson(payload);
      setLessons((p) => [...p, res.data.lesson]);
      setCreateLessonOpen(false);
      setLessonForm({ title: "", content: "", type: "TEXT", order: 1 });
      setVideoPreview("");
      showToast("Lesson created!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setSavingLesson(false);
    }
  };

  const openEditLesson = (lesson) => {
    setEditingLesson(lesson);
    setLessonForm({
      title: lesson.title,
      content: lesson.content,
      type: lesson.type,
      order: lesson.order,
    });
    setVideoPreview(lesson.type === "VIDEO" ? lesson.content : "");
    setEditLessonOpen(true);
  };

  const handleEditLesson = async (e) => {
    e.preventDefault();
    setSavingLesson(true);
    try {
      const res = await updateLesson(editingLesson.id, {
        ...lessonForm,
        content:
          lessonForm.type === "VIDEO"
            ? videoPreview || lessonForm.content
            : lessonForm.content,
      });
      setLessons((p) =>
        p.map((l) => (l.id === editingLesson.id ? res.data.lesson : l)),
      );
      setEditLessonOpen(false);
      setEditingLesson(null);
      showToast("Lesson updated!");
    } catch {
      showToast("Failed to update.", "error");
    } finally {
      setSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    setDeleteLoading((p) => ({ ...p, [lessonId]: true }));
    try {
      await deleteLesson(lessonId);
      setLessons((p) => p.filter((l) => l.id !== lessonId));
      showToast("Lesson deleted.");
    } catch {
      showToast("Failed.", "error");
    } finally {
      setDeleteLoading((p) => ({ ...p, [lessonId]: false }));
    }
  };

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
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setSavingResource(false);
    }
  };

  const handleCreateQuiz = async () => {
    setSavingQuiz(true);
    try {
      const res = await API.post("/quizzes", {
        ...quizForm,
        courseId: selectedCourse.id,
      });
      setQuizzes((p) => [...p, res.data.quiz]);
      setCreateQuizOpen(false);
      setQuizForm({
        title: "",
        questions: [
          {
            text: "",
            options: [
              { text: "", isCorrect: true },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
              { text: "", isCorrect: false },
            ],
          },
        ],
      });
      showToast("Quiz created!");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed", "error");
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await API.delete(`/quizzes/${quizId}`);
      setQuizzes((p) => p.filter((q) => q.id !== quizId));
      showToast("Quiz deleted.");
    } catch {
      showToast("Failed.", "error");
    }
  };

  const handleThumbUpload = async (f) => {
    setUploadingThumb(true);
    try {
      setThumbPreview(await uploadToCloudinary(f, "image"));
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingThumb(false);
    }
  };
  const handleVideoUpload = async (f) => {
    setUploadingVideo(true);
    try {
      setVideoPreview(await uploadToCloudinary(f, "video"));
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingVideo(false);
    }
  };
  const handleResUpload = async (f) => {
    setUploadingRes(true);
    try {
      setResPreview(await uploadToCloudinary(f, "auto"));
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploadingRes(false);
    }
  };

  const stats = {
    total: courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    pending: courses.filter((c) => c.status === "PENDING_REVIEW").length,
    students: courses.reduce((a, c) => a + (c._count?.enrollments || 0), 0),
  };

  const Toast = () =>
    toast && (
      <div
        className="fixed top-5 right-5 z-[999] px-5 py-3 rounded-sm text-white font-bold shadow-2xl text-sm"
        style={{ backgroundColor: toast.type === "error" ? RUST : MOSS }}
      >
        {toast.msg}
      </div>
    );

  // ══════════════════════════════════════════════════════════════════════════════
  // COURSE DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  if (view === VIEWS.COURSE_DETAIL && selectedCourse) {
    const tabList = [
      { key: TABS.LESSONS, label: "Lessons", icon: <BookOpen size={14} /> },
      { key: TABS.RESOURCES, label: "Resources", icon: <FileText size={14} /> },
      { key: TABS.QUIZZES, label: "Quizzes", icon: <HelpCircle size={14} /> },
      { key: TABS.REVIEWS, label: "Reviews", icon: <Star size={14} /> },
      { key: TABS.STUDENTS, label: "Students", icon: <Users size={14} /> },
    ];

    return (
      <Layout>
        <Toast />

        <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pt-28">
            <button
              onClick={() => {
                setView(VIEWS.LIST);
                setSelectedCourse(null);
              }}
              className="flex items-center gap-2 font-semibold text-sm mb-6 transition"
              style={{ color: MUTED }}
            >
              <ArrowLeft size={16} /> Back to courses
            </button>

            {/* Course header */}
            <div
              className="bg-white rounded-sm border overflow-hidden mb-5"
              style={{ borderColor: LINE }}
            >
              {selectedCourse.thumbnail && (
                <img
                  src={selectedCourse.thumbnail}
                  alt=""
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h1
                        className="text-2xl font-black"
                        style={{ fontFamily: DISPLAY_FONT, color: INK }}
                      >
                        {selectedCourse.title}
                      </h1>
                      <StatusBadge status={selectedCourse.status} />
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: MUTED }}
                    >
                      {selectedCourse.description}
                    </p>
                    <div
                      className="flex flex-wrap items-center gap-4 mt-3 text-xs"
                      style={{ color: MUTED }}
                    >
                      {selectedCourse.category?.name && (
                        <span
                          className="font-semibold px-2.5 py-1 rounded-sm border"
                          style={{ color: BLUE, borderColor: LINE }}
                        >
                          {selectedCourse.category.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={12} />{" "}
                        {selectedCourse._count?.enrollments || 0} students
                      </span>
                      <span className="font-bold" style={{ color: INK }}>
                        {selectedCourse.price === 0
                          ? "Free"
                          : `$${selectedCourse.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => openEditCourse(selectedCourse)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm font-bold transition border"
                      style={{ borderColor: LINE, color: INK }}
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    {(selectedCourse.status === "DRAFT" ||
                      selectedCourse.status === "REJECTED") && (
                      <button
                        onClick={() => handleSubmitForReview(selectedCourse.id)}
                        disabled={submitLoading[selectedCourse.id]}
                        className="flex items-center gap-1.5 px-4 py-2 text-white rounded-sm text-sm font-bold transition disabled:opacity-60"
                        style={{ backgroundColor: BLUE }}
                      >
                        {submitLoading[selectedCourse.id] ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Send size={14} />
                        )}
                        Submit for review
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteCourse(selectedCourse.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-sm text-sm font-bold transition border"
                      style={{ borderColor: `${RUST}40`, color: RUST }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Mini stats */}
                <div
                  className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t"
                  style={{ borderColor: LINE }}
                >
                  {[
                    {
                      label: "Students",
                      value: selectedCourse._count?.enrollments || 0,
                      icon: <Users size={13} />,
                      color: BLUE,
                    },
                    {
                      label: "Lessons",
                      value:
                        lessons.length || selectedCourse._count?.lessons || 0,
                      icon: <BookOpen size={13} />,
                      color: PLUM,
                    },
                    {
                      label: "Avg rating",
                      value: reviews.averageRating
                        ? `${reviews.averageRating}★`
                        : "—",
                      icon: <Star size={13} />,
                      color: ORANGE,
                    },
                    {
                      label: "Revenue",
                      value: `$${((selectedCourse._count?.enrollments || 0) * (selectedCourse.price || 0) * 0.37).toFixed(0)}`,
                      icon: <TrendingUp size={13} />,
                      color: MOSS,
                    },
                  ].map(({ label, value, icon, color }) => (
                    <div key={label} className="text-center">
                      <div
                        className="flex items-center justify-center gap-1 text-xs mb-1"
                        style={{ color }}
                      >
                        {icon}
                      </div>
                      <p
                        className="text-lg font-black"
                        style={{ fontFamily: DISPLAY_FONT, color: INK }}
                      >
                        {value}
                      </p>
                      <p className="text-[10px]" style={{ color: MUTED }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Referral link card */}
            {selectedCourse.status === "PUBLISHED" &&
              selectedCourse.price > 0 && (
                <div className="mb-5">
                  <ReferralLinkCard
                    courseId={selectedCourse.id}
                    courseTitle={selectedCourse.title}
                  />
                </div>
              )}

            {/* Tabs */}
            <div
              className="flex gap-1 p-1 rounded-sm mb-6 overflow-x-auto border"
              style={{ backgroundColor: "#fff", borderColor: LINE }}
            >
              {tabList.map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-sm font-bold text-xs transition whitespace-nowrap flex-1 justify-center"
                  style={
                    activeTab === key
                      ? { backgroundColor: BLUE, color: "#fff" }
                      : { color: MUTED }
                  }
                >
                  {icon} {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div
              className="bg-white rounded-sm border p-6"
              style={{ borderColor: LINE }}
            >
              {loadingTab ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-14 animate-pulse rounded-sm"
                      style={{ backgroundColor: PAPER }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  {activeTab === TABS.LESSONS && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3
                            className="font-black"
                            style={{ fontFamily: DISPLAY_FONT, color: INK }}
                          >
                            Lessons
                          </h3>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {lessons.length} lesson
                            {lessons.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setLessonForm({
                              title: "",
                              content: "",
                              type: "TEXT",
                              order: 1,
                            });
                            setVideoPreview("");
                            setCreateLessonOpen(true);
                          }}
                          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-sm font-bold text-sm transition"
                          style={{ backgroundColor: BLUE }}
                        >
                          <Plus size={16} /> Add lesson
                        </button>
                      </div>
                      {lessons.length === 0 ? (
                        <div className="text-center py-10">
                          <BookOpen
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: LINE }}
                          />
                          <p className="font-bold" style={{ color: MUTED }}>
                            No lessons yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, idx) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-4 p-4 rounded-sm border transition group"
                              style={{ borderColor: LINE }}
                            >
                              <div
                                className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-black shrink-0"
                                style={{
                                  backgroundColor: `${BLUE}0D`,
                                  color: BLUE,
                                }}
                              >
                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {lesson.type === "VIDEO" ? (
                                    <Video
                                      size={13}
                                      style={{ color: PLUM }}
                                      className="shrink-0"
                                    />
                                  ) : (
                                    <FileText
                                      size={13}
                                      style={{ color: BLUE }}
                                      className="shrink-0"
                                    />
                                  )}
                                  <p
                                    className="font-bold text-sm truncate"
                                    style={{ color: INK }}
                                  >
                                    {lesson.title}
                                  </p>
                                </div>
                                <p
                                  className="text-xs mt-0.5"
                                  style={{ color: MUTED }}
                                >
                                  {lesson.type} lesson
                                </p>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                                <button
                                  onClick={() => openEditLesson(lesson)}
                                  className="p-2 rounded-sm hover:bg-slate-50 transition"
                                  style={{ color: MUTED }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lesson.id)}
                                  disabled={deleteLoading[lesson.id]}
                                  className="p-2 rounded-sm hover:bg-red-50 transition"
                                  style={{ color: MUTED }}
                                >
                                  {deleteLoading[lesson.id] ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === TABS.RESOURCES && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3
                            className="font-black"
                            style={{ fontFamily: DISPLAY_FONT, color: INK }}
                          >
                            Resources
                          </h3>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {resources.length} resource
                            {resources.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setResourceForm({ title: "", fileUrl: "" });
                            setResPreview("");
                            setAddResourceOpen(true);
                          }}
                          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-sm font-bold text-sm transition"
                          style={{ backgroundColor: PLUM }}
                        >
                          <Plus size={16} /> Add resource
                        </button>
                      </div>
                      {resources.length === 0 ? (
                        <div className="text-center py-10">
                          <FileText
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: LINE }}
                          />
                          <p className="font-bold" style={{ color: MUTED }}>
                            No resources yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {resources.map((res) => (
                            <div
                              key={res.id}
                              className="flex items-center gap-3 p-4 rounded-sm border transition"
                              style={{ borderColor: LINE }}
                            >
                              <div
                                className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
                                style={{ backgroundColor: `${PLUM}0D` }}
                              >
                                <FileText size={15} style={{ color: PLUM }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="font-bold text-sm"
                                  style={{ color: INK }}
                                >
                                  {res.title}
                                </p>
                                <a
                                  href={res.fileUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs hover:underline truncate block"
                                  style={{ color: BLUE }}
                                >
                                  {res.fileUrl}
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === TABS.QUIZZES && (
                    <>
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h3
                            className="font-black"
                            style={{ fontFamily: DISPLAY_FONT, color: INK }}
                          >
                            Quizzes
                          </h3>
                          <p className="text-xs" style={{ color: MUTED }}>
                            {quizzes.length} quiz
                            {quizzes.length !== 1 ? "zes" : ""}
                          </p>
                        </div>
                        <button
                          onClick={() => setCreateQuizOpen(true)}
                          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-sm font-bold text-sm transition"
                          style={{ backgroundColor: ORANGE }}
                        >
                          <Plus size={16} /> Create quiz
                        </button>
                      </div>
                      {quizzes.length === 0 ? (
                        <div className="text-center py-10">
                          <HelpCircle
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: LINE }}
                          />
                          <p className="font-bold" style={{ color: MUTED }}>
                            No quizzes yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {quizzes.map((quiz) => (
                            <div
                              key={quiz.id}
                              className="border rounded-sm p-5"
                              style={{ borderColor: LINE }}
                            >
                              <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                  <h4
                                    className="font-black"
                                    style={{ color: INK }}
                                  >
                                    {quiz.title}
                                  </h4>
                                  <p
                                    className="text-xs mt-0.5"
                                    style={{ color: MUTED }}
                                  >
                                    {quiz.questions?.length || 0} questions ·{" "}
                                    {quiz._count?.quizAttempts || 0} attempts
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteQuiz(quiz.id)}
                                  className="p-2 rounded-sm hover:bg-red-50 transition shrink-0"
                                  style={{ color: MUTED }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === TABS.REVIEWS && (
                    <>
                      <div className="mb-5">
                        <h3
                          className="font-black"
                          style={{ fontFamily: DISPLAY_FONT, color: INK }}
                        >
                          Student reviews
                        </h3>
                        {reviews.totalReviews > 0 && (
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-3xl font-black"
                              style={{ fontFamily: DISPLAY_FONT, color: INK }}
                            >
                              {reviews.averageRating}
                            </span>
                            <div>
                              <StarRating rating={reviews.averageRating} />
                              <p
                                className="text-xs mt-0.5"
                                style={{ color: MUTED }}
                              >
                                {reviews.totalReviews} review
                                {reviews.totalReviews !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {!reviews.reviews?.length ? (
                        <div className="text-center py-10">
                          <Star
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: LINE }}
                          />
                          <p className="font-bold" style={{ color: MUTED }}>
                            No reviews yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reviews.reviews.map((r) => (
                            <div
                              key={r.id}
                              className="border rounded-sm p-4"
                              style={{ borderColor: LINE }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className="w-9 h-9 rounded-full text-white flex items-center justify-center font-black text-sm shrink-0 overflow-hidden"
                                  style={{ backgroundColor: BLUE }}
                                >
                                  {r.user?.avatarUrl ? (
                                    <img
                                      src={r.user.avatarUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    r.user?.fullName?.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p
                                      className="font-bold text-sm"
                                      style={{ color: INK }}
                                    >
                                      {r.user?.fullName}
                                    </p>
                                    <StarRating rating={r.rating} />
                                  </div>
                                  {r.comment && (
                                    <p
                                      className="text-sm mt-1 leading-relaxed"
                                      style={{ color: MUTED }}
                                    >
                                      {r.comment}
                                    </p>
                                  )}
                                  <p
                                    className="text-[10px] mt-1.5"
                                    style={{
                                      color: MUTED,
                                      fontFamily: MONO_FONT,
                                    }}
                                  >
                                    {new Date(r.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === TABS.STUDENTS && (
                    <>
                      <div className="mb-5">
                        <h3
                          className="font-black"
                          style={{ fontFamily: DISPLAY_FONT, color: INK }}
                        >
                          Enrolled students
                        </h3>
                        <p className="text-xs" style={{ color: MUTED }}>
                          {students.length} student
                          {students.length !== 1 ? "s" : ""} enrolled
                        </p>
                      </div>
                      {students.length === 0 ? (
                        <div className="text-center py-10">
                          <Users
                            size={32}
                            className="mx-auto mb-3"
                            style={{ color: LINE }}
                          />
                          <p className="font-bold" style={{ color: MUTED }}>
                            No students yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {students.map((enrollment) => {
                            const student = enrollment.user || enrollment;
                            const progress = enrollment.progress || 0;
                            return (
                              <div
                                key={enrollment.id}
                                className="flex items-center gap-4 p-4 rounded-sm border transition"
                                style={{ borderColor: LINE }}
                              >
                                <div
                                  className="w-10 h-10 rounded-sm text-white flex items-center justify-center font-black shrink-0 overflow-hidden"
                                  style={{ backgroundColor: BLUE }}
                                >
                                  {student?.avatarUrl ? (
                                    <img
                                      src={student.avatarUrl}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    student?.fullName?.charAt(0)
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className="font-bold text-sm"
                                    style={{ color: INK }}
                                  >
                                    {student?.fullName || "Unknown"}
                                  </p>
                                  <p
                                    className="text-xs"
                                    style={{ color: MUTED }}
                                  >
                                    {student?.email}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <div
                                      className="flex-1 rounded-full h-1.5"
                                      style={{ backgroundColor: LINE }}
                                    >
                                      <div
                                        className="h-1.5 rounded-full transition-all"
                                        style={{
                                          width: `${progress}%`,
                                          backgroundColor: BLUE,
                                        }}
                                      />
                                    </div>
                                    <span
                                      className="text-[10px] font-bold shrink-0"
                                      style={{ color: MUTED }}
                                    >
                                      {progress}%
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  {progress === 100 ? (
                                    <span
                                      className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-sm"
                                      style={{
                                        color: MOSS,
                                        backgroundColor: `${MOSS}14`,
                                      }}
                                    >
                                      <Trophy size={10} /> Done
                                    </span>
                                  ) : (
                                    <span
                                      className="text-xs"
                                      style={{ color: MUTED }}
                                    >
                                      {new Date(
                                        enrollment.enrolledAt,
                                      ).toLocaleDateString()}
                                    </span>
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

        {createLessonOpen && (
          <LessonFormModal
            isEdit={false}
            onSubmit={handleCreateLesson}
            onClose={() => setCreateLessonOpen(false)}
            lessonForm={lessonForm}
            setLessonForm={setLessonForm}
            videoPreview={videoPreview}
            setVideoPreview={setVideoPreview}
            uploadingVideo={uploadingVideo}
            handleVideoUpload={handleVideoUpload}
            savingLesson={savingLesson}
          />
        )}
        {editLessonOpen && (
          <LessonFormModal
            isEdit={true}
            onSubmit={handleEditLesson}
            onClose={() => {
              setEditLessonOpen(false);
              setEditingLesson(null);
            }}
            lessonForm={lessonForm}
            setLessonForm={setLessonForm}
            videoPreview={videoPreview}
            setVideoPreview={setVideoPreview}
            uploadingVideo={uploadingVideo}
            handleVideoUpload={handleVideoUpload}
            savingLesson={savingLesson}
          />
        )}
        {editCourseOpen && (
          <CourseFormModal
            isEdit={true}
            onSubmit={handleEditCourse}
            onClose={() => setEditCourseOpen(false)}
            courseForm={courseForm}
            setCourseForm={setCourseForm}
            thumbPreview={thumbPreview}
            handleThumbUpload={handleThumbUpload}
            uploadingThumb={uploadingThumb}
            submitting={submitting}
            savingCourse={savingCourse}
          />
        )}
        {addResourceOpen && (
          <ResourceModal
            onSubmit={handleAddResource}
            onClose={() => setAddResourceOpen(false)}
            resourceForm={resourceForm}
            setResourceForm={setResourceForm}
            resPreview={resPreview}
            setResPreview={setResPreview}
            uploadingRes={uploadingRes}
            handleResUpload={handleResUpload}
            savingResource={savingResource}
          />
        )}
        {createQuizOpen && (
          <QuizBuilderModal
            onClose={() => setCreateQuizOpen(false)}
            onSubmit={handleCreateQuiz}
            quizForm={quizForm}
            setQuizForm={setQuizForm}
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
      <Toast />

      <div className="min-h-screen" style={{ backgroundColor: PAPER }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-28">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-8 h-8 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: BLUE }}
                >
                  <GraduationCap size={16} className="text-white" />
                </div>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: ORANGE, fontFamily: MONO_FONT }}
                >
                  Instructor portal
                </span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-black tracking-tight"
                style={{ fontFamily: DISPLAY_FONT, color: INK }}
              >
                Your courses
              </h1>
              <p className="mt-1 text-sm" style={{ color: MUTED }}>
                Create, manage and grow your teaching business
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Quick links */}
              <RouterLink
                to="/instructor/wallet"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                style={{
                  color: MOSS,
                  backgroundColor: `${MOSS}0D`,
                  borderColor: `${MOSS}40`,
                }}
              >
                <Wallet size={13} /> Wallet{" "}
                {wallet ? `· ${fmt(wallet.availableBalance)}` : ""}
              </RouterLink>
              <RouterLink
                to="/instructor/coupons"
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                style={{
                  color: PLUM,
                  backgroundColor: `${PLUM}0D`,
                  borderColor: `${PLUM}40`,
                }}
              >
                <Tag size={13} /> Coupons
              </RouterLink>
              <button
                onClick={() => {
                  setCourseForm({
                    title: "",
                    description: "",
                    price: "",
                    category: "Development",
                  });
                  setThumbPreview("");
                  setCreateCourseOpen(true);
                }}
                className="flex items-center gap-2 text-white px-6 py-3 rounded-sm font-bold transition-all text-sm shrink-0"
                style={{ backgroundColor: ORANGE }}
              >
                <Plus size={18} /> New course
              </button>
            </div>
          </div>

          {/* Wallet + Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-10">
            <div className="col-span-2">
              <WalletSummary wallet={wallet} />
            </div>
            <StatCard
              icon={BookOpen}
              label="Total"
              value={stats.total}
              accent={BLUE}
            />
            <StatCard
              icon={CheckCircle}
              label="Published"
              value={stats.published}
              accent={MOSS}
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={stats.pending}
              accent={ORANGE}
            />
            <StatCard
              icon={Users}
              label="Students"
              value={stats.students}
              accent={PLUM}
            />
          </div>

          {/* Course list */}
          {loading ? (
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-white rounded-sm border animate-pulse"
                  style={{ borderColor: LINE }}
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div
              className="bg-white rounded-sm border p-16 text-center"
              style={{ borderColor: LINE }}
            >
              <div
                className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${BLUE}0D` }}
              >
                <BookOpen size={24} style={{ color: BLUE }} />
              </div>
              <h3 className="font-black text-lg mb-1" style={{ color: INK }}>
                No courses yet
              </h3>
              <p className="text-sm mb-6" style={{ color: MUTED }}>
                Create your first course and start teaching
              </p>
              <button
                onClick={() => {
                  setCourseForm({
                    title: "",
                    description: "",
                    price: "",
                    category: "Development",
                  });
                  setThumbPreview("");
                  setCreateCourseOpen(true);
                }}
                className="inline-flex items-center gap-2 text-white px-6 py-3 rounded-sm font-bold text-sm transition"
                style={{ backgroundColor: BLUE }}
              >
                <Plus size={16} /> Create first course
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-sm border p-5 sm:p-6 transition-shadow hover:shadow-md group"
                  style={{ borderColor: LINE }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-sm overflow-hidden shrink-0">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: BLUE }}
                        >
                          <FileText size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3
                            className="font-black text-base truncate"
                            style={{ color: INK }}
                          >
                            {course.title}
                          </h3>
                          <p
                            className="text-xs mt-0.5 line-clamp-1"
                            style={{ color: MUTED }}
                          >
                            {course.description}
                          </p>
                        </div>
                        <StatusBadge status={course.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        {course.category?.name && (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-sm border"
                            style={{ color: BLUE, borderColor: LINE }}
                          >
                            {course.category.name}
                          </span>
                        )}
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: MUTED }}
                        >
                          <Users size={12} /> {course._count?.enrollments || 0}{" "}
                          students
                        </span>
                        <span
                          className="text-xs font-semibold"
                          style={{ color: MUTED }}
                        >
                          {course.price === 0 ? "Free" : `$${course.price}`}
                        </span>
                        <span className="text-xs" style={{ color: MUTED }}>
                          {course._count?.lessons || 0} lessons
                        </span>
                        {course.price > 0 && course._count?.enrollments > 0 && (
                          <span
                            className="text-xs font-bold flex items-center gap-1"
                            style={{ color: MOSS }}
                          >
                            <DollarSign size={11} />{" "}
                            {fmt(
                              course._count.enrollments * course.price * 0.37,
                            )}{" "}
                            earned
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openCourse(course)}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-sm text-xs font-bold transition border"
                        style={{ borderColor: LINE, color: INK }}
                      >
                        <ChevronRight size={14} /> Manage
                      </button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === course.id ? null : course.id,
                            )
                          }
                          className="p-2 rounded-sm hover:bg-slate-50 transition"
                          style={{ color: MUTED }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {menuOpen === course.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpen(null)}
                            />
                            <div
                              className="absolute right-0 top-10 w-48 bg-white rounded-sm shadow-2xl border p-2 z-20"
                              style={{ borderColor: LINE }}
                            >
                              <button
                                onClick={() => openCourse(course)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-sm hover:bg-slate-50 transition"
                                style={{ color: INK }}
                              >
                                <ChevronRight size={14} /> Manage course
                              </button>
                              <button
                                onClick={() => openEditCourse(course)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-sm hover:bg-slate-50 transition"
                                style={{ color: INK }}
                              >
                                <Edit2 size={14} /> Edit details
                              </button>
                              {(course.status === "DRAFT" ||
                                course.status === "REJECTED") && (
                                <button
                                  onClick={() =>
                                    handleSubmitForReview(course.id)
                                  }
                                  disabled={submitLoading[course.id]}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-sm hover:bg-slate-50 transition"
                                  style={{ color: BLUE }}
                                >
                                  {submitLoading[course.id] ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Send size={14} />
                                  )}{" "}
                                  Submit for review
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteCourse(course.id)}
                                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-semibold rounded-sm hover:bg-red-50 transition"
                                style={{ color: RUST }}
                              >
                                <Trash2 size={14} /> Delete course
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

      {createCourseOpen && (
        <CourseFormModal
          isEdit={false}
          onSubmit={handleCreateCourse}
          onClose={() => setCreateCourseOpen(false)}
          courseForm={courseForm}
          setCourseForm={setCourseForm}
          thumbPreview={thumbPreview}
          handleThumbUpload={handleThumbUpload}
          uploadingThumb={uploadingThumb}
          submitting={submitting}
          savingCourse={savingCourse}
        />
      )}
      {editCourseOpen && (
        <CourseFormModal
          isEdit={true}
          onSubmit={handleEditCourse}
          onClose={() => setEditCourseOpen(false)}
          courseForm={courseForm}
          setCourseForm={setCourseForm}
          thumbPreview={thumbPreview}
          handleThumbUpload={handleThumbUpload}
          uploadingThumb={uploadingThumb}
          submitting={submitting}
          savingCourse={savingCourse}
        />
      )}
    </Layout>
  );
};

export default InstructorDashboard;
