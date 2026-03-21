import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import API from "../services/api";

const ForgotPassword = () => {
  const [email,       setEmail]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email address"); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address"); return; }

    setLoading(true);
    try {
      await API.post("/users/forgot-password", { email: email.trim().toLowerCase() });
      // Always show success — never reveal if the email exists (security)
      setSubmitted(true);
    } catch {
      // Still show success screen — same reason
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <Link to="/auth"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold mb-8 transition">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-5 border border-amber-500/20">
                  <Mail size={26} className="text-amber-400" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Forgot your password?</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Enter the email address linked to your account and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-4">
                  <AlertCircle size={15} className="text-red-400 shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors pointer-events-none" size={17} />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition text-sm font-medium placeholder:text-slate-500 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white py-3.5 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-600/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]">
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                    : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                <CheckCircle size={30} className="text-emerald-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white">Check your inbox</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  If <span className="text-amber-400 font-bold">{email}</span> is linked to an account,
                  you'll receive a password reset link shortly.
                </p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-1.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Didn't get it?</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Check your spam or junk folder. The link expires in 1 hour.
                  You can also{" "}
                  <button onClick={() => { setSubmitted(false); setEmail(""); }}
                    className="text-amber-400 hover:text-amber-300 font-bold transition underline underline-offset-2">
                    try again
                  </button>
                  {" "}with a different email.
                </p>
              </div>
              <Link to="/auth"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm font-semibold transition">
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;