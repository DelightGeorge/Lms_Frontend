import React, { useState, useRef, useEffect } from "react";
import {
  Mail, Lock, User, ChevronRight, Eye, EyeOff,
  ShieldCheck, ArrowLeft, Camera, X,
  CheckCircle, Loader2, GraduationCap, AlertCircle,
  RefreshCw, Briefcase,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER  = "#EEF1F3";
const LINE   = "rgba(255,255,255,0.12)";
const MUTED  = "#8D96A0";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

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
    <div className="fixed top-6 right-6 z-[999] flex items-start gap-3 px-5 py-4 rounded-sm shadow-2xl text-white font-semibold text-sm max-w-sm border"
      style={{ backgroundColor: isSuccess ? MOSS : "#B23A2E", borderColor: "rgba(255,255,255,0.2)" }}>
      {isSuccess ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white ml-1 shrink-0">
        <X size={14} />
      </button>
    </div>
  );
};

// ── Password strength meter (shared logic w/ ResetPassword) ──────────────────
const strengthOf = (password) =>
  (password.length >= 6 ? 1 : 0) +
  (/[A-Z]/.test(password) ? 1 : 0) +
  (/[0-9]/.test(password) ? 1 : 0) +
  (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

const StrengthMeter = ({ password }) => {
  if (!password) return null;
  const strength = strengthOf(password);
  const colors = ["#B23A2E", ORANGE, "#C99A2E", MOSS];
  const labels = ["Weak", "Okay", "Good", "Strong"];
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1.5">
        {[1,2,3,4].map((lvl) => (
          <div key={lvl} className="h-1 flex-1 rounded-full transition-all"
            style={{ backgroundColor: lvl <= strength ? colors[Math.max(strength - 1, 0)] : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-[10px] font-semibold" style={{ fontFamily: MONO_FONT, color: colors[strength - 1] }}>
          {labels[strength - 1]}
        </p>
      )}
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
        <div className="w-16 h-16 rounded-sm overflow-hidden border flex items-center justify-center" style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.04)" }}>
          {uploading ? (
            <Loader2 size={22} className="animate-spin" style={{ color: ORANGE }} />
          ) : value ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={24} style={{ color: MUTED }} />
          )}
        </div>
        {value && !uploading && (
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white transition"
            style={{ backgroundColor: "#B23A2E" }}>
            <X size={10} />
          </button>
        )}
      </div>

      {/* Button */}
      <div className="flex-1">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="w-full flex items-center gap-2.5 border rounded-sm px-4 py-3 transition disabled:opacity-50 group"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}>
          {uploading
            ? <Loader2 size={16} className="animate-spin shrink-0" style={{ color: ORANGE }} />
            : <Camera size={16} className="shrink-0" style={{ color: MUTED }} />}
          <div className="text-left">
            <p className="text-sm font-bold text-white">
              {uploading ? "Uploading…" : value ? "Change photo" : "Upload photo"}
            </p>
            <p className="text-[10px]" style={{ color: MUTED }}>JPG, PNG · max 5MB · optional</p>
          </div>
          {value && !uploading && <CheckCircle size={14} className="ml-auto shrink-0" style={{ color: MOSS }} />}
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
  <div className="min-h-screen text-white flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
    <div className="relative z-10 max-w-md w-full border rounded-sm p-10 text-center space-y-6" style={{ borderColor: LINE, backgroundColor: "rgba(255,255,255,0.04)" }}>
      <div className="w-16 h-16 rounded-sm flex items-center justify-center mx-auto border-2" style={{ backgroundColor: "rgba(76,122,93,0.15)", borderColor: "rgba(76,122,93,0.4)" }}>
        <CheckCircle size={30} style={{ color: MOSS }} />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white" style={{ fontFamily: DISPLAY_FONT }}>Account created</h2>
        <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
          We sent a verification link to{" "}
          <span className="font-bold break-all" style={{ color: ORANGE }}>{email}</span>.
          Click it to activate your account before signing in.
        </p>
      </div>

      {role === "INSTRUCTOR" && (
        <div className="border rounded-sm p-5 text-left space-y-2" style={{ backgroundColor: "rgba(27,58,92,0.3)", borderColor: LINE }}>
          <div className="flex items-center gap-2 font-black text-sm" style={{ color: "#7B9DC4" }}>
            <GraduationCap size={16} /> Next step for instructors
          </div>
          <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
            After verifying your email, submit an <strong className="text-white">Instructor Application</strong> with your credentials. Our team reviews within 2–3 business days.
          </p>
          <Link to="/become-instructor"
            className="inline-flex items-center gap-2 text-white font-bold text-sm px-5 py-2.5 rounded-sm transition mt-1"
            style={{ backgroundColor: BLUE }}>
            Go to application form
          </Link>
        </div>
      )}

      <div className="space-y-3 pt-2">
        <p className="text-xs" style={{ color: MUTED }}>Didn't receive the email? Check your spam or junk folder.</p>
        <button onClick={onBack}
          className="w-full border font-bold py-3 rounded-sm transition text-sm text-white"
          style={{ borderColor: LINE }}>
          Back to sign in
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
    <div className="border rounded-sm p-4 space-y-2" style={{ backgroundColor: "rgba(214,90,46,0.08)", borderColor: "rgba(214,90,46,0.3)" }}>
      <div className="flex items-center gap-2 font-black text-sm" style={{ color: ORANGE }}>
        <AlertCircle size={15} /> Email not verified
      </div>
      <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
        You need to verify your email before signing in. Check your inbox for a link from us.
      </p>
      {!sent ? (
        <button onClick={resend} disabled={sending}
          className="flex items-center gap-1.5 text-xs font-bold transition disabled:opacity-50" style={{ color: ORANGE }}>
          {sending ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {sending ? "Sending…" : "Resend verification email"}
        </button>
      ) : (
        <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: MOSS }}>
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
        showToast("success", `Welcome back, ${user.fullName?.split(" ")[0] || "there"}!`);
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
  const fieldCls = "w-full rounded-sm py-3.5 pl-11 pr-4 outline-none transition text-sm font-medium text-white border";
  const fieldStyle = { backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE };

  return (
    <div className="min-h-screen text-white flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>

      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      <Toast type={toast.type} message={toast.message} onClose={clearToast} />

      {/* Back link */}
      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 border rounded-sm transition text-sm font-semibold"
        style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}>
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left panel ────────────────────────────────────────────────── */}
          <div className="hidden lg:block space-y-8">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-11 h-11 rounded-sm flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: BLUE, fontFamily: DISPLAY_FONT }}>L</div>
              <span className="text-2xl font-black tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>LMS<span style={{ color: ORANGE }}>PRO</span></span>
            </Link>
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 border rounded-sm text-xs font-semibold tracking-widest" style={{ borderColor: LINE, fontFamily: MONO_FONT }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ORANGE }} />
                ACCOUNT ACCESS
              </div>
              <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>
                Pick up
                <br />
                <span style={{ color: ORANGE }}>where you left off.</span>
              </h1>
              <p className="text-base text-white/70 leading-relaxed max-w-md">
                One account for every course you take or teach.
              </p>
              <div className="space-y-4 pt-4">
                {[
                  { number: "500+", label: "Courses"  },
                  { number: "2M+",  label: "Learners"  },
                  { number: "4.9",  label: "Avg rating"   },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 pl-3 border-l-2" style={{ borderColor: ORANGE }}>
                    <div>
                      <p className="font-black text-xl text-white" style={{ fontFamily: DISPLAY_FONT }}>{s.number}</p>
                      <p className="text-sm" style={{ color: MUTED, fontFamily: MONO_FONT }}>{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right panel (form) ────────────────────────────────────────── */}
          <div className="space-y-5 max-w-md w-full mx-auto">

            {/* Mode toggle */}
            <div className="flex p-1.5 border rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}>
              {[{ key: "login", label: "Sign In" }, { key: "register", label: "Create Account" }].map((m) => (
                <button key={m.key} type="button" onClick={() => switchMode(m.key)}
                  className="flex-1 py-3 rounded-sm text-sm font-bold transition-all duration-200"
                  style={mode === m.key
                    ? { backgroundColor: ORANGE, color: "#fff" }
                    : { color: MUTED }}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Header */}
            <div className="pt-1">
              <h2 className="text-3xl font-black text-white" style={{ fontFamily: DISPLAY_FONT }}>
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-sm mt-1" style={{ color: MUTED }}>
                {mode === "login" ? "Sign in to access your courses" : "Takes less than a minute"}
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
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                    <input type="text" placeholder="Full name" value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name" required
                      className={fieldCls} style={fieldStyle} />
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
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: MUTED, fontFamily: MONO_FONT }}>I want to</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { r: "STUDENT",    label: "Learn",        icon: <GraduationCap size={18} />, desc: "Take courses, earn certificates" },
                        { r: "INSTRUCTOR", label: "Teach & earn", icon: <Briefcase size={18} />,      desc: "Create courses, earn revenue"    },
                      ].map(({ r, label, icon, desc }) => (
                        <button key={r} type="button" onClick={() => setRole(r)}
                          className="p-4 rounded-sm border transition text-center w-full"
                          style={role === r
                            ? { borderColor: ORANGE, backgroundColor: "rgba(214,90,46,0.1)" }
                            : { borderColor: LINE, backgroundColor: "rgba(255,255,255,0.03)" }}>
                          <span className="flex justify-center mb-1.5" style={{ color: role === r ? ORANGE : MUTED }}>{icon}</span>
                          <p className="text-sm font-black" style={{ color: role === r ? ORANGE : "#fff" }}>{label}</p>
                          <p className="text-[10px] mt-0.5 leading-tight" style={{ color: MUTED }}>{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Instructor notice */}
                  {role === "INSTRUCTOR" && (
                    <div className="border rounded-sm p-4 flex gap-3" style={{ backgroundColor: "rgba(27,58,92,0.3)", borderColor: LINE }}>
                      <GraduationCap size={18} className="shrink-0 mt-0.5" style={{ color: "#7B9DC4" }} />
                      <div>
                        <p className="text-sm font-bold mb-1" style={{ color: "#7B9DC4" }}>Instructor application required</p>
                        <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                          After verifying your email you'll complete a short application. Our team reviews in 2–3 business days.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                <input type="email" placeholder="Email address" value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailUnverified(false); }}
                  autoComplete="email" required
                  className={fieldCls} style={fieldStyle} />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                  className={`${fieldCls} pr-12`} style={fieldStyle}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition" style={{ color: MUTED }}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Password strength — register only */}
              {mode === "register" && <StrengthMeter password={password} />}

              {/* Confirm password */}
              {mode === "register" && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    className={`${fieldCls} pr-12`} style={fieldStyle}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition" style={{ color: MUTED }}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                  {/* Live password match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-11 top-1/2 -translate-y-1/2">
                      {password === confirmPassword
                        ? <CheckCircle size={15} style={{ color: MOSS }} />
                        : <X size={15} style={{ color: "#D4695C" }} />
                      }
                    </div>
                  )}
                </div>
              )}

              {/* Forgot password */}
              {mode === "login" && (
                <div className="text-right -mt-1">
                  <Link to="/forgot-password" className="text-xs font-semibold transition" style={{ color: MUTED }}>
                    Forgot password?
                  </Link>
                </div>
              )}

              {/* Submit */}
              <button type="submit"
                disabled={loading || avatarUploading}
                className="w-full text-white py-4 rounded-sm font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
                style={{ backgroundColor: ORANGE }}>
                {loading ? (
                  <><Spinner size={18} /><span>{mode === "login" ? "Signing in…" : "Creating account…"}</span></>
                ) : (
                  <>{mode === "login" ? "Sign in" : "Create account"}<ChevronRight size={17} /></>
                )}
              </button>

              {/* Register hint */}
              {mode === "login" && (
                <p className="text-center text-xs pt-1" style={{ color: MUTED }}>
                  Don't have an account?{" "}
                  <button type="button" onClick={() => switchMode("register")} className="font-bold transition" style={{ color: ORANGE }}>
                    Create one free
                  </button>
                </p>
              )}
            </form>

            {/* Security badge */}
            <div className="flex justify-center pt-1">
              <div className="flex items-center gap-2 text-xs border rounded-sm px-4 py-2.5" style={{ color: MUTED, borderColor: LINE }}>
                <ShieldCheck size={13} style={{ color: MOSS }} />
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