// src/pages/InstructorApplicationPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap, Upload, FileText, Video, Globe, Linkedin,
  CheckCircle, AlertCircle, Loader2, ArrowRight, ArrowLeft,
  Briefcase, BookOpen, User, Clock, Award, ChevronRight,
  ExternalLink, Info,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";
import API from "../services/api";

// ── Upload helper — uses a simple URL input (works with Cloudinary/S3 links)
// In production, swap the URL input for an actual file upload widget
const UrlInput = ({ label, placeholder, value, onChange, required, hint, icon: Icon }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400"
    />
    {hint && <p className="text-xs text-slate-400 flex items-center gap-1"><Info size={10} />{hint}</p>}
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, rows = 4, required, hint, maxLen }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-bold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLen}
      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder-slate-400 resize-none"
    />
    <div className="flex items-center justify-between">
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
      {maxLen && <p className="text-xs text-slate-400 ml-auto">{value.length}/{maxLen}</p>}
    </div>
  </div>
);

const STEPS = [
  { id: 1, label: "Profile",   icon: User },
  { id: 2, label: "Documents", icon: FileText },
  { id: 3, label: "Statement", icon: BookOpen },
  { id: 4, label: "Review",    icon: CheckCircle },
];

export default function InstructorApplicationPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [errors, setErrors] = useState({});

  // Form fields
  const [headline, setHeadline]     = useState("");
  const [expertise, setExpertise]   = useState("");
  const [yearsExp, setYearsExp]     = useState("");
  const [bio, setBio]               = useState("");
  const [idDocUrl, setIdDocUrl]     = useState("");
  const [cvUrl, setCvUrl]           = useState("");
  const [portfolioUrl, setPortfolio]     = useState("");
  const [sampleVideoUrl, setSampleVideo] = useState("");
  const [motivation, setMotivation]      = useState("");

  // Check for existing application
  useEffect(() => {
    if (!user) return;
    API.get("/instructor-applications/my")
      .then((r) => setExistingApp(r.data))
      .catch(() => {})
      .finally(() => setLoadingApp(false));
  }, [user]);

  const validate = () => {
    const errs = {};
    if (step === 1) {
      if (!headline.trim())         errs.headline   = "Professional headline is required";
      if (!expertise.trim())        errs.expertise  = "Area of expertise is required";
      if (!yearsExp || yearsExp < 0) errs.yearsExp  = "Years of experience is required";
      if (!bio.trim() || bio.length < 100) errs.bio = "Bio must be at least 100 characters";
    }
    if (step === 2) {
      if (!idDocUrl.trim())  errs.idDocUrl = "ID document URL is required";
      if (!cvUrl.trim())     errs.cvUrl    = "CV/Resume URL is required";
    }
    if (step === 3) {
      if (!motivation.trim() || motivation.length < 150)
        errs.motivation = "Statement must be at least 150 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await API.post("/instructor-applications", {
        headline, expertise,
        yearsExperience: Number(yearsExp),
        bio, idDocumentUrl: idDocUrl, cvUrl,
        portfolioUrl:   portfolioUrl   || undefined,
        sampleVideoUrl: sampleVideoUrl || undefined,
        teachingMotivation: motivation,
      });
      setSubmitted(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || "Failed to submit. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <div className="text-center">
            <GraduationCap size={48} className="text-indigo-400 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-slate-900 mb-2">Sign in required</h2>
            <p className="text-slate-500 mb-6">You must be logged in to apply as an instructor.</p>
            <button onClick={() => navigate("/auth")} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition">
              Sign In
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (loadingApp) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20">
          <Loader2 size={36} className="animate-spin text-indigo-500" />
        </div>
      </Layout>
    );
  }

  // Already approved
  if (user.role === "INSTRUCTOR" && user.isInstructorApproved) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">You're an Instructor!</h2>
            <p className="text-slate-500 text-sm mb-6">Your account is already approved as an instructor. Head to your dashboard to create courses.</p>
            <button onClick={() => navigate("/instructor/dashboard")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition">
              Go to Instructor Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Pending application
  if (existingApp?.status === "PENDING") {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
              <Clock size={40} className="text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Application Under Review</h2>
            <p className="text-slate-500 text-sm mb-2">
              Your instructor application was submitted on <strong>{new Date(existingApp.createdAt).toLocaleDateString()}</strong>.
            </p>
            <p className="text-slate-500 text-sm mb-6">Our team will review it within 2–3 business days. We'll send you a notification once a decision is made.</p>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left space-y-2 mb-6">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Submitted Details</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Headline:</span> {existingApp.headline}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Expertise:</span> {existingApp.expertise}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold">Experience:</span> {existingApp.yearsExperience} year(s)</p>
            </div>
            <button onClick={() => navigate("/")} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition">
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-20 px-4">
          <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 animate-bounce">
              <GraduationCap size={40} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted! 🎉</h2>
            <p className="text-slate-500 text-sm mb-6">
              Thank you for applying! Our admin team has been notified and will review your application within 2–3 business days. You'll receive a notification when a decision is made.
            </p>
            <button onClick={() => navigate("/")} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition">
              Back to Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
              <GraduationCap size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Become an Instructor</h1>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Share your expertise with thousands of students. Complete your application and our team will review it within 2–3 business days.
            </p>
            {existingApp?.status === "REJECTED" && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-left">
                <p className="text-sm font-bold text-red-700 mb-1">Previous application rejected</p>
                <p className="text-sm text-red-600">Reason: {existingApp.rejectionReason}</p>
                <p className="text-xs text-red-500 mt-1">You can submit a new application below.</p>
              </div>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-8">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const done    = step > s.id;
              const current = step === s.id;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition ${
                      done    ? "bg-emerald-500 text-white" :
                      current ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" :
                                "bg-white border-2 border-slate-200 text-slate-400"
                    }`}>
                      {done ? <CheckCircle size={18} /> : <Icon size={18} />}
                    </div>
                    <span className={`text-xs font-semibold mt-1 ${current ? "text-indigo-600" : done ? "text-emerald-600" : "text-slate-400"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 mb-4 rounded-full transition ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">

            {/* ── STEP 1: Professional Profile ─────────────────────── */}
            {step === 1 && (
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Your Professional Profile</h2>
                  <p className="text-sm text-slate-400 mt-1">Tell us about your background and expertise.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                    <Briefcase size={14} className="text-slate-400" />
                    Professional Headline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Senior Software Engineer & React Expert"
                    maxLength={120}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                  {errors.headline && <p className="text-xs text-red-500">{errors.headline}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Area of Expertise <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={expertise}
                      onChange={(e) => setExpertise(e.target.value)}
                      placeholder="e.g. Web Dev, Data Science"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    {errors.expertise && <p className="text-xs text-red-500">{errors.expertise}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700">
                      Years of Experience <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={yearsExp}
                      onChange={(e) => setYearsExp(e.target.value)}
                      min="0" max="50"
                      placeholder="e.g. 5"
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition"
                    />
                    {errors.yearsExp && <p className="text-xs text-red-500">{errors.yearsExp}</p>}
                  </div>
                </div>

                <Textarea
                  label="Professional Bio"
                  required
                  value={bio}
                  onChange={setBio}
                  placeholder="Describe your professional background, achievements, and what makes you qualified to teach this subject. This will be shown on your instructor profile."
                  rows={5}
                  hint="Minimum 100 characters. Be specific about your experience and credentials."
                  maxLen={1000}
                />
                {errors.bio && <p className="text-xs text-red-500 -mt-3">{errors.bio}</p>}
              </div>
            )}

            {/* ── STEP 2: Documents ─────────────────────────────────── */}
            {step === 2 && (
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Verification Documents</h2>
                  <p className="text-sm text-slate-400 mt-1">Upload your documents to a cloud service (Google Drive, Dropbox, Cloudinary) and paste the shareable URL here.</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-sm text-indigo-700">
                  <p className="font-semibold mb-1 flex items-center gap-1.5"><Info size={14} /> How to upload documents</p>
                  <ol className="space-y-0.5 text-indigo-600 text-xs list-decimal list-inside">
                    <li>Upload your file to Google Drive, Dropbox, or Cloudinary</li>
                    <li>Set sharing to "Anyone with the link can view"</li>
                    <li>Copy the link and paste it below</li>
                  </ol>
                </div>

                <UrlInput
                  label="Government-Issued ID"
                  required
                  icon={FileText}
                  value={idDocUrl}
                  onChange={setIdDocUrl}
                  placeholder="https://drive.google.com/file/d/..."
                  hint="National ID, passport, or driver's licence (shareable link)"
                />
                {errors.idDocUrl && <p className="text-xs text-red-500 -mt-3">{errors.idDocUrl}</p>}

                <UrlInput
                  label="CV / Resume"
                  required
                  icon={FileText}
                  value={cvUrl}
                  onChange={setCvUrl}
                  placeholder="https://drive.google.com/file/d/..."
                  hint="Your most recent resume or curriculum vitae"
                />
                {errors.cvUrl && <p className="text-xs text-red-500 -mt-3">{errors.cvUrl}</p>}

                <UrlInput
                  label="Portfolio / LinkedIn / GitHub"
                  icon={Globe}
                  value={portfolioUrl}
                  onChange={setPortfolio}
                  placeholder="https://linkedin.com/in/yourprofile"
                  hint="Optional but recommended — helps us verify your credentials"
                />

                <UrlInput
                  label="Sample Lesson Video"
                  icon={Video}
                  value={sampleVideoUrl}
                  onChange={setSampleVideo}
                  placeholder="https://youtube.com/watch?v=... or Google Drive link"
                  hint="Optional — a 3–5 minute video showing your teaching style"
                />
              </div>
            )}

            {/* ── STEP 3: Teaching Statement ────────────────────────── */}
            {step === 3 && (
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Teaching Statement</h2>
                  <p className="text-sm text-slate-400 mt-1">Help us understand your motivation and teaching philosophy.</p>
                </div>

                <Textarea
                  label="Why do you want to teach on this platform?"
                  required
                  value={motivation}
                  onChange={setMotivation}
                  placeholder={`Tell us:\n• What courses you plan to create\n• Who your target students are\n• What unique value you bring\n• Your teaching style and approach\n• Any previous teaching experience`}
                  rows={10}
                  hint="Minimum 150 characters. Be as detailed as possible."
                  maxLen={2000}
                />
                {errors.motivation && <p className="text-xs text-red-500 -mt-3">{errors.motivation}</p>}

                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">What happens next?</p>
                  {[
                    "Our admin team will review your application within 2–3 business days",
                    "You'll receive a notification when a decision is made",
                    "If approved, you'll immediately gain access to the instructor dashboard",
                    "If rejected, you'll receive feedback and can reapply",
                  ].map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</div>
                      <p className="text-xs text-slate-500">{t}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Review & Submit ───────────────────────────── */}
            {step === 4 && (
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Review Your Application</h2>
                  <p className="text-sm text-slate-400 mt-1">Please confirm all details before submitting.</p>
                </div>

                <div className="space-y-4">
                  {/* Profile */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Professional Profile</p>
                      <button onClick={() => setStep(1)} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">Edit</button>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <p><span className="font-semibold text-slate-700">Headline:</span> <span className="text-slate-600">{headline}</span></p>
                      <p><span className="font-semibold text-slate-700">Expertise:</span> <span className="text-slate-600">{expertise}</span></p>
                      <p><span className="font-semibold text-slate-700">Experience:</span> <span className="text-slate-600">{yearsExp} year(s)</span></p>
                      <p><span className="font-semibold text-slate-700">Bio:</span> <span className="text-slate-600">{bio.substring(0, 120)}{bio.length > 120 ? "..." : ""}</span></p>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Documents</p>
                      <button onClick={() => setStep(2)} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">Edit</button>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-slate-600">Government ID uploaded</span>
                        <a href={idDocUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-indigo-500 hover:text-indigo-700"><ExternalLink size={12} /></a>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-emerald-500" />
                        <span className="text-slate-600">CV/Resume uploaded</span>
                        <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-indigo-500 hover:text-indigo-700"><ExternalLink size={12} /></a>
                      </div>
                      {portfolioUrl && (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-slate-600">Portfolio link provided</span>
                        </div>
                      )}
                      {sampleVideoUrl && (
                        <div className="flex items-center gap-2">
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span className="text-slate-600">Sample video provided</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statement */}
                  <div className="border border-slate-100 rounded-2xl overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Teaching Statement</p>
                      <button onClick={() => setStep(3)} className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold">Edit</button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-slate-600 leading-relaxed">{motivation.substring(0, 200)}{motivation.length > 200 ? "..." : ""}</p>
                    </div>
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-500 shrink-0" />
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-700 flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <p>By submitting, you confirm that all provided information is accurate and that you agree to our instructor terms and policies.</p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => step > 1 ? setStep((s) => s - 1) : navigate(-1)}
                className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-white transition"
              >
                <ArrowLeft size={16} /> {step > 1 ? "Back" : "Cancel"}
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition"
                >
                  Next <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold text-sm transition"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Questions? Contact us at <span className="text-indigo-500">support@yourplatform.com</span>
          </p>
        </div>
      </div>
    </Layout>
  );
}
