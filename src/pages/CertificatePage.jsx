// src/pages/Student/CertificatePage.jsx
// Route: /certificate/:courseId
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import {
  Award, Download, ArrowLeft, CheckCircle, Star,
  Calendar, BookOpen, Loader2, Share2,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import API from "../services/api";

// ── helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });

// Simple unique cert ID based on userId + courseId
const certId = (uid = "", cid = "") =>
  `CERT-${(uid + cid).replace(/-/g, "").substring(0, 12).toUpperCase()}`;

// ── PDF download via html2canvas + jsPDF (loaded from CDN) ────────────────
const downloadPDF = async (certRef, studentName, courseTitle) => {
  // Dynamically load libraries if not present
  if (!window.html2canvas) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  if (!window.jspdf) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const canvas = await window.html2canvas(certRef, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });
  const imgData = canvas.toDataURL("image/png");
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  pdf.addImage(imgData, "PNG", 0, 0, w, h);
  pdf.save(`Certificate_${courseTitle.replace(/\s+/g, "_")}.pdf`);
};

// ── Main component ─────────────────────────────────────────────────────────
export default function CertificatePage() {
  const { courseId }  = useParams();
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const certRef       = useRef(null);

  const [loading,      setLoading]      = useState(true);
  const [downloading,  setDownloading]  = useState(false);
  const [enrollment,   setEnrollment]   = useState(null);
  const [copied,       setCopied]       = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    API.get("/enrollments/my")
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : [];
        const found = list.find(
          (e) => e.courseId === courseId || e.course?.id === courseId
        );
        if (!found || found.progress < 100) {
          navigate(`/courses/${courseId}`);
          return;
        }
        setEnrollment(found);
      })
      .catch(() => navigate("/StudentDashboard"))
      .finally(() => setLoading(false));
  }, [courseId, user]);

  const handleDownload = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      await downloadPDF(
        certRef.current,
        user.fullName,
        enrollment.course?.title || "Course"
      );
    } catch (e) {
      console.error("PDF generation failed:", e);
      alert("PDF download failed. Try right-clicking the certificate and saving as image.");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    const text = `I just completed "${enrollment.course?.title}" on this platform! 🎓`;
    if (navigator.share) {
      navigator.share({ title: "Certificate of Completion", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-amber-400" />
      </div>
    );
  }

  if (!enrollment) return null;

  const course       = enrollment.course;
  const instructor   = course?.instructor;
  const completionDate = fmtDate(enrollment.enrolledAt);
  const id           = certId(user.id, courseId);

  return (
    <div className="min-h-screen bg-[#0c0a0a] flex flex-col items-center py-10 px-4">
      {/* Top bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8">
        <Link
          to="/StudentDashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition border border-slate-700"
          >
            <Share2 size={15} />
            {copied ? "Copied!" : "Share"}
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold text-sm transition shadow-lg shadow-amber-500/30"
          >
            {downloading
              ? <Loader2 size={15} className="animate-spin" />
              : <Download size={15} />}
            {downloading ? "Generating..." : "Download PDF"}
          </button>
        </div>
      </div>

      {/* ── CERTIFICATE ────────────────────────────────────────────────── */}
      <div
        ref={certRef}
        className="w-full max-w-5xl bg-white rounded-none overflow-hidden shadow-2xl shadow-black/50"
        style={{ aspectRatio: "1.414 / 1", fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {/* Outer border frame */}
        <div className="h-full w-full p-6 box-border" style={{ background: "#fffef9" }}>
          <div
            className="h-full w-full flex flex-col items-center justify-between py-10 px-14 relative overflow-hidden"
            style={{
              border: "3px solid #c9a84c",
              boxShadow: "inset 0 0 0 8px #fffef9, inset 0 0 0 11px #c9a84c",
            }}
          >
            {/* Corner ornaments */}
            {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos, i) => (
              <svg
                key={i}
                className={`absolute ${pos} opacity-40`}
                width="48" height="48" viewBox="0 0 48 48"
              >
                <path
                  d="M4,4 L20,4 M4,4 L4,20"
                  stroke="#c9a84c" strokeWidth="2.5" fill="none" strokeLinecap="round"
                />
                <path
                  d={i === 1 || i === 3
                    ? "M44,4 L28,4 M44,4 L44,20"
                    : i === 2
                    ? "M4,44 L20,44 M4,44 L4,28"
                    : "M44,44 L28,44 M44,44 L44,28"}
                  stroke="#c9a84c" strokeWidth="2.5" fill="none" strokeLinecap="round"
                />
              </svg>
            ))}

            {/* Background watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]"
              style={{ fontSize: "22vw", fontWeight: 900, color: "#c9a84c", letterSpacing: "-0.05em" }}
            >
              ✦
            </div>

            {/* Logo / Platform name */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                  <BookOpen size={20} className="text-white" />
                </div>
                <span
                  className="text-2xl font-black tracking-widest uppercase"
                  style={{ color: "#1a1a2e", letterSpacing: "0.25em", fontFamily: "Georgia, serif" }}
                >
                  LearnHub
                </span>
              </div>
              <div className="h-px w-48 mx-auto mt-2" style={{ background: "linear-gradient(to right, transparent, #c9a84c, transparent)" }} />
            </div>

            {/* Main content */}
            <div className="text-center space-y-5 flex-1 flex flex-col items-center justify-center">
              <div>
                <p
                  className="uppercase tracking-[0.3em] text-xs mb-4"
                  style={{ color: "#9a7c3a", fontFamily: "Georgia, serif" }}
                >
                  Certificate of Completion
                </p>
                <p
                  className="text-sm mb-2"
                  style={{ color: "#555", fontFamily: "Georgia, serif" }}
                >
                  This is to certify that
                </p>
                <h1
                  className="text-5xl font-normal mb-3"
                  style={{
                    color: "#1a1a2e",
                    fontFamily: "'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif",
                    letterSpacing: "0.02em",
                  }}
                >
                  {user.fullName}
                </h1>
                <div className="h-px w-72 mx-auto" style={{ background: "linear-gradient(to right, transparent, #c9a84c80, transparent)" }} />
              </div>

              <div className="space-y-2">
                <p
                  className="text-sm"
                  style={{ color: "#555", fontFamily: "Georgia, serif" }}
                >
                  has successfully completed the course
                </p>
                <h2
                  className="text-2xl font-bold px-8"
                  style={{
                    color: "#1a1a2e",
                    fontFamily: "Georgia, serif",
                    maxWidth: "600px",
                    lineHeight: "1.3",
                  }}
                >
                  "{course?.title}"
                </h2>
                {instructor?.fullName && (
                  <p
                    className="text-sm"
                    style={{ color: "#777", fontFamily: "Georgia, serif" }}
                  >
                    instructed by <span style={{ color: "#9a7c3a" }}>{instructor.fullName}</span>
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 mt-2">
                {[
                  { icon: CheckCircle, label: `${enrollment.totalLessons || 0} Lessons`, },
                  { icon: Star,        label: "All Quizzes Passed" },
                  { icon: Calendar,    label: completionDate },
                ].map(({ icon: Icon, label }, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "#9a7c3a" }}>
                    <Icon size={13} />
                    <span style={{ fontFamily: "Georgia, serif" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom: signatures + cert ID */}
            <div className="w-full">
              <div className="flex items-end justify-between px-8">
                {/* Platform sig */}
                <div className="text-center">
                  <div
                    className="text-2xl mb-1"
                    style={{
                      fontFamily: "'Brush Script MT', cursive",
                      color: "#1a1a2e",
                      letterSpacing: "0.05em",
                    }}
                  >
                    LearnHub Team
                  </div>
                  <div className="h-px w-40 mb-1" style={{ background: "#c9a84c" }} />
                  <p className="text-xs uppercase tracking-widest" style={{ color: "#9a7c3a", fontFamily: "Georgia, serif" }}>
                    Platform Director
                  </p>
                </div>

                {/* Seal */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      border: "3px solid #c9a84c",
                      boxShadow: "0 0 0 2px #fffef9, 0 0 0 4px #c9a84c40",
                      background: "radial-gradient(circle, #fffef9, #fef9e7)",
                    }}
                  >
                    <div className="text-center">
                      <Award size={22} className="mx-auto mb-0.5" style={{ color: "#c9a84c" }} />
                      <p className="text-[7px] uppercase tracking-wider font-bold" style={{ color: "#9a7c3a" }}>Certified</p>
                    </div>
                  </div>
                </div>

                {/* Instructor sig */}
                {instructor?.fullName && (
                  <div className="text-center">
                    <div
                      className="text-2xl mb-1"
                      style={{
                        fontFamily: "'Brush Script MT', cursive",
                        color: "#1a1a2e",
                      }}
                    >
                      {instructor.fullName}
                    </div>
                    <div className="h-px w-40 mb-1" style={{ background: "#c9a84c" }} />
                    <p className="text-xs uppercase tracking-widest" style={{ color: "#9a7c3a", fontFamily: "Georgia, serif" }}>
                      Instructor
                    </p>
                  </div>
                )}
              </div>

              {/* Cert ID */}
              <div className="text-center mt-5">
                <p className="text-[9px] uppercase tracking-[0.3em]" style={{ color: "#bbb" }}>
                  Certificate ID: {id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Caption below */}
      <p className="mt-6 text-slate-500 text-xs text-center">
        This certificate is uniquely generated for {user.fullName} · ID: {id}
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADD TO App.jsx:
// import CertificatePage from "./pages/Student/CertificatePage";
// <Route path="/certificate/:courseId" element={<CertificatePage />} />
// ─────────────────────────────────────────────────────────────────────────────