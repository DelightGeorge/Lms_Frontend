// src/pages/Instructor/CouponsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Tag, Plus, Copy, CheckCircle, X, Loader2, Trash2,
  ToggleLeft, ToggleRight, AlertCircle, ChevronRight,
  ArrowLeft, Calendar, Users, Percent, Info, Eye,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never";
const isExpired = (d) => d && new Date(d) < new Date();

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-white text-sm
    ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
    {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
  </div>
);

// ── Create Coupon Modal ───────────────────────────────────────────────────────
const CreateModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({
    code:        "",
    discountPct: "",
    maxUsage:    "",
    expiresAt:   "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    setError("");
    if (!form.code.trim())                    return setError("Coupon code is required");
    if (!form.discountPct || form.discountPct < 1 || form.discountPct > 100)
                                              return setError("Discount must be 1–100%");
    setLoading(true);
    try {
      const res = await API.post("/coupons", {
        code:        form.code.trim(),
        discountPct: parseFloat(form.discountPct),
        maxUsage:    form.maxUsage ? parseInt(form.maxUsage) : undefined,
        expiresAt:   form.expiresAt || undefined,
      });
      onCreated(res.data.coupon);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  const suggestCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const code   = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    set("code", code);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900">Create Coupon</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"><X size={18} /></button>
          </div>
          <div className="p-6 space-y-4">

            {/* Code */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Coupon Code</label>
              <div className="flex gap-2">
                <input type="text" value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase().replace(/\s/g, ""))}
                  placeholder="e.g. LAUNCH50"
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-mono uppercase" />
                <button onClick={suggestCode}
                  className="px-3 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition whitespace-nowrap">
                  Suggest
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Students enter this at checkout — it's automatically applied to your courses.</p>
            </div>

            {/* Discount % */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Discount Percentage</label>
              <div className="relative">
                <input type="number" min="1" max="100" value={form.discountPct}
                  onChange={(e) => set("discountPct", e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full border border-slate-200 rounded-xl px-4 pr-10 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
              </div>
            </div>

            {/* Quick % presets */}
            <div className="flex gap-2 flex-wrap">
              {[10, 20, 30, 50, 75].map((n) => (
                <button key={n} onClick={() => set("discountPct", n)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition
                    ${form.discountPct == n ? "bg-blue-600 text-white border-blue-600" : "border-slate-200 text-slate-600 hover:border-blue-300"}`}>
                  {n}%
                </button>
              ))}
            </div>

            {/* Max usage */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Usage <span className="font-normal text-slate-400">(optional)</span></label>
              <input type="number" min="1" value={form.maxUsage}
                onChange={(e) => set("maxUsage", e.target.value)}
                placeholder="Leave blank for unlimited"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            {/* Expires at */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Expiry Date <span className="font-normal text-slate-400">(optional)</span></label>
              <input type="datetime-local" value={form.expiresAt}
                onChange={(e) => set("expiresAt", e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
            </div>

            {/* Info */}
            <div className="bg-violet-50 rounded-xl p-3 flex gap-2">
              <Info size={14} className="text-violet-500 shrink-0 mt-0.5" />
              <p className="text-xs text-violet-700">When a student uses this coupon, you earn <span className="font-bold">97%</span> of the sale instead of the standard 37%.</p>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl p-3 flex gap-2">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
              <button onClick={handleCreate} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {loading ? "Creating..." : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── Coupon Card ───────────────────────────────────────────────────────────────
const CouponCard = ({ coupon, onToggle, onDelete, onCopy }) => {
  const expired = isExpired(coupon.expiresAt);
  const exhausted = coupon.maxUsage !== null && coupon.usageCount >= coupon.maxUsage;
  const active = coupon.isActive && !expired && !exhausted;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition p-5
      ${active ? "border-slate-100" : "border-slate-100 opacity-60"}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0
            ${active ? "bg-violet-100" : "bg-slate-100"}`}>
            <Tag size={16} className={active ? "text-violet-600" : "text-slate-400"} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-black text-slate-900 text-base font-mono tracking-wider">{coupon.code}</span>
              {!active && (
                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                  {expired ? "Expired" : exhausted ? "Exhausted" : "Inactive"}
                </span>
              )}
              {active && (
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Active</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Created {fmtDate(coupon.createdAt)}</p>
          </div>
        </div>

        {/* Discount badge */}
        <div className="bg-violet-600 text-white font-black text-lg px-3 py-1 rounded-xl shrink-0">
          {coupon.discountPct}%
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Users size={12} className="text-slate-400 mx-auto mb-1" />
          <p className="font-black text-slate-800 text-sm">{coupon.usageCount}</p>
          <p className="text-[10px] text-slate-400">Used</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Percent size={12} className="text-slate-400 mx-auto mb-1" />
          <p className="font-black text-slate-800 text-sm">{coupon.maxUsage ?? "∞"}</p>
          <p className="text-[10px] text-slate-400">Max Uses</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <Calendar size={12} className="text-slate-400 mx-auto mb-1" />
          <p className="font-black text-slate-800 text-sm truncate text-[11px]">
            {coupon.expiresAt ? fmtDate(coupon.expiresAt) : "Never"}
          </p>
          <p className="text-[10px] text-slate-400">Expires</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={() => onCopy(coupon.code)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition">
          <Copy size={12} /> Copy Code
        </button>
        <button onClick={() => onToggle(coupon)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition
            ${coupon.isActive ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>
          {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {coupon.isActive ? "Disable" : "Enable"}
        </button>
        <button onClick={() => onDelete(coupon.id)}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const CouponsPage = () => {
  const [coupons, setCoupons]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast]       = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/coupons/mine");
      setCoupons(res.data || []);
    } catch {
      showToast("Failed to load coupons", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (coupon) => {
    setCoupons((p) => [coupon, ...p]);
    setCreateOpen(false);
    showToast("Coupon created!");
  };

  const handleToggle = async (coupon) => {
    setActionLoading((p) => ({ ...p, [coupon.id]: true }));
    try {
      await API.patch(`/coupons/${coupon.id}`, { isActive: !coupon.isActive });
      setCoupons((p) => p.map((c) => c.id === coupon.id ? { ...c, isActive: !c.isActive } : c));
      showToast(coupon.isActive ? "Coupon disabled" : "Coupon enabled");
    } catch {
      showToast("Failed to update coupon", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [coupon.id]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await API.delete(`/coupons/${id}`);
      setCoupons((p) => p.filter((c) => c.id !== id));
      showToast("Coupon deleted");
    } catch {
      showToast("Failed to delete coupon", "error");
    } finally {
      setActionLoading((p) => ({ ...p, [id]: false }));
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    showToast(`Copied: ${code}`);
  };

  const active   = coupons.filter((c) => c.isActive && !isExpired(c.expiresAt) && !(c.maxUsage !== null && c.usageCount >= c.maxUsage));
  const inactive = coupons.filter((c) => !c.isActive || isExpired(c.expiresAt) || (c.maxUsage !== null && c.usageCount >= c.maxUsage));

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {createOpen && <CreateModal onClose={() => setCreateOpen(false)} onCreated={handleCreated} />}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link to="/instructor/dashboard" className="hover:text-slate-600 flex items-center gap-1 transition">
                <ArrowLeft size={13} /> Dashboard
              </Link>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-medium">Coupons</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Coupon Codes</h1>
            <p className="text-sm text-slate-400 mt-0.5">Create discount codes and earn 97% on every coupon sale</p>
          </div>
          <button onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-violet-200">
            <Plus size={15} /> New Coupon
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-white flex items-start gap-4">
          <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Tag size={20} />
          </div>
          <div>
            <p className="font-black text-lg">Earn 97% with Your Coupons</p>
            <p className="text-white/80 text-sm mt-1">
              When students use your coupon code at checkout, you keep 97% of the sale price — vs 37% from standard marketplace sales.
              Share your codes on social media, email, or embed them in your content.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Coupons",  value: coupons.length,                          color: "bg-slate-100 text-slate-700" },
            { label: "Active",         value: active.length,                            color: "bg-emerald-100 text-emerald-700" },
            { label: "Total Uses",     value: coupons.reduce((a, c) => a + c.usageCount, 0), color: "bg-blue-100 text-blue-700" },
            { label: "Inactive",       value: inactive.length,                          color: "bg-slate-100 text-slate-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm text-center">
              <p className={`text-2xl font-black ${s.color.split(" ")[1]} mb-0.5`}>{s.value}</p>
              <p className="text-xs text-slate-400 font-medium">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Coupon list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin text-violet-500" />
          </div>
        ) : coupons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Tag size={28} className="text-violet-500" />
            </div>
            <p className="font-black text-slate-700 text-lg">No coupons yet</p>
            <p className="text-sm text-slate-400 mt-1 mb-5">Create your first coupon and start earning 97% on sales</p>
            <button onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-bold hover:bg-violet-700 transition">
              <Plus size={14} /> Create First Coupon
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div>
                <h3 className="font-black text-slate-700 text-sm uppercase tracking-wide mb-3">Active ({active.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {active.map((c) => (
                    <CouponCard key={c.id} coupon={c} onToggle={handleToggle} onDelete={handleDelete} onCopy={handleCopy} />
                  ))}
                </div>
              </div>
            )}

            {inactive.length > 0 && (
              <div>
                <h3 className="font-black text-slate-400 text-sm uppercase tracking-wide mb-3">Inactive / Expired ({inactive.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inactive.map((c) => (
                    <CouponCard key={c.id} coupon={c} onToggle={handleToggle} onDelete={handleDelete} onCopy={handleCopy} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CouponsPage;
