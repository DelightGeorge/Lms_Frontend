import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play, Lock, CheckCircle, X, BookOpen, Users, Star,
  ShoppingCart, Zap, Award, FileText, Video,
  Loader2, Trophy, Target, HelpCircle, AlertCircle,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";


import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const StarPicker = ({ value, onChange }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)} className="transition hover:scale-110">
        <Star size={24} className={s <= value ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
      </button>
    ))}
  </div>
);

const StarDisplay = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={size} className={s <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"} />
    ))}
  </div>
);

const QuizSection = ({ courseId, isEnrolled }) => {
  const [quizzes,   setQuizzes]   = useState([]);
  const [attempts,  setAttempts]  = useState({});
  const [active,    setActive]    = useState(null);
  const [answers,   setAnswers]   = useState({});
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [submitting,setSubmitting]= useState(false);

  useEffect(() => {
    if (!courseId) return;
    API.get(`/quizzes/course/${courseId}`)
      .then((r) => setQuizzes(Array.isArray(r.data) ? r.data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
    if (isEnrolled) {
      API.get(`/quizzes/attempts/${courseId}`)
        .then((r) => {
          const map = {};
          (Array.isArray(r.data) ? r.data : []).forEach((a) => { map[a.quizId] = a; });
          setAttempts(map);
        }).catch(console.error);
    }
  }, [courseId, isEnrolled]);

  const startQuiz = (quiz) => { setActive(quiz.id); setAnswers({}); setResult(null); };

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

  if (loading) return <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />)}</div>;
  if (!quizzes.length) return (
    <div className="text-center py-12">
      <HelpCircle size={40} className="text-slate-200 mx-auto mb-3" />
      <p className="font-bold text-slate-400">No quizzes yet</p>
    </div>
  );

  const activeQuiz = quizzes.find((q) => q.id === active);

  if (active && activeQuiz && !result) {
    const total = activeQuiz.questions?.length || 0;
    const answered = Object.keys(answers).length;
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h3 className="font-black text-slate-900">{activeQuiz.title}</h3><p className="text-xs text-slate-400">{answered}/{total} answered</p></div>
          <button onClick={() => setActive(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${total > 0 ? Math.round((answered/total)*100) : 0}%` }} />
        </div>
        {activeQuiz.questions?.map((q, qi) => (
          <div key={q.id} className="bg-slate-50 rounded-2xl p-5 space-y-3">
            <p className="font-bold text-slate-800 text-sm"><span className="text-blue-500 mr-2">{qi + 1}.</span>{q.text}</p>
            <div className="space-y-2">
              {q.options?.map((opt) => (
                <button key={opt.id} onClick={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition
                    ${answers[q.id] === opt.id ? "border-blue-500 bg-blue-50 text-blue-700 font-bold" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button onClick={handleSubmit} disabled={submitting || answered < total}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm transition flex items-center justify-center gap-2">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Target size={18} />}
          {submitting ? "Submitting..." : answered < total ? `Answer all ${total} questions` : "Submit Quiz"}
        </button>
      </div>
    );
  }

  if (result) {
    const pct = result.percentage; const passed = result.passed;
    return (
      <div className="text-center py-8 space-y-5">
        <div className={`w-24 h-24 rounded-3xl mx-auto flex items-center justify-center ${passed ? "bg-emerald-50" : "bg-red-50"}`}>
          {passed ? <Trophy size={40} className="text-emerald-500" /> : <AlertCircle size={40} className="text-red-400" />}
        </div>
        <div>
          <p className="text-4xl font-black text-slate-900">{pct}%</p>
          <p className={`text-sm font-bold mt-1 ${passed ? "text-emerald-600" : "text-red-500"}`}>{passed ? "Passed!" : "Not quite — try again"}</p>
          <p className="text-xs text-slate-400 mt-1">{result.score}/{result.total} correct</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setResult(null); setActive(null); }} className="flex-1 border border-slate-200 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition">Back</button>
          {!passed && <button onClick={() => startQuiz(activeQuiz)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition">Try Again</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const attempt = attempts[quiz.id];
        const pct = attempt ? Math.round((attempt.score / (quiz.questions?.length || 1)) * 100) : null;
        return (
          <div key={quiz.id} className="border border-slate-100 rounded-2xl p-5 hover:border-blue-100 hover:bg-blue-50/20 transition">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2"><HelpCircle size={16} className="text-blue-500 shrink-0" /><h4 className="font-black text-slate-800">{quiz.title}</h4></div>
                <p className="text-xs text-slate-400 mt-0.5">{quiz.questions?.length || 0} questions</p>
                {attempt && <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${pct >= 70 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-500"}`}>{pct}% — {pct >= 70 ? "Passed" : "Failed"}</span>}
              </div>
              {isEnrolled
                ? <button onClick={() => startQuiz(quiz)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition shrink-0 ${attempt ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>{attempt ? "Retake" : "Start Quiz"}</button>
                : <span className="flex items-center gap-1 text-xs text-slate-400 font-semibold px-3 py-2 bg-slate-50 rounded-xl"><Lock size={12} /> Enroll to take</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ReviewsSection = ({ courseId, isEnrolled, userId }) => {
  const [reviews,   setReviews]   = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [myRating,  setMyRating]  = useState(0);
  const [myComment, setMyComment] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState(null);

  useEffect(() => {
    API.get(`/reviews/course/${courseId}`)
      .then((r) => {
        const data = r.data || {};
        const list = Array.isArray(data) ? data : (data.reviews || []);
        setReviews(list);
        setAvgRating(data.averageRating || (list.length ? (list.reduce((a, r) => a + r.rating, 0) / list.length).toFixed(1) : 0));
        setTotal(data.totalReviews || list.length);
      }).catch(console.error).finally(() => setLoading(false));
  }, [courseId]);

  const myReview = reviews.find((r) => r.userId === userId);
  useEffect(() => { if (myReview) { setMyRating(myReview.rating); setMyComment(myReview.comment || ""); } }, [myReview?.id]);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!myRating) { showToast("Please select a rating", "error"); return; }
    setSaving(true);
    try {
      const res = await API.post("/reviews", { courseId, rating: myRating, comment: myComment });
      const newReview = res.data.review;
      setReviews((p) => [newReview, ...p.filter((r) => r.userId !== userId)]);
      showToast(myReview ? "Review updated!" : "Review submitted!");
    } catch (err) { showToast(err.response?.data?.message || "Failed", "error"); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="space-y-3">{[1,2].map((i) => <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />)}</div>;

  return (
    <div className="space-y-6">
      {toast && <div className={`px-4 py-3 rounded-xl text-sm font-bold ${toast.type === "error" ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>{toast.msg}</div>}
      {total > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-5">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-slate-900">{avgRating}</p>
            <StarDisplay rating={avgRating} />
            <p className="text-xs text-slate-400 mt-1">{total} review{total !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-2">{star}</span>
                  <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                  <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${total > 0 ? (count/total)*100 : 0}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-400 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isEnrolled && (
        <div className="border border-slate-200 rounded-2xl p-5">
          <h4 className="font-black text-slate-900 mb-4">{myReview ? "Your Review" : "Leave a Review"}</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <StarPicker value={myRating} onChange={setMyRating} />
            <textarea value={myComment} onChange={(e) => setMyComment(e.target.value)} placeholder="Share your experience..." rows={3}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" />
            <button type="submit" disabled={saving || !myRating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
              {saving ? "Saving..." : myReview ? "Update Review" : "Submit Review"}
            </button>
          </form>
        </div>
      )}
      {!reviews.length ? (
        <div className="text-center py-10"><Star size={36} className="text-slate-200 mx-auto mb-3" /><p className="font-bold text-slate-400">No reviews yet</p></div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className={`border rounded-2xl p-4 ${r.userId === userId ? "border-blue-200 bg-blue-50/30" : "border-slate-100"}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-black text-sm shrink-0">
                  {r.user?.avatarUrl ? <img src={r.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : r.user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-slate-800 text-sm">{r.user?.fullName || "Student"}</span>
                    <StarDisplay rating={r.rating} size={12} />
                  </div>
                  {r.comment && <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{r.comment}</p>}
                  <p className="text-[10px] text-slate-300 mt-2">{new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CourseDetail = () => {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const { user }    = useAuth();

  const [course,          setCourse]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [lessons,         setLessons]         = useState([]);
  const [isEnrolled,      setIsEnrolled]      = useState(false);
  const [enrolling,       setEnrolling]       = useState(false);
  const [addingToCart,    setAddingToCart]    = useState(false);
  const [selectedLesson,  setSelectedLesson]  = useState(null);
  const [progress,        setProgress]        = useState({ percentage: 0, completedLessonIds: [] });
  const [completingId,    setCompletingId]    = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [activeTab,       setActiveTab]       = useState("curriculum");

  useEffect(() => {
    setLoading(true);
    API.get(`/courses/${id}`)
      .then((r) => { const data = r.data?.course || r.data; setCourse(data); setLessons(data?.lessons || []); })
      .catch(() => navigate("/courses"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!user || !id) return;
    API.get("/enrollments/my")
      .then((r) => setIsEnrolled((Array.isArray(r.data) ? r.data : []).some((e) => e.courseId === id || e.course?.id === id)))
      .catch(console.error);
  }, [user, id]);

  useEffect(() => {
    if (!user || !isEnrolled || !id) return;
    API.get(`/progress/${id}`)
      .then((r) => { const d = r.data || {}; setProgress({ percentage: d.percentage || 0, completedLessonIds: d.completedLessonIds || [] }); })
      .catch(console.error);
  }, [user, isEnrolled, id]);

  const completedSet = new Set(progress.completedLessonIds);
  const isFree     = !course?.price || course.price === 0;
  const isOwner    = user?.id === course?.instructor?.id;
  const canAccess  = isEnrolled || isOwner || user?.role === "ADMIN";

  const handleMarkComplete = async (lessonId) => {
    if (completedSet.has(lessonId)) return;
    setCompletingId(lessonId);
    try {
      const res = await API.post("/progress/complete", { lessonId });
      const d = res.data;
      setProgress({ percentage: d.percentage, completedLessonIds: d.completedLessonIds || [] });
      if (d.isCourseComplete) { setSelectedLesson(null); setShowCelebration(true); }
      else {
        const idx = lessons.findIndex((l) => l.id === lessonId);
        const next = lessons[idx + 1];
        if (next) setTimeout(() => setSelectedLesson(next), 600); else setSelectedLesson(null);
      }
    } catch (err) { console.error(err); }
    finally { setCompletingId(null); }
  };

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    setEnrolling(true);
    try { await API.post("/enrollments", { courseId: id }); setIsEnrolled(true); }
    catch (err) { console.error(err); } finally { setEnrolling(false); }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/auth"); return; }
    setAddingToCart(true);
    try { await API.post("/cart", { courseId: id }); navigate("/cart"); }
    catch (err) { console.error(err); } finally { setAddingToCart(false); }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
        <div className="text-center"><Loader2 size={40} className="animate-spin text-blue-500 mx-auto mb-4" /><p className="text-slate-400 font-semibold">Loading course...</p></div>
      </div>
    </Layout>
  );
  if (!course) return null;

  const tabs = [
    { key: "curriculum", label: "Curriculum", icon: <BookOpen size={14} /> },
    { key: "quizzes",    label: "Quizzes",    icon: <HelpCircle size={14} /> },
    { key: "reviews",    label: "Reviews",    icon: <Star size={14} /> },
  ];

  return (
    <Layout>
      {selectedLesson && (
        <>
          <div onClick={() => setSelectedLesson(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
          <div className="fixed inset-x-4 top-[5%] bottom-[5%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-3xl z-50 flex flex-col bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lesson {lessons.findIndex((l) => l.id === selectedLesson.id) + 1}</p>
                <h3 className="font-black text-slate-900 truncate">{selectedLesson.title}</h3>
              </div>
              <button onClick={() => setSelectedLesson(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 ml-3 shrink-0"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {selectedLesson.type === "VIDEO"
                ? selectedLesson.content?.includes("youtube") || selectedLesson.content?.includes("youtu.be")
                  ? <iframe className="w-full aspect-video rounded-2xl" src={selectedLesson.content.replace("watch?v=","embed/").replace("youtu.be/","youtube.com/embed/")} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                  : <video src={selectedLesson.content} controls className="w-full rounded-2xl bg-black" />
                : <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedLesson.content}</div>}
            </div>
            {canAccess && (
              <div className="px-5 py-4 border-t border-slate-100 shrink-0">
                {completedSet.has(selectedLesson.id)
                  ? <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 font-bold text-sm bg-emerald-50 rounded-xl"><CheckCircle size={16} /> Completed</div>
                  : <button onClick={() => handleMarkComplete(selectedLesson.id)} disabled={!!completingId}
                      className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition">
                      {completingId === selectedLesson.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      {completingId === selectedLesson.id ? "Marking..." : "Mark as Complete"}
                    </button>}
              </div>
            )}
          </div>
        </>
      )}

      {showCelebration && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-sm z-50">
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-rose-500 rounded-3xl p-8 text-white text-center shadow-2xl">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-black mb-1">Course Complete!</h2>
              <p className="text-white/80 text-sm mb-2">You have finished every lesson.</p>
              <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 px-4 py-2 rounded-full text-sm font-bold mb-6"><Award size={14} /> Certificate Earned</div>
              <div className="flex flex-col gap-3">
                <button onClick={() => { setShowCelebration(false); navigate("/StudentDashboard"); }} className="w-full py-3 bg-white text-orange-600 rounded-2xl font-black hover:bg-orange-50 transition text-sm">View Certificate</button>
                <button onClick={() => setShowCelebration(false)} className="w-full py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-2xl font-bold text-sm transition">Stay on Course</button>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="min-h-screen bg-white">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 pt-28 pb-12 px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-10 items-start">
            <div className="flex-1 min-w-0">
              {course.category?.name && <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-4">{course.category.name}</span>}
              <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-4">{course.title}</h1>
              <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-xl">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-6">
                {course.instructor && (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                      {course.instructor.avatarUrl ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" /> : course.instructor.fullName?.charAt(0)}
                    </div>
                    <span>{course.instructor.fullName}</span>
                  </div>
                )}
                <span className="flex items-center gap-1"><BookOpen size={14} /> {lessons.length} lessons</span>
                <span className="flex items-center gap-1"><Users size={14} /> {course._count?.enrollments || 0} enrolled</span>
              </div>
              {isEnrolled && (
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-white">Your Progress</span><span className="text-xs font-black text-blue-300">{progress.percentage}%</span></div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-blue-400 rounded-full transition-all duration-700" style={{ width: `${progress.percentage}%` }} /></div>
                  <p className="text-xs text-slate-400 mt-1.5">{progress.completedLessonIds.length}/{lessons.length} lessons completed</p>
                </div>
              )}
            </div>
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                {course.thumbnail && <img src={course.thumbnail} alt="" className="w-full h-44 object-cover" />}
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">{isFree ? "Free" : `$${course.price}`}</span>
                  </div>
                  {canAccess ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
                      <CheckCircle size={20} className="text-emerald-500 shrink-0" />
                      <div><p className="font-black text-emerald-700 text-sm">You are enrolled!</p><p className="text-xs text-emerald-500">{progress.percentage}% complete</p></div>
                    </div>
                  ) : isFree ? (
                    <button onClick={handleEnroll} disabled={enrolling}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-2xl font-black text-sm transition flex items-center justify-center gap-2">
                      {enrolling ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                      {enrolling ? "Enrolling..." : "Enroll for Free"}
                    </button>
                  ) : (
                    <button onClick={handleAddToCart} disabled={addingToCart}
                      className="w-full py-4 bg-slate-900 hover:bg-blue-600 disabled:opacity-60 text-white rounded-2xl font-black text-sm transition flex items-center justify-center gap-2">
                      {addingToCart ? <Loader2 size={18} className="animate-spin" /> : <ShoppingCart size={18} />}
                      {addingToCart ? "Adding..." : "Add to Cart"}
                    </button>
                  )}
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-center gap-2"><CheckCircle size={13} className="text-emerald-500" /> {lessons.length} lessons</li>
                    <li className="flex items-center gap-2"><CheckCircle size={13} className="text-emerald-500" /> Full lifetime access</li>
                    <li className="flex items-center gap-2"><CheckCircle size={13} className="text-emerald-500" /> Certificate of completion</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 sticky top-[57px] bg-white z-30">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex gap-1">
              {tabs.map(({ key, label, icon }) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-5 py-4 font-bold text-sm border-b-2 transition ${activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="max-w-3xl">
            {activeTab === "curriculum" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div><h2 className="text-xl font-black text-slate-900">Course Content</h2><p className="text-xs text-slate-400 mt-0.5">{lessons.length} lessons</p></div>
                </div>
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => {
                    const isCompleted = completedSet.has(lesson.id);
                    const locked = !canAccess && idx > 0;
                    return (
                      <div key={lesson.id} onClick={() => !locked && setSelectedLesson(lesson)}
                        className={`flex items-center gap-4 p-4 rounded-2xl border transition group
                          ${locked ? "border-slate-100 opacity-60 cursor-not-allowed" : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 cursor-pointer"}
                          ${isCompleted ? "bg-emerald-50/30 border-emerald-100" : ""}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${isCompleted ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600"}`}>
                          {isCompleted ? <CheckCircle size={16} /> : locked ? <Lock size={14} /> : idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {lesson.type === "VIDEO" ? <Video size={13} className={isCompleted ? "text-emerald-400" : "text-violet-400"} /> : <FileText size={13} className={isCompleted ? "text-emerald-400" : "text-blue-400"} />}
                            <p className={`font-bold text-sm truncate ${isCompleted ? "text-emerald-700 line-through decoration-emerald-300" : "text-slate-800"}`}>{lesson.title}</p>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{lesson.type}</p>
                        </div>
                        {!locked && <div className={`shrink-0 ${isCompleted ? "text-emerald-400" : "text-slate-300 group-hover:text-blue-400"}`}>{isCompleted ? <CheckCircle size={18} /> : <Play size={16} />}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === "quizzes" && (
              <div>
                <div className="mb-6"><h2 className="text-xl font-black text-slate-900">Quizzes</h2><p className="text-xs text-slate-400 mt-0.5">Test your knowledge</p></div>
                <QuizSection courseId={id} isEnrolled={canAccess} />
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <div className="mb-6"><h2 className="text-xl font-black text-slate-900">Student Reviews</h2><p className="text-xs text-slate-400 mt-0.5">{isEnrolled ? "Share your experience" : "Enroll to leave a review"}</p></div>
                <ReviewsSection courseId={id} isEnrolled={canAccess} userId={user?.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;
