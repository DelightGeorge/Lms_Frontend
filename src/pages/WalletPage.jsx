// src/pages/Instructor/WalletPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet, TrendingUp, Clock, CheckCircle, ArrowUpRight,
  DollarSign, Loader2, ChevronRight, AlertCircle, X,
  ArrowLeft, Banknote, CreditCard, Send, RefreshCw,
  ShieldCheck, Info, Tag, BarChart3, Package,
} from "lucide-react";
import Layout from "../../shared/Layout/Layout";
import API from "../../services/api";

// ── helpers ───────────────────────────────────────────────────────────────────
const fmt  = (n) => `$${(n || 0).toFixed(2)}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const daysLeft = (d) => {
  const diff = new Date(d) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// ── sub-components ────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-5 right-5 z-[999] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl font-bold text-white text-sm
    ${type === "error" ? "bg-red-500" : "bg-emerald-500"}`}>
    {type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
    {msg}
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
  </div>
);

const BalanceCard = ({ label, amount, icon: Icon, color, sub, badge }) => (
  <div className={`relative overflow-hidden rounded-3xl p-6 text-white ${color}`}>
    {/* decorative blob */}
    <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
    <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full bg-white/5" />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
          <Icon size={20} />
        </div>
        {badge && (
          <span className="text-[10px] font-black bg-white/20 px-2.5 py-1 rounded-full tracking-wide uppercase">
            {badge}
          </span>
        )}
      </div>
      <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-black tracking-tight">{fmt(amount)}</p>
      {sub && <p className="text-white/60 text-xs mt-2">{sub}</p>}
    </div>
  </div>
);

const EarningRow = ({ earning }) => {
  const days = daysLeft(earning.availableAfter);
  const released = earning.isReleased;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0">
      {/* source badge */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
        ${earning.saleSource === "INSTRUCTOR" ? "bg-violet-100" : "bg-blue-100"}`}>
        {earning.saleSource === "INSTRUCTOR"
          ? <Tag size={14} className="text-violet-600" />
          : <Package size={14} className="text-blue-600" />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm truncate">
          {earning.payment?.course?.title || "Unknown Course"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {fmtDate(earning.createdAt)} · {earning.saleSource === "INSTRUCTOR" ? "97% share" : "37% share"}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-black text-slate-800">{fmt(earning.amount)}</p>
        {released ? (
          <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 justify-end mt-0.5">
            <CheckCircle size={10} /> Available
          </span>
        ) : (
          <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1 justify-end mt-0.5">
            <Clock size={10} /> {days}d left
          </span>
        )}
      </div>
    </div>
  );
};

const PayoutRow = ({ payout }) => {
  const statusMap = {
    PENDING:  { color: "bg-amber-100 text-amber-700",   label: "Pending"  },
    APPROVED: { color: "bg-emerald-100 text-emerald-700", label: "Approved" },
    REJECTED: { color: "bg-red-100 text-red-600",       label: "Rejected" },
    PAID:     { color: "bg-blue-100 text-blue-700",     label: "Paid"     },
  };
  const s = statusMap[payout.status] || statusMap.PENDING;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-50 last:border-0">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
        <Banknote size={14} className="text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-800 text-sm">Payout Request</p>
        <p className="text-xs text-slate-400">{fmtDate(payout.createdAt)} · {payout.payoutMethod?.replace("_", " ")}</p>
        {payout.rejectionReason && (
          <p className="text-xs text-red-500 mt-0.5">"{payout.rejectionReason}"</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="font-black text-slate-800">{fmt(payout.amount)}</p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
      </div>
    </div>
  );
};

// ── Payout Request Modal ──────────────────────────────────────────────────────
const PayoutModal = ({ wallet, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    amount:       "",
    payoutMethod: "bank_transfer",
    accountName:  "",
    accountNumber:"",
    bankName:     "",
    paypalEmail:  "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setError("");
    const amount = parseFloat(form.amount);
    if (!amount || amount < 25)            return setError("Minimum payout is $25");
    if (amount > wallet.availableBalance)  return setError("Exceeds available balance");
    if (!form.accountName && form.payoutMethod === "bank_transfer") return setError("Account name required");
    if (!form.accountNumber && form.payoutMethod === "bank_transfer") return setError("Account number required");
    if (!form.bankName && form.payoutMethod === "bank_transfer") return setError("Bank name required");
    if (!form.paypalEmail && form.payoutMethod === "paypal") return setError("PayPal email required");

    setLoading(true);
    try {
      await API.post("/wallet/payout/request", { ...form, amount });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
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
            <div>
              <h2 className="text-lg font-black text-slate-900">Request Payout</h2>
              <p className="text-xs text-slate-400 mt-0.5">Available: <span className="font-bold text-emerald-600">{fmt(wallet.availableBalance)}</span></p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition"><X size={18} /></button>
          </div>

          <div className="p-6 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" min="25" max={wallet.availableBalance} step="0.01"
                  value={form.amount} onChange={(e) => set("amount", e.target.value)}
                  placeholder="0.00"
                  className="w-full border border-slate-200 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
              <p className="text-xs text-slate-400 mt-1">Min $25 · Max {fmt(wallet.availableBalance)}</p>
            </div>

            {/* Method */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Payout Method</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "bank_transfer", label: "Bank Transfer", icon: Banknote },
                  { value: "paypal",        label: "PayPal",        icon: CreditCard },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => set("payoutMethod", value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition
                      ${form.payoutMethod === value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                    <Icon size={15} /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bank fields */}
            {form.payoutMethod === "bank_transfer" && (
              <div className="space-y-3">
                {[
                  { key: "accountName",   label: "Account Name",   placeholder: "Full name on account" },
                  { key: "accountNumber", label: "Account Number",  placeholder: "0123456789" },
                  { key: "bankName",      label: "Bank Name",       placeholder: "e.g. GTBank, Zenith" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
                    <input type="text" value={form[key]} onChange={(e) => set(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                ))}
              </div>
            )}

            {/* PayPal */}
            {form.payoutMethod === "paypal" && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">PayPal Email</label>
                <input type="email" value={form.paypalEmail} onChange={(e) => set("paypalEmail", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition" />
              </div>
            )}

            {/* Info box */}
            <div className="bg-blue-50 rounded-xl p-3 flex gap-2">
              <Info size={14} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Payouts are reviewed by admins and typically processed within 1–3 business days.</p>
            </div>

            {error && (
              <div className="bg-red-50 rounded-xl p-3 flex gap-2">
                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 border border-slate-200 rounded-xl py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl py-3 text-sm font-bold transition flex items-center justify-center gap-2">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const WalletPage = () => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("earnings");
  const [payoutOpen, setPayoutOpen] = useState(false);
  const [toast,   setToast]   = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get("/wallet/me");
      setData(res.data);
    } catch {
      showToast("Failed to load wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handlePayoutSuccess = () => {
    setPayoutOpen(false);
    showToast("Payout request submitted! Admin will process it soon.");
    load();
  };

  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    </Layout>
  );

  const { wallet, earnings, payoutRequests } = data || {};

  return (
    <Layout>
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      {payoutOpen && wallet && (
        <PayoutModal wallet={wallet} onClose={() => setPayoutOpen(false)} onSuccess={handlePayoutSuccess} />
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <Link to="/instructor/dashboard" className="hover:text-slate-600 flex items-center gap-1 transition">
                <ArrowLeft size={13} /> Dashboard
              </Link>
              <ChevronRight size={12} />
              <span className="text-slate-600 font-medium">Wallet</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">My Wallet</h1>
            <p className="text-sm text-slate-400 mt-0.5">Track your earnings and manage payouts</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-400 hover:text-slate-600">
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setPayoutOpen(true)}
              disabled={!wallet?.canRequestPayout}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition shadow-md shadow-blue-200">
              <ArrowUpRight size={15} /> Request Payout
            </button>
          </div>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <BalanceCard label="Available Balance" amount={wallet?.availableBalance}
            icon={DollarSign} color="bg-gradient-to-br from-blue-600 to-blue-700"
            sub={wallet?.canRequestPayout ? "Ready to withdraw" : `Need $${(25 - (wallet?.availableBalance || 0)).toFixed(2)} more`}
            badge={wallet?.canRequestPayout ? "Withdrawable" : null} />

          <BalanceCard label="Pending Balance" amount={wallet?.pendingBalance}
            icon={Clock} color="bg-gradient-to-br from-amber-500 to-orange-500"
            sub="Clearing in 30 days" />

          <BalanceCard label="Total Earned" amount={wallet?.totalEarned}
            icon={TrendingUp} color="bg-gradient-to-br from-emerald-600 to-teal-600"
            sub="All time" />

          <BalanceCard label="Total Paid Out" amount={wallet?.totalPaidOut}
            icon={ShieldCheck} color="bg-gradient-to-br from-violet-600 to-purple-700"
            sub="Successfully paid" />
        </div>

        {/* Min payout notice */}
        {!wallet?.canRequestPayout && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
            <Info size={16} className="text-amber-500 shrink-0" />
            <p className="text-sm text-amber-800">
              <span className="font-bold">Minimum payout is $25.</span> You need{" "}
              <span className="font-bold">{fmt(25 - (wallet?.availableBalance || 0))}</span> more in your available balance.
              Earnings are released 30 days after each sale.
            </p>
          </div>
        )}

        {/* Revenue split explanation */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" /> How Your Earnings Work
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <div className="flex items-center gap-2 mb-2">
                <Tag size={14} className="text-violet-600" />
                <span className="font-black text-violet-800 text-sm">Your Referral / Coupon</span>
              </div>
              <p className="text-3xl font-black text-violet-700">97%</p>
              <p className="text-xs text-violet-600 mt-1">When a student uses your link or coupon code</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Package size={14} className="text-blue-600" />
                <span className="font-black text-blue-800 text-sm">Platform Marketplace</span>
              </div>
              <p className="text-3xl font-black text-blue-700">37%</p>
              <p className="text-xs text-blue-600 mt-1">When a student finds you via search or browse</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Clock size={11} /> All earnings are held for 30 days to allow for refunds, then released to your available balance.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100">
            {[
              { id: "earnings",       label: "Earnings History",  count: earnings?.length },
              { id: "payouts",        label: "Payout Requests",   count: payoutRequests?.length },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-4 text-sm font-bold transition flex items-center justify-center gap-2
                  ${tab === t.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700"}`}>
                {t.label}
                {t.count > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full
                    ${tab === t.id ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {tab === "earnings" && (
              <>
                {earnings?.length === 0 ? (
                  <div className="text-center py-12">
                    <DollarSign size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="font-bold text-slate-500">No earnings yet</p>
                    <p className="text-xs text-slate-400 mt-1">Your earnings will appear here after students purchase your courses</p>
                  </div>
                ) : (
                  <div>
                    {earnings.map((e) => <EarningRow key={e.id} earning={e} />)}
                  </div>
                )}
              </>
            )}

            {tab === "payouts" && (
              <>
                {payoutRequests?.length === 0 ? (
                  <div className="text-center py-12">
                    <Banknote size={40} className="text-slate-200 mx-auto mb-3" />
                    <p className="font-bold text-slate-500">No payout requests yet</p>
                    <p className="text-xs text-slate-400 mt-1">Request a payout once you have $25+ in your available balance</p>
                  </div>
                ) : (
                  <div>
                    {payoutRequests.map((p) => <PayoutRow key={p.id} payout={p} />)}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WalletPage;
