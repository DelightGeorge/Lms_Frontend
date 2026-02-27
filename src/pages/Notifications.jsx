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

// ── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG = {
  ENROLLMENT: {
    icon:    GraduationCap,
    color:   "bg-blue-100 text-blue-600",
    border:  "border-blue-100",
    dot:     "bg-blue-500",
    label:   "Enrollment",
  },
  PAYMENT: {
    icon:    CreditCard,
    color:   "bg-emerald-100 text-emerald-600",
    border:  "border-emerald-100",
    dot:     "bg-emerald-500",
    label:   "Payment",
  },
  COURSE_APPROVED: {
    icon:    Award,
    color:   "bg-green-100 text-green-600",
    border:  "border-green-100",
    dot:     "bg-green-500",
    label:   "Approved",
  },
  COURSE_REJECTED: {
    icon:    AlertCircle,
    color:   "bg-red-100 text-red-600",
    border:  "border-red-100",
    dot:     "bg-red-500",
    label:   "Rejected",
  },
  COURSE_COMPLETED: {
    icon:    Award,
    color:   "bg-amber-100 text-amber-600",
    border:  "border-amber-100",
    dot:     "bg-amber-500",
    label:   "Completed",
  },
  GENERAL: {
    icon:    Info,
    color:   "bg-slate-100 text-slate-600",
    border:  "border-slate-100",
    dot:     "bg-slate-400",
    label:   "General",
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
    <div className={`group flex gap-4 px-5 py-4 transition-all duration-200 border-b border-slate-50 last:border-0
      ${notif.isRead ? "bg-white hover:bg-slate-50/50" : "bg-blue-50/30 hover:bg-blue-50/50"}`}>

      {/* Unread dot */}
      <div className="flex flex-col items-center pt-1.5 shrink-0">
        <div className={`w-2 h-2 rounded-full transition-all ${notif.isRead ? "bg-transparent" : cfg.dot}`} />
      </div>

      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.color}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-bold leading-tight ${notif.isRead ? "text-slate-700" : "text-slate-900"}`}>
              {notif.title}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              {notif.message}
            </p>
          </div>
          <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0 mt-0.5">
            {timeAgo(notif.createdAt)}
          </span>
        </div>

        {/* Type badge + actions */}
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.border}`}>
            {cfg.label}
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!notif.isRead && (
              <button onClick={() => onRead(notif.id)}
                className="text-[10px] font-bold text-blue-500 hover:text-blue-700 px-2 py-0.5 rounded-lg hover:bg-blue-50 transition flex items-center gap-1">
                <CheckCheck size={10} /> Mark read
              </button>
            )}
            <button onClick={() => onDelete(notif.id)} disabled={deleting === notif.id}
              className="text-[10px] font-bold text-red-400 hover:text-red-600 px-2 py-0.5 rounded-lg hover:bg-red-50 transition flex items-center gap-1">
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
        <div className={`fixed top-5 right-5 z-[999] px-5 py-3 rounded-2xl text-white font-bold shadow-2xl text-sm
          ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-slate-50">

        {/* ── Hero ── */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white py-12 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500/30 rounded-xl flex items-center justify-center relative">
                    <Bell size={15} className="text-blue-300" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Notifications</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Your Inbox</h1>
                <p className="text-slate-300 text-sm mt-1">
                  {unreadCount > 0
                    ? <span className="text-blue-300 font-bold">{unreadCount} unread</span>
                    : "All caught up"
                  }
                  {" · "}{notifs.length} total
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => fetchNotifs(true)} disabled={refreshing}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition">
                  <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} disabled={actionLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition">
                    {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <CheckCheck size={13} />}
                    <span className="hidden sm:inline">Mark all read</span>
                  </button>
                )}
                {notifs.length > 0 && (
                  <button onClick={handleDeleteAll} disabled={actionLoading}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 px-3 py-2 rounded-xl transition">
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
            <div className="flex bg-white rounded-xl border border-slate-200 p-1 gap-1">
              {[
                { value: "all",    label: `All (${notifs.length})`           },
                { value: "unread", label: `Unread (${unreadCount})`          },
                { value: "read",   label: `Read (${notifs.length - unreadCount})` },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setFilter(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filter === opt.value
                      ? "bg-slate-900 text-white shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded-xl pl-8 pr-8 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Clear filters */}
            {(filter !== "all" || typeFilter !== "ALL") && (
              <button onClick={() => { setFilter("all"); setTypeFilter("ALL"); }}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition">
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* ── Notification list ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="animate-spin text-blue-500" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <BellOff size={28} className="text-slate-300" />
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-600 text-lg">
                    {filter === "unread" ? "No unread notifications" : "No notifications"}
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    {filter !== "all" || typeFilter !== "ALL"
                      ? "Try changing your filters"
                      : "You're all caught up! 🎉"
                    }
                  </p>
                </div>
                {!user && (
                  <Link to="/auth"
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition">
                    Sign in to see notifications
                  </Link>
                )}
              </div>
            ) : (
              <div>
                {/* Unread section */}
                {filter !== "read" && filtered.filter((n) => !n.isRead).length > 0 && (
                  <>
                    <div className="px-5 py-3 bg-blue-50/50 border-b border-blue-100">
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
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
                      <div className="px-5 py-3 bg-slate-50 border-t border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
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
            <p className="text-center text-xs text-slate-400 mt-4">
              Showing {filtered.length} of {notifs.length} notifications
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Notifications;
