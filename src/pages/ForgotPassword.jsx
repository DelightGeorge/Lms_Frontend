import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import API from "../services/api";

const BLUE_DEEP = "#12283D";
const BLUE      = "#1B3A5C";
const LINE      = "rgba(255,255,255,0.12)";
const MUTED     = "#8D96A0";
const ORANGE    = "#D65A2E";
const MOSS      = "#4C7A5C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";

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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      <div className="relative z-10 w-full max-w-md">
        {/* Back */}
        <Link to="/auth"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition" style={{ color: MUTED }}>
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <div className="border rounded-sm p-8" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="w-14 h-14 rounded-sm flex items-center justify-center mb-5 border" style={{ backgroundColor: "rgba(214,90,46,0.12)", borderColor: "rgba(214,90,46,0.3)" }}>
                  <Mail size={24} style={{ color: ORANGE }} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: DISPLAY_FONT }}>Forgot your password?</h1>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Enter the email linked to your account and we'll send you a reset link.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2.5 border rounded-sm px-4 py-3 mb-4" style={{ backgroundColor: "rgba(178,58,46,0.1)", borderColor: "rgba(178,58,46,0.3)" }}>
                  <AlertCircle size={15} className="shrink-0" style={{ color: "#D4695C" }} />
                  <p className="text-sm" style={{ color: "#E3A79E" }}>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                    required
                    className="w-full rounded-sm py-3.5 pl-11 pr-4 outline-none transition text-sm font-medium text-white border"
                    style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3.5 rounded-sm font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ backgroundColor: ORANGE }}>
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
                    : "Send reset link"}
                </button>
              </form>
            </>
          ) : (
            /* ── Success state ── */
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2" style={{ backgroundColor: "rgba(76,122,93,0.15)", borderColor: "rgba(76,122,93,0.4)" }}>
                <CheckCircle size={28} style={{ color: MOSS }} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white" style={{ fontFamily: DISPLAY_FONT }}>Check your inbox</h2>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  If <span className="font-bold" style={{ color: ORANGE }}>{email}</span> is linked to an account,
                  you'll receive a password reset link shortly.
                </p>
              </div>
              <div className="border rounded-sm p-4 text-left space-y-1.5" style={{ backgroundColor: "rgba(255,255,255,0.03)", borderColor: LINE }}>
                <p className="text-xs font-bold uppercase tracking-wide" style={{ color: MUTED }}>Didn't get it?</p>
                <p className="text-xs leading-relaxed" style={{ color: MUTED }}>
                  Check your spam or junk folder. The link expires in 1 hour.
                  You can also{" "}
                  <button onClick={() => { setSubmitted(false); setEmail(""); }}
                    className="font-bold transition underline underline-offset-2" style={{ color: ORANGE }}>
                    try again
                  </button>
                  {" "}with a different email.
                </p>
              </div>
              <Link to="/auth"
                className="inline-flex items-center gap-2 text-sm font-semibold transition" style={{ color: MUTED }}>
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;