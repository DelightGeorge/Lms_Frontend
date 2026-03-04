import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  Star, ArrowLeft, BookOpen, Clock, Users, CheckCircle,
  Play, Globe, Award, Loader2, AlertCircle, ShoppingCart,
  X, FileText, Video, ChevronRight, Lock, Unlock,
  Shield, CreditCard, Zap, Eye, Trophy,
} from "lucide-react";
import { getCourseById } from "../../services/courseService";
import { enrollFree, checkEnrollment } from "../../services/enrollmentService";
import { initializePayment } from "../../services/paymentService";
import { useAuth } from "../../Context/AuthContext";
import API from "../../services/api";

const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
];

const getEmbedUrl = (url = "") => {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
};
const isRawVideo = (url = "") =>
  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com");

// ── Progress Ring ─────────────────────────────────────────
const ProgressRing = ({ pct, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90" style={{ minWidth: size }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={pct === 100 ? "#10b981" : "#3b82f6"}
        strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
    </svg>
  );
};

// ── Course Complete Celebration Modal ─────────────────────
const CompletionModal = ({ course, onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]" onClick={onClose} />
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-center">
        <div className="bg-gradient-to-br from-emerald-400 to-blue-500 p-8">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-1">Course Complete! 🎉</h2>
          <p className="text-white/80 text-sm">You've finished every lesson</p>
        </div>
        <div className="p-8 space-y-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Congratulations on completing <span className="font-black text-slate-900">"{course?.title}"</span>!
            Your certificate of completion is now available.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
            <Award size={20} className="text-amber-500 shrink-0" />
            <div className="text-left">
              <p className="font-black text-slate-800 text-sm">Certificate Earned</p>
              <p className="text-xs text-slate-500">View it in your dashboard</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose}
              className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
              Keep Learning
            </button>
            <Link to="/StudentDashboard"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-sm font-black transition flex items-center justify-center gap-2">
              <Award size={14} /> My Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  </>
);

// ── Lesson Viewer Modal ───────────────────────────────────
const LessonViewer = ({
  lesson, onClose, onPrev, onNext, hasPrev, hasNext,
  isCompleted, onMarkComplete, markingComplete, enrolled,
}) => {
  if (!lesson) return null;
  const videoSrc = lesson.videoUrl || lesson.content;
  const embedUrl = lesson.type === "VIDEO" ? getEmbedUrl(videoSrc) : null;
  const rawVideo = lesson.type === "VIDEO" && isRawVideo(videoSrc);

  return (
    <>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                lesson.type === "VIDEO" ? "bg-violet-100" : "bg-blue-100"
              }`}>
                {lesson.type === "VIDEO"
                  ? <Video size={15} className="text-violet-600" />
                  : <FileText size={15} className="text-blue-600" />
                }
              </div>
              <div className="min-w-0">
                <h2 className="font-black text-slate-900 text-sm truncate">{lesson.title}</h2>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{lesson.type} Lesson</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mark complete button — only for enrolled students */}
              {enrolled && (
                <button
                  onClick={onMarkComplete}
                  disabled={isCompleted || markingComplete}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition
                    ${isCompleted
                      ? "bg-emerald-100 text-emerald-600 cursor-default"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                >
                  {markingComplete
                    ? <Loader2 size={12} className="animate-spin" />
                    : <CheckCircle size={12} />
                  }
                  {isCompleted ? "Completed" : "Mark Complete"}
                </button>
              )}
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {lesson.type === "VIDEO" ? (
              <div className="bg-black">
                {embedUrl ? (
                  <div className="relative" style={{ paddingBottom: "56.25%" }}>
                    <iframe src={embedUrl} title={lesson.title}
                      className="absolute inset-0 w-full h-full" frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen />
                  </div>
                ) : rawVideo ? (
                  <video src={videoSrc} controls autoPlay className="w-full max-h-[65vh]">
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Play size={32} className="text-white/40 ml-1" />
                    <a href={videoSrc} target="_blank" rel="noreferrer"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition">
                      Open Video ↗
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <div className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                  {lesson.content || <span className="text-slate-400 italic">No content available.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 shrink-0 bg-slate-50/80">
            <button onClick={onPrev} disabled={!hasPrev}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
              ← Prev
            </button>
            {enrolled && !isCompleted && (
              <button onClick={onMarkComplete} disabled={markingComplete}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-60">
                {markingComplete ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                Mark as Complete
              </button>
            )}
            <button onClick={onNext} disabled={!hasNext}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed">
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Paywall Modal ─────────────────────────────────────────
const PaywallModal = ({ course, onClose, onPay, onAddToCart, paying, addingToCart }) => (
  <>
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Lock size={26} className="text-amber-500" />
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400"><X size={18} /></button>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">This lesson is locked</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Enroll in <span className="font-bold text-slate-700">"{course?.title}"</span> to access all lessons.
          </p>
          <div className="space-y-3">
            <button onClick={onPay} disabled={paying}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-2 text-sm">
              {paying ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
              {paying ? "Redirecting..." : `Pay $${course?.price} · Enroll Now`}
            </button>
            <button onClick={onAddToCart} disabled={addingToCart}
              className="w-full border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-60 font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
              {addingToCart ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
              Add to Cart
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-4 flex items-center justify-center gap-1">
            <Shield size={11} /> Secured by Paystack
          </p>
        </div>
      </div>
    </div>
  </>
);

// ── Main ─────────────────────────────────────────────────
const CourseDetail = () => {
  const { id }   = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [course,          setCourse]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState("");
  const [enrolled,        setEnrolled]        = useState(false);
  const [enrolling,       setEnrolling]       = useState(false);
  const [addingToCart,    setAddingToCart]    = useState(false);
  const [paying,          setPaying]          = useState(false);
  const [toast,           setToast]           = useState(null);
  const [activeLessonIdx, setActiveLessonIdx] = useState(null);
  const [paywallOpen,     setPaywallOpen]     = useState(false);
  const [completedIds,    setCompletedIds]    = useState(new Set());
  const [markingComplete, setMarkingComplete] = useState(false);
  const [progress,        setProgress]        = useState({ pct: 0, completed: 0, total: 0 });
  const [showCompletion,  setShowCompletion]  = useState(false);

  const isAdmin    = user?.role === "ADMIN";
  const isInstructor = user?.role === "INSTRUCTOR";
  const canViewAll = isAdmin || isInstructor || enrolled;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch course + enrollment + progress
  useEffect(() => {
    getCourseById(id)
      .then((r) => setCourse(r.data))
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));

    if (user) {
      checkEnrollment(id)
        .then((r) => setEnrolled(r.data.enrolled))
        .catch(console.error);
    }
  }, [id, user]);

  // Fetch progress when enrolled
  useEffect(() => {
    if (!enrolled || !user || !id) return;
    API.get(`/progress/${id}`)
      .then((r) => {
        setCompletedIds(new Set(r.data.completedLessonIds || []));
        setProgress({
          pct:       r.data.percentage || 0,
          completed: r.data.completedLessons || 0,
          total:     r.data.totalLessons || 0,
        });
      })
      .catch(console.error);
  }, [enrolled, user, id]);

  // Mark lesson complete
  const handleMarkComplete = useCallback(async () => {
    const lesson = course?.lessons?.[activeLessonIdx];
    if (!lesson || completedIds.has(lesson.id) || markingComplete) return;

    setMarkingComplete(true);
    try {
      const res = await API.post("/progress/complete", { lessonId: lesson.id });
      const { isCourseComplete, completedLessons, totalLessons, percentage } = res.data;

      setCompletedIds((prev) => new Set([...prev, lesson.id]));
      setProgress({ pct: percentage, completed: completedLessons, total: totalLessons });

      if (isCourseComplete) {
        setShowCompletion(true);
      } else {
        showToast("Lesson complete! ✓");
        // Auto-advance to next lesson
        if (activeLessonIdx < (course.lessons.length - 1)) {
          setTimeout(() => setActiveLessonIdx((i) => i + 1), 800);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to mark complete", "error");
    } finally {
      setMarkingComplete(false);
    }
  }, [course, activeLessonIdx, completedIds, markingComplete]);

  const handleEnroll = async () => {
    if (!user) { navigate("/auth"); return; }
    if (enrolled) { navigate("/StudentDashboard"); return; }

    if (course.price === 0) {
      setEnrolling(true);
      try {
        await enrollFree(course.id);
        setEnrolled(true);
        showToast("Enrolled successfully! 🎉");
      } catch (err) {
        showToast(err.response?.data?.message || "Failed to enroll", "error");
      } finally {
        setEnrolling(false);
      }
    } else {
      setPaying(true);
      try {
        const res = await initializePayment(course.id);
        window.location.href = res.data.authorizationUrl;
      } catch (err) {
        showToast(err.response?.data?.message || "Payment failed", "error");
        setPaying(false);
      }
    }
  };

  const handleAddToCart = async () => {
    if (!user) { navigate("/auth"); return; }
    setAddingToCart(true);
    try {
      await API.post("/cart", { courseId: course.id });
      showToast("Added to cart!");
    } catch (err) {
      showToast(err.response?.data?.message || "Already in cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleLessonClick = (idx) => {
    if (!user) { navigate("/auth"); return; }
    if (canViewAll || course.price === 0) { setActiveLessonIdx(idx); return; }
    setPaywallOpen(true);
  };

  const activeLesson = activeLessonIdx !== null ? course?.lessons?.[activeLessonIdx] : null;

  if (loading) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    </Layout>
  );

  if (error || !course) return (
    <Layout>
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertCircle size={32} className="text-red-400" />
        <p className="font-black text-slate-700 text-xl">{error || "Course not found"}</p>
        <Link to="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm">Back to Courses</Link>
      </div>
    </Layout>
  );

  const imgSrc = course.thumbnail || placeholderImgs[Math.abs(id?.charCodeAt(0) || 0) % placeholderImgs.length];

  const enrollBtnLabel = () => {
    if (enrolling || paying) return <><Loader2 size={16} className="animate-spin" /> Processing...</>;
    if (enrolled)            return <><Unlock size={16} /> Go to Dashboard</>;
    if (course.price === 0)  return <><Zap size={16} /> Enroll for Free</>;
    return <><CreditCard size={16} /> Pay ${course.price}</>;
  };

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      {activeLesson && (
        <LessonViewer
          lesson={activeLesson}
          onClose={() => setActiveLessonIdx(null)}
          onPrev={() => setActiveLessonIdx((i) => Math.max(0, i - 1))}
          onNext={() => setActiveLessonIdx((i) => Math.min((course?.lessons?.length ?? 1) - 1, i + 1))}
          hasPrev={activeLessonIdx > 0}
          hasNext={activeLessonIdx < (course.lessons?.length ?? 0) - 1}
          isCompleted={completedIds.has(activeLesson.id)}
          onMarkComplete={handleMarkComplete}
          markingComplete={markingComplete}
          enrolled={enrolled}
        />
      )}

      {paywallOpen && (
        <PaywallModal
          course={course}
          onClose={() => setPaywallOpen(false)}
          onPay={() => { setPaywallOpen(false); handleEnroll(); }}
          onAddToCart={() => { setPaywallOpen(false); handleAddToCart(); }}
          paying={paying}
          addingToCart={addingToCart}
        />
      )}

      {showCompletion && (
        <CompletionModal course={course} onClose={() => setShowCompletion(false)} />
      )}

      <div className="min-h-screen bg-slate-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white py-14 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-6xl mx-auto relative">
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <Link to="/courses"
                className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white font-semibold text-sm transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg">
                <ArrowLeft size={14} /> Courses
              </Link>
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-red-500/20 border border-red-400/30 text-red-300 px-3 py-1.5 rounded-lg">
                  <Shield size={12} /> Admin View
                </span>
              )}
              {enrolled && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1.5 rounded-lg">
                  <CheckCircle size={12} /> Enrolled
                </span>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2 space-y-4">
                {course.category?.name && (
                  <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                    {course.category.name}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">{course.title}</h1>
                <p className="text-slate-300 text-base leading-relaxed max-w-2xl">{course.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Users size={13} className="text-blue-400" />{course._count?.enrollments || 0} students
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <BookOpen size={13} className="text-violet-400" />{course.lessons?.length || 0} lessons
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Globe size={13} className="text-emerald-400" />English
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  By <span className="text-white font-bold">{course.instructor?.fullName || "Unknown"}</span>
                </p>

                {/* Progress bar — enrolled students only */}
                {enrolled && progress.total > 0 && (
                  <div className="bg-white/10 rounded-2xl p-4 mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-white">Your Progress</span>
                      <span className="text-sm font-black text-emerald-400">{progress.pct}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${progress.pct}%`,
                          background: progress.pct === 100
                            ? "linear-gradient(90deg, #10b981, #34d399)"
                            : "linear-gradient(90deg, #3b82f6, #818cf8)",
                        }}
                      />
                    </div>
                    <p className="text-xs text-white/60 mt-1.5">
                      {progress.completed} of {progress.total} lessons completed
                      {progress.pct === 100 && " · 🎉 Course Complete!"}
                    </p>
                  </div>
                )}
              </div>

              {/* Desktop price card */}
              <div className="hidden lg:block">
                <div className="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img src={imgSrc} alt={course.title} className="w-full h-full object-cover" />
                    {course.price === 0 && (
                      <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-black px-3 py-1 rounded-full">FREE</div>
                    )}
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black">
                        {course.price === 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
                      </span>
                    </div>
                    {enrolled && progress.total > 0 && (
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-500 font-semibold">Progress</span>
                          <span className="font-black text-blue-600">{progress.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-blue-500 rounded-full transition-all" style={{ width: `${progress.pct}%` }} />
                        </div>
                      </div>
                    )}
                    <button onClick={handleEnroll} disabled={enrolling || paying}
                      className={`w-full font-black py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-60 shadow-lg
                        ${enrolled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                      {enrollBtnLabel()}
                    </button>
                    {!enrolled && course.price > 0 && !isAdmin && (
                      <button onClick={handleAddToCart} disabled={addingToCart}
                        className="w-full border-2 border-slate-200 hover:bg-slate-50 disabled:opacity-60 font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                        {addingToCart ? <Loader2 size={14} className="animate-spin" /> : <ShoppingCart size={14} />}
                        Add to Cart
                      </button>
                    )}
                    <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                      <Shield size={11} /> 30-Day Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Lessons */}
              {course.lessons?.length > 0 && (
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">Course Content</h2>
                      <p className="text-xs text-slate-400 mt-0.5">{course.lessons.length} lessons</p>
                    </div>
                    {enrolled && progress.total > 0 && (
                      <div className="flex items-center gap-2">
                        <ProgressRing pct={progress.pct} />
                        <div className="text-right">
                          <p className="text-xs font-black text-slate-700">{progress.pct}%</p>
                          <p className="text-[10px] text-slate-400">{progress.completed}/{progress.total}</p>
                        </div>
                      </div>
                    )}
                    {canViewAll && !enrolled && (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                        <Unlock size={11} /> Full Access
                      </span>
                    )}
                  </div>

                  <div className="divide-y divide-slate-50">
                    {course.lessons.map((lesson, idx) => {
                      const isLocked    = !canViewAll && course.price > 0;
                      const isDone      = completedIds.has(lesson.id);
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(idx)}
                          className={`w-full flex items-center gap-3 px-5 py-4 transition group text-left
                            ${isLocked ? "hover:bg-amber-50/50" : isDone ? "hover:bg-emerald-50/50" : "hover:bg-blue-50/50"}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition
                            ${isDone
                              ? "bg-emerald-100 text-emerald-600"
                              : isLocked
                                ? "bg-slate-100 text-slate-400"
                                : "bg-blue-50 text-blue-600 group-hover:bg-blue-100"
                            }`}>
                            {isDone ? <CheckCircle size={14} /> : isLocked ? <Lock size={12} /> : idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold truncate transition
                              ${isDone ? "text-emerald-700 line-through opacity-60" : isLocked ? "text-slate-500" : "text-slate-700 group-hover:text-blue-700"}`}>
                              {lesson.title}
                              {isLocked && <span className="ml-2 text-[10px] text-amber-500 font-bold bg-amber-50 px-1.5 py-0.5 rounded">LOCKED</span>}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">{lesson.type === "VIDEO" ? "Video lesson" : "Text lesson"}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {isDone ? (
                              <CheckCircle size={14} className="text-emerald-500" />
                            ) : lesson.type === "VIDEO" ? (
                              <Play size={11} className="text-violet-500" />
                            ) : (
                              <FileText size={11} className="text-blue-500" />
                            )}
                            <ChevronRight size={13} className="text-slate-200 group-hover:text-blue-400 transition" />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {!canViewAll && course.price > 0 && (
                    <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-violet-50 border-t border-blue-100">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Lock size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm">{course.lessons.length} lessons locked</p>
                            <p className="text-xs text-slate-500">Enroll to unlock all content</p>
                          </div>
                        </div>
                        <button onClick={handleEnroll} disabled={paying}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shrink-0">
                          {paying ? <Loader2 size={14} className="animate-spin" /> : <CreditCard size={14} />}
                          Enroll for ${course.price}
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Resources */}
              {canViewAll && course.resources?.length > 0 && (
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-xl font-extrabold text-slate-900">Resources</h2>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {course.resources.map((res) => (
                      <a key={res.id} href={res.fileUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-3 px-5 py-4 hover:bg-blue-50/50 transition group">
                        <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <FileText size={14} className="text-violet-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 flex-1">{res.title}</p>
                        <span className="text-xs font-bold text-blue-500 group-hover:underline">Open ↗</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {/* Instructor */}
              <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">Your Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-md">
                    {course.instructor?.avatarUrl
                      ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : course.instructor?.fullName?.charAt(0)
                    }
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{course.instructor?.fullName}</p>
                    <p className="text-sm text-slate-400 mb-2">{course.instructor?.email}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Expert instructor with years of industry experience.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="lg:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
                <img src={imgSrc} alt={course.title} className="w-full h-40 object-cover rounded-xl" />
                <span className="text-2xl font-black text-slate-900 block">
                  {course.price === 0 ? <span className="text-emerald-600">Free</span> : `$${course.price}`}
                </span>
                <button onClick={handleEnroll} disabled={enrolling || paying}
                  className={`w-full font-black py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2 disabled:opacity-60
                    ${enrolled ? "bg-emerald-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                  {enrollBtnLabel()}
                </button>
              </div>

              <div className="hidden lg:block sticky top-24 space-y-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <h3 className="font-black text-slate-800 text-sm mb-4">This course includes</h3>
                  <div className="space-y-3">
                    {[
                      { icon: <BookOpen size={14} />,  text: `${course.lessons?.length || 0} lessons`,     color: "text-blue-500"    },
                      { icon: <Video size={14} />,     text: `${course.lessons?.filter(l=>l.type==="VIDEO").length || 0} video lessons`, color: "text-violet-500" },
                      { icon: <FileText size={14} />,  text: `${course.resources?.length || 0} resources`, color: "text-orange-500"  },
                      { icon: <Clock size={14} />,     text: "Lifetime access",                             color: "text-slate-500"   },
                      { icon: <Award size={14} />,     text: "Certificate on completion",                   color: "text-amber-500"   },
                      { icon: <Users size={14} />,     text: `${course._count?.enrollments || 0} enrolled`, color: "text-cyan-500"    },
                    ].map(({ icon, text, color }) => (
                      <div key={text} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <span className={color}>{icon}</span>{text}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-5 text-white">
                  <p className="font-black text-sm mb-1">Share this course</p>
                  <p className="text-xs text-slate-400 mb-3">Help others discover great content</p>
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.href); showToast("Link copied!"); }}
                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs transition">
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;