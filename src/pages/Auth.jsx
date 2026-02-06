import React, { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ImageIcon,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

// Simple spinner component
const Spinner = () => (
  <div className="w-6 h-6 border-4 border-t-indigo-600 border-white/20 rounded-full animate-spin"></div>
);

const Auth = () => {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("STUDENT");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Notification state
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [visible, setVisible] = useState(false);

  const navigate = useNavigate();

  // Show notification function with slide/fade animation
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setVisible(true);
    setTimeout(() => setVisible(false), 3000); // hide after 3s
  };

  // ===================== HANDLE FORM SUBMIT =====================
  const handleSubmit = async () => {
    try {
      setLoading(true);
      let data;

      if (mode === "register") {
        if (password !== confirmPassword) {
          showNotification("error", "Passwords do not match!");
          setLoading(false);
          return;
        }

        const res = await API.post("/auth/register", {
          fullName,
          email,
          password,
          role,
          avatarUrl,
        });
        data = res.data;
        localStorage.setItem("token", data.token);
        showNotification("success", `Registered successfully as ${data.user.role}`);
      } else {
        const res = await API.post("/auth/login", { email, password });
        data = res.data;
        localStorage.setItem("token", data.token);
        showNotification("success", `Logged in successfully as ${data.user.role}`);
      }

      // ===== Redirect based on role =====
      switch (data.user.role) {
        case "ADMIN":
          navigate("/admindashboard");
          break;
        case "INSTRUCTOR":
          navigate("/instructordashboard");
          break;
        case "STUDENT":
        default:
          navigate("/studentdashboard");
          break;
      }
    } catch (err) {
      console.error(err);
      showNotification("error", err.response?.data?.message || "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white selection:bg-indigo-500 relative">
      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-4 right-4 px-6 py-3 rounded-xl shadow-lg text-white font-bold z-50 transform transition-all duration-500 ease-in-out
            ${notification.type === "success" ? "bg-emerald-500" : "bg-red-500"}
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          {notification.message}
        </div>
      )}

      {/* MOBILE BACK TO HOME BUTTON */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-1 lg:hidden"
        >
          ← Back to Home
        </Link>
      </div>

      {/* VISUAL PANEL LEFT */}
      <div className="relative hidden lg:flex w-[60%] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[100px]" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-indigo-600 rotate-45" />
          </div>
          <span className="text-2xl font-black tracking-tighter uppercase">
            LMS.PRO
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold mb-6">
            <Sparkles size={14} />
            <span>JOIN 2M+ STUDENTS WORLDWIDE</span>
          </div>
          <h1 className="text-7xl font-black leading-[0.9] mb-8 italic uppercase tracking-tighter">
            Stop <span className="text-indigo-500">Dreaming.</span>
            <br />
            Start{" "}
            <span className="underline decoration-indigo-500 decoration-8">
              Coding.
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-md">
            The world's most aggressive learning platform. Master skills in
            weeks, not years.
          </p>
        </div>

        {/* Footer Links */}
        <div className="relative z-10 flex gap-8 text-xs font-bold text-slate-500">
          <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest">
            Twitter
          </span>
          <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest">
            Discord
          </span>
          <span className="hover:text-white cursor-pointer transition-colors uppercase tracking-widest">
            Github
          </span>
        </div>
      </div>

      {/* AUTH FORM RIGHT */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Desktop Back Button */}
          <div className="hidden lg:block mb-4">
            <Link
              to="/"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-xl">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  mode === m
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {m === "login" ? "Auth / Login" : "Create / User"}
              </button>
            ))}
          </div>

          {/* Form Title */}
          <div className="space-y-2">
            <h2 className="text-4xl font-black tracking-tight uppercase italic">
              {mode === "login" ? "Systems: Online" : "Join the Grid"}
            </h2>
            <p className="text-slate-500 font-medium">
              {mode === "login"
                ? "Enter credentials to sync progress."
                : "Initialize your learning sequence."}
            </p>
          </div>

          {/* ===================== Form ===================== */}
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {mode === "register" && (
              <>
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="IDENTITY NAME"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
                  />
                </div>

                {/* Avatar URL */}
                <div className="relative">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Avatar Image URL (optional)"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Confirm Password */}
            {mode === "register" && (
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="CONFIRM PASSWORD"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            )}

            {/* Role Selector */}
            {mode === "register" && (
              <div className="flex gap-4">
                {["STUDENT", "INSTRUCTOR"].map((r) => (
                  <label key={r} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      className="hidden peer"
                      checked={role === r}
                      onChange={() => setRole(r)}
                    />
                    <div className="text-center py-3 rounded-xl border border-white/10 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:text-indigo-400">
                      {r}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20 active:scale-[0.98]"
            >
              {loading ? <Spinner /> : mode === "login" ? "Execute Login" : "Initialize Account"}
              {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-bold bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>AES-256 Bit Encrypted Connection</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
