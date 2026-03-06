import React, { useState, useEffect } from "react";
import { MessageCircle, Bell, HelpCircle, ChevronUp, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const FloatingActionBar = ({ hideOnPages = ["/cart", "/checkout", "/payment"] }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  // Check if current page should hide floating bar
  useEffect(() => {
    const shouldHide = hideOnPages.some((page) =>
      location.pathname.includes(page)
    );
    setIsVisible(!shouldHide);
    setShowMenu(false); // Close menu on route change
  }, [location.pathname, hideOnPages]);

  if (!isVisible) return null;

  return (
    <>
      {/* Menu items - always positioned, but hidden/shown */}
      <div
        className={`fixed bottom-24 right-6 z-[9998] flex flex-col gap-2 transition-all duration-300 ${
          showMenu
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Help button */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Handle help action
          }}
          className="flex items-center justify-end gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
        >
          <span className="text-sm font-bold text-slate-700 group-hover:text-amber-600 transition-colors hidden sm:inline">
            Help & Support
          </span>
          <HelpCircle size={18} className="text-slate-700 group-hover:text-amber-600 transition-colors shrink-0" />
        </a>

        {/* Chat button */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            // Handle chat action
          }}
          className="flex items-center justify-end gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
        >
          <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600 transition-colors hidden sm:inline">
            Chat with us
          </span>
          <MessageCircle size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors shrink-0" />
        </a>

        {/* Notifications */}
        <Link
          to="/notifications"
          className="flex items-center justify-end gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
        >
          <span className="text-sm font-bold text-slate-700 group-hover:text-red-600 transition-colors hidden sm:inline">
            Notifications
          </span>
          <Bell size={18} className="text-slate-700 group-hover:text-red-600 transition-colors shrink-0" />
        </Link>
      </div>

      {/* Main floating button - ALWAYS visible and on top */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-2xl shadow-amber-600/40 flex items-center justify-center transition-all duration-300 group active:scale-95 ${
            showMenu ? "rotate-180" : "rotate-0"
          }`}
        >
          {showMenu ? (
            <X size={24} className="text-white" />
          ) : (
            <span className="text-2xl font-black">✨</span>
          )}
        </button>

        {/* Animated ring */}
        {!showMenu && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Overlay when menu is open */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997] transition-opacity duration-300"
        />
      )}
    </>
  );
};

export default FloatingActionBar;