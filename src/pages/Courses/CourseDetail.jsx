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

// ─── tiny helpers ────────────────────────────────────────────────────────────
const fmt  = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));
const pct  = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
const fmtD = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// ─── Stars ───────────────────────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}
        className="transition-transform hover:scale-125 active:scale-95">
        <Star size={26} className={s <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} />
      </button>
    ))}
  </div>
);

const Stars = ({ rating, size = 13 }) => (
  <div className="flex items-center gap-[2px]">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size}
        className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"} />
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
        stroke="#34d399" strokeWidth={stroke}
        strokeDasharray={`${fill} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .8s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type }) => (
  <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-2
    px-5 py-3 rounded-2xl shadow-2xl font-bold text-sm
    ${type === "error" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
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
      {[1, 2].map((i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}
    </div>
  );

  if (!quizzes.length) return (
    <div className="text-center py-16 text-slate-400">
      <HelpCircle size={40} className="mx-auto mb-3 opacity-30" />
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
            <h3 className="font-black text-slate-900 text-lg">{activeQuiz.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{answered}/{total} answered</p>
          </div>
          <button onClick={() => setActive(null)}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
            <X size={18} />
          </button>
        </div>
        <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? pct(answered, total) : 0}%` }} />
        </div>
        {activeQuiz.questions?.map((q, qi) => (
          <div key={q.id} className="bg-slate-50 rounded-2xl p-5 space-y-3 border border-slate-100">
            <p className="font-bold text-slate-800 text-sm leading-relaxed">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100
                text-blue-600 text-xs font-black mr-2">{qi + 1}</span>
              {q.text}
            </p>
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <button key={opt.id} onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all
                    ${answers[q.id] === opt.id
                      ? "border-blue-500 bg-blue-50 text-blue-800 font-bold"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} disabled={submitting || answered < total}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700
            disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm
            transition shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
          {submitting ? "Submitting…" : answered < total ? `Answer all ${total} questions` : "Submit Quiz"}
        </button>
      </div>
    );
  }

  if (result) {
    const passed = result.passed;
    return (
      <div className="text-center py-10 space-y-6">
        <div className={`w-28 h-28 rounded-3xl mx-auto flex items-center justify-center
          ${passed ? "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200"
            : "bg-gradient-to-br from-red-400 to-rose-500 shadow-lg shadow-red-200"}`}>
          {passed ? <Trophy size={48} className="text-white" /> : <AlertCircle size={48} className="text-white" />}
        </div>
        <div>
          <p className="text-5xl font-black text-slate-900">{result.percentage}%</p>
          <p className={`text-sm font-bold mt-2 ${passed ? "text-emerald-600" : "text-red-500"}`}>
            {passed ? "🎉 Passed!" : "Almost — try again"}
          </p>
          <p className="text-xs text-slate-400 mt-1">{result.score} of {result.total} correct</p>
        </div>
        <div className="flex gap-3 max-w-xs mx-auto">
          <button onClick={() => { setResult(null); setActive(null); }}
            className="flex-1 border-2 border-slate-200 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition">
            Back
          </button>
          {!passed && (
            <button onClick={() => startQuiz(activeQuiz)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition">
              Try Again
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
            className="group border-2 border-slate-100 hover:border-blue-200 rounded-2xl p-5
              transition-all hover:shadow-md hover:shadow-blue-50 bg-white">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-black text-lg
                ${attempt ? passed ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"
                  : "bg-blue-100 text-blue-600"}`}>
                {attempt ? (passed ? "✓" : "✗") : <HelpCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-800">{quiz.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{quiz.questions?.length || 0} questions</p>
                {attempt && (
                  <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full mt-2
                    ${passed ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                    {passed ? <CheckCircle size={10} /> : <X size={10} />}
                    {score}% · {passed ? "Passed" : "Failed"}
                  </div>
                )}
              </div>
              {canAccess ? (
                <button onClick={() => startQuiz(quiz)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm transition shrink-0
                    ${attempt ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"}`}>
                  {attempt ? "Retake" : "Start"}
                </button>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 px-3 py-2 bg-slate-50 rounded-xl shrink-0">
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
      {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-2xl" />)}
    </div>
  );

  return (
    <div className="space-y-8">
      {toast && <Toast {...toast} />}

      {total > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-6xl font-black text-slate-900 leading-none">{avgRating}</p>
            <div className="mt-2"><Stars rating={avgRating} size={16} /></div>
            <p className="text-xs text-slate-400 mt-2 font-medium">{fmt(total)} review{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 w-full space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <div key={star} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-12 shrink-0">
                    <span className="text-xs font-bold text-slate-600">{star}</span>
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                  </div>
                  <div className="flex-1 h-2 bg-white rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${total > 0 ? pct(count, total) : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-5 text-right font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {canAccess && (
        <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 space-y-4">
          <h4 className="font-black text-slate-900">{myReview ? "Update Your Review" : "Rate This Course"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <StarPicker value={myRating} onChange={setMyRating} />
            <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)}
              placeholder="What did you think? Your feedback helps other students…" rows={3}
              className="w-full border-2 border-slate-100 focus:border-blue-300 rounded-2xl px-4 py-3
                text-sm outline-none resize-none transition bg-slate-50 focus:bg-white" />
            <button type="submit" disabled={saving || !myRating}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50
                text-white px-6 py-3 rounded-xl font-bold text-sm transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
              {saving ? "Saving…" : myReview ? "Update Review" : "Post Review"}
            </button>
          </form>
        </div>
      )}

      {!reviews.length ? (
        <div className="text-center py-12">
          <Star size={36} className="text-slate-200 mx-auto mb-3" />
          <p className="font-semibold text-slate-400">No reviews yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id}
              className={`rounded-2xl p-5 border-2 ${r.userId === userId ? "border-blue-200 bg-blue-50/30" : "border-slate-100 bg-white"}`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-600
                  text-white flex items-center justify-center font-black text-sm shrink-0">
                  {r.user?.avatarUrl
                    ? <img src={r.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : r.user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{r.user?.fullName || "Student"}</span>
                      {r.userId === userId && (
                        <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">You</span>
                      )}
                      <div className="mt-1"><Stars rating={r.rating} size={11} /></div>
                    </div>
                    <span className="text-[10px] text-slate-300 font-medium">{fmtD(r.createdAt)}</span>
                  </div>
                  {r.comment && <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.comment}</p>}
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
  <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden">
    {course.thumbnail ? (
      <div className="relative overflow-hidden h-44">
        <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {!isFree && (
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3 py-1.5
            font-black text-slate-900 text-lg shadow-md">
            ${course.price}
          </div>
        )}
      </div>
    ) : (
      <div className="h-44 bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
        <BookOpen size={48} className="text-white/50" />
      </div>
    )}
    <div className="p-6 space-y-5">
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-slate-900">{isFree ? "Free" : `$${course.price}`}</span>
      </div>
      <div className="space-y-2.5">
        <button onClick={isFree ? onEnroll : onBuy} disabled={enrolling}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl
            font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
          {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
          {enrolling ? "Enrolling…" : isFree ? "Enroll for Free" : "Buy Now"}
        </button>
        <button onClick={onShare}
          className="w-full py-3 border-2 border-slate-200 hover:border-slate-300 text-slate-700
            rounded-2xl font-bold text-sm transition flex items-center justify-center gap-2">
          <Share2 size={15} />
          {copied ? "Link Copied!" : "Share Course"}
        </button>
      </div>
      <div className="space-y-2.5 pt-1">
        {[
          { icon: ShieldCheck, text: "Secure payment via Paystack"       },
          { icon: BookOpen,    text: `${lessons.length} lessons · lifetime access` },
          { icon: Award,       text: "Certificate of completion"          },
          { icon: Flame,       text: "Start learning immediately"         },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-sm text-slate-600">
            <Icon size={15} className="text-blue-500 shrink-0" />
            {text}
          </div>
        ))}
      </div>
      {course.instructor && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center
            text-white font-black text-sm shrink-0">
            {course.instructor.avatarUrl
              ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
              : course.instructor.fullName?.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Instructor</p>
            <p className="text-sm font-bold text-slate-800">{course.instructor.fullName}</p>
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
      showToast("You're enrolled! Start learning 🎉");
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600
            flex items-center justify-center mx-auto shadow-xl shadow-blue-200 animate-pulse">
            <BookOpen size={28} className="text-white" />
          </div>
          <p className="text-slate-400 font-semibold">Loading course…</p>
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
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50" />
          <div className="fixed inset-x-3 top-[3%] bottom-[3%]
            sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl
            z-50 flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* progress strip */}
            <div className="h-1 bg-slate-100 shrink-0">
              <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all"
                style={{ width: `${pct(lessons.findIndex((l) => l.id === selectedLesson.id) + 1, lessons.length)}%` }} />
            </div>

            {/* header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Lesson {lessons.findIndex((l) => l.id === selectedLesson.id) + 1} of {lessons.length}
                </p>
                <h3 className="font-black text-slate-900 truncate">{selectedLesson.title}</h3>
              </div>
              <button onClick={() => setSelectedLesson(null)}
                className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-400 transition shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* body */}
            <div className="flex-1 overflow-y-auto p-5">
              {selectedLesson.type === "VIDEO"
                ? (selectedLesson.content?.includes("youtube") || selectedLesson.content?.includes("youtu.be")
                    ? <iframe className="w-full aspect-video rounded-2xl shadow-lg"
                        src={selectedLesson.content.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen />
                    : <video src={selectedLesson.content} controls className="w-full rounded-2xl bg-black shadow-lg" />)
                : <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedLesson.content}
                  </div>
              }
            </div>

            {/* footer */}
            {canAccess && (
              <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                {completedSet.has(selectedLesson.id) ? (
                  <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 text-emerald-600 font-bold text-sm rounded-xl">
                    <CheckCircle size={16} /> Completed
                  </div>
                ) : (
                  <button onClick={() => handleMarkComplete(selectedLesson.id)} disabled={!!completingId}
                    className="w-full flex items-center justify-center gap-2 py-3.5
                      bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700
                      disabled:opacity-60 text-white rounded-xl font-bold text-sm transition shadow-md shadow-blue-200">
                    {completingId === selectedLesson.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                    {completingId === selectedLesson.id ? "Marking…" : "Mark Complete & Continue"}
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
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500
              rounded-3xl p-8 text-white text-center shadow-2xl">
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10" />
              <div className="relative">
                <div className="text-7xl mb-4">🏆</div>
                <h2 className="text-2xl font-black mb-2">Course Complete!</h2>
                <p className="text-white/80 text-sm mb-6">You've completed every lesson!</p>
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Award size={14} /> Certificate Earned
                </div>
                <div className="flex flex-col gap-3">
                  <button onClick={() => { setCelebration(false); navigate(`/certificate/${id}`); }}
                    className="w-full py-3.5 bg-white text-orange-600 rounded-2xl font-black hover:bg-orange-50 transition text-sm">
                    View Certificate
                  </button>
                  <button onClick={() => setCelebration(false)}
                    className="w-full py-3 bg-white/20 hover:bg-white/30 rounded-2xl font-bold text-sm transition border border-white/20">
                    Keep Reviewing
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ENROLLED — LEARNING MODE  (dark slate)
         ══════════════════════════════════════════════════════════════════ */}
      {canAccess ? (
        <div className="min-h-screen bg-slate-950 text-white">

          {/* top bar */}
          <div className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
              <button onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-medium shrink-0">
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex-1 min-w-0 text-center">
                <h1 className="font-black text-sm text-white truncate">{course.title}</h1>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 shrink-0">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${progress.percentage}%` }} />
                </div>
                <span className="text-xs font-bold text-emerald-400">{progress.percentage}%</span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 items-start">

            {/* LEFT: content */}
            <div className="flex-1 min-w-0 order-2 lg:order-1">

              {/* course hero card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900
                rounded-3xl p-6 mb-6 border border-white/5">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-10" />
                )}
                <div className="relative">
                  {course.category?.name && (
                    <span className="inline-block text-[10px] font-bold bg-blue-500/20 border border-blue-400/30
                      text-blue-300 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                      {course.category.name}
                    </span>
                  )}
                  <h2 className="text-xl sm:text-2xl font-black text-white mb-2 leading-tight">{course.title}</h2>
                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{course.description}</p>
                </div>
              </div>

              {/* stat pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Progress",  value: `${progress.percentage}%`,                                      icon: TrendingUp,  color: "text-emerald-400" },
                  { label: "Done",      value: `${progress.completedLessonIds.length}/${lessons.length}`,      icon: CheckCircle, color: "text-blue-400"    },
                  { label: "Students",  value: fmt(course._count?.enrollments || 0),                           icon: Users,       color: "text-violet-400"  },
                  { label: "Rating",    value: course.avgRating ? course.avgRating.toFixed(1) : "New",         icon: Star,        color: "text-amber-400"   },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 text-center">
                    <Icon size={16} className={`${color} mx-auto mb-1.5`} />
                    <p className="text-lg font-black text-white">{value}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</p>
                  </div>
                ))}
              </div>

              {/* tabs */}
              <div className="bg-slate-900 rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex border-b border-white/5">
                  {tabs.map(({ key, label, count, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-4 text-xs font-bold transition border-b-2
                        ${activeTab === key ? "border-blue-500 text-blue-400" : "border-transparent text-slate-500 hover:text-slate-300"}`}>
                      <Icon size={13} />
                      <span className="hidden sm:inline">{label}</span>
                      {count !== null && count > 0 && (
                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full
                          ${activeTab === key ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-slate-500"}`}>
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
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition text-left group
                              ${done
                                ? "border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                                : "border-white/5 hover:bg-white/5 hover:border-white/10"}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm transition
                              ${done ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400"}`}>
                              {done ? <CheckCircle size={16} /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {lesson.type === "VIDEO"
                                  ? <Video size={12} className={done ? "text-emerald-400" : "text-slate-500"} />
                                  : <FileText size={12} className={done ? "text-emerald-400" : "text-slate-500"} />}
                                <p className={`font-bold text-sm truncate ${done ? "text-emerald-300 line-through decoration-emerald-500/50" : "text-slate-200"}`}>
                                  {lesson.title}
                                </p>
                              </div>
                              <p className="text-[10px] text-slate-600 mt-0.5 uppercase tracking-wider">{lesson.type}</p>
                            </div>
                            <div className={`shrink-0 transition ${done ? "text-emerald-400" : "text-slate-600 group-hover:text-blue-400"}`}>
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
              <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">

                {/* progress ring */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 text-center border-b border-white/5">
                  <div className="relative inline-block">
                    <Ring value={progress.percentage} size={100} stroke={8} />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-white leading-none">{progress.percentage}%</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">done</span>
                    </div>
                  </div>
                  <p className="font-black text-white mt-3">
                    {progress.percentage === 100 ? "Course Complete! 🎉" : "Keep Going!"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {lessons.length - progress.completedLessonIds.length} lessons remaining
                  </p>
                </div>

                {/* next lesson */}
                {(() => {
                  const next = lessons.find((l) => !completedSet.has(l.id));
                  return next ? (
                    <div className="p-4 border-b border-white/5">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Up Next</p>
                      <button onClick={() => setSelectedLesson(next)}
                        className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10
                          rounded-2xl transition border border-white/5 hover:border-white/10 text-left group">
                        <div className="w-8 h-8 rounded-xl bg-blue-600 group-hover:bg-blue-500 transition flex items-center justify-center shrink-0">
                          <Play size={12} className="text-white" />
                        </div>
                        <p className="text-xs font-bold text-slate-300 truncate flex-1">{next.title}</p>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border-b border-white/5">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Trophy size={16} />
                        <p className="text-sm font-black">All lessons complete!</p>
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
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition
                          ${done ? "text-emerald-400 hover:bg-emerald-500/10" : "text-slate-400 hover:bg-white/5"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0
                          ${done ? "bg-emerald-500 text-white" : "bg-white/10 text-slate-500"}`}>
                          {done ? "✓" : i + 1}
                        </span>
                        <span className="text-xs font-medium truncate">{l.title}</span>
                      </button>
                    );
                  })}
                </div>

                {course.instructor && (
                  <div className="p-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 overflow-hidden flex items-center justify-center text-white font-black text-sm shrink-0">
                      {course.instructor.avatarUrl
                        ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                        : course.instructor.fullName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Instructor</p>
                      <p className="text-xs font-bold text-slate-200">{course.instructor.fullName}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      /* ══════════════════════════════════════════════════════════════════════
          UNENROLLED — MARKETING MODE  (white / light)
         ══════════════════════════════════════════════════════════════════ */
      ) : (
        <div className="min-h-screen bg-white">

          {/* hero */}
          <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 overflow-hidden pt-24 pb-0">
            <div className="absolute inset-0 opacity-40"
              style={{ backgroundImage: "radial-gradient(circle at 20% 50%, rgba(59,130,246,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(139,92,246,0.2) 0%, transparent 50%)" }} />

            <div className="relative max-w-7xl mx-auto px-4">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start pb-0">

                {/* left: course info */}
                <div className="flex-1 min-w-0 pb-10">
                  <div className="flex items-center gap-2 text-slate-400 text-xs mb-5">
                    <Link to="/courses" className="hover:text-white transition">Courses</Link>
                    <ChevronRight size={12} />
                    {course.category?.name && (
                      <><span>{course.category.name}</span><ChevronRight size={12} /></>
                    )}
                    <span className="text-slate-500 truncate max-w-[200px]">{course.title}</span>
                  </div>

                  {course.category?.name && (
                    <span className="inline-block text-[11px] font-bold bg-blue-500/20 border border-blue-400/30
                      text-blue-300 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                      {course.category.name}
                    </span>
                  )}

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] mb-5">
                    {course.title}
                  </h1>
                  <p className="text-slate-300 text-base leading-relaxed mb-7 max-w-2xl">{course.description}</p>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-slate-300 mb-7">
                    {course.avgRating ? (
                      <div className="flex items-center gap-2">
                        <span className="font-black text-amber-400 text-base">{course.avgRating.toFixed(1)}</span>
                        <Stars rating={course.avgRating} size={13} />
                        <span className="text-slate-400 text-xs">({fmt(course._count?.reviews || 0)})</span>
                      </div>
                    ) : null}
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-slate-400" />
                      <span>{fmt(course._count?.enrollments || 0)} enrolled</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} className="text-slate-400" />
                      <span>{lessons.length} lessons</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-slate-400" />
                      <span>English</span>
                    </div>
                  </div>

                  {course.instructor && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600
                        flex items-center justify-center text-white font-black text-sm shrink-0 ring-2 ring-blue-400/30">
                        {course.instructor.avatarUrl
                          ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                          : course.instructor.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Instructor</p>
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
                <div className="flex gap-0 border-b-2 border-slate-100 mb-8 overflow-x-auto">
                  {tabs.map(({ key, label, count, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-2 px-5 py-3.5 font-bold text-sm whitespace-nowrap border-b-2 -mb-0.5 transition
                        ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                      <Icon size={14} />
                      {label}
                      {count !== null && count > 0 && (
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                          ${activeTab === key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {activeTab === "curriculum" && (
                  <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Course Curriculum</h2>
                    <p className="text-xs text-slate-400 mb-6">{lessons.length} lessons · first lesson free preview</p>
                    <div className="space-y-2">
                      {lessons.map((lesson, idx) => {
                        const isFirst = idx === 0;
                        return (
                          <div key={lesson.id}
                            onClick={() => isFirst && setSelectedLesson(lesson)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition group
                              ${isFirst ? "border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer" : "border-slate-100 opacity-70"}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm
                              ${isFirst ? "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition" : "bg-slate-100 text-slate-400"}`}>
                              {!isFirst ? <Lock size={14} /> : idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {lesson.type === "VIDEO" ? <Video size={12} className="text-violet-400 shrink-0" /> : <FileText size={12} className="text-blue-400 shrink-0" />}
                                <p className="font-bold text-sm text-slate-800 truncate">{lesson.title}</p>
                                {isFirst && (
                                  <span className="shrink-0 text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Preview
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-0.5 uppercase tracking-wider">{lesson.type}</p>
                            </div>
                            <div className={`shrink-0 transition ${isFirst ? "text-blue-300 group-hover:text-blue-600" : "text-slate-300"}`}>
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
                    <h2 className="text-xl font-black text-slate-900 mb-1">Quizzes</h2>
                    <p className="text-xs text-slate-400 mb-6">Enroll to access all quizzes</p>
                    <QuizSection courseId={id} canAccess={false} />
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Student Reviews</h2>
                    <p className="text-xs text-slate-400 mb-6">Enroll to leave your review</p>
                    <ReviewsSection courseId={id} canAccess={false} userId={user?.id} />
                  </div>
                )}

                {activeTab === "discussion" && (
                  <div>
                    <h2 className="text-xl font-black text-slate-900 mb-1">Discussion</h2>
                    <p className="text-xs text-slate-400 mb-6">Enroll to join the course discussion</p>
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                      <MessageCircle size={40} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-semibold text-sm">Discussion is available to enrolled students</p>
                      <p className="text-slate-400 text-xs mt-1">Ask questions and learn from fellow students</p>
                    </div>
                  </div>
                )}
              </div>

              {/* spacer so content doesn't go under the floating card */}
              <div className="hidden lg:block w-80 xl:w-96 shrink-0" />
            </div>
          </div>

          {/* sticky mobile bottom bar */}
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur
            border-t border-slate-100 px-4 py-3 shadow-2xl shadow-slate-200">
            <div className="flex items-center gap-3 max-w-lg mx-auto">
              <div className="flex-1">
                <p className="font-black text-slate-900 text-lg">{isFree ? "Free" : `$${course.price}`}</p>
              </div>
              <button onClick={isFree ? handleEnroll : handleBuy} disabled={enrolling}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700
                  disabled:opacity-60 text-white rounded-2xl font-black text-sm transition shadow-lg shadow-blue-200">
                {enrolling ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {enrolling ? "Enrolling…" : isFree ? "Enroll Free" : "Buy Now"}
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
