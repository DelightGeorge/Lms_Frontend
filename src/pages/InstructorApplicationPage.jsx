// src/pages/InstructorApplicationPage.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap, Upload, FileText, Video, CheckCircle,
  AlertCircle, Loader2, ArrowRight, ArrowLeft, Briefcase,
  BookOpen, User, Clock, Award, Info, Camera, X, File,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";
import API from "../services/api";

// ── Cloudinary config ──────────────────────────────────────────────────────
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME    || "your_cloud_name";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset";

const uploadFile = async (file, folder = "lmspro/applications") => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", folder);
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${file.type.startsWith("video") ? "video" : "raw"}/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Upload failed");
  return (await res.json()).secure_url;
};

// ── File upload component ──────────────────────────────────────────────────
const FileUpload = ({ label, hint, accept, required, value, onChange, icon: Icon = File, uploading, onUpload }) => {
  const ref = useRef(null);
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
        {Icon && <Icon size={13} className="text-slate-400" />}
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {value ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <CheckCircle size={16} className="text-emerald-500 shrink-0" />
          <p className="text-sm font-semibold text-emerald-700 truncate flex-1">File uploaded ✓</p>
          <button type="button" onClick={() => onChange("")}
            className="text-slate-400 hover:text-red-500 transition shrink-0"><X size={14} /></button>
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="w-full flex items-center gap-3 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-xl px-4 py-4 transition group disabled:opacity-50">
          {uploading
            ? <Loader2 size={18} className="text-blue-500 animate-spin shrink-0" />
            : <Upload size={18} className="text-slate-400 group-hover:text-blue-500 shrink-0 transition" />}
          <div className="text-left">
            <p className="text-sm font-bold text-slate-600 group-hover:text-blue-600 transition">
              {uploading ? "Uploading..." : "Click to upload"}
            </p>
            <p className="text-xs text-slate-400">{hint}</p>
          </div>
        </button>
      )}
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (f) await onUpload(f);
          if (ref.current) ref.current.value = "";
        }} />
    </div>
  );
};

// ── Text area ──────────────────────────────────────────────────────────────
const Textarea = ({ label, value, onChange, placeholder, rows = 4, required, hint, maxLen }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">{label} {required && <span className="text-red-500">*</span>}</label>
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} maxLength={maxLen}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400 resize-none" />
    <div className="flex items-center justify-between">
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {maxLen && <p className="text-xs text-slate-400 ml-auto">{value.length}/{maxLen}</p>}
    </div>
  </div>
);

// ── Steps ──────────────────────────────────────────────────────────────────
const STEPS = [
  { id:1, label:"Your Profile",    icon: User      },
  { id:2, label:"Your Expertise",  icon: Award     },
  { id:3, label:"Documents",       icon: FileText  },
  { id:4, label:"Your Story",      icon: BookOpen  },
];

export default function InstructorApplicationPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step,    setStep]    = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existing,  setExisting]  = useState(null);
  const [toast,   setToast]   = useState(null);

  // Upload states
  const [uploadingId,    setUploadingId]    = useState(false);
  const [uploadingCv,    setUploadingCv]    = useState(false);
  const [uploadingVideo,    setUploadingVideo]    = useState(false);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  // Form state
  const [form, setForm] = useState({
    headline:          "",
    expertise:         "",
    yearsExperience:   "",
    bio:               "",
    idDocumentUrl:     "",
    cvUrl:             "",
    portfolioUrl:      "",
    sampleVideoUrl:    "",
    teachingMotivation:"",
  });

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Check for existing application
  useEffect(() => {
    if (!user) return;
    API.get("/instructor-applications/my").then((r) => {
      if (r.data) setExisting(r.data);
    }).catch(() => {});
  }, [user]);

  // ── Upload handlers ──────────────────────────────────────────────────────
  const handleUploadId = async (file) => {
    setUploadingId(true);
    try { set("idDocumentUrl", await uploadFile(file)); }
    catch { showToast("ID upload failed. Try again.", "error"); }
    finally { setUploadingId(false); }
  };

  const handleUploadCv = async (file) => {
    setUploadingCv(true);
    try { set("cvUrl", await uploadFile(file)); }
    catch { showToast("CV upload failed. Try again.", "error"); }
    finally { setUploadingCv(false); }
  };

  const handleUploadVideo = async (file) => {
    setUploadingVideo(true);
    try { set("sampleVideoUrl", await uploadFile(file, "lmspro/samples")); }
    catch { showToast("Video upload failed. Try again.", "error"); }
    finally { setUploadingVideo(false); }
  };

  // ── Step validation ────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return form.headline.trim() && form.bio.trim().length >= 50;
    if (step === 2) return form.expertise.trim() && form.yearsExperience;
    if (step === 3) return form.idDocumentUrl && form.cvUrl;
    if (step === 4) return form.teachingMotivation.trim().length >= 100;
    return false;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await API.post("/instructor-applications", {
        ...form,
        yearsExperience: Number(form.yearsExperience),
      });
      setSubmitted(true);
    } catch (err) {
      showToast(err.response?.data?.message || "Submission failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────
  if (!user) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center max-w-md">
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-slate-900 mb-3">Sign in required</h2>
          <p className="text-slate-500 mb-6">You need to be logged in to apply as an instructor.</p>
          <Link to="/auth" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition">Sign In</Link>
        </div>
      </div>
    </Layout>
  );

  if (user.role !== "STUDENT" && user.role !== "INSTRUCTOR") return null;

  // Already submitted / approved
  if (existing) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center max-w-lg w-full">
          {existing.status === "APPROVED" ? (
            <>
              <CheckCircle size={56} className="text-emerald-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-slate-900 mb-2">You're an Instructor!</h2>
              <p className="text-slate-500 mb-6">Your application was approved. Head to your dashboard to start creating courses.</p>
              <Link to="/instructordashboard" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition inline-block">Go to Dashboard</Link>
            </>
          ) : existing.status === "PENDING" ? (
            <>
              <Clock size={56} className="text-amber-500 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-slate-900 mb-2">Application Pending</h2>
              <p className="text-slate-500 mb-2">Your application is under review. We typically respond within 2–3 business days.</p>
              <p className="text-xs text-slate-400">Submitted {new Date(existing.createdAt).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</p>
            </>
          ) : (
            <>
              <AlertCircle size={56} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-slate-900 mb-2">Application Rejected</h2>
              {existing.rejectionReason && <p className="text-slate-600 mb-2 text-sm bg-red-50 rounded-xl p-3">"{existing.rejectionReason}"</p>}
              <p className="text-slate-500 text-sm mb-6">You can resubmit with updated information.</p>
              <button onClick={() => setExisting(null)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition">Resubmit Application</button>
            </>
          )}
        </div>
      </div>
    </Layout>
  );

  // Success screen
  if (submitted) return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-12 text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3">Application Submitted!</h2>
          <p className="text-slate-500 mb-2">Our team will review your application and get back to you within <strong>2–3 business days</strong>.</p>
          <p className="text-slate-400 text-sm mb-8">You'll receive an email notification at <strong>{user.email}</strong> once a decision is made.</p>
          <div className="space-y-3">
            <Link to="/" className="block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition">Back to Home</Link>
            <Link to="/courses" className="block border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold px-8 py-3.5 rounded-xl transition">Browse Courses</Link>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3.5 rounded-xl text-white font-bold shadow-2xl text-sm ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-16">

        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-3xl mx-auto relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center border border-indigo-400/30">
                <GraduationCap size={24} className="text-indigo-300" />
              </div>
              <div>
                <h1 className="text-3xl font-black">Become an Instructor</h1>
                <p className="text-slate-300 text-sm">Share your expertise and earn on LMSPRO</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mt-6">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = step > s.id;
                const active = step === s.id;
                return (
                  <React.Fragment key={s.id}>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      active ? "bg-white text-indigo-700" :
                      done   ? "bg-emerald-500/30 text-emerald-300 border border-emerald-500/30" :
                               "bg-white/10 text-slate-400"
                    }`}>
                      {done ? <CheckCircle size={12} /> : <Icon size={12} />}
                      <span className="hidden sm:inline">{s.label}</span>
                      <span className="sm:hidden">{s.id}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`flex-1 h-px ${done ? "bg-emerald-500/50" : "bg-white/10"}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">

            {/* Step 1 — Profile */}
            {step === 1 && (
              <>
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Your Profile</h2>
                  <p className="text-slate-500 text-sm">Tell us who you are and what you'll be teaching</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Professional Headline <span className="text-red-500">*</span></label>
                    <input value={form.headline} onChange={(e) => set("headline", e.target.value)}
                      placeholder="e.g. Senior Software Engineer with 10 years at Google"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                    <p className="text-xs text-slate-400 mt-1">This appears on your public instructor profile</p>
                  </div>
                  <Textarea label="Professional Bio" required value={form.bio} onChange={(v) => set("bio", v)}
                    placeholder="Tell students about your background, what you've built, and what makes you qualified to teach this subject..."
                    rows={5} hint="Minimum 50 characters" maxLen={1000} />
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Portfolio / Website <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="space-y-2">
                      <input type="url" value={form.portfolioUrl && !form.portfolioUrl.startsWith("http://res.cloudinary") ? form.portfolioUrl : ""}
                        onChange={(e) => set("portfolioUrl", e.target.value)}
                        placeholder="https://yourportfolio.com or LinkedIn URL"
                        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-semibold">or upload a file</span>
                        <div className="flex-1 h-px bg-slate-200" />
                      </div>
                      <FileUpload
                        label=""
                        hint="PDF, images, or any document · Max 10MB"
                        accept=".pdf,.jpg,.jpeg,.png,.zip,.doc,.docx"
                        icon={FileText}
                        value={form.portfolioUrl?.startsWith("http://res.cloudinary") || form.portfolioUrl?.startsWith("https://res.cloudinary") ? form.portfolioUrl : ""}
                        onChange={(v) => set("portfolioUrl", v)}
                        uploading={uploadingPortfolio}
                        onUpload={handleUploadPortfolio}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Step 2 — Expertise */}
            {step === 2 && (
              <>
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Your Expertise</h2>
                  <p className="text-slate-500 text-sm">What subjects do you specialise in and how long have you been doing it?</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Area of Expertise <span className="text-red-500">*</span></label>
                    <input value={form.expertise} onChange={(e) => set("expertise", e.target.value)}
                      placeholder="e.g. Web Development, Data Science, Digital Marketing, Finance..."
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition" />
                    <p className="text-xs text-slate-400 mt-1">You can list multiple e.g. "Python, Machine Learning, Deep Learning"</p>
                  </div>
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-1.5 block">Years of Professional Experience <span className="text-red-500">*</span></label>
                    <select value={form.yearsExperience} onChange={(e) => set("yearsExperience", e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition bg-white">
                      <option value="">Select years of experience</option>
                      {[1,2,3,4,5,6,7,8,9,"10",11,12,13,14,"15+"].map((y) => (
                        <option key={y} value={typeof y === "string" && y.includes("+") ? 15 : y}>
                          {y} {Number(String(y).replace("+","")) === 1 ? "year" : "years"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-2">
                    <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">We recommend instructors have at least 2 years of professional experience in their field to ensure quality content for our learners.</p>
                  </div>
                </div>
              </>
            )}

            {/* Step 3 — Documents */}
            {step === 3 && (
              <>
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Identity & Documents</h2>
                  <p className="text-slate-500 text-sm">We verify all instructors to protect our learner community</p>
                </div>
                <div className="space-y-5">
                  <FileUpload
                    label="Government-Issued ID"
                    hint="Passport, National ID card, or Driver's Licence · PDF, JPG or PNG · Max 5MB"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    icon={FileText}
                    value={form.idDocumentUrl}
                    onChange={(v) => set("idDocumentUrl", v)}
                    uploading={uploadingId}
                    onUpload={handleUploadId}
                  />
                  <FileUpload
                    label="CV / Resume"
                    hint="Your professional CV or resume · PDF preferred · Max 5MB"
                    accept=".pdf,.doc,.docx"
                    required
                    icon={Briefcase}
                    value={form.cvUrl}
                    onChange={(v) => set("cvUrl", v)}
                    uploading={uploadingCv}
                    onUpload={handleUploadCv}
                  />
                  <FileUpload
                    label="Sample Teaching Video"
                    hint="A 2–5 minute video of you explaining any concept · MP4 or MOV · Max 50MB · Optional but strongly recommended"
                    accept="video/mp4,video/quicktime,.mp4,.mov"
                    icon={Video}
                    value={form.sampleVideoUrl}
                    onChange={(v) => set("sampleVideoUrl", v)}
                    uploading={uploadingVideo}
                    onUpload={handleUploadVideo}
                  />
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-2">
                    <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">All documents are securely stored and only used to verify your identity. They are never shared publicly or with third parties.</p>
                  </div>
                </div>
              </>
            )}

            {/* Step 4 — Story */}
            {step === 4 && (
              <>
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Your Teaching Story</h2>
                  <p className="text-slate-500 text-sm">Help us understand why you want to teach on LMSPRO</p>
                </div>
                <div className="space-y-4">
                  <Textarea label="Why do you want to teach on LMSPRO?" required
                    value={form.teachingMotivation} onChange={(v) => set("teachingMotivation", v)}
                    placeholder="Tell us what drives your passion for teaching, what courses you plan to create, who your target students are, and what outcomes you want them to achieve..."
                    rows={7} hint="Minimum 100 characters" maxLen={2000} />

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 space-y-3">
                    <h3 className="font-black text-slate-800 text-sm">Application Summary</h3>
                    {[
                      ["Headline",    form.headline    || "—"],
                      ["Expertise",   form.expertise   || "—"],
                      ["Experience",  form.yearsExperience ? `${form.yearsExperience} years` : "—"],
                      ["ID Document", form.idDocumentUrl ? "✓ Uploaded" : "—"],
                      ["CV",          form.cvUrl ? "✓ Uploaded" : "—"],
                      ["Sample Video",form.sampleVideoUrl ? "✓ Uploaded" : "Not provided"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex justify-between text-xs">
                        <span className="text-slate-400 font-semibold">{label}</span>
                        <span className={`font-bold ${val.includes("✓") ? "text-emerald-600" : val === "—" ? "text-red-400" : "text-slate-700"}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Navigation buttons */}
            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <button type="button" onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2 px-5 py-3 border border-slate-200 rounded-xl text-slate-700 font-bold text-sm hover:bg-slate-50 transition">
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <button
                type="button"
                onClick={step < 4 ? () => setStep(step + 1) : handleSubmit}
                disabled={!canProceed() || loading || uploadingId || uploadingCv || uploadingVideo}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition shadow-md shadow-indigo-200">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" /> Submitting...</>
                  : step < 4
                    ? <>Next: {STEPS[step].label} <ArrowRight size={15} /></>
                    : <>Submit Application <CheckCircle size={15} /></>}
              </button>
            </div>

            {/* Step counter */}
            <p className="text-center text-xs text-slate-400">Step {step} of {STEPS.length}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}