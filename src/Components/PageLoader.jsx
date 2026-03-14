// src/components/PageLoader.jsx
// Drop into main.jsx or App.jsx to show a branded spinner on first load.
//
// USAGE in main.jsx:
//   import PageLoader from "./components/PageLoader";
//   ...
//   root.render(
//     <React.StrictMode>
//       <PageLoader />
//       <App />
//     </React.StrictMode>
//   );
//
// USAGE in App.jsx (recommended — controls when it hides):
//   import PageLoader from "./components/PageLoader";
//   const [appReady, setAppReady] = useState(false);
//   useEffect(() => { setAppReady(true); }, []);
//   return appReady ? <RouterContent /> : <PageLoader />;
//
// The spinner auto-fades after the React tree mounts.

import { useEffect, useState } from "react";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading,  setFading]  = useState(false);

  useEffect(() => {
    // Start fade after a short delay to ensure styles apply
    const fadeTimer = setTimeout(() => setFading(true), 2000);
    // Remove from DOM after fade completes
    const hideTimer = setTimeout(() => setVisible(false), 2600);
    return () => { clearTimeout(fadeTimer); clearTimeout(hideTimer); };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a",           // slate-900
        transition: "opacity 0.45s ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "all",
      }}
    >
      {/* Animated background blobs */}
      <div style={{
        position: "absolute", top: "-10%", right: "-5%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", left: "10%",
        width: 320, height: 320, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo mark */}
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: "linear-gradient(135deg, #2563eb, #4f46e5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 24, fontWeight: 900, color: "white",
        boxShadow: "0 0 40px rgba(37,99,235,0.4)",
        marginBottom: 28,
        animation: "lms-pulse 1.8s ease-in-out infinite",
      }}>
        L
      </div>

      {/* Spinner ring */}
      <div style={{ position: "relative", width: 48, height: 48, marginBottom: 20 }}>
        {/* Track */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid rgba(255,255,255,0.08)",
        }} />
        {/* Spinning arc */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          border: "3px solid transparent",
          borderTopColor: "#3b82f6",
          borderRightColor: "rgba(59,130,246,0.3)",
          animation: "lms-spin 0.8s linear infinite",
        }} />
        {/* Inner dot */}
        <div style={{
          position: "absolute", inset: "35%",
          borderRadius: "50%",
          background: "#3b82f6",
          opacity: 0.7,
        }} />
      </div>

      {/* Brand name */}
      <p style={{
        fontSize: 15, fontWeight: 900, letterSpacing: "0.05em",
        color: "white", margin: 0,
      }}>
        LMS<span style={{ color: "#3b82f6", fontStyle: "italic" }}>PRO</span>
      </p>
      <p style={{
        fontSize: 11, color: "rgba(148,163,184,0.7)", marginTop: 6,
        letterSpacing: "0.08em", textTransform: "uppercase",
      }}>
        Loading your experience…
      </p>

      {/* Inline keyframes */}
      <style>{`
        @keyframes lms-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes lms-pulse {
          0%, 100% { transform: scale(1);    box-shadow: 0 0 40px rgba(37,99,235,0.4); }
          50%       { transform: scale(1.06); box-shadow: 0 0 60px rgba(37,99,235,0.6); }
        }
      `}</style>
    </div>
  );
}
