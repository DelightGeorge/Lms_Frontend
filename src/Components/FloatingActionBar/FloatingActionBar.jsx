import React, { useState, useEffect } from "react";
import { MessageCircle, Bell, HelpCircle, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingActionBar = ({ hideOnPages = ["/cart", "/checkout", "/payment"] }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Track scroll position to hide/show button
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      // Check if we're on a page that should hide the floating bar
      const shouldHide = hideOnPages.some((page) =>
        window.location.pathname.includes(page)
      );
      setIsVisible(!shouldHide);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hideOnPages]);

  if (!isVisible) return null;

  return (
    <>
      {/* Floating menu - appears when scrolled */}
      <div
        className={`fixed bottom-6 right-6 z-40 transition-all duration-500 transform ${
          scrollY > 300 && showMenu
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col gap-3">
          {/* Help button */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Handle help action
            }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
          >
            <HelpCircle size={18} className="text-slate-700 group-hover:text-amber-600 transition-colors" />
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">Help & Support</span>
          </a>

          {/* Chat button */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              // Handle chat action
            }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
          >
            <MessageCircle size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">Chat with us</span>
          </a>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all hover:bg-white group"
          >
            <Bell size={18} className="text-slate-700 group-hover:text-red-600 transition-colors" />
            <span className="text-sm font-bold text-slate-700 hidden sm:inline">Notifications</span>
          </Link>
        </div>
      </div>

      {/* Main floating button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-2xl shadow-amber-600/40 flex items-center justify-center transition-all duration-300 group active:scale-95 ${
            showMenu ? "rotate-180" : "rotate-0"
          }`}
        >
          {showMenu ? (
            <ChevronUp size={24} className="text-white" />
          ) : (
            <span className="text-2xl font-black">✨</span>
          )}
        </button>

        {/* Animated ring on scroll */}
        {scrollY > 300 && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-pulse pointer-events-none" />
        )}
      </div>

      {/* Overlay when menu is open */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 transition-opacity duration-300"
        />
      )}
    </>
  );
};

export default FloatingActionBar;
