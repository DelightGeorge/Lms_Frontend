import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "../../shared/Layout/Layout";
import {
  Star, ArrowLeft, BookOpen, Clock, Users, CheckCircle,
  Play, Globe, Award, Loader2, AlertCircle, ShoppingCart,
} from "lucide-react";
import { getCourseById } from "../../services/courseService";
import { useAuth } from "../../Context/AuthContext";


const placeholderImgs = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
];

const CourseDetail = () => {
  const { id }       = useParams();
  const { user }     = useAuth();
  const navigate     = useNavigate();
  const [course,     setCourse]   = useState(null);
  const [loading,    setLoading]  = useState(true);
  const [error,      setError]    = useState("");

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

              {/* Lessons */}
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
                      <div key={lesson.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-black shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-700 truncate">{lesson.title}</p>
                        </div>
                        <Play size={14} className="text-slate-300 shrink-0" />
                      </div>
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