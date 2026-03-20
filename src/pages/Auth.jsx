import React, { useState, useRef, useEffect } from "react";
import {
  Mail, Lock, User, ChevronRight, Eye, EyeOff,
  Sparkles, ShieldCheck, ArrowLeft, Camera, X,
  CheckCircle, Loader2, GraduationCap, AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

// ── Cloudinary upload ─────────────────────────────────────────────────────────
const CLOUD_NAME    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME    || "your_cloud_name";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset";

const uploadAvatar = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  fd.append("folder", "lmspro/avatars");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );
  if (!res.ok) throw new Error("Avatar upload failed");
  return (await res.json()).secure_url;
};

// ── Inline spinner ────────────────────────────────────────────────────────────
const Spinner = ({ size = 18 }) => (
  <div className="relative shrink-0" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full border-2 border-white/20" />
    <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
  </div>
);

// ── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;
  const isSuccess = type === "success";
  return (
    <div className={`fixed top-6 right-6 z-[999] flex items-start gap-3 px-5 py-4 rounded-xl shadow-2xl text-white font-semibold text-sm max-w-sm border backdrop-blur-xl transition-all
      ${isSuccess ? "bg-emerald-500/90 border-emerald-400/50" : "bg-red-500/90 border-red-400/50"}`}>
      {isSuccess ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white ml-1 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
};

// ── Avatar Upload ─────────────────────────────────────────────────────────────
const AvatarUpload = ({ value, onChange, uploading, onUploadStart, onUploadEnd, onError }) => {
  const ref = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      onError("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      onError("Image must be under 5MB");
      return;
    }
    onUploadStart();
    try {
      const url = await uploadAvatar(file);
      onChange(url);
    } catch {
      onError("Photo upload failed — please try again");
    } finally {
      onUploadEnd();
      if (ref.current) ref.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
          {uploading ? (
            <Loader2 size={22} className="text-amber-400 animate-spin" />
          ) : value ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={24} className="text-slate-500" />
          )}
        </div>
        {value && !uploading && (
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition">
            <X size={10} />
          </button>
        )}
      </div>

      {/* Button */}
      <div className="flex-1">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="w-full flex items-center gap-2.5 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-xl px-4 py-3 transition disabled:opacity-50 group">
          {uploading
            ? <Loader2 size={16} className="text-amber-400 animate-spin shrink-0" />
            : <Camera size={16} className="text-slate-400 group-hover:text-amber-400 transition shrink-0" />}
          <div className="text-left">
            <p className="text-sm font-bold text-slate-300 group-hover:text-white transition">
              {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
            </p>
            <p className="text-[10px] text-slate-500">JPG, PNG · max 5MB · optional</p>
          </div>
          {value && !uploading && <CheckCircle size={14} className="text-emerald-400 ml-auto shrink-0" />}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
    </div>
  );
};

// ── Validate helpers ──────────────────────────────────────────────────────────
const validateRegister = ({ fullName, email, password, confirmPassword }) => {
  if (!fullName.trim())                    return "Please enter your full name";
  if (fullName.trim().length < 2)          return "Name must be at least 2 characters";
  if (!email.includes("@"))               return "Please enter a valid email address";
  if (password.length < 6)               return "Password must be at least 6 characters";
  if (!/[A-Za-z]/.test(password))        return "Password must contain at least one letter";
  if (password !== confirmPassword)       return "Passwords do not match";
  return null;
};

const validateLogin = ({ email, password }) => {
  if (!email.trim())    return "Please enter your email address";
  if (!password.trim()) return "Please enter your password";
  return null;
};

// ── Map backend error messages to friendly UI messages ───────────────────────
const friendlyError = (raw) => {
  const map = {
    "Email already in use":          "An account with this email already exists. Try signing in instead.",
    "Email not verified":            "__EMAIL_NOT_VERIFIED__", // special case
    "Invalid credentials":           "Incorrect email or password. Please try again.",
    "All fields are required":       "Please fill in all required fields.",
    "Registration failed":           "Registration failed. Please try again in a moment.",
    "Login failed":                  "Sign in failed. Please try again in a moment.",
  };
  return map[raw] || raw || "Something went wrong. Please try again.";
};

// ── Registration success screen ───────────────────────────────────────────────
const SuccessScreen = ({ email, role, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />
    <div className="relative z-10 max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-6 backdrop-blur-sm">
      <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
        <CheckCircle size={36} className="text-emerald-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white">Account Created!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent a verification link to{" "}
          <span className="text-amber-400 font-bold break-all">{email}</span>.
          Click the link to activate your account before signing in.
        </p>
      </div>

      {role === "INSTRUCTOR" && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-left space-y-2">
          <div className="flex items-center gap-2 text-blue-300 font-black text-sm">
            <GraduationCap size={16} /> Next step for Instructors
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            After verifying your email, submit an <strong className="text-white">Instructor Application</strong> with your credentials and documents. Our team reviews within 2–3 business days.
          </p>
          <Link to="/become-instructor"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition mt-1">
            Go to Application Form
          </Link>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <p className="text-xs text-slate-500">Didn't receive the email? Check your spam or junk folder.</p>
        <button onClick={onBack}
          className="w-full border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold py-3 rounded-xl transition text-sm">
          Back to Sign In
        </button>
      </div>
    </div>
  </div>
);

// ── Email not verified banner (shown after failed login attempt) ──────────────
const UnverifiedBanner = ({ email, onResent }) => {
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);

  const resend = async () => {
    if (sending || sent) return;
    setSending(true);
    try {
      await API.post("/auth/resend-verification", { email });
      setSent(true);
    } catch {
      // fail silently — user can try again
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
        <AlertCircle size={15} /> Email not verified
      </div>
      <p className="text-xs text-slate-400 leading-relaxed">
        You need to verify your email before signing in. Check your inbox for a link from us.
      </p>
      {!sent ? (
        <button onClick={resend} disabled={sending}
          className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition disabled:opacity-50">
          {sending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {sending ? "Sending…" : "Resend verification email"}
        </button>
      ) : (
        <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
          <CheckCircle size={12} /> Verification email resent — check your inbox
        </p>
      )}
    </div>
  );
};

// ── Main Auth Component ───────────────────────────────────────────────────────
const Auth = () => {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [mode,            setMode]            = useState("login");
  const [fullName,        setFullName]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role,            setRole]            = useState("STUDENT");
  const [avatarUrl,       setAvatarUrl]       = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [toast,           setToast]           = useState({ type: "", message: "" });
  const [registered,      setRegistered]      = useState(false);
  const [emailUnverified, setEmailUnverified] = useState(false);

  const showToast = (type, message) => setToast({ type, message });
  const clearToast = () => setToast({ type: "", message: "" });

  const switchMode = (m) => {
    setMode(m);
    setRegistered(false);
    setEmailUnverified(false);
    clearToast();
    setFullName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setAvatarUrl(""); setRole("STUDENT");
    setShowPassword(false); setShowConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || avatarUploading) return;
    clearToast();
    setEmailUnverified(false);

    // ── Client-side validation first (no network needed) ──
    const validationError = mode === "register"
      ? validateRegister({ fullName, email, password, confirmPassword })
      : validateLogin({ email, password });

    if (validationError) {
      showToast("error", validationError);
      return; // loading never set, no cleanup needed
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await API.post("/auth/register", {
          fullName: fullName.trim(),
          email:    email.trim().toLowerCase(),
          password,
          role,
          avatarUrl: avatarUrl || undefined,
        });
        setRegistered(true);

      } else {
        const res = await API.post("/auth/login", {
          email:    email.trim().toLowerCase(),
          password,
        });
        const { token, user } = res.data;
        login(user, token);
        showToast("success", `Welcome back, ${user.fullName?.split(" ")[0] || "there"}! 👋`);
        setTimeout(() => {
          if      (user.role === "ADMIN")      navigate("/admindashboard");
          else if (user.role === "INSTRUCTOR") navigate("/instructordashboard");
          else                                 navigate("/StudentDashboard");
        }, 600);
      }

    } catch (err) {
      const raw = err.response?.data?.message || "";
      if (raw === "Email not verified") {
        setEmailUnverified(true);
      } else {
        showToast("error", friendlyError(raw));
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (registered) {
    return <SuccessScreen email={email} role={role} onBack={() => switchMode("login")} />;
  }

  // ── Field style helper ────────────────────────────────────────────────────
  const fieldCls = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500 text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 blur-3xl rounded-full pointer-events-none" />

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Back link */}
      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm font-semibold backdrop-blur-sm">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left panel ────────────────────────────────────────────────── */}
          <div className="hidden lg:block space-y-8">
            <Link to="/" className="inline-flex items-center gap-2.5 group mb-8">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-600/30">L</div>
              <span className="text-2xl font-black tracking-tight">LMS<span className="text-blue-400 italic">PRO</span></span>
            </Link>
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Sparkles size={14} /> PREMIUM EDUCATION
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Your Gateway to<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300">Excellence</span>
              </h1>
              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                Join thousands of professionals transforming their careers with world-class courses.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  { number: "500+", label: "Premium Courses"  },
                  { number: "2M+",  label: "Active Learners"  },
                  { number: "4.9★", label: "Average Rating"   },
                ].map((s) => (
                  <div key={s.label} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0" />
                    <div>
                      <p className="font-black text-xl text-white">{s.number}</p>
                      <p className="text-sm text-slate-400">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel (form) ────────────────────────────────────────── */}
          <div className="space-y-5 max-w-md w-full mx-auto">

            {/* Mode toggle */}
            <div className="flex p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              {[{ key: "login", label: "Sign In" }, { key: "register", label: "Create Account" }].map((m) => (
                <button key={m.key} type="button" onClick={() => switchMode(m.key)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    mode === m.key
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="pt-1">
              <h2 className="text-3xl font-black text-white">
                {mode === "login" ? "Welcome Back" : "Start Learning"}
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                {mode === "login" ? "Sign in to access your courses" : "Create your free account today"}
              </p>
            </div>

            {/* Email-not-verified inline banner */}
            {emailUnverified && (
              <UnverifiedBanner email={email} />
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>

              {/* ── Register-only fields ── */}
              {mode === "register" && (
                <>
                  {/* Full name */}
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                    <input type="text" placeholder="Full Name" value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name" required
                      className={fieldCls} />
                  </div>

                  {/* Avatar */}
                  <AvatarUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    uploading={avatarUploading}
                    onUploadStart={() => setAvatarUploading(true)}
                    onUploadEnd={() => setAvatarUploading(false)}
                    onError={(msg) => showToast("error", msg)}
                  />

                  {/* Role selector — state-driven (no peer-checked needed) */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">I want to</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { r: "STUDENT",    label: "Learn",        icon: "🎓", desc: "Take courses & earn certificates" },
                        { r: "INSTRUCTOR", label: "Teach & Earn", icon: "🏫", desc: "Create courses & earn revenue"    },
                      ].map(({ r, label, icon, desc }) => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                          className={`p-4 rounded-xl border-2 transition text-center w-full ${
                            role === r
                              ? "border-amber-500/60 bg-amber-500/10"
                              : "border-white/10 hover:border-white/20 bg-white/5"
                          }`}>
                          <span className="text-2xl block mb-1">{icon}</span>
                          <p className={`text-sm font-black ${role === r ? "text-amber-400" : "text-white"}`}>{label}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructor notice */}
                  {role === "INSTRUCTOR" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                      <GraduationCap size={18} className="text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-300 mb-1">Instructor Application Required</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          After verifying your email you'll complete a short application with your credentials. Our team reviews in 2–3 business days.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                <input type="email" placeholder="Email Address" value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailUnverified(false); }}
                  autoComplete="email" required
                  className={fieldCls} />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  className={`${fieldCls} pr-12`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Confirm password */}
              {mode === "register" && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${fieldCls} pr-12`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  {/* Live password match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-11 top-1/2 -translate-y-1/2">
                      {password === confirmPassword
                        ? <CheckCircle size={15} className="text-emerald-400" />
                        : <X size={15} className="text-red-400" />
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Forgot password */}
              {mode === "login" && (
                <div className="text-right -mt-1">
                  <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-amber-400 transition font-semibold">
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button type="submit"
                disabled={loading || avatarUploading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1">
                {loading ? (
                  <><Spinner size={18} /><span>{mode === "login" ? "Signing in…" : "Creating account…"}</span></>
                ) : (
                  <>{mode === "login" ? "Sign In" : "Create Account"}<ChevronRight size={17} /></>
                )}
              </button>

              {/* Register hint */}
              {mode === "login" && (
                <p className="text-center text-xs text-slate-500 pt-1">
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchMode("register")} className="text-amber-400 hover:text-amber-300 font-bold transition">
                    Create one free
                  </button>
                </p>
              )}
            </form>

            {/* Security badge */}
            <div className="flex justify-center pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-4 py-2.5 rounded-full border border-white/10">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span className="font-semibold">Secured with JWT + bcrypt encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;