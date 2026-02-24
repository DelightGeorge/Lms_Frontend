import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  Star, ArrowLeft, BookOpen, Clock, Users, CheckCircle,
  Play, Globe, Award, Loader2, AlertCircle, ShoppingCart,
  X, FileText, Video, ChevronRight, ChevronDown,
} from "lucide-react";
import { getCourseById } from "../../services/courseService";
import { useAuth } from "../../Context/AuthContext";


const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Turn any YouTube / Vimeo / raw video URL into an embeddable src */
const getEmbedUrl = (url = "") => {
  if (!url) return null;

  // YouTube
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`;

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;

  // Raw video file (mp4, webm, etc.) — return as-is for <video> tag
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return null; // handled separately

  // Cloudinary video
  if (url.includes("cloudinary.com")) return null; // handled separately

  return null; // fallback: use <video>
};

const isRawVideo = (url = "") =>
  /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || url.includes("cloudinary.com");

// ── Lesson Viewer Modal ───────────────────────────────────────────────────────

const LessonViewer = ({ lesson, onClose, onPrev, onNext, hasPrev, hasNext }) => {
  if (!lesson) return null;

  const embedUrl = lesson.type === "VIDEO" ? getEmbedUrl(lesson.videoUrl || lesson.content) : null;
  const rawVideo = lesson.type === "VIDEO" && isRawVideo(lesson.videoUrl || lesson.content);
  const videoSrc = lesson.videoUrl || lesson.content;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {lesson.type === "VIDEO" ? (
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                  <Video size={15} className="text-violet-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText size={15} className="text-blue-600" />
                </div>
              )}
              <h2 className="font-black text-slate-900 truncate">{lesson.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition shrink-0 ml-3"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {lesson.type === "VIDEO" ? (
              <div className="bg-black">
                {embedUrl ? (
                  /* YouTube / Vimeo embed */
                  <div className="relative" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      src={embedUrl}
                      title={lesson.title}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : rawVideo ? (
                  /* Native video player */
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    className="w-full max-h-[60vh]"
                    style={{ background: "#000" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  /* Fallback: open in new tab */
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <Play size={48} className="text-white/30" />
                    <p className="text-white/60 text-sm">Cannot embed this video directly.</p>
                    <a
                      href={videoSrc}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition"
                    >
                      Open Video ↗
                    </a>
                  </div>
                )}
              </div>
            ) : (
              /* TEXT lesson */
              <div className="p-6 sm:p-8">
                <div
                  className="prose prose-slate max-w-none text-sm leading-relaxed text-slate-700 whitespace-pre-wrap"
                >
                  {lesson.content || <span className="text-slate-400 italic">No content available.</span>}
                </div>
              </div>
            )}
          </div>

          {/* Footer nav */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 shrink-0 bg-slate-50">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ← Previous
            </button>
            <span className="text-xs text-slate-400 font-medium">
              {lesson.type} lesson
            </span>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-white border border-slate-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────

const CourseDetail = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [course,     setCourse]   = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [error,      setError]    = useState("");

  // Lesson viewer state
  const [activeLessonIdx, setActiveLessonIdx] = useState(null);

  useEffect(() => {
    getCourseById(id)
      .then((r) => setCourse(r.data))
      .catch(() => setError("Course not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = () => {
    if (!user) { navigate("/auth"); return; }
    navigate("/cart");
  };

  const openLesson = (idx) => setActiveLessonIdx(idx);
  const closeLesson = () => setActiveLessonIdx(null);
  const prevLesson = () => setActiveLessonIdx((i) => Math.max(0, i - 1));
  const nextLesson = () => setActiveLessonIdx((i) => Math.min((course?.lessons?.length ?? 1) - 1, i + 1));

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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <p className="font-bold text-slate-600 text-xl">{error || "Course not found"}</p>
        <Link to="/courses" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
          Back to Courses
        </Link>
      </div>
    </Layout>
  );

  const imgSrc = course.thumbnail || placeholderImgs[parseInt(id) % placeholderImgs.length] || placeholderImgs[0];

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50">
        {/* Lesson Viewer Modal */}
        {activeLesson && (
          <LessonViewer
            lesson={activeLesson}
            onClose={closeLesson}
            onPrev={prevLesson}
            onNext={nextLesson}
            hasPrev={activeLessonIdx > 0}
            hasNext={activeLessonIdx < (course.lessons?.length ?? 0) - 1}
          />
        )}

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <Link to="/courses" className="inline-flex items-center gap-2 text-slate-300 hover:text-white font-semibold mb-6 text-sm transition">
              <ArrowLeft size={16} /> Back to Courses
            </Link>

            <div className="grid lg:grid-cols-3 gap-10 items-start">
              {/* Info */}
              <div className="lg:col-span-2 space-y-4">
                {course.category?.name && (
                  <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold px-3 py-1 rounded-full">
                    {course.category.name}
                  </span>
                )}
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight">
                  {course.title}
                </h1>
                <p className="text-slate-300 text-base leading-relaxed">
                  {course.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Star size={15} className="text-amber-400" fill="currentColor" />
                    <span className="font-black text-amber-400">4.8</span>
                    <span className="text-slate-400">(1.2k reviews)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={14} className="text-blue-400" />
                    {course._count?.enrollments || 0} students
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe size={14} className="text-emerald-400" />
                    English
                  </span>
                </div>
                <p className="text-slate-400 text-sm">
                  Instructor: <span className="text-white font-bold">{course.instructor?.fullName || "Unknown"}</span>
                </p>
              </div>

              {/* Price card (desktop) */}
              <div className="hidden lg:block bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden">
                <img src={imgSrc} alt={course.title} className="w-full h-48 object-cover" />
                <div className="p-6 space-y-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black">
                      {course.price === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        `$${course.price}`
                      )}
                    </span>
                  </div>
                  <button
                    onClick={handleEnroll}
                    className="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 text-sm"
                  >
                    {user ? "Enroll Now" : "Sign in to Enroll"}
                  </button>
                  <button
                    onClick={() => navigate("/cart")}
                    className="w-full border-2 border-slate-200 hover:bg-slate-50 font-bold py-3.5 rounded-xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} /> Add to Cart
                  </button>
                  <p className="text-xs text-slate-400 text-center">30-Day Money-Back Guarantee</p>
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    {[
                      "Full lifetime access",
                      "Certificate of completion",
                      "Access on all devices",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-slate-600">
                        <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">

              {/* What you'll learn */}
              <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">What you'll learn</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    "Core concepts and fundamentals",
                    "Real-world project experience",
                    "Industry best practices",
                    "Problem-solving techniques",
                    "Advanced techniques and tips",
                    "Career-ready skills",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle size={15} className="text-emerald-500 mt-0.5 shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              {/* Course description */}
              <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-4">Course Description</h2>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {course.description}
                </p>
                {course.description && course.description.length > 200 && (
                  <p className="text-slate-600 leading-relaxed text-sm mt-3">
                    This course is designed for learners at all levels. Whether you're just starting
                    out or looking to deepen your expertise, you'll find practical, hands-on content
                    that prepares you for real-world challenges. Join thousands of students who have
                    already transformed their careers with this course.
                  </p>
                )}
              </section>

              {/* ── Lessons (clickable) ── */}
              {course.lessons?.length > 0 && (
                <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                  <h2 className="text-xl font-extrabold text-slate-900 mb-5">
                    Course Content
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      ({course.lessons.length} lessons)
                    </span>
                  </h2>
                  <div className="space-y-2">
                    {course.lessons.map((lesson, idx) => (
                      <button
                        key={lesson.id}
                        onClick={() => openLesson(idx)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition group text-left"
                      >
                        <div className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shrink-0 transition">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate group-hover:text-blue-700 transition">
                            {lesson.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {lesson.type === "VIDEO" ? "Video lesson" : "Text lesson"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lesson.type === "VIDEO" ? (
                            <div className="w-7 h-7 rounded-full bg-violet-100 group-hover:bg-violet-200 flex items-center justify-center transition">
                              <Play size={12} className="text-violet-600 ml-0.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center transition">
                              <FileText size={12} className="text-blue-600" />
                            </div>
                          )}
                          <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-400 transition" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Instructor */}
              <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                <h2 className="text-xl font-extrabold text-slate-900 mb-5">Your Instructor</h2>
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shrink-0 overflow-hidden">
                    {course.instructor?.avatarUrl
                      ? <img src={course.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : course.instructor?.fullName?.charAt(0)
                    }
                  </div>
                  <div>
                    <p className="font-black text-slate-800 text-lg">{course.instructor?.fullName}</p>
                    <p className="text-sm text-slate-400 mb-2">{course.instructor?.email}</p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Expert instructor with years of industry experience. Passionate about teaching
                      and helping students achieve their learning goals.
                    </p>
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky price card (mobile + sidebar repeat) */}
            <div className="lg:hidden">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                <img src={imgSrc} alt={course.title} className="w-full h-40 object-cover rounded-xl" />
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-black text-slate-900">
                    {course.price === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : `$${course.price}`}
                  </span>
                </div>
                <button onClick={handleEnroll}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition text-sm">
                  {user ? "Enroll Now" : "Sign in to Enroll"}
                </button>
                <button onClick={() => navigate("/cart")}
                  className="w-full border-2 border-slate-200 font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2">
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </div>

            {/* Sticky sidebar (desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-24 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <h3 className="font-bold text-slate-700 text-sm">Course includes:</h3>
                {[
                  { icon: <BookOpen size={14} />,  text: `${course.lessons?.length || 0} lessons` },
                  { icon: <Clock size={14} />,     text: "Lifetime access" },
                  { icon: <Globe size={14} />,     text: "Access on all devices" },
                  { icon: <Award size={14} />,     text: "Certificate of completion" },
                  { icon: <Users size={14} />,     text: `${course._count?.enrollments || 0} students enrolled` },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-blue-500">{icon}</span> {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CourseDetail;