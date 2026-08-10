import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import API from "../services/api";

const BLUE_DEEP = "#12283D";
const LINE      = "rgba(255,255,255,0.12)";
const MUTED     = "#8D96A0";
const ORANGE    = "#D65A2E";
const MOSS      = "#4C7A5C";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

const strengthColors = ["#B23A2E", ORANGE, "#C99A2E", MOSS];
const strengthLabels = ["Weak", "Okay", "Good", "Strong"];

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

  const fieldCls = "w-full rounded-sm py-3.5 pl-11 pr-12 outline-none transition text-sm font-medium text-white border";
  const fieldStyle = { backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE };

  const strength =
    (password.length >= 6 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }} />

      <div className="relative z-10 w-full max-w-md">
        <Link to="/auth"
          className="inline-flex items-center gap-2 text-sm font-semibold mb-8 transition" style={{ color: MUTED }}>
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <div className="border rounded-sm p-8" style={{ backgroundColor: "rgba(255,255,255,0.04)", borderColor: LINE }}>

          {/* ── No token ── */}
          {tokenMissing && (
            <div className="text-center space-y-5 py-4">
              <div className="w-14 h-14 rounded-sm flex items-center justify-center mx-auto border" style={{ backgroundColor: "rgba(178,58,46,0.12)", borderColor: "rgba(178,58,46,0.3)" }}>
                <AlertCircle size={24} style={{ color: "#D4695C" }} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white mb-2" style={{ fontFamily: DISPLAY_FONT }}>Invalid reset link</h2>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  This password reset link is missing or broken. Please request a new one.
                </p>
              </div>
              <Link to="/forgot-password"
                className="inline-flex items-center gap-2 text-white font-black px-6 py-3 rounded-sm transition text-sm"
                style={{ backgroundColor: ORANGE }}>
                Request new link
              </Link>
            </div>
          )}

          {/* ── Success ── */}
          {!tokenMissing && done && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border-2" style={{ backgroundColor: "rgba(76,122,93,0.15)", borderColor: "rgba(76,122,93,0.4)" }}>
                <CheckCircle size={28} style={{ color: MOSS }} />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-black text-white" style={{ fontFamily: DISPLAY_FONT }}>Password updated</h2>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Your password has been changed. Redirecting you to sign in…
                </p>
              </div>
              <Link to="/auth"
                className="inline-flex items-center gap-2 text-white font-black px-6 py-3 rounded-sm transition text-sm"
                style={{ backgroundColor: ORANGE }}>
                Sign in now
              </Link>
            </div>
          )}

          {/* ── Form ── */}
          {!tokenMissing && !done && (
            <>
              <div className="mb-8">
                <div className="w-14 h-14 rounded-sm flex items-center justify-center mb-5 border" style={{ backgroundColor: "rgba(214,90,46,0.12)", borderColor: "rgba(214,90,46,0.3)" }}>
                  <Lock size={24} style={{ color: ORANGE }} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: DISPLAY_FONT }}>Set new password</h1>
                <p className="text-sm leading-relaxed" style={{ color: MUTED }}>
                  Choose a strong password with at least 6 characters including a letter.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 border rounded-sm px-4 py-3 mb-5" style={{ backgroundColor: "rgba(178,58,46,0.1)", borderColor: "rgba(178,58,46,0.3)" }}>
                  <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#D4695C" }} />
                  <div className="flex-1">
                    <p className="text-sm leading-snug" style={{ color: "#E3A79E" }}>{error}</p>
                    {error.includes("expired") && (
                      <Link to="/forgot-password"
                        className="text-xs font-bold mt-1 inline-block underline underline-offset-2" style={{ color: ORANGE }}>
                        Request a new link →
                      </Link>
                    )}
                  </div>
                  <button onClick={() => setError("")} className="transition shrink-0" style={{ color: "#D4695C" }}>
                    <X size={13} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* New password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    autoComplete="new-password"
                    required
                    className={fieldCls} style={fieldStyle}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition" style={{ color: MUTED }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirm password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" size={17} style={{ color: MUTED }} />
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPass(e.target.value); setError(""); }}
                    autoComplete="new-password"
                    required
                    className={fieldCls} style={fieldStyle}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition" style={{ color: MUTED }}>
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  {/* Live match indicator */}
                  {confirmPassword.length > 0 && (
                    <div className="absolute right-11 top-1/2 -translate-y-1/2">
                      {password === confirmPassword
                        ? <CheckCircle size={15} style={{ color: MOSS }} />
                        : <X size={15} style={{ color: "#D4695C" }} />}
                    </div>
                  )}
                </div>

                {/* Password strength hint */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[1,2,3,4].map((lvl) => (
                        <div key={lvl}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{ backgroundColor: lvl <= strength ? strengthColors[Math.max(strength - 1, 0)] : "rgba(255,255,255,0.1)" }} />
                      ))}
                    </div>
                    {strength > 0 && (
                      <p className="text-[10px] font-semibold" style={{ fontFamily: MONO_FONT, color: strengthColors[strength - 1] }}>
                        {strengthLabels[strength - 1]}
                      </p>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full text-white py-3.5 rounded-sm font-black text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-1"
                  style={{ backgroundColor: ORANGE }}>
                  {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Updating password…</>
                    : "Update password"}
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