// src/pages/CheckoutPage.jsx  (or src/pages/Checkout.jsx — match your import)
// Route: /checkout?courseId=XXX&ref=INSTRUCTOR_CODE (optional referral)
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, Tag, X, Loader2, CheckCircle, AlertCircle,
  Lock, Star, Users, BookOpen, Clock, ChevronRight, ArrowLeft,
  Zap, DollarSign, TrendingUp,
} from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";
import { useAuth } from "../Context/AuthContext";

const fmt = (n) => `$${(n || 0).toFixed(2)}`;

// ── Revenue split preview ─────────────────────────────────────────────────────
const SplitPreview = ({ price, isInstructor }) => {
  const instructorPct = isInstructor ? 97 : 37;
  const platformPct   = isInstructor ? 3  : 63;
  const instructorAmt = (price * instructorPct / 100).toFixed(2);
  const platformAmt   = (price * platformPct   / 100).toFixed(2);

  return (
    <div className={`rounded-xl p-3.5 border text-xs space-y-2 ${isInstructor ? "bg-violet-50 border-violet-200" : "bg-slate-50 border-slate-200"}`}>
      <p className={`font-black text-[10px] uppercase tracking-widest ${isInstructor ? "text-violet-600" : "text-slate-500"}`}>
        {isInstructor ? "⚡ Instructor Referral Sale" : "Revenue Split"}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className={isInstructor ? "text-violet-700" : "text-slate-600"}>Instructor earns</span>
          <span className={`font-black ${isInstructor ? "text-violet-700" : "text-slate-700"}`}>
            {fmt(instructorAmt)} <span className="font-normal opacity-60">({instructorPct}%)</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-400">Platform fee</span>
          <span className="text-slate-500 font-bold">
            {fmt(platformAmt)} <span className="font-normal opacity-60">({platformPct}%)</span>
          </span>
        </div>
      </div>
      {/* Visual bar */}
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mt-1">
        <div className={`h-full rounded-full transition-all duration-500 ${isInstructor ? "bg-violet-500" : "bg-blue-500"}`}
          style={{ width: `${instructorPct}%` }} />
      </div>
    </div>
  );
};

// ── Coupon Input ──────────────────────────────────────────────────────────────
const CouponInput = ({ courseId, onApply, onRemove, applied }) => {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true); setError("");
    try {
      const res = await API.get(`/coupons/validate?code=${code.trim()}&courseId=${courseId}`);
      if (res.data.valid) {
        onApply({ ...res.data, code: code.trim().toUpperCase() });
        setCode("");
      } else {
        setError(res.data.message || "Invalid or expired coupon code");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to validate coupon");
    } finally { setLoading(false); }
  };

  if (applied) return (
    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <CheckCircle size={15} className="text-emerald-600" />
        <div>
          <span className="font-black text-emerald-700 text-sm font-mono">{applied.code}</span>
          <span className="text-emerald-600 text-xs ml-2">— {applied.discountPct}% off applied!</span>
        </div>
      </div>
      <button onClick={onRemove} className="text-emerald-500 hover:text-emerald-700 transition"><X size={14} /></button>
    </div>
  );

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter coupon code"
            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-mono uppercase" />
        </div>
        <button onClick={handleApply} disabled={loading || !code.trim()}
          className="px-4 py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition">
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} /> {error}</p>}
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const { user }       = useAuth();

  const courseId = searchParams.get("courseId");
  const refParam = searchParams.get("ref"); // instructor referral code

  const [course,          setCourse]          = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [paying,          setPaying]          = useState(false);
  const [coupon,          setCoupon]          = useState(null);
  const [error,           setError]           = useState("");
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    if (!courseId) { navigate("/courses"); return; }
    (async () => {
      try {
        const res = await API.get(`/courses/${courseId}`);
        const data = res.data?.course || res.data;
        setCourse(data);
        // Check enrollment
        try {
          const enroll = await API.get("/enrollments/my");
          const list = Array.isArray(enroll.data) ? enroll.data : [];
          if (list.some(e => e.courseId === courseId)) setAlreadyEnrolled(true);
        } catch {}
      } catch {
        setError("Course not found");
      } finally { setLoading(false); }
    })();
  }, [courseId, user]);

  const isInstructorSale = !!(coupon || refParam);
  const originalPrice    = course?.price || 0;
  const discount         = coupon ? parseFloat((originalPrice * coupon.discountPct / 100).toFixed(2)) : 0;
  const finalPrice       = parseFloat((originalPrice - discount).toFixed(2));

  const handleCheckout = async () => {
    if (!user) { navigate("/auth"); return; }
    if (alreadyEnrolled) { navigate(`/courses/${courseId}`); return; }
    setPaying(true); setError("");
    try {
      // Free course — bypass Paystack
      if (finalPrice === 0) {
        await API.post("/payments/enroll/free", { courseId });
        navigate(`/courses/${courseId}?enrolled=true`);
        return;
      }
      // Paid — initialize Paystack transaction
      const res = await API.post("/payments/initialize", {
        courseId,
        couponCode: coupon?.code   || undefined,
        referral:   refParam ? true : undefined,
      });
      // Redirect to Paystack hosted checkout
      if (res.data.authorizationUrl) {
        window.location.href = res.data.authorizationUrl;
      } else {
        throw new Error("No authorization URL returned");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process payment. Please try again.");
      setPaying(false);
    }
  };

  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-500" />
      </div>
    </Layout>
  );

  if (error && !course) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
          <p className="font-bold text-slate-700">{error}</p>
          <Link to="/courses" className="text-sm text-blue-600 hover:underline mt-2 block">Browse Courses</Link>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8">
          <Link to={`/courses/${courseId}`} className="hover:text-slate-600 flex items-center gap-1 transition">
            <ArrowLeft size={13} /> Course
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT ── */}
          <div className="lg:col-span-3 space-y-5">
            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-1">Complete Your Purchase</h1>
              <p className="text-slate-500 text-sm">You're one step away from accessing this course.</p>
            </div>

            {/* Course card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4">
              <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {course.thumbnail
                  ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><BookOpen size={20} className="text-slate-300" /></div>}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-800 text-sm leading-snug line-clamp-2">{course.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{course.instructor?.fullName}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {course._count?.lessons > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <BookOpen size={10} /> {course._count.lessons} lessons
                    </span>
                  )}
                  {course._count?.enrollments > 0 && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Users size={10} /> {course._count.enrollments} students
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Referral notice */}
            {refParam && !coupon && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
                <Zap size={16} className="text-violet-600 shrink-0" />
                <p className="text-sm text-violet-800">
                  <span className="font-bold">Instructor referral detected.</span> The instructor earns 97% of this sale.
                </p>
              </div>
            )}

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <Tag size={15} className="text-violet-500" /> Have a Coupon?
              </h3>
              <CouponInput courseId={courseId} applied={coupon}
                onApply={(c) => setCoupon(c)} onRemove={() => setCoupon(null)} />
            </div>

            {/* Revenue split preview — always visible for paid courses */}
            {finalPrice > 0 && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp size={15} className="text-blue-500" /> How Revenue is Split
                </h3>
                <SplitPreview price={finalPrice} isInstructor={isInstructorSale} />
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure Payment",  sub: "256-bit SSL encryption" },
                { icon: Clock,       label: "Lifetime Access", sub: "Learn at your own pace" },
                { icon: CheckCircle, label: "Instant Access",  sub: "Start immediately"      },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-100 p-3.5 flex items-center gap-3 shadow-sm">
                  <Icon size={16} className="text-blue-500 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-700 text-xs">{label}</p>
                    <p className="text-[10px] text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 sticky top-24">
              <h3 className="font-black text-slate-800">Order Summary</h3>

              {/* Price breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Original Price</span>
                  <span className="font-bold text-slate-800">{fmt(originalPrice)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Tag size={11} /> Coupon ({coupon.discountPct}% off)
                    </span>
                    <span className="font-bold text-emerald-600">−{fmt(discount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-black text-slate-800">Total</span>
                  <span className="font-black text-2xl text-slate-900">{finalPrice === 0 ? "Free" : fmt(finalPrice)}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 rounded-xl p-3 flex gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600 font-medium">{error}</p>
                </div>
              )}

              {alreadyEnrolled ? (
                <div className="space-y-3">
                  <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <p className="text-sm font-bold text-emerald-700">You're already enrolled!</p>
                  </div>
                  <Link to={`/courses/${courseId}`}
                    className="block w-full text-center py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition">
                    Go to Course →
                  </Link>
                </div>
              ) : (
                <button onClick={handleCheckout} disabled={paying}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl font-black text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  {paying
                    ? <><Loader2 size={16} className="animate-spin" /> Processing...</>
                    : finalPrice === 0
                      ? <><CheckCircle size={16} /> Enroll for Free</>
                      : <><Lock size={16} /> Pay {fmt(finalPrice)} Securely</>
                  }
                </button>
              )}

              {!alreadyEnrolled && finalPrice > 0 && (
                <p className="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                  <Lock size={9} /> Processed securely via Paystack
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
