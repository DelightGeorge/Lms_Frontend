import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Award, Download, ArrowLeft, CheckCircle, BookOpen, Loader2, Share2 } from "lucide-react";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";
import API from "../services/api";

const CertificatePage = () => {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const printRef     = useRef();

  const [enrollment, setEnrollment] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [copied,     setCopied]     = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    (async () => {
      try {
        const res  = await API.get("/enrollments/my");
        const list = Array.isArray(res.data) ? res.data : [];
        const enrl = list.find((e) => e.courseId === courseId || e.course?.id === courseId);
        if (!enrl)            { setError("Enrollment not found.");          setLoading(false); return; }
        if (enrl.progress < 100) { setError("Complete the course first to unlock your certificate."); setLoading(false); return; }
        setEnrollment(enrl);
      } catch {
        setError("Could not load certificate.");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId, user]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const issuedDate = enrollment
    ? new Date(enrollment.updatedAt || enrollment.enrolledAt).toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      })
    : "";

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 size={32} className="animate-spin text-blue-500 mx-auto" />
          <p className="text-slate-400 font-semibold text-sm">Loading certificate…</p>
        </div>
      </div>
    </Layout>
  );

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award size={28} className="text-amber-400" />
          </div>
          <h2 className="font-black text-slate-800 text-lg mb-2">Certificate Unavailable</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link to={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
            <BookOpen size={14} /> Back to Course
          </Link>
        </div>
      </div>
    </Layout>
  );

  const courseName     = enrollment?.course?.title       || "Course";
  const instructorName = enrollment?.course?.instructor?.fullName || "Instructor";
  const studentName    = user?.fullName || "Student";

  return (
    <>
      {/* ── Print styles injected via a <style> tag ─────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');

        @media print {
          /* Hide everything outside the certificate */
          body * { visibility: hidden !important; }

          /* Show only the certificate */
          #certificate-printable,
          #certificate-printable * { visibility: visible !important; }

          /* Position the certificate to fill the page */
          #certificate-printable {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          /* Force landscape */
          @page {
            size: landscape;
            margin: 0;
          }
        }
      `}</style>

      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/20 py-8 px-4">

          {/* ── Top bar (hidden on print) ── */}
          <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition text-sm font-medium">
              <ArrowLeft size={15} /> Back
            </button>
            <div className="flex items-center gap-2">
              <button onClick={handleShare}
                className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-800 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl transition bg-white shadow-sm">
                <Share2 size={14} />
                {copied ? "Copied!" : "Share"}
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition shadow-md shadow-blue-200">
                <Download size={14} /> Save / Print
              </button>
            </div>
          </div>

          {/* ── Certificate ── */}
          <div className="max-w-4xl mx-auto">
            <div
              id="certificate-printable"
              ref={printRef}
              style={{ fontFamily: "'Lato', sans-serif" }}
              className="relative bg-white rounded-2xl overflow-hidden shadow-2xl shadow-slate-200/60"
              // Fixed aspect ratio so it looks the same on every screen size
            >
              {/* Outer decorative border */}
              <div className="absolute inset-0 border-[14px] border-amber-400/20 rounded-2xl pointer-events-none z-10" />
              <div className="absolute inset-[14px] border-[2px] border-amber-400/30 rounded-xl pointer-events-none z-10" />

              {/* Background pattern */}
              <div className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    45deg,
                    #92400e 0px, #92400e 1px,
                    transparent 1px, transparent 12px
                  )`,
                }} />

              {/* Corner ornaments */}
              {[
                "top-4 left-4",
                "top-4 right-4 rotate-90",
                "bottom-4 left-4 -rotate-90",
                "bottom-4 right-4 rotate-180",
              ].map((pos, i) => (
                <svg key={i} className={`absolute ${pos} w-12 h-12 text-amber-400/30`}
                  viewBox="0 0 48 48" fill="none">
                  <path d="M2 2 L18 2 L2 18 Z" fill="currentColor" />
                  <path d="M2 2 L6 2 L2 6 Z" fill="currentColor" opacity="0.6" />
                </svg>
              ))}

              {/* Main content */}
              <div className="relative z-20 px-10 py-10 sm:px-16 sm:py-12 flex flex-col items-center text-center">

                {/* Header row */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-300/40">
                    <Award size={24} className="text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] sm:text-xs font-black text-amber-600 uppercase tracking-[0.25em]">
                      Certificate of Completion
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
                      LMSPRO · Verified Achievement
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full max-w-md mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300 to-amber-400" />
                  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 0L9.8 5.5H16L11 8.9L12.8 14.4L8 11L3.2 14.4L5 8.9L0 5.5H6.2Z" />
                  </svg>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-amber-300 to-amber-400" />
                </div>

                {/* "This certifies that" */}
                <p className="text-xs sm:text-sm text-slate-400 font-light tracking-[0.15em] uppercase mb-3">
                  This certifies that
                </p>

                {/* Student name */}
                <h1 style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4"
                >
                  {studentName}
                </h1>

                {/* "has successfully completed" */}
                <p className="text-xs sm:text-sm text-slate-400 font-light tracking-[0.15em] uppercase mb-3">
                  has successfully completed
                </p>

                {/* Course name */}
                <h2 style={{ fontFamily: "'Playfair Display', serif" }}
                  className="text-lg sm:text-2xl font-bold text-blue-700 leading-snug max-w-lg mb-2"
                >
                  {courseName}
                </h2>

                {/* Instructor */}
                <p className="text-xs sm:text-sm text-slate-500 mb-6">
                  Instructed by <span className="font-bold text-slate-700">{instructorName}</span>
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 w-full max-w-md mb-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-slate-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-200 to-slate-300" />
                </div>

                {/* Completion badge + date + lessons row */}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-600">100% Complete</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen size={15} className="text-blue-400" />
                    <span className="text-xs font-bold text-slate-600">
                      {enrollment?.totalLessons || enrollment?.completedLessons || "All"} Lessons
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Issued: <span className="font-bold text-slate-600">{issuedDate}</span>
                  </div>
                </div>

                {/* Signature row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 w-full max-w-lg">
                  {/* Instructor sig */}
                  <div className="text-center">
                    <div className="h-10 flex items-end justify-center mb-1">
                      <p style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-lg font-bold text-slate-500 italic border-b border-slate-300 px-4 pb-1">
                        {instructorName}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Instructor</p>
                  </div>

                  {/* Seal */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <svg className="absolute inset-0 w-full h-full text-amber-400/60" viewBox="0 0 80 80">
                      {Array.from({ length: 12 }).map((_, i) => {
                        const angle = (i * 30 * Math.PI) / 180;
                        const x1 = 40 + 32 * Math.cos(angle);
                        const y1 = 40 + 32 * Math.sin(angle);
                        const x2 = 40 + 38 * Math.cos(angle);
                        const y2 = 40 + 38 * Math.sin(angle);
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="2" />;
                      })}
                      <circle cx="40" cy="40" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
                      <circle cx="40" cy="40" r="22" fill="#fffbeb" stroke="currentColor" strokeWidth="1" />
                    </svg>
                    <Award size={22} className="relative z-10 text-amber-500" />
                  </div>

                  {/* Platform sig */}
                  <div className="text-center">
                    <div className="h-10 flex items-end justify-center mb-1">
                      <p style={{ fontFamily: "'Playfair Display', serif" }}
                        className="text-lg font-bold text-slate-500 italic border-b border-slate-300 px-4 pb-1">
                        LMSPRO
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Platform</p>
                  </div>
                </div>

              </div>
            </div>

            {/* ── Action hint below certificate (print hidden) ── */}
            <p className="text-center text-xs text-slate-400 mt-4 print:hidden">
              Tap <span className="font-bold text-slate-600">Save / Print</span> to download your certificate as a PDF
            </p>
          </div>

        </div>
      </Layout>
    </>
  );
};

export default CertificatePage;