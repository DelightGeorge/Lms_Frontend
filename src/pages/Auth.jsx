import React, { useState } from "react";
import {
  Mail, Lock, User, ChevronRight, Eye, EyeOff,
  Sparkles, ShieldCheck, ImageIcon, ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

const Spinner = () => (
  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
);

const Auth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

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
  const [notification, setNotification] = useState({ type: "", message: "" });
  const [visible, setVisible] = useState(false);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setVisible(true);
    setTimeout(() => setVisible(false), 4000);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (mode === "register") {
        if (password !== confirmPassword) {
          showNotification("error", "Passwords do not match!");
          setLoading(false);
          return;
        }

        await API.post("/auth/register", { fullName, email, password, role, avatarUrl });
        showNotification("success", "Registration successful! Please check your email to verify your account.");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setMode("login"), 2000);

      } else {
        const res = await API.post("/auth/login", { email, password });
        const { token, user } = res.data;

        login(user, token);

        showNotification("success", `Welcome back, ${user.fullName?.split(" ")[0]}!`);

        setTimeout(() => {
          if (user.role === "ADMIN") navigate("/admindashboard");
          else if (user.role === "INSTRUCTOR") navigate("/instructordashboard");
          else navigate("/StudentDashboard");
        }, 500);
      }
    } catch (err) {
      console.error(err);
      const msg =
        err.response?.data?.message === "Email not verified"
          ? "Your email is not verified. Please check your inbox."
          : err.response?.data?.message || "Error occurred";
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/5 blur-3xl rounded-full pointer-events-none" />

      {/* Notification */}
      {notification.message && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-bold z-50 transform transition-all duration-500 ease-in-out backdrop-blur-xl border ${
            notification.type === "success"
              ? "bg-emerald-500/90 border-emerald-400/50 shadow-emerald-600/20"
              : "bg-red-500/90 border-red-400/50 shadow-red-600/20"
          } ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          {notification.message}
        </div>
      )}

      {/* Back button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-sm font-semibold backdrop-blur-sm"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left panel - Premium messaging */}
          <div className="hidden lg:block space-y-8">
            <div>
              <Link to="/" className="inline-flex items-center gap-2.5 group mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white font-black text-xl group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-600/30">
                  L
                </div>
                <span className="text-2xl font-black tracking-tight text-white">
                  LMS<span className="text-amber-400 italic ml-1">ELITE</span>
                </span>
              </Link>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Sparkles size={14} />
                PREMIUM EDUCATION
              </div>

              <h1 className="text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Your Gateway to
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-300">
                  Excellence
                </span>
              </h1>

              <p className="text-lg text-slate-300 leading-relaxed max-w-md">
                Join thousands of professionals transforming their careers. World-class instructors, real-world skills, lifetime access.
              </p>

              {/* Stats */}
              <div className="space-y-4 pt-4">
                {[
                  { number: "2M+", label: "Active Learners" },
                  { number: "500+", label: "Premium Courses" },
                  { number: "4.9★", label: "Average Rating" },
                ].map((stat, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-2" />
                    <div>
                      <p className="font-black text-xl text-white">{stat.number}</p>
                      <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel - Auth form */}
          <div className="space-y-6 max-w-md">
            {/* Mode tabs */}
            <div className="flex p-1.5 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
              {[
                { key: "login", label: "Sign In" },
                { key: "register", label: "Create Account" },
              ].map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMode(m.key)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                    mode === m.key
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/30"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Form header */}
            <div className="space-y-2 pt-2">
              <h2 className="text-3xl font-black text-white">
                {mode === "login" ? "Welcome Back" : "Start Learning"}
              </h2>
              <p className="text-sm text-slate-400">
                {mode === "login"
                  ? "Access your courses and continue learning"
                  : "Join our community of learners"}
              </p>
            </div>

            {/* Form */}
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              {mode === "register" && (
                <>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium placeholder:text-slate-500"
                    />
                  </div>

                  <div className="relative group">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                    <input
                      type="text"
                      placeholder="Avatar URL (optional)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium placeholder:text-slate-500"
                    />
                  </div>
                </>
              )}

              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium placeholder:text-slate-500"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {mode === "register" && (
                <>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={18} />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 outline-none focus:border-amber-500/50 focus:bg-white/8 focus:ring-1 focus:ring-amber-500/30 transition-all text-sm font-medium placeholder:text-slate-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex gap-3 pt-2">
                    {["STUDENT", "INSTRUCTOR"].map((r) => (
                      <label key={r} className="flex-1 cursor-pointer group">
                        <input
                          type="radio"
                          name="role"
                          className="hidden peer"
                          checked={role === r}
                          onChange={() => setRole(r)}
                        />
                        <div className="text-center py-3 rounded-lg border border-white/10 peer-checked:border-amber-500/50 peer-checked:bg-amber-500/10 group-hover:border-white/20 transition-all text-sm font-bold text-slate-400 peer-checked:text-amber-400">
                          {r}
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading ? (
                  <Spinner />
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Create Account"}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </form>

            {/* Security badge */}
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 px-4 py-2.5 rounded-full border border-white/10 backdrop-blur-sm">
                <ShieldCheck size={14} className="text-emerald-400" />
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
