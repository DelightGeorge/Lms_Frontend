// src/pages/Admin/AdminInstructorApplicationsPage.jsx
import { useState, useEffect } from "react";
import {
  GraduationCap, CheckCircle, XCircle, Eye, Loader2, Search,
  FileText, Globe, Video, User, Briefcase, Clock, Star,
  ExternalLink, AlertCircle, ChevronDown, ChevronUp, Filter,
  UserCheck, UserX, Users, RefreshCw
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

// ── Document viewer utility ────────────────────────────────────────────────
const getViewableUrl = (url = "") => {
  if (!url) return null;
  const lower = url.toLowerCase();

  // Videos open directly
  if (lower.includes("/video/upload/") || /\.(mp4|mov|webm|avi)(\?|$)/.test(lower)) {
    return url;
  }

  // Raw uploads (doc/docx) → Google Docs Viewer
  if (lower.includes("/raw/upload/")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
  }

  // PDFs stored as Cloudinary image resource_type or explicit .pdf → Google Docs Viewer
  if (lower.includes(".pdf") || lower.includes("/image/upload/")) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=false`;
  }

  // Images open directly
  return url;
};

const openDocument = (url) => {
  const viewUrl = getViewableUrl(url);
  if (viewUrl) window.open(viewUrl, "_blank", "noopener,noreferrer");
};

// ── Helpers ────────────────────────────────────────────────────────────────
const timeAgo = (d) => {
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const StatusBadge = ({ status }) => {
  const cfg = {
    PENDING:  { cls: "bg-amber-100 text-amber-700",     label: "Pending Review" },
    APPROVED: { cls: "bg-emerald-100 text-emerald-700", label: "Approved"       },
    REJECTED: { cls: "bg-red-100 text-red-600",         label: "Rejected"       },
  }[status] || {};
  return (
    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
  );
};

// ── DocLink — button instead of <a> so URL goes through getViewableUrl ─────
const DocLink = ({ url, label, icon: Icon }) => {
  if (!url) return null;
  return (
    <button
      onClick={() => openDocument(url)}
      className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition"
    >
      <Icon size={13} />
      {label}
      <ExternalLink size={11} />
    </button>
  );
};

// ── Application Card ───────────────────────────────────────────────────────
const ApplicationCard = ({ app, onApprove, onReject, approvingId, rejectingId }) => {
  const [expanded, setExpanded]         = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const u = app.user;
  const isActing = approvingId === app.id || rejectingId === app.id;

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) return;
    onReject(app.id, rejectReason);
    setShowRejectForm(false);
  };

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition ${
      app.status === "PENDING" ? "border-amber-200 shadow-sm" : "border-slate-200"
    }`}>
      {/* Summary row */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="shrink-0">
            {u?.avatarUrl ? (
              <img src={u.avatarUrl} className="w-12 h-12 rounded-xl object-cover" alt="" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                {u?.fullName?.[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h3 className="font-black text-slate-900 text-base leading-tight">{u?.fullName}</h3>
                <p className="text-xs text-slate-500">{u?.email}</p>
                <p className="text-sm text-slate-600 mt-1 font-medium">{app.headline}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <StatusBadge status={app.status} />
                <span className="text-xs text-slate-400">{timeAgo(app.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mt-3">
              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Briefcase size={11} /> {app.expertise}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg">
                <Clock size={11} /> {app.yearsExperience} yrs exp
              </span>
              {app.sampleVideoUrl && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2.5 py-1 rounded-lg">
                  <Video size={11} /> Has sample video
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 py-1.5 bg-slate-50 rounded-xl transition"
        >
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {expanded ? "Collapse" : "View Full Application"}
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 p-5 space-y-5 bg-slate-50/50">

          {/* Bio */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Professional Bio</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{app.bio}</p>
          </div>

          {/* Teaching Motivation */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Teaching Statement</p>
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{app.teachingMotivation}</p>
            </div>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Documents & Links</p>
            <div className="flex flex-wrap gap-2">
              <DocLink url={app.idDocumentUrl}  label="Government ID" icon={FileText} />
              <DocLink url={app.cvUrl}          label="CV / Resume"   icon={FileText} />
              <DocLink url={app.portfolioUrl}   label="Portfolio"     icon={Globe}    />
              <DocLink url={app.sampleVideoUrl} label="Sample Video"  icon={Video}    />
            </div>
          </div>

          {/* Member since */}
          <div className="text-xs text-slate-400">
            Member since {new Date(u?.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </div>

          {/* Reviewed info if not pending */}
          {app.status !== "PENDING" && (
            <div className={`rounded-xl p-3 border text-sm ${
              app.status === "APPROVED"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}>
              <p className="font-semibold">
                {app.status === "APPROVED" ? "✓ Approved" : "✗ Rejected"} by {app.reviewedBy?.fullName} · {timeAgo(app.reviewedAt)}
              </p>
              {app.rejectionReason && (
                <p className="text-xs mt-1 opacity-80">Reason: {app.rejectionReason}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action buttons — only for PENDING */}
      {app.status === "PENDING" && (
        <div className="border-t border-slate-100 p-5 space-y-3">
          {!showRejectForm ? (
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(app.id, u?.fullName)}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition"
              >
                {approvingId === app.id
                  ? <Loader2 size={16} className="animate-spin" />
                  : <CheckCircle size={16} />}
                Approve Instructor
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isActing}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm transition"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Rejection reason (required)</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why the application is rejected and what the applicant can improve..."
                  rows={3}
                  className="w-full border border-red-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none transition bg-red-50/30"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRejectSubmit}
                  disabled={!rejectReason.trim() || rejectingId === app.id}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition"
                >
                  {rejectingId === app.id
                    ? <Loader2 size={14} className="animate-spin" />
                    : <XCircle size={14} />}
                  Confirm Rejection
                </button>
                <button
                  onClick={() => { setShowRejectForm(false); setRejectReason(""); }}
                  className="px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────
export default function AdminInstructorApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("PENDING");
  const [search, setSearch]             = useState("");
  const [approvingId, setApprovingId]   = useState(null);
  const [rejectingId, setRejectingId]   = useState(null);
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadApplications = (status = filter) => {
    setLoading(true);
    const q = status === "ALL" ? "" : `?status=${status}`;
    API.get(`/instructor-applications${q}`)
      .then((r) => setApplications(Array.isArray(r.data) ? r.data : []))
      .catch(() => showToast("Failed to load applications", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.role === "ADMIN") loadApplications(filter);
  }, [filter, user]);

  const handleApprove = async (id, name) => {
    setApprovingId(id);
    try {
      await API.patch(`/instructor-applications/${id}/review`, { approve: true });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast(`${name} approved as instructor!`);
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to approve", "error");
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setRejectingId(id);
    try {
      await API.patch(`/instructor-applications/${id}/review`, { approve: false, rejectionReason: reason });
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast("Application rejected. Applicant notified.");
    } catch (e) {
      showToast(e.response?.data?.message || "Failed to reject", "error");
    } finally {
      setRejectingId(null);
    }
  };

  const filtered = applications.filter((a) =>
    a.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
    a.expertise?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    PENDING:  applications.filter((a) => a.status === "PENDING").length,
    APPROVED: applications.filter((a) => a.status === "APPROVED").length,
    REJECTED: applications.filter((a) => a.status === "REJECTED").length,
  };

  if (user?.role !== "ADMIN") {
    return (
      <Layout hideFloatingBar>
        <div className="min-h-screen flex items-center justify-center bg-slate-950 pt-20">
          <p className="text-white text-xl font-black">Admins only</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFloatingBar>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999] px-5 py-3.5 rounded-xl text-white font-semibold shadow-2xl text-sm flex items-center gap-2 ${
          toast.type === "error" ? "bg-rose-600" : "bg-emerald-600"
        }`}>
          {toast.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="min-h-screen bg-slate-950 text-white pt-20">
        {/* Header */}
        <div className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-[64px] z-40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <GraduationCap size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white">Instructor Applications</h1>
                  <p className="text-xs text-slate-500">Review and approve instructor requests</p>
                </div>
              </div>
              <button
                onClick={() => loadApplications(filter)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
              >
                <RefreshCw size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-1 mt-4">
              {[
                { key: "PENDING",  label: "Pending",  icon: Clock     },
                { key: "APPROVED", label: "Approved", icon: UserCheck },
                { key: "REJECTED", label: "Rejected", icon: UserX     },
                { key: "ALL",      label: "All",      icon: Users     },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    filter === key
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon size={14} />
                  {label}
                  {key !== "ALL" && counts[key] > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      filter === key ? "bg-white/20 text-white" : "bg-slate-700 text-slate-300"
                    }`}>{counts[key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Search */}
          <div className="relative mb-6">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or expertise..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 size={40} className="animate-spin text-indigo-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/60 rounded-2xl border border-slate-800">
              <GraduationCap size={48} className="text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-semibold">
                {search ? "No applications match your search" : `No ${filter.toLowerCase()} applications`}
              </p>
              <p className="text-slate-600 text-sm mt-1">
                {filter === "PENDING" && "All applications have been reviewed!"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((app) => (
                <ApplicationCard
                  key={app.id}
                  app={app}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  approvingId={approvingId}
                  rejectingId={rejectingId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}