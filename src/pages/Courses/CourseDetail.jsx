import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Play, Lock, CheckCircle, X, BookOpen, Users, Star,
  Zap, Award, FileText, Video, Loader2, Trophy, Target,
  HelpCircle, AlertCircle, ChevronRight, ArrowLeft,
  Share2, Globe, ShieldCheck, Flame, TrendingUp, MessageCircle,
} from "lucide-react";

import Layout from "../../shared/Layout/Layout";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";
import LessonComments from "../../Components/LessonComments";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER  = "#EEF1F3";
const LINE   = "#D8DEE3";
const MUTED  = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const RUST   = "#B23A2E";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt  = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const pct  = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const fmtD = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Stars ───────────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className="transition-transform hover:scale-110 active:scale-95">
        <Star size={24} style={{ color: s <= value ? ORANGE : LINE }} className={s <= value ? "fill-current" : ""} />
      </button>
    ))}
  </div>
);

const Stars = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-[2px]">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size}
        style={{ color: s <= Math.round(rating) ? ORANGE : LINE }}
        className={s <= Math.round(rating) ? "fill-current" : ""} />
    ))}
  </div>
);

// ─── Progress ring ────────────────────────────────────────────────────────────
const Ring = ({ value, size = 64, stroke = 6 }) => {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={MOSS} strokeWidth={stroke}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2
    px-5 py-3 rounded-sm shadow-2xl font-bold text-sm text-white"
    style={{ backgroundColor: type === "error" ? RUST : MOSS }}>
    {type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
    {msg}
  </div>
);

// ─── Quiz section ─────────────────────────────────────────────────────────────
const QuizSection = ({ courseId, canAccess }) => {
  const [quizzes,    setQuizzes]    = useState([]);
  const [attempts,   setAttempts]   = useState({});
  const [active,     setActive]     = useState(null);
  const [answers,    setAnswers]    = useState({});
  const [result,     setResult]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!courseId) return;
    API.get(`/quizzes/course/${courseId}`)
      .then((r) => setQuizzes(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
    if (canAccess) {
      API.get(`/quizzes/attempts/${courseId}`)
        .then((r) => {
          const map = {};
          (Array.isArray(r.data) ? r.data : []).forEach((a) => { map[a.quizId] = a; });
          setAttempts(map);
        }).catch(console.error);
    }
  }, [courseId, canAccess]);

  const startQuiz  = (quiz) => { setActive(quiz.id); setAnswers({}); setResult(null); };
  const activeQuiz = quizzes.find((q) => q.id === active);

  const handleSubmit = async () => {
    const answerList = Object.entries(answers).map(([qId, oId]) => ({ questionId: qId, optionId: oId }));
    setSubmitting(true);
    try {
      const res = await API.post("/quizzes/submit", { quizId: active, answers: answerList });
      setResult(res.data);
      setAttempts((p) => ({ ...p, [active]: res.data.attempt }));
    } catch (err) { console.error(err); }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-sm" style={{ backgroundColor: PAPER }} />)}
    </div>
  );

  if (!quizzes.length) return (
    <div className="text-center py-16" style={{ color: MUTED }}>
      <HelpCircle size={36} className="mx-auto mb-3 opacity-40" />
      <p className="font-semibold">No quizzes for this course yet</p>
    </div>
  );

  if (active && activeQuiz && !result) {
    const total    = activeQuiz.questions?.length || 0;
    const answered = Object.keys(answers).length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-lg" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{activeQuiz.title}</h3>
            <p className="text-xs mt-0.5" style={{ color: MUTED }}>{answered}/{total} answered</p>
          </div>
          <button onClick={() => setActive(null)}
            className="p-2 rounded-sm hover:bg-slate-50 transition" style={{ color: MUTED }}>
            <X size={18} />
          </button>
        </div>
        <div className="relative h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: LINE }}>
          <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? pct(answered, total) : 0}%`, backgroundColor: BLUE }} />
        </div>
        {activeQuiz.questions?.map((q, qi) => (
          <div key={q.id} className="rounded-sm p-5 space-y-3 border" style={{ backgroundColor: PAPER, borderColor: LINE }}>
            <p className="font-bold text-sm leading-relaxed" style={{ color: INK }}>
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-sm text-white text-xs font-black mr-2"
                style={{ backgroundColor: BLUE, fontFamily: MONO_FONT }}>{qi + 1}</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <button key={opt.id} onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                  className="w-full text-left px-4 py-3 rounded-sm border text-sm font-medium transition-all"
                  style={answers[q.id] === opt.id
                    ? { borderColor: BLUE, backgroundColor: "rgba(27,58,92,0.06)", color: BLUE, fontWeight: 700 }
                    : { borderColor: LINE, backgroundColor: "#fff", color: MUTED }}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} disabled={submitting || answered < total}
          className="w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-sm font-black text-sm
            transition flex items-center justify-center gap-2" style={{ backgroundColor: ORANGE }}>
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
          {submitting ? "Submitting…" : answered < total ? `Answer all ${total} questions` : "Submit quiz"}
        </button>
      </div>
    );
  }

  if (result) {
    const passed = result.passed;
    return (
      <div className="text-center py-10 space-y-6">
        <div className="w-24 h-24 rounded-sm mx-auto flex items-center justify-center"
          style={{ backgroundColor: passed ? MOSS : RUST }}>
          {passed ? <Trophy size={40} className="text-white" /> : <AlertCircle size={40} className="text-white" />}
        </div>
        <div>
          <p className="text-5xl font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{result.percentage}%</p>
          <p className="text-sm font-bold mt-2" style={{ color: passed ? MOSS : RUST }}>
            {passed ? "Passed" : "Almost — try again"}
          </p>
          <p className="text-xs mt-1" style={{ color: MUTED }}>{result.score} of {result.total} correct</p>
        </div>
        <div className="flex gap-3 max-w-xs mx-auto">
          <button onClick={() => { setResult(null); setActive(null); }}
            className="flex-1 border py-3 rounded-sm font-bold text-sm transition" style={{ borderColor: LINE, color: MUTED }}>
            Back
          </button>
          {!passed && (
            <button onClick={() => startQuiz(activeQuiz)}
              className="flex-1 text-white py-3 rounded-sm font-bold text-sm transition" style={{ backgroundColor: BLUE }}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {quizzes.map((quiz) => {
        const attempt = attempts[quiz.id];
        const score   = attempt ? Math.round((attempt.score / (quiz.questions?.length || 1)) * 100) : null;
        const passed  = score !== null && score >= 70;
        return (
          <div key={quiz.id}
            className="group border rounded-sm p-5 transition-shadow hover:shadow-md bg-white" style={{ borderColor: LINE }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center shrink-0 font-black text-lg"
                style={attempt
                  ? { backgroundColor: passed ? "rgba(76,122,93,0.12)" : "rgba(178,58,46,0.1)", color: passed ? MOSS : RUST }
                  : { backgroundColor: "rgba(27,58,92,0.08)", color: BLUE }}>
                {attempt ? (passed ? "✓" : "✗") : <HelpCircle size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black" style={{ color: INK }}>{quiz.title}</h4>
                <p className="text-xs mt-0.5" style={{ color: MUTED }}>{quiz.questions?.length || 0} questions</p>
                {attempt && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-sm mt-2"
                    style={{ backgroundColor: passed ? "rgba(76,122,93,0.1)" : "rgba(178,58,46,0.1)", color: passed ? MOSS : RUST }}>
                    {passed ? <CheckCircle size={10} /> : <X size={10} />}
                    {score}% · {passed ? "Passed" : "Failed"}
                  </div>
                )}
              </div>
              {canAccess ? (
                <button onClick={() => startQuiz(quiz)}
                  className="px-4 py-2.5 rounded-sm font-bold text-sm transition shrink-0"
                  style={attempt ? { backgroundColor: PAPER, color: INK } : { backgroundColor: BLUE, color: "#fff" }}>
                  {attempt ? "Retake" : "Start"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-sm shrink-0" style={{ color: MUTED, backgroundColor: PAPER }}>
                  <Lock size={12} /> Enroll first
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── Reviews section ──────────────────────────────────────────────────────────
const ReviewsSection = ({ courseId, canAccess, userId }) => {
  const [reviews,   setReviews]   = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    API.get(`/reviews/course/${courseId}`)
      .then((r) => {
        const data = r.data || {};
        const list = Array.isArray(data) ? data : (data.reviews || []);
        setReviews(list);
        setAvgRating(data.averageRating || (list.length ? +(list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1) : 0));
        setTotal(data.totalReviews || list.length);
      }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  const myReview = reviews.find((r) => r.userId === userId);
  useEffect(() => {
    if (myReview) { setMyRating(myReview.rating); setMyComment(myReview.comment || ""); }
  }, [myReview?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { showToast("Please select a rating", "error"); return; }
    setSaving(true);
    try {
      const res = await API.post("/reviews", { courseId, rating: myRating, comment: myComment });
      setReviews((p) => [res.data.review, ...p.filter((r) => r.userId !== userId)]);
      showToast(myReview ? "Review updated!" : "Review posted!");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-sm" style={{ backgroundColor: PAPER }} />)}
    </div>
  );

  return (
    <div className="space-y-8">
      {toast && <Toast {...toast} />}

      {total > 0 && (
        <div className="border rounded-sm p-6 flex flex-col sm:flex-row items-center gap-6" style={{ backgroundColor: "rgba(214,90,46,0.05)", borderColor: "rgba(214,90,46,0.2)" }}>
          <div className="text-center shrink-0">
            <p className="text-6xl font-black leading-none" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{avgRating}</p>
            <div className="mt-2"><Stars rating={avgRating} size={16} /></div>
            <p className="text-xs mt-2 font-medium" style={{ color: MUTED }}>{fmt(total)} review{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-xs font-bold" style={{ color: INK }}>{star}</span>
                    <Star size={11} style={{ color: ORANGE }} className="fill-current" />
                  </div>
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${total > 0 ? pct(count, total) : 0}%`, backgroundColor: ORANGE }} />
                  </div>
                  <span className="text-[10px] w-5 text-right font-medium" style={{ color: MUTED }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canAccess && (
        <div className="bg-white border rounded-sm p-6 space-y-4" style={{ borderColor: LINE }}>
          <h4 className="font-black" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{myReview ? "Update your review" : "Rate this course"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <StarPicker value={myRating} onChange={setMyRating} />
            <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think? Your feedback helps other students…" rows={3}
              className="w-full border rounded-sm px-4 py-3 text-sm outline-none resize-none transition"
              style={{ borderColor: LINE, backgroundColor: PAPER }} />
            <button type="submit" disabled={saving || !myRating}
              className="flex items-center gap-2 disabled:opacity-50 text-white px-6 py-3 rounded-sm font-bold text-sm transition"
              style={{ backgroundColor: BLUE }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
              {saving ? "Saving…" : myReview ? "Update review" : "Post review"}
            </button>
          </form>
        </div>
      )}

      {!reviews.length ? (
        <div className="text-center py-12">
          <Star size={32} className="mx-auto mb-3" style={{ color: LINE }} />
          <p className="font-semibold" style={{ color: MUTED }}>No reviews yet — be the first</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id}
              className="rounded-sm p-5 border" style={{ borderColor: r.userId === userId ? BLUE : LINE, backgroundColor: r.userId === userId ? "rgba(27,58,92,0.03)" : "#fff" }}>
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full overflow-hidden text-white flex items-center justify-center font-black text-sm shrink-0"
                  style={{ backgroundColor: BLUE }}>
                  {r.user?.avatarUrl
                    ? <img src={r.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : r.user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-sm" style={{ color: INK }}>{r.user?.fullName || "Student"}</span>
                      {r.userId === userId && (
                        <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: "rgba(27,58,92,0.1)", color: BLUE }}>You</span>
                      )}
                      <div className="mt-1"><Stars rating={r.rating} size={11} /></div>
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: MUTED, fontFamily: MONO_FONT }}>{fmtD(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-sm mt-2 leading-relaxed" style={{ color: MUTED }}>{r.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Buy Card ─────────────────────────────────────────────────────────────────
const BuyCard = ({ course, isFree, lessons, enrolling, onEnroll, onBuy, onShare, copied }) => (
  <div className="bg-white rounded-sm shadow-2xl border overflow-hidden" style={{ borderColor: LINE }}>
    {course.thumbnail ? (
      <div className="relative overflow-hidden h-40">
        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
        {!isFree && (
          <div className="absolute top-3 right-3 bg-white rounded-sm px-3 py-1.5 font-black text-lg shadow-md" style={{ color: INK }}>
            ${course.price}
          </div>
        )}
      </div>
    ) : (
      <div className="h-40 flex items-center justify-center" style={{ backgroundColor: BLUE }}>
        <BookOpen size={40} className="text-white/50" />
      </div>
    )}
    <div className="p-6 space-y-5">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black" style={{ fontFamily: DISPLAY_FONT, color: isFree ? MOSS : ORANGE }}>{isFree ? "Free" : `$${course.price}`}</span>
      </div>
      <div className="space-y-2.5">
        <button onClick={isFree ? onEnroll : onBuy} disabled={enrolling}
          className="w-full py-4 disabled:opacity-60 text-white rounded-sm font-black text-sm transition flex items-center justify-center gap-2"
          style={{ backgroundColor: ORANGE }}>
          {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {enrolling ? "Enrolling…" : isFree ? "Enroll for free" : "Buy now"}
        </button>
        <button onClick={onShare}
          className="w-full py-3 border rounded-sm font-bold text-sm transition flex items-center justify-center gap-2"
          style={{ borderColor: LINE, color: INK }}>
          <Share2 size={15} />
          {copied ? "Link copied" : "Share course"}
        </button>
      </div>
      <div className="space-y-2.5 pt-1">
        {[
          { icon: ShieldCheck, text: "Secure payment via Paystack"       },
          { icon: BookOpen,    text: `${lessons.length} lessons · lifetime access` },
          { icon: Award,       text: "Certificate of completion"          },
          { icon: Flame,       text: "Start learning immediately"         },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-sm" style={{ color: MUTED }}>
            <Icon size={15} style={{ color: BLUE }} className="shrink-0" />
            {text}
          </div>
        ))}
      </div>
      {course.instructor && (
        <div className="pt-2 border-t flex items-center gap-3" style={{ borderColor: LINE }}>
          <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-black text-sm shrink-0"
            style={{ backgroundColor: BLUE }}>
            {course.instructor.avatarUrl
              ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
              : course.instructor.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] font-medium" style={{ color: MUTED, fontFamily: MONO_FONT }}>Instructor</p>
            <p className="text-sm font-bold" style={{ color: INK }}>{course.instructor.fullName}</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────
const CourseDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course,         setCourse]         = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [lessons,        setLessons]        = useState([]);
  const [isEnrolled,     setIsEnrolled]     = useState(false);
  const [enrolling,      setEnrolling]      = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [progress,       setProgress]       = useState({ percentage: 0, completedLessonIds: [] });
  const [completingId,   setCompletingId]   = useState(null);
  const [celebration,    setCelebration]    = useState(false);
  const [activeTab,      setActiveTab]      = useState("curriculum");
  const [toast,          setToast]          = useState(null);
  const [copied,         setCopied]         = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    setLoading(true);
    API.get(`/courses/${id}`)
      .then((r) => { const d = r.data?.course || r.data; setCourse(d); setLessons(d?.lessons || []); })
      .catch(() => navigate("/courses"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    API.get("/enrollments/my")
      .then((r) =>
        setIsEnrolled((Array.isArray(r.data) ? r.data : [])
          .some((e) => e.courseId === id || e.course?.id === id))
      ).catch(console.error);
  }, [user, id]);

  useEffect(() => {
    if (!user || !isEnrolled || !id) return;
    API.get(`/progress/${id}`)
      .then((r) => {
        const d = r.data || {};
        setProgress({ percentage: d.percentage || 0, completedLessonIds: d.completedLessonIds || [] });
      }).catch(console.error);
  }, [user, isEnrolled, id]);

  const completedSet = new Set(progress.completedLessonIds);
  const isFree       = !course?.price || course.price === 0;
  const isOwner      = user?.id === course?.instructor?.id;
  const canAccess    = isEnrolled || isOwner || user?.role === "ADMIN";

  const handleMarkComplete = async (lessonId) => {
    if (completedSet.has(lessonId)) return;
    setCompletingId(lessonId);
    try {
      const res = await API.post("/progress/complete", { lessonId });
      const d   = res.data;
      setProgress({ percentage: d.percentage, completedLessonIds: d.completedLessonIds || [] });
      if (d.isCourseComplete) { setSelectedLesson(null); setCelebration(true); }
      else {
        const idx  = lessons.findIndex((l) => l.id === lessonId);
        const next = lessons[idx + 1];
        if (next) setTimeout(() => setSelectedLesson(next), 500); else setSelectedLesson(null);
      }
    } catch (err) { console.error(err); }
    finally { setCompletingId(null); }
  };

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    try {
      await API.post("/enrollments", { courseId: id });
      setIsEnrolled(true);
      showToast("You're enrolled! Start learning");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setEnrolling(false); }
  };

  const handleBuy   = () => { if (!user) { navigate("/auth"); return; } navigate(`/checkout?courseId=${id}`); };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2000);
    showToast("Link copied!");
  };

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto animate-pulse" style={{ backgroundColor: BLUE }}>
            <BookOpen size={26} className="text-white" />
          </div>
          <p className="font-semibold" style={{ color: MUTED }}>Loading course…</p>
        </div>
      </div>
    </Layout>
  );
  if (!course) return null;

  const tabs = [
    { key: "curriculum",  label: "Curriculum",  count: lessons.length,                icon: BookOpen      },
    { key: "quizzes",     label: "Quizzes",      count: null,                           icon: HelpCircle    },
    { key: "reviews",     label: "Reviews",      count: course._count?.reviews || null, icon: Star          },
    { key: "discussion",  label: "Discussion",   count: null,                           icon: MessageCircle },
  ];

  return (
    <Layout>
      {toast && <Toast {...toast} />}

      {/* ── LESSON VIEWER MODAL ────────────────────────────────────────────── */}
      {selectedLesson && (
        <>
          <div onClick={() => setSelectedLesson(null)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-x-3 top-[3%] bottom-[3%]
            sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl
            z-50 flex flex-col bg-white rounded-sm shadow-2xl overflow-hidden">

            {/* progress strip */}
            <div className="h-1 shrink-0" style={{ backgroundColor: LINE }}>
              <div className="h-full transition-all" style={{ backgroundColor: BLUE,
                width: `${pct(lessons.findIndex((l) => l.id === selectedLesson.id) + 1, lessons.length)}%` }} />
            </div>

            {/* header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b shrink-0" style={{ borderColor: LINE }}>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>
                  Lesson {lessons.findIndex((l) => l.id === selectedLesson.id) + 1} of {lessons.length}
                </p>
                <h3 className="font-black truncate" style={{ color: INK }}>{selectedLesson.title}</h3>
              </div>
              <button onClick={() => setSelectedLesson(null)}
                className="p-2.5 rounded-sm hover:bg-slate-50 transition shrink-0" style={{ color: MUTED }}>
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto p-5">
              {selectedLesson.type === "VIDEO"
                ? (selectedLesson.content?.includes("youtube") || selectedLesson.content?.includes("youtu.be")
                    ? <iframe className="w-full aspect-video rounded-sm shadow-lg"
                        src={selectedLesson.content.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                    : <video src={selectedLesson.content} controls className="w-full rounded-sm bg-black shadow-lg" />)
                : <div className="prose prose-sm max-w-none leading-relaxed whitespace-pre-wrap" style={{ color: INK }}>
                    {selectedLesson.content}
                  </div>
              }
            </div>

            {/* footer */}
            {canAccess && (
              <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: LINE }}>
                {completedSet.has(selectedLesson.id) ? (
                  <div className="flex items-center justify-center gap-2 py-3 font-bold text-sm rounded-sm"
                    style={{ backgroundColor: "rgba(76,122,93,0.1)", color: MOSS }}>
                    <CheckCircle size={16} /> Completed
                  </div>
                ) : (
                  <button onClick={() => handleMarkComplete(selectedLesson.id)} disabled={!!completingId}
                    className="w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 text-white rounded-sm font-bold text-sm transition"
                    style={{ backgroundColor: ORANGE }}>
                    {completingId === selectedLesson.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {completingId === selectedLesson.id ? "Marking…" : "Mark complete & continue"}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CELEBRATION ────────────────────────────────────────────────────── */}
      {celebration && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-96 z-50">
            <div className="relative overflow-hidden rounded-sm p-8 text-white text-center shadow-2xl" style={{ backgroundColor: BLUE_DEEP }}>
              <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }} />
              <div className="relative">
                <Trophy size={48} className="mx-auto mb-4" style={{ color: ORANGE }} />
                <h2 className="text-2xl font-black mb-2" style={{ fontFamily: DISPLAY_FONT }}>Course complete</h2>
                <p className="text-sm mb-6 text-white/70">You've completed every lesson.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-bold mb-6 border" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                  <Award size={14} style={{ color: ORANGE }} /> Certificate earned
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setCelebration(false); navigate(`/certificate/${id}`); }}
                    className="w-full py-3.5 rounded-sm font-black text-sm transition text-white" style={{ backgroundColor: ORANGE }}>
                    View certificate
                  </button>
                  <button onClick={() => setCelebration(false)}
                    className="w-full py-3 rounded-sm font-bold text-sm transition border" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                    Keep reviewing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ENROLLED — LEARNING MODE  (deep blueprint)
         ══════════════════════════════════════════════════════════════════ */}
      {canAccess ? (
        <div className="min-h-screen text-white" style={{ backgroundColor: BLUE_DEEP }}>

          {/* top bar */}
          <div className="sticky top-0 z-30 backdrop-blur border-b" style={{ backgroundColor: "rgba(18,40,61,0.95)", borderColor: "rgba(255,255,255,0.08)" }}>
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm font-medium shrink-0 transition text-white/70 hover:text-white">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex-1 min-w-0 text-center">
                <h1 className="font-black text-sm truncate">{course.title}</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full transition-all" style={{ backgroundColor: MOSS, width: `${progress.percentage}%` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: MOSS }}>{progress.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT: content */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">

              {/* course hero card */}
              <div className="relative overflow-hidden rounded-sm p-6 mb-6 border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                {course.thumbnail && (
                  <img src={course.thumbnail} alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10" />
                )}
                <div className="relative">
                  {course.category?.name && (
                    <span className="inline-block text-[10px] font-bold border px-3 py-1 rounded-sm mb-3 uppercase tracking-wider"
                      style={{ borderColor: "rgba(214,90,46,0.4)", color: ORANGE, backgroundColor: "rgba(214,90,46,0.1)" }}>
                      {course.category.name}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-black mb-2 leading-tight" style={{ fontFamily: DISPLAY_FONT }}>{course.title}</h2>
                  <p className="text-sm leading-relaxed line-clamp-2 text-white/60">{course.description}</p>
                </div>
              </div>

              {/* stat pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Progress",  value: `${progress.percentage}%`,                                      icon: TrendingUp,  color: MOSS   },
                  { label: "Done",      value: `${progress.completedLessonIds.length}/${lessons.length}`,      icon: CheckCircle, color: "#7B9DC4" },
                  { label: "Students",  value: fmt(course._count?.enrollments || 0),                           icon: Users,       color: "#9B8CC4" },
                  { label: "Rating",    value: course.avgRating ? course.avgRating.toFixed(1) : "New",         icon: Star,        color: ORANGE },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="rounded-sm p-4 text-center border" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                    <Icon size={15} style={{ color }} className="mx-auto mb-1.5" />
                    <p className="text-lg font-black" style={{ fontFamily: DISPLAY_FONT }}>{value}</p>
                    <p className="text-[10px] uppercase tracking-wider text-white/40">{label}</p>
                  </div>
                ))}
              </div>

              {/* tabs */}
              <div className="rounded-sm border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="flex border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  {tabs.map(({ key, label, count, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-4 text-xs font-bold transition border-b-2"
                      style={activeTab === key ? { borderColor: ORANGE, color: ORANGE } : { borderColor: "transparent", color: "rgba(255,255,255,0.4)" }}>
                      <Icon size={13} />
                      <span className="hidden sm:inline">{label}</span>
                      {count !== null && count > 0 && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                          style={activeTab === key ? { backgroundColor: "rgba(214,90,46,0.2)", color: ORANGE } : { backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)" }}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {activeTab === "curriculum" && (
                    <div className="space-y-2">
                      {lessons.map((lesson, idx) => {
                        const done = completedSet.has(lesson.id);
                        return (
                          <button key={lesson.id} onClick={() => setSelectedLesson(lesson)}
                            className="w-full flex items-center gap-4 p-4 rounded-sm border transition text-left group"
                            style={done
                              ? { borderColor: "rgba(76,122,93,0.25)", backgroundColor: "rgba(76,122,93,0.06)" }
                              : { borderColor: "rgba(255,255,255,0.08)" }}>
                            <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 font-black text-sm transition"
                              style={done ? { backgroundColor: MOSS, color: "#fff" } : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                              {done ? <CheckCircle size={16} /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {lesson.type === "VIDEO"
                                  ? <Video size={12} style={{ color: done ? MOSS : "rgba(255,255,255,0.4)" }} />
                                  : <FileText size={12} style={{ color: done ? MOSS : "rgba(255,255,255,0.4)" }} />}
                                <p className="font-bold text-sm truncate" style={{ color: done ? MOSS : "#fff" }}>
                                  {lesson.title}
                                </p>
                              </div>
                              <p className="text-[10px] mt-0.5 uppercase tracking-wider text-white/30">{lesson.type}</p>
                            </div>
                            <div className="shrink-0" style={{ color: done ? MOSS : "rgba(255,255,255,0.3)" }}>
                              {done ? <CheckCircle size={16} /> : <Play size={14} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {activeTab === "quizzes"    && <QuizSection courseId={id} canAccess={canAccess} />}
                  {activeTab === "reviews"    && <ReviewsSection courseId={id} canAccess={canAccess} userId={user?.id} />}
                  {activeTab === "discussion" && (
                    <LessonComments
                      lessonId={selectedLesson?.id || lessons[0]?.id}
                      courseInstructorId={course?.instructor?.id}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: sticky sidebar */}
            <div className="w-full lg:w-72 xl:w-80 shrink-0 order-1 lg:order-2 lg:sticky lg:top-20">
              <div className="rounded-sm border overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.08)" }}>

                {/* progress ring */}
                <div className="p-6 text-center border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                  <div className="relative inline-block">
                    <Ring value={progress.percentage} size={96} stroke={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black leading-none" style={{ fontFamily: DISPLAY_FONT }}>{progress.percentage}%</span>
                      <span className="text-[9px] uppercase tracking-widest text-white/40">done</span>
                    </div>
                  </div>
                  <p className="font-black mt-3">
                    {progress.percentage === 100 ? "Course complete" : "Keep going"}
                  </p>
                  <p className="text-xs mt-0.5 text-white/50">
                    {lessons.length - progress.completedLessonIds.length} lessons remaining
                  </p>
                </div>

                {/* next lesson */}
                {(() => {
                  const next = lessons.find((l) => !completedSet.has(l.id));
                  return next ? (
                    <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-2 text-white/40" style={{ fontFamily: MONO_FONT }}>Up next</p>
                      <button onClick={() => setSelectedLesson(next)}
                        className="w-full flex items-center gap-3 p-3 rounded-sm transition border text-left group"
                        style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}>
                        <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0" style={{ backgroundColor: ORANGE }}>
                          <Play size={12} className="text-white" />
                        </div>
                        <p className="text-xs font-bold truncate flex-1 text-white/80">{next.title}</p>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                      <div className="flex items-center gap-2" style={{ color: MOSS }}>
                        <Trophy size={16} />
                        <p className="text-sm font-black">All lessons complete</p>
                      </div>
                    </div>
                  );
                })()}

                {/* mini lesson list */}
                <div className="p-4 max-h-56 overflow-y-auto space-y-1">
                  {lessons.map((l, i) => {
                    const done = completedSet.has(l.id);
                    return (
                      <button key={l.id} onClick={() => setSelectedLesson(l)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-sm text-left transition"
                        style={{ color: done ? MOSS : "rgba(255,255,255,0.5)" }}>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                          style={done ? { backgroundColor: MOSS, color: "#fff" } : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                          {done ? "✓" : i + 1}
                        </span>
                        <span className="text-xs font-medium truncate">{l.title}</span>
                      </button>
                    );
                  })}
                </div>

                {course.instructor && (
                  <div className="p-4 border-t flex items-center gap-3" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: BLUE }}>
                      {course.instructor.avatarUrl
                        ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : course.instructor.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] text-white/40">Instructor</p>
                      <p className="text-xs font-bold text-white/80">{course.instructor.fullName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      /* ══════════════════════════════════════════════════════════════════════
          UNENROLLED — MARKETING MODE  (paper / light)
         ══════════════════════════════════════════════════════════════════ */
      ) : (
        <div className="min-h-screen bg-white">

          {/* hero */}
          <div className="relative overflow-hidden pt-24 pb-0" style={{ backgroundColor: BLUE_DEEP }}>
            <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                backgroundSize: "44px 44px",
              }} />

            <div className="relative max-w-7xl mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start pb-0">

                {/* left: course info */}
                <div className="flex-1 min-w-0 pb-10">
                  <div className="flex items-center gap-2 text-xs mb-5 text-white/50">
                    <Link to="/courses" className="hover:text-white transition">Courses</Link>
                    <ChevronRight size={12} />
                    {course.category?.name && (
                      <><span>{course.category.name}</span><ChevronRight size={12} /></>
                    )}
                    <span className="truncate max-w-[200px] text-white/40">{course.title}</span>
                  </div>

                  {course.category?.name && (
                    <span className="inline-block text-[11px] font-bold border px-3 py-1 rounded-sm mb-4 uppercase tracking-wider"
                      style={{ borderColor: "rgba(214,90,46,0.4)", color: ORANGE, backgroundColor: "rgba(214,90,46,0.1)" }}>
                      {course.category.name}
                    </span>
                  )}

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] mb-5 text-white" style={{ fontFamily: DISPLAY_FONT }}>
                    {course.title}
                  </h1>
                  <p className="text-base leading-relaxed mb-7 max-w-2xl text-white/70">{course.description}</p>

                  <div className="flex flex-wrap items-center gap-5 text-sm mb-7 text-white/70">
                    {course.avgRating ? (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base" style={{ color: ORANGE }}>{course.avgRating.toFixed(1)}</span>
                        <Stars rating={course.avgRating} size={13} />
                        <span className="text-xs text-white/40">({fmt(course._count?.reviews || 0)})</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-white/40" />
                      <span>{fmt(course._count?.enrollments || 0)} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-white/40" />
                      <span>{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-white/40" />
                      <span>English</span>
                    </div>
                  </div>

                  {course.instructor && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-white font-black text-sm shrink-0" style={{ backgroundColor: BLUE }}>
                        {course.instructor.avatarUrl
                          ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : course.instructor.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] text-white/40">Instructor</p>
                        <p className="text-sm font-bold text-white">{course.instructor.fullName}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* right: buy card (desktop floats above fold) */}
                <div className="hidden lg:block w-80 xl:w-96 shrink-0 self-start mt-4">
                  <div className="translate-y-16">
                    <BuyCard course={course} isFree={isFree} lessons={lessons}
                      enrolling={enrolling} onEnroll={handleEnroll} onBuy={handleBuy}
                      onShare={handleShare} copied={copied} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* mobile buy card */}
          <div className="lg:hidden px-4 -mt-4 relative z-10 mb-8">
            <BuyCard course={course} isFree={isFree} lessons={lessons}
              enrolling={enrolling} onEnroll={handleEnroll} onBuy={handleBuy}
              onShare={handleShare} copied={copied} />
          </div>

          {/* main content + desktop card spacer */}
          <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col lg:flex-row gap-10">
              <div className="flex-1 min-w-0 lg:max-w-[calc(100%-22rem-2.5rem)]">

                {/* tab bar */}
                <div className="flex gap-0 border-b-2 mb-8 overflow-x-auto" style={{ borderColor: LINE }}>
                  {tabs.map(({ key, label, count, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className="flex items-center gap-2 px-5 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 -mb-0.5 transition"
                      style={activeTab === key ? { borderColor: BLUE, color: BLUE } : { borderColor: "transparent", color: MUTED }}>
                      <Icon size={14} />
                      {label}
                      {count !== null && count > 0 && (
                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-sm"
                          style={activeTab === key ? { backgroundColor: "rgba(27,58,92,0.1)", color: BLUE } : { backgroundColor: PAPER, color: MUTED }}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === "curriculum" && (
                  <div>
                    <h2 className="text-xl font-black mb-1" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Course curriculum</h2>
                    <p className="text-xs mb-6" style={{ color: MUTED }}>{lessons.length} lessons · first lesson free preview</p>
                    <div className="space-y-2">
                      {lessons.map((lesson, idx) => {
                        const isFirst = idx === 0;
                        return (
                          <div key={lesson.id}
                            onClick={() => isFirst && setSelectedLesson(lesson)}
                            className="flex items-center gap-4 p-4 rounded-sm border transition group"
                            style={isFirst ? { borderColor: "rgba(27,58,92,0.2)", cursor: "pointer" } : { borderColor: LINE, opacity: 0.7 }}>
                            <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0 font-black text-sm"
                              style={isFirst ? { backgroundColor: "rgba(27,58,92,0.08)", color: BLUE } : { backgroundColor: PAPER, color: MUTED }}>
                              {!isFirst ? <Lock size={14} /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {lesson.type === "VIDEO" ? <Video size={12} style={{ color: "#9B8CC4" }} className="shrink-0" /> : <FileText size={12} style={{ color: BLUE }} className="shrink-0" />}
                                <p className="font-bold text-sm truncate" style={{ color: INK }}>{lesson.title}</p>
                                {isFirst && (
                                  <span className="shrink-0 text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-wider" style={{ backgroundColor: "rgba(76,122,93,0.1)", color: MOSS }}>
                                    Preview
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] mt-0.5 uppercase tracking-wider" style={{ color: MUTED }}>{lesson.type}</p>
                            </div>
                            <div className="shrink-0" style={{ color: isFirst ? BLUE : LINE }}>
                              {isFirst ? <Play size={16} /> : <Lock size={14} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "quizzes" && (
                  <div>
                    <h2 className="text-xl font-black mb-1" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Quizzes</h2>
                    <p className="text-xs mb-6" style={{ color: MUTED }}>Enroll to access all quizzes</p>
                    <QuizSection courseId={id} canAccess={false} />
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h2 className="text-xl font-black mb-1" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Student reviews</h2>
                    <p className="text-xs mb-6" style={{ color: MUTED }}>Enroll to leave your review</p>
                    <ReviewsSection courseId={id} canAccess={false} userId={user?.id} />
                  </div>
                )}

                {activeTab === "discussion" && (
                  <div>
                    <h2 className="text-xl font-black mb-1" style={{ fontFamily: DISPLAY_FONT, color: INK }}>Discussion</h2>
                    <p className="text-xs mb-6" style={{ color: MUTED }}>Enroll to join the course discussion</p>
                    <div className="border-2 border-dashed rounded-sm p-12 text-center" style={{ borderColor: LINE, backgroundColor: PAPER }}>
                      <MessageCircle size={36} className="mx-auto mb-3" style={{ color: LINE }} />
                      <p className="font-semibold text-sm" style={{ color: MUTED }}>Discussion is available to enrolled students</p>
                      <p className="text-xs mt-1" style={{ color: MUTED }}>Ask questions and learn from fellow students</p>
                    </div>
                  </div>
                )}
              </div>

              {/* spacer so content doesn't go under the floating card */}
              <div className="hidden lg:block w-80 xl:w-96 shrink-0" />
            </div>
          </div>

          {/* sticky mobile bottom bar */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t px-4 py-3 shadow-2xl" style={{ borderColor: LINE }}>
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="flex-1">
                <p className="font-black text-lg" style={{ fontFamily: DISPLAY_FONT, color: INK }}>{isFree ? "Free" : `$${course.price}`}</p>
              </div>
              <button onClick={isFree ? handleEnroll : handleBuy} disabled={enrolling}
                className="flex items-center gap-2 px-6 py-3 disabled:opacity-60 text-white rounded-sm font-black text-sm transition"
                style={{ backgroundColor: ORANGE }}>
                {enrolling ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {enrolling ? "Enrolling…" : isFree ? "Enroll free" : "Buy now"}
              </button>
            </div>
          </div>
          <div className="lg:hidden h-20" />
        </div>
      )}
    </Layout>
  );
};

export default CourseDetail;