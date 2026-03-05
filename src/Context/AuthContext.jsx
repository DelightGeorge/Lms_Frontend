import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUserState] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUserState(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUserState(null);
  };

  // ── updateUser: call this after profile/avatar changes ──
  // Updates both context state AND localStorage so it survives refresh
  const updateUser = (partial) => {
    setUserState((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);