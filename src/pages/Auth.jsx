import React, { useState, useRef } from "react";
import {
  Mail, Lock, User, ChevronRight, Eye, EyeOff,
  Sparkles, ShieldCheck, ArrowLeft, Camera, X,
  CheckCircle, Upload, Loader2, GraduationCap,
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

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ size = 18 }) => (
  <div className="relative" style={{ width: size, height: size }}>
    <div className="absolute inset-0 rounded-full border-2 border-white/20" />
    <div className="absolute inset-0 rounded-full border-2 border-t-white animate-spin" />
  </div>
);

// ── Avatar Upload Button ──────────────────────────────────────────────────────
const AvatarUpload = ({ value, onChange, uploading, onUpload }) => {
  const ref = useRef(null);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    onUpload(true);
    try {
      const url = await uploadAvatar(file);
      onChange(url);
    } catch {
      // silently fail — user can try again
    } finally {
      onUpload(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Preview / placeholder */}
      <div className="relative shrink-0">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 bg-white/5 flex items-center justify-center">
          {uploading ? (
            <Loader2 size={20} className="text-amber-400 animate-spin" />
          ) : value ? (
            <img src={value} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User size={22} className="text-slate-500" />
          )}
        </div>
        {value && !uploading && (
          <button type="button" onClick={() => onChange("")}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition">
            <X size={10} />
          </button>
        )}
      </div>

      {/* Upload button */}
      <div className="flex-1">
        <button type="button" onClick={() => ref.current?.click()} disabled={uploading}
          className="w-full flex items-center gap-2.5 bg-white/5 border border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5 rounded-xl px-4 py-3 transition disabled:opacity-50 group">
          {uploading
            ? <Loader2 size={16} className="text-amber-400 animate-spin shrink-0" />
            : <Camera size={16} className="text-slate-400 group-hover:text-amber-400 transition shrink-0" />}
          <div className="text-left">
            <p className="text-sm font-bold text-slate-300 group-hover:text-white transition">
              {uploading ? "Uploading..." : value ? "Change photo" : "Upload photo"}
            </p>
            <p className="text-[10px] text-slate-500">JPG, PNG · max 5MB</p>
          </div>
          {value && !uploading && <CheckCircle size={14} className="text-emerald-400 ml-auto shrink-0" />}
        </button>
        <input ref={ref} type="file" accept="image/*" className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])} />
      </div>
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
  const [notification,    setNotification]    = useState({ type: "", message: "" });
  const [visible,         setVisible]         = useState(false);
  const [registered,      setRegistered]      = useState(false); // success state

  const showNotif = (type, message) => {
    setNotification({ type, message });
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || avatarUploading) return;
    setLoading(true);

    try {
      if (mode === "register") {
        if (!fullName.trim()) { showNotif("error", "Please enter your full name"); return; }
        if (password.length < 6) { showNotif("error", "Password must be at least 6 characters"); return; }
        if (password !== confirmPassword) { showNotif("error", "Passwords do not match"); return; }

        await API.post("/auth/register", { fullName, email, password, role, avatarUrl });

        setRegistered(true);
        // If instructor → after email verify they'll be prompted to apply
        // Show appropriate success message
      } else {
        const res = await API.post("/auth/login", { email, password });
        const { token, user } = res.data;
        login(user, token);
        showNotif("success", `Welcome back, ${user.fullName?.split(" ")[0]}!`);

        setTimeout(() => {
          if (user.role === "ADMIN")       navigate("/admindashboard");
          else if (user.role === "INSTRUCTOR") navigate("/instructordashboard");
          else                             navigate("/StudentDashboard");
        }, 500);
      }
    } catch (err) {
      const msg =
        err.response?.data?.message === "Email not verified"
          ? "Your email is not verified. Please check your inbox."
          : err.response?.data?.message || "Something went wrong. Please try again.";
      showNotif("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setRegistered(false);
    setNotification({ type: "", message: "" });
    setFullName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setAvatarUrl(""); setRole("STUDENT");
  };

  // ── Registration success screen ───────────────────────────────────────────
  if (registered) {
    const isInstructor = role === "INSTRUCTOR";
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center p-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 max-w-md w-full bg-white/5 border border-white/10 rounded-3xl p-10 text-center space-y-6 backdrop-blur-sm">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
            <CheckCircle size={36} className="text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white">Account Created!</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We sent a verification email to <span className="text-amber-400 font-bold">{email}</span>.
              Click the link in that email to activate your account.
            </p>
          </div>

          {isInstructor && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 text-left space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-black">
                <GraduationCap size={18} /> Next step for Instructors
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                After verifying your email, you'll need to submit an <strong className="text-white">Instructor Application</strong> with your credentials and documents. Our team reviews applications within 2–3 business days.
              </p>
              <div className="pt-1">
                <Link to="/become-instructor"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition">
                  <Upload size={14} /> Go to Application Form
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <p className="text-xs text-slate-500">Didn't receive the email? Check your spam folder.</p>
            <button onClick={() => switchMode("login")}
              className="w-full border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-bold py-3 rounded-xl transition text-sm">
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 blur-3xl rounded-full pointer-events-none" />

      {/* Toast */}
      {notification.message && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-bold z-50 transform transition-all duration-500 backdrop-blur-xl border max-w-sm
          ${notification.type === "success"
            ? "bg-emerald-500/90 border-emerald-400/50"
            : "bg-red-500/90 border-red-400/50"
          } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
          {notification.message}
        </div>
      )}

      {/* Back */}
      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition text-sm font-semibold backdrop-blur-sm">
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left panel */}
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
                Join thousands of professionals transforming their careers. World-class instructors, real-world skills, lifetime access.
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

          {/* Right panel - form */}
          <div className="space-y-5 max-w-md w-full mx-auto">

            {/* Mode tabs */}
            <div className="flex p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              {[{ key:"login", label:"Sign In" }, { key:"register", label:"Create Account" }].map((m) => (
                <button key={m.key} onClick={() => switchMode(m.key)}
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
                {mode === "login" ? "Access your courses and continue learning" : "Join our community of learners"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">

              {mode === "register" && (
                <>
                  {/* Full name */}
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={17} />
                    <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500" />
                  </div>

                  {/* Avatar upload */}
                  <AvatarUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    uploading={avatarUploading}
                    onUpload={setAvatarUploading}
                  />

                  {/* Role selector */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">I want to</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { r: "STUDENT",    label: "Learn",          icon: "🎓", desc: "Take courses & earn certificates" },
                        { r: "INSTRUCTOR", label: "Teach & Earn",   icon: "🏫", desc: "Create courses & earn revenue" },
                      ].map(({ r, label, icon, desc }) => (
                        <label key={r} className="cursor-pointer group">
                          <input type="radio" name="role" className="hidden peer" checked={role === r} onChange={() => setRole(r)} />
                          <div className="p-4 rounded-xl border-2 border-white/10 peer-checked:border-amber-500/60 peer-checked:bg-amber-500/10 group-hover:border-white/20 transition text-center">
                            <span className="text-2xl block mb-1">{icon}</span>
                            <p className="text-sm font-black text-white peer-checked:text-amber-400">{label}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Instructor notice */}
                  {role === "INSTRUCTOR" && (
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
                      <GraduationCap size={18} className="text-blue-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-blue-300 mb-1">Instructor Application Required</p>
                        <p className="text-xs text-slate-400 leading-relaxed">After creating your account and verifying your email, you'll complete an instructor application with your qualifications and documents. Our team reviews applications in 2–3 days.</p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={17} />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500" />
              </div>

              {/* Password */}
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={17} />
                <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Confirm password (register only) */}
              {mode === "register" && (
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={17} />
                  <input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              )}

              {/* Forgot password */}
              {mode === "login" && (
                <div className="text-right">
                  <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-amber-400 transition font-semibold">Forgot password?</Link>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading || avatarUploading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1">
                {loading ? (
                  <>
                    <Spinner size={18} />
                    <span>{mode === "login" ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ChevronRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Security badge */}
            <div className="flex justify-center pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-4 py-2.5 rounded-full border border-white/10">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span className="font-semibold">Bank-Level Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;