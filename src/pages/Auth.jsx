import React, { useState } from "react";
import {
  ArrowRight,
  Github,
  Mail,
  Lock,
  User,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const [mode, setMode] = useState("login");

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white selection:bg-indigo-500 relative">
      {/* MOBILE BACK TO HOME BUTTON */}
      <div className="absolute top-4 left-4 z-20">
        <Link
          to="/"
          className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-1 lg:hidden"
        >
          ← Back to Home
        </Link>
      </div>

      {/* 1. THE "VISUAL PUNCH" PANEL (Left) */}
      <div className="relative hidden lg:flex w-[60%] flex-col justify-between p-12 overflow-hidden">
        {/* Animated Background Mesh */}
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

      {/* 2. THE AUTH FORM (Right) */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Desktop Back to Home Button */}
          <div className="hidden lg:block mb-4">
            <Link
              to="/"
              className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-700 transition-all flex items-center gap-1"
            >
              ← Back to Home
            </Link>
          </div>

          {/* Custom Mode Switcher */}
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

          {/* Social Auth */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all font-bold text-sm group">
              <Github
                size={18}
                className="group-hover:scale-110 transition-transform"
              />
              Github
            </button>
            <button className="flex items-center justify-center gap-3 py-3 border border-white/10 rounded-2xl hover:bg-white hover:text-black transition-all font-bold text-sm group">
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="G"
                className="w-4 h-4 group-hover:scale-110 transition-transform"
              />
              Google
            </button>
          </div>

          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Secure Entry
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Actual Form */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {mode === "register" && (
              <div className="relative">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="IDENTITY NAME"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
                />
              </div>
            )}

            <div className="relative">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            <div className="relative">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                size={18}
              />
              <input
                type="password"
                placeholder="PASSWORD"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm font-medium"
              />
            </div>

            {mode === "register" && (
              <div className="flex gap-4">
                {["Student", "Mentor"].map((role) => (
                  <label key={role} className="flex-1 cursor-pointer">
                    <input
                      type="radio"
                      name="role"
                      className="hidden peer"
                      defaultChecked={role === "Student"}
                    />
                    <div className="text-center py-3 rounded-xl border border-white/10 peer-checked:border-indigo-500 peer-checked:bg-indigo-500/10 transition-all text-xs font-black uppercase tracking-widest text-slate-500 peer-checked:text-indigo-400">
                      {role}
                    </div>
                  </label>
                ))}
              </div>
            )}

            <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group shadow-xl shadow-indigo-600/20 active:scale-[0.98]">
              {mode === "login" ? "Execute Login" : "Initialize Account"}
              <ChevronRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="flex justify-center">
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
