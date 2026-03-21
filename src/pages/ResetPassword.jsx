import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import API from "../services/api";

const ResetPassword = () => {
  const { token }                           = useParams();
  const navigate                            = useNavigate();
  const [password,        setPassword]      = useState("");
  const [confirmPassword, setConfirmPass]   = useState("");
  const [showPassword,    setShowPassword]  = useState(false);
  const [showConfirm,     setShowConfirm]   = useState(false);
  const [loading,         setLoading]       = useState(false);
  const [done,            setDone]          = useState(false);
  const [error,           setError]         = useState("");

  // If no token in URL, show an error immediately
  const tokenMissing = !token;

  const validate = () => {
    if (password.length < 6)         return "Password must be at least 6 characters";
    if (!/[A-Za-z]/.test(password))  return "Password must contain at least one letter";
    if (password !== confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      await API.patch(`/users/reset-password/${token}`, { password });
      setDone(true);
      // Auto-redirect to /auth after 3 seconds
      setTimeout(() => navigate("/auth"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        setError("This reset link has expired or is invalid. Please request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldCls = "w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-12 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500 text-white";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/auth"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">

          {/* ── No token ── */}
          {tokenMissing && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                <AlertCircle size={26} className="text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2">Invalid Reset Link</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This password reset link is missing or broken. Please request a new one.
                </p>
              </div>
              <Link to="/forgot-password"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-white font-black px-6 py-3 rounded-xl transition text-sm">
                Request New Link
              </Link>
            </div>
          )}

          {/* ── Success ── */}
          {!tokenMissing && done && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                <CheckCircle size={30} className="text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white">Password updated!</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Your password has been changed successfully. Redirecting you to sign in…
                </p>
              </div>
              <Link to="/auth"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black px-6 py-3 rounded-xl transition text-sm shadow-lg shadow-amber-600/25">
                Sign In Now
              </Link>
            </div>
          )}

          {/* ── Form ── */}
          {!tokenMissing && !done && (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20">
                  <Lock size={26} className="text-amber-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Set new password</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Choose a strong password with at least 6 characters including a letter.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                  <AlertCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-red-300 leading-snug">{error}</p>
                    {error.includes("expired") && (
                      <Link to="/forgot-password"
                        className="text-xs text-amber-400 hover:text-amber-300 font-bold mt-1 inline-block underline underline-offset-2">
                        Request a new link →
                      </Link>
                    )}
                  </div>
                  <button onClick={() => setError("")} className="text-red-400/60 hover:text-red-400 transition shrink-0">
                    <X size={13} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* New password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="new-password"
                    required
                    className={fieldCls}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPass(e.target.value); setError(""); }}
                    autoComplete="new-password"
                    required
                    className={fieldCls}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Live match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-11 top-1/2 -translate-y-1/2">
                      {password === confirmPassword
                        ? <CheckCircle size={15} className="text-emerald-400" />
                        : <X size={15} className="text-red-400" />}
                    </div>
                  )}
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="flex gap-1.5">
                    {[1,2,3,4].map((lvl) => {
                      const strength =
                        (password.length >= 6 ? 1 : 0) +
                        (/[A-Z]/.test(password) ? 1 : 0) +
                        (/[0-9]/.test(password) ? 1 : 0) +
                        (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
                      const colors = ["bg-red-500","bg-orange-500","bg-amber-500","bg-emerald-500"];
                      return (
                        <div key={lvl}
                          className={`h-1 flex-1 rounded-full transition-all ${lvl <= strength ? colors[strength - 1] : "bg-white/10"}`} />
                      );
                    })}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Updating password…</>
                    : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;