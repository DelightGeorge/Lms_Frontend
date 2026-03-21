// src/Context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Clock } from "lucide-react";

const AuthContext = createContext(null);

// ── Session-expired modal ─────────────────────────────────────────────────────
// Shown whenever the API interceptor fires "session:expired".
// Gives the user a clear explanation before redirecting them to /auth.
const SessionExpiredModal = ({ onDismiss }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center space-y-5 animate-fade-in">
      {/* Icon */}
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
        <Clock size={30} className="text-amber-500" />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-900">Session Expired</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          You've been signed out because your session timed out after 24 hours.
          Please sign in again to continue.
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onDismiss}
        className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 text-sm active:scale-[0.98]"
      >
        <LogIn size={16} /> Sign In Again
      </button>
    </div>
  </div>
);

// ── Provider ──────────────────────────────────────────────────────────────────
export const AuthProvider = ({ children }) => {
  const [user,           setUserState]     = useState(null);
  const [loading,        setLoading]       = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Read persisted session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) setUserState(JSON.parse(stored));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  // Listen for the custom event fired by the API interceptor
  useEffect(() => {
    const handleExpired = () => {
      setUserState(null);      // clear context state immediately
      setSessionExpired(true); // show the modal
    };
    window.addEventListener("session:expired", handleExpired);
    return () => window.removeEventListener("session:expired", handleExpired);
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
    setSessionExpired(false); // clear any lingering expired state
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
    setSessionExpired(false);
  }, []);

  // Call this after profile / avatar updates so context + localStorage stay in sync
  const updateUser = useCallback((partial) => {
    setUserState((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Dismiss the modal and navigate to /auth
  // We use window.location so this works even outside a Router context
  const handleExpiredDismiss = () => {
    setSessionExpired(false);
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
      {sessionExpired && <SessionExpiredModal onDismiss={handleExpiredDismiss} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);