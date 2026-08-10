import { useState, useEffect, useCallback } from "react";
import Layout from "../shared/Layout/Layout";
import {
  Bell, BellOff, CheckCheck, Trash2, Loader2,
  GraduationCap, CreditCard, BookOpen, Award,
  ShieldCheck, UserPlus, AlertCircle, Info,
  ChevronDown, Filter, X, RefreshCw,
} from "lucide-react";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";
import { Link } from "react-router-dom";

const INK    = "#22262B";
const BLUE   = "#1B3A5C";
const BLUE_DEEP = "#12283D";
const PAPER  = "#EEF1F3";
const LINE   = "#D8DEE3";
const MUTED  = "#5B6570";
const ORANGE = "#D65A2E";
const MOSS   = "#4C7A5C";
const RUST   = "#B23A2E";
const DISPLAY_FONT = "'Space Grotesk', ui-sans-serif, system-ui, sans-serif";
const MONO_FONT    = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace";

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  ENROLLMENT: {
    icon:  GraduationCap,
    color: BLUE,
    dot:   BLUE,
    label: "Enrollment",
  },
  PAYMENT: {
    icon:  CreditCard,
    color: MOSS,
    dot:   MOSS,
    label: "Payment",
  },
  COURSE_APPROVED: {
    icon:  Award,
    color: MOSS,
    dot:   MOSS,
    label: "Approved",
  },
  COURSE_REJECTED: {
    icon:  AlertCircle,
    color: RUST,
    dot:   RUST,
    label: "Rejected",
  },
  COURSE_COMPLETED: {
    icon:  Award,
    color: ORANGE,
    dot:   ORANGE,
    label: "Completed",
  },
  GENERAL: {
    icon:  Info,
    color: MUTED,
    dot:   MUTED,
    label: "General",
  },
};

const getConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.GENERAL;

// ── Time formatter ────────────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hrs   = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hrs < 24)   return `${hrs}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ── Single notification card ──────────────────────────────────────────────────
const NotifCard = ({ notif, onRead, onDelete, deleting }) => {
  const cfg = getConfig(notif.type);
  const Icon = cfg.icon;

  return (
    <div className="group flex gap-4 px-5 py-4 transition-colors duration-200 border-b last:border-0"
      style={{ borderColor: LINE, backgroundColor: notif.isRead ? "#fff" : "rgba(27,58,92,0.03)" }}>

      {/* Unread dot */}
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <div className="w-2 h-2 rounded-full transition-all" style={{ backgroundColor: notif.isRead ? "transparent" : cfg.dot }} />
      </div>

      {/* Icon */}
      <div className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0" style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}>
        <Icon size={17} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight" style={{ color: notif.isRead ? MUTED : INK }}>
              {notif.title}
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: MUTED }}>
              {notif.message}
            </p>
          </div>
          <span className="text-[10px] whitespace-nowrap shrink-0 mt-0.5" style={{ color: MUTED, fontFamily: MONO_FONT }}>
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        {/* Type badge + actions */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-[9px] font-black px-2 py-0.5 rounded-sm border" style={{ color: cfg.color, borderColor: `${cfg.color}40` }}>
            {cfg.label.toUpperCase()}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notif.isRead && (
              <button onClick={() => onRead(notif.id)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-sm hover:bg-slate-50 transition flex items-center gap-1" style={{ color: BLUE }}>
                <CheckCheck size={10} /> Mark read
              </button>
            )}
            <button onClick={() => onDelete(notif.id)} disabled={deleting === notif.id}
              className="text-[10px] font-bold px-2 py-0.5 rounded-sm hover:bg-red-50 transition flex items-center gap-1" style={{ color: RUST }}>
              {deleting === notif.id
                ? <Loader2 size={10} className="animate-spin" />
                : <Trash2 size={10} />
              }
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const Notifications = () => {
  const { user }       = useAuth();
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const [filter,       setFilter]       = useState("all");   // all | unread | read
  const [typeFilter,   setTypeFilter]   = useState("ALL");
  const [deleting,     setDeleting]     = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchNotifs = useCallback(async (showSpin = false) => {
    if (showSpin) setRefreshing(true);
    try {
      const r = await API.get("/notifications");
      setNotifs(Array.isArray(r.data) ? r.data : []);
    } catch {
      showToast("Failed to load notifications", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifs(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.patch(`/notifications/${id}/read`);
      setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      showToast("Failed to mark as read", "error");
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await API.patch("/notifications/read-all");
      setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
      showToast("All notifications marked as read");
    } catch {
      showToast("Failed to mark all as read", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await API.delete(`/notifications/${id}`);
      setNotifs((prev) => prev.filter((n) => n.id !== id));
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all notifications? This can't be undone.")) return;
    setActionLoading(true);
    try {
      await API.delete("/notifications/all");
      setNotifs([]);
      showToast("All notifications deleted");
    } catch {
      showToast("Failed to delete all", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────
  const filtered = notifs.filter((n) => {
    const readMatch = filter === "all" ? true : filter === "unread" ? !n.isRead : n.isRead;
    const typeMatch = typeFilter === "ALL" ? true : n.type === typeFilter;
    return readMatch && typeMatch;
  });

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  // ── Type filter options ───────────────────────────────────
  const typeOptions = [
    { value: "ALL",              label: "All Types"  },
    { value: "ENROLLMENT",       label: "Enrollment" },
    { value: "PAYMENT",          label: "Payment"    },
    { value: "COURSE_APPROVED",  label: "Approved"   },
    { value: "COURSE_REJECTED",  label: "Rejected"   },
    { value: "COURSE_COMPLETED", label: "Completed"  },
    { value: "GENERAL",          label: "General"    },
  ];

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-[999] px-5 py-3 rounded-sm text-white font-bold shadow-2xl text-sm"
          style={{ backgroundColor: toast.type === "error" ? RUST : MOSS }}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen" style={{ backgroundColor: PAPER }}>

        {/* ── Hero ── */}
        <div className="text-white py-12 px-4 relative overflow-hidden" style={{ backgroundColor: BLUE_DEEP }}>
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }} />
          <div className="max-w-3xl mx-auto relative">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-sm flex items-center justify-center relative" style={{ backgroundColor: "rgba(255,255,255,0.1)" }}>
                    <Bell size={15} style={{ color: ORANGE }} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center" style={{ backgroundColor: RUST }}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: ORANGE, fontFamily: MONO_FONT }}>Notifications</span>
                </div>
                <h1 className="text-3xl font-black tracking-tight" style={{ fontFamily: DISPLAY_FONT }}>Your inbox</h1>
                <p className="text-sm mt-1 text-white/70">
                  {unreadCount > 0
                    ? <span className="font-bold" style={{ color: ORANGE }}>{unreadCount} unread</span>
                    : "All caught up"
                  }
                  {" · "}{notifs.length} total
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => fetchNotifs(true)} disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)", color: "#fff" }}>
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} disabled={actionLoading}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.14)", color: "#fff" }}>
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={handleDeleteAll} disabled={actionLoading}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-sm transition border"
                    style={{ backgroundColor: "rgba(178,58,46,0.15)", borderColor: "rgba(178,58,46,0.3)", color: "#E3A79E" }}>
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Clear all</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">

          {/* ── Filters ── */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {/* Read status */}
            <div className="flex bg-white rounded-sm border p-1 gap-1" style={{ borderColor: LINE }}>
              {[
                { value: "all",    label: `All (${notifs.length})`           },
                { value: "unread", label: `Unread (${unreadCount})`          },
                { value: "read",   label: `Read (${notifs.length - unreadCount})` },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setFilter(opt.value)}
                  className="px-3 py-1.5 rounded-sm text-xs font-bold transition"
                  style={filter === opt.value ? { backgroundColor: BLUE, color: "#fff" } : { color: MUTED }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border rounded-sm pl-8 pr-8 py-2 text-xs font-bold outline-none cursor-pointer"
                style={{ borderColor: LINE, color: INK }}>
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: MUTED }} />
            </div>

            {/* Clear filters */}
            {(filter !== "all" || typeFilter !== "ALL") && (
              <button onClick={() => { setFilter("all"); setTypeFilter("ALL"); }}
                className="flex items-center gap-1 text-xs font-bold px-2 py-1.5 rounded-sm hover:bg-white transition" style={{ color: MUTED }}>
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* ── Notification list ── */}
          <div className="bg-white rounded-sm border overflow-hidden" style={{ borderColor: LINE }}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={26} className="animate-spin" style={{ color: BLUE }} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-14 h-14 rounded-sm flex items-center justify-center" style={{ backgroundColor: PAPER }}>
                  <BellOff size={24} style={{ color: MUTED }} />
                </div>
                <div className="text-center">
                  <p className="font-black text-lg" style={{ color: INK }}>
                    {filter === "unread" ? "No unread notifications" : "No notifications"}
                  </p>
                  <p className="text-sm mt-1" style={{ color: MUTED }}>
                    {filter !== "all" || typeFilter !== "ALL"
                      ? "Try changing your filters"
                      : "You're all caught up"
                    }
                  </p>
                </div>
                {!user && (
                  <Link to="/auth"
                    className="px-5 py-2.5 text-white rounded-sm font-bold text-sm transition" style={{ backgroundColor: BLUE }}>
                    Sign in to see notifications
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {/* Unread section */}
                {filter !== "read" && filtered.filter((n) => !n.isRead).length > 0 && (
                  <>
                    <div className="px-5 py-3 border-b" style={{ backgroundColor: "rgba(27,58,92,0.04)", borderColor: LINE }}>
                      <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: BLUE, fontFamily: MONO_FONT }}>
                        New · {filtered.filter((n) => !n.isRead).length}
                      </p>
                    </div>
                    {filtered.filter((n) => !n.isRead).map((n) => (
                      <NotifCard key={n.id} notif={n} onRead={handleMarkRead} onDelete={handleDelete} deleting={deleting} />
                    ))}
                  </>
                )}

                {/* Read section */}
                {filter !== "unread" && filtered.filter((n) => n.isRead).length > 0 && (
                  <>
                    {filtered.filter((n) => !n.isRead).length > 0 && filter === "all" && (
                      <div className="px-5 py-3 border-t border-b" style={{ backgroundColor: PAPER, borderColor: LINE }}>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: MUTED, fontFamily: MONO_FONT }}>
                          Earlier · {filtered.filter((n) => n.isRead).length}
                        </p>
                      </div>
                    )}
                    {filtered.filter((n) => n.isRead).map((n) => (
                      <NotifCard key={n.id} notif={n} onRead={handleMarkRead} onDelete={handleDelete} deleting={deleting} />
                    ))}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer note */}
          {notifs.length > 0 && (
            <p className="text-center text-xs mt-4" style={{ color: MUTED }}>
              Showing {filtered.length} of {notifs.length} notifications
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;