import React, { useState, useEffect } from "react";
import { MessageCircle, Bell, HelpCircle, X, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const FloatingActionBar = ({ hideOnPages = ["/cart", "/checkout", "/payment"] }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [showMenu,  setShowMenu]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const shouldHide = hideOnPages.some((page) =>
      location.pathname.includes(page)
    );
    setIsVisible(!shouldHide);
    setShowMenu(false);
  }, [location.pathname, hideOnPages]);

  if (!isVisible) return null;

  const menuItems = [
    {
      to:    "/help",
      label: "Help & Support",
      icon:  HelpCircle,
      hover: "group-hover:text-amber-500",
      dot:   "bg-amber-500",
    },
    {
      to:    "/contact",
      label: "Chat with us",
      icon:  MessageCircle,
      hover: "group-hover:text-blue-500",
      dot:   "bg-blue-500",
    },
    {
      to:    "/notifications",
      label: "Notifications",
      icon:  Bell,
      hover: "group-hover:text-rose-500",
      dot:   "bg-rose-500",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      {showMenu && (
        <div
          onClick={() => setShowMenu(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9997]"
        />
      )}

      {/* Menu items */}
      <div className="fixed right-6 z-[9998] flex flex-col gap-2.5 bottom-[172px] sm:bottom-[88px]">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.to}
              className="flex justify-end"
              style={{
                transitionDelay: showMenu ? `${idx * 50}ms` : `${(menuItems.length - idx) * 30}ms`,
                transition: "opacity 0.25s ease, transform 0.25s ease",
                opacity:   showMenu ? 1 : 0,
                transform: showMenu ? "translateY(0) scale(1)" : "translateY(16px) scale(0.9)",
                pointerEvents: showMenu ? "auto" : "none",
              }}
            >
              <Link
                to={item.to}
                onClick={() => setShowMenu(false)}
                className="group flex items-center gap-3 pl-4 pr-4 py-2.5 rounded-2xl
                  bg-white border border-slate-200/80 shadow-lg shadow-slate-200/60
                  hover:shadow-xl hover:-translate-x-0.5 transition-all duration-200"
              >
                {/* Label — visible on all sizes */}
                <span className={`text-sm font-bold text-slate-600 ${item.hover} transition-colors whitespace-nowrap`}>
                  {item.label}
                </span>
                {/* Icon with colored dot */}
                <div className="relative shrink-0">
                  <Icon size={17} className={`text-slate-500 ${item.hover} transition-colors`} />
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${item.dot} border border-white`} />
                </div>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Main FAB */}
      <div className="fixed right-6 z-[9999] bottom-[88px] sm:bottom-6">
        {/* Pulse ring — only when closed */}
        {!showMenu && (
          <span className="absolute inset-0 rounded-full border-2 border-amber-400/40 animate-ping pointer-events-none" />
        )}

        <button
          onClick={() => setShowMenu((v) => !v)}
          aria-label="Quick actions"
          className={`relative w-14 h-14 rounded-full shadow-2xl shadow-amber-500/40
            flex items-center justify-center transition-all duration-300 active:scale-90
            ${showMenu
              ? "bg-slate-800 hover:bg-slate-700 rotate-90"
              : "bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 rotate-0"
            }`}
        >
          {showMenu
            ? <X size={20} className="text-white" />
            : <span className="text-xl leading-none">✨</span>
          }
        </button>
      </div>
    </>
  );
};

export default FloatingActionBar;