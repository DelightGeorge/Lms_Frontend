// src/pages/Admin/AdminPayoutsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Banknote, CheckCircle, XCircle, Loader2, X, AlertCircle,
  ChevronRight, ArrowLeft, DollarSign, Clock, Users,
  Search, Filter, Eye, ShieldCheck, RefreshCw, BarChart3,
} from "lucide-react";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt     = (n) => `$${(n || 0).toFixed(2)}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const STATUS_CONFIG = {
  PENDING:  { color: "bg-amber-100 text-amber-700",     dot: "bg-amber-500",   label: "Pending"  },
  APPROVED: { color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Approved" },
  REJECTED: { color: "bg-red-100 text-red-600",         dot: "bg-red-500",     label: "Rejected" },
  PAID:     { color: "bg-blue-100 text-blue-700",       dot: "bg-blue-500",    label: "Paid"     },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-white text-sm
    ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
    {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

// ── Action Modal ──────────────────────────────────────────────────────────────
const ActionModal = ({ payout, action, onClose, onDone }) => {
  const [note,    setNote]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const isApprove = action === "approve";

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await API.patch(`/wallet/admin/payouts/${payout.id}/${action}`, {
        adminNote:       isApprove ? note : undefined,
        rejectionReason: !isApprove ? (note || "No reason provided") : undefined,
      });
      onDone(payout.id, isApprove ? "APPROVED" : "REJECTED");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">
              {isApprove ? "Approve Payout" : "Reject Payout"}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"><X size={18} /></button>
          </div>

          <div className="p-6 space-y-4">
            {/* Payout summary */}
            <div className="bg-slate-50 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm overflow-hidden shrink-0">
                  {payout.instructor?.avatarUrl
                    ? <img src={payout.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : payout.instructor?.fullName?.charAt(0)}
                </div>
                <div>
                  <p className="font-black text-slate-800">{payout.instructor?.fullName}</p>
                  <p className="text-xs text-slate-400">{payout.instructor?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Amount</p>
                  <p className="font-black text-xl text-slate-800">{fmt(payout.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Method</p>
                  <p className="font-bold text-slate-700 text-sm capitalize">{payout.payoutMethod?.replace("_", " ")}</p>
                </div>
                {payout.payoutMethod === "bank_transfer" && (
                  <>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Account Name</p>
                      <p className="font-bold text-slate-700 text-sm">{payout.accountName || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Account Number</p>
                      <p className="font-bold text-slate-700 text-sm">{payout.accountNumber || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 font-medium">Bank</p>
                      <p className="font-bold text-slate-700 text-sm">{payout.bankName || "—"}</p>
                    </div>
                  </>
                )}
                {payout.payoutMethod === "paypal" && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 font-medium">PayPal Email</p>
                    <p className="font-bold text-slate-700 text-sm">{payout.paypalEmail || "—"}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Note/Reason */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">
                {isApprove ? "Admin Note (optional)" : "Rejection Reason"}
              </label>
              <textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)}
                placeholder={isApprove ? "e.g. Payment sent via bank transfer" : "e.g. Insufficient verification"}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none transition" />
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl p-3 flex gap-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className={`flex-1 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2
                  ${isApprove ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-500 hover:bg-red-600"}`}>
                {loading ? <Loader2 size={15} className="animate-spin" /> : isApprove ? <CheckCircle size={15} /> : <XCircle size={15} />}
                {loading ? "Processing..." : isApprove ? "Approve & Mark Sent" : "Reject Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const AdminPayoutsPage = () => {
  const [payouts,  setPayouts]  = useState([]);
  const [wallets,  setWallets]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("payouts");
  const [filter,   setFilter]   = useState("PENDING");
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(null); // { payout, action }
  const [toast,    setToast]    = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const [pr, wr] = await Promise.all([
        API.get(`/wallet/admin/payouts${filter ? `?status=${filter}` : ""}`),
        API.get("/wallet/admin/instructors"),
      ]);
      setPayouts(pr.data || []);
      setWallets(wr.data || []);
    } catch {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleDone = (id, newStatus) => {
    setPayouts((p) => p.map((r) => r.id === id ? { ...r, status: newStatus } : r));
    setModal(null);
    showToast(newStatus === "APPROVED" ? "Payout approved!" : "Payout rejected");
  };

  const filtered = payouts.filter((p) =>
    !search || p.instructor?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    p.instructor?.email?.toLowerCase().includes(search.toLowerCase())
  );

  // Stats
  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;
  const pendingTotal  = payouts.filter((p) => p.status === "PENDING").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {modal && (
        <ActionModal
          payout={modal.payout}
          action={modal.action}
          onClose={() => setModal(null)}
          onDone={handleDone}
        />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link to="/admin" className="hover:text-slate-600 flex items-center gap-1 transition">
                <ArrowLeft size={13} /> Admin
              </Link>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-medium">Payouts</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Payout Management</h1>
            <p className="text-sm text-slate-400 mt-0.5">Review and process instructor withdrawal requests</p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition">
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending Requests", value: pendingCount,   icon: Clock,       color: "bg-amber-500",   sub: "awaiting review" },
            { label: "Pending Amount",   value: fmt(pendingTotal), icon: DollarSign, color: "bg-blue-500",    sub: "to be processed", isText: true },
            { label: "Total Instructors",value: wallets.length,  icon: Users,       color: "bg-violet-500",  sub: "with wallets" },
            { label: "Total Earned",     value: fmt(wallets.reduce((a,w) => a + w.totalEarned, 0)), icon: BarChart3, color: "bg-emerald-500", sub: "platform wide", isText: true },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.color} shrink-0`}>
                <c.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{c.label}</p>
                <p className="text-xl font-black text-slate-800">{c.value}</p>
                <p className="text-[10px] text-slate-400">{c.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { id: "payouts", label: "Payout Requests" },
              { id: "wallets", label: "Instructor Wallets" },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-4 text-sm font-bold transition
                  ${tab === t.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "payouts" && (
            <div>
              {/* Filters + Search */}
              <div className="flex items-center gap-3 p-4 border-b border-slate-50 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search instructor..."
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
                    <button key={s} onClick={() => setFilter(s)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition
                        ${filter === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                      {s || "All"}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Banknote size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No {filter.toLowerCase()} requests</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {filtered.map((payout) => (
                    <div key={payout.id} className="p-5 flex items-center gap-4 hover:bg-slate-50/50 transition flex-wrap">
                      {/* Instructor */}
                      <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0 overflow-hidden">
                          {payout.instructor?.avatarUrl
                            ? <img src={payout.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : payout.instructor?.fullName?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{payout.instructor?.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{payout.instructor?.email}</p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-center shrink-0">
                        <p className="font-black text-lg text-slate-800">{fmt(payout.amount)}</p>
                        <p className="text-xs text-slate-400 capitalize">{payout.payoutMethod?.replace("_", " ")}</p>
                      </div>

                      {/* Date */}
                      <div className="text-center shrink-0 hidden sm:block">
                        <p className="font-bold text-slate-700 text-sm">{fmtDate(payout.createdAt)}</p>
                        <p className="text-xs text-slate-400">Requested</p>
                      </div>

                      {/* Status */}
                      <div className="shrink-0">
                        <StatusBadge status={payout.status} />
                        {payout.rejectionReason && (
                          <p className="text-[10px] text-red-400 mt-1 max-w-[120px] truncate">"{payout.rejectionReason}"</p>
                        )}
                      </div>

                      {/* Actions */}
                      {payout.status === "PENDING" && (
                        <div className="flex gap-2 shrink-0 ml-auto">
                          <button onClick={() => setModal({ payout, action: "approve" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition">
                            <CheckCircle size={12} /> Approve
                          </button>
                          <button onClick={() => setModal({ payout, action: "reject" })}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "wallets" && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                </div>
              ) : wallets.length === 0 ? (
                <div className="text-center py-16">
                  <DollarSign size={36} className="text-slate-200 mx-auto mb-3" />
                  <p className="font-bold text-slate-500">No instructor wallets yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["Instructor", "Pending", "Available", "Total Earned", "Paid Out"].map((h) => (
                          <th key={h} className="text-left px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {wallets.map((w) => (
                        <tr key={w.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs shrink-0 overflow-hidden">
                                {w.instructor?.avatarUrl
                                  ? <img src={w.instructor.avatarUrl} alt="" className="w-full h-full object-cover" />
                                  : w.instructor?.fullName?.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{w.instructor?.fullName}</p>
                                <p className="text-xs text-slate-400">{w.instructor?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-bold ${w.pendingBalance > 0 ? "text-amber-600" : "text-slate-400"}`}>
                              {fmt(w.pendingBalance)}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`font-bold ${w.availableBalance >= 25 ? "text-emerald-600" : "text-slate-600"}`}>
                              {fmt(w.availableBalance)}
                            </span>
                            {w.availableBalance >= 25 && (
                              <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">
                                Withdrawable
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 font-black text-slate-800">{fmt(w.totalEarned)}</td>
                          <td className="px-5 py-4 font-bold text-slate-600">{fmt(w.totalPaidOut)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayoutsPage;
