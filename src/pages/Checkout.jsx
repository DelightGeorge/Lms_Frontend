// src/pages/Student/CheckoutPage.jsx
//
// Route: /checkout?courseId=XXX&ref=INSTRUCTOR_CODE (optional referral)
//
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck, Tag, X, Loader2, CheckCircle, AlertCircle,
  Lock, Star, Users, BookOpen, Clock, ChevronRight, ArrowLeft,
  Zap, DollarSign,
} from "lucide-react";
import API from "../services/api";
import Layout from "../shared/Layout/Layout";
import { useAuth } from "../Context/AuthContext";


// ── helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

// ── Coupon Input ──────────────────────────────────────────────────────────────
const CouponInput = ({ courseId, onApply, onRemove, applied }) => {
  const [code,    setCode]    = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await API.get(`/coupons/validate?code=${code.trim()}&courseId=${courseId}`);
      if (res.data.valid) {
        onApply({ ...res.data, code: code.trim().toUpperCase() });
        setCode("");
      } else {
        setError("Invalid or expired coupon code");
      }
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
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
      <button onClick={onRemove} className="text-emerald-500 hover:text-emerald-700 transition">
        <X size={14} />
      </button>
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
            className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition font-mono uppercase placeholder-normal" />
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

// ── Order Summary ─────────────────────────────────────────────────────────────
const OrderSummary = ({ course, coupon, referral }) => {
  const original   = course.price;
  const discount   = coupon ? parseFloat((original * coupon.discountPct / 100).toFixed(2)) : 0;
  const final      = parseFloat((original - discount).toFixed(2));
  const splitPct   = (coupon || referral) ? 97 : 37;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600">Original Price</span>
        <span className="font-bold text-slate-800">{fmt(original)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-emerald-600 flex items-center gap-1">
            <Tag size={11} /> Coupon Discount ({coupon.discountPct}%)
          </span>
          <span className="font-bold text-emerald-600">−{fmt(discount)}</span>
        </div>
      )}
      <div className="border-t border-slate-100 pt-3 flex justify-between">
        <span className="font-black text-slate-800">Total</span>
        <span className="font-black text-xl text-slate-900">{fmt(final)}</span>
      </div>
      {(coupon || referral) && (
        <div className="bg-violet-50 rounded-xl p-3 flex items-center gap-2">
          <Zap size={13} className="text-violet-500 shrink-0" />
          <p className="text-xs text-violet-700">Instructor referral applied — instructor earns 97% of this sale.</p>
        </div>
      )}
    </div>
  );
};

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const [searchParams]    = useSearchParams();
  const navigate          = useNavigate();
  const { user }          = useAuth();

  const courseId = searchParams.get("courseId");
  const refParam = searchParams.get("ref"); // instructor referral

  const [course,  setCourse]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying,  setPaying]  = useState(false);
  const [coupon,  setCoupon]  = useState(null);
  const [error,   setError]   = useState("");
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);

  useEffect(() => {
    if (!courseId) { navigate("/"); return; }
    (async () => {
      try {
        const res = await API.get(`/courses/${courseId}`);
        setCourse(res.data);

        // Check if already enrolled
        try {
          const enroll = await API.get(`/enrollments/check/${courseId}`);
          if (enroll.data?.enrolled) setAlreadyEnrolled(true);
        } catch {}
      } catch {
        setError("Course not found");
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  const finalPrice = course
    ? parseFloat((course.price - (coupon ? course.price * coupon.discountPct / 100 : 0)).toFixed(2))
    : 0;

  const handleCheckout = async () => {
    if (!user) { navigate("/login"); return; }
    if (alreadyEnrolled) { navigate(`/course/${courseId}`); return; }

    setPaying(true);
    setError("");
    try {
      // Free course
      if (finalPrice === 0) {
        await API.post("/payments/enroll/free", { courseId });
        navigate(`/course/${courseId}?enrolled=true`);
        return;
      }

      // Paid course
      const res = await API.post("/payments/initialize", {
        courseId,
        couponCode: coupon?.code || undefined,
        referral:   refParam ? true : undefined,
      });

      // Redirect to Paystack
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process payment");
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
          <Link to="/" className="text-sm text-blue-600 hover:underline mt-2 block">Go Home</Link>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link to={`/course/${courseId}`} className="hover:text-slate-600 flex items-center gap-1 transition">
            <ArrowLeft size={13} /> Course
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-600 font-medium">Checkout</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── LEFT: Course Info ── */}
          <div className="lg:col-span-3 space-y-6">
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
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{course.description}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {course._count?.lessons && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <BookOpen size={10} /> {course._count.lessons} lessons
                    </span>
                  )}
                  {course._count?.enrollments && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Users size={10} /> {course._count.enrollments} students
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star size={10} fill="currentColor" /> {course.averageRating?.toFixed(1) || "New"}
                  </span>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Tag size={15} className="text-violet-500" /> Have a Coupon?
              </h3>
              <CouponInput
                courseId={courseId}
                applied={coupon}
                onApply={(c) => setCoupon(c)}
                onRemove={() => setCoupon(null)}
              />
            </div>

            {/* Referral notice */}
            {refParam && !coupon && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-center gap-3">
                <Zap size={16} className="text-violet-600 shrink-0" />
                <p className="text-sm text-violet-800">
                  <span className="font-bold">Referral link detected.</span> This purchase will go directly towards the instructor.
                </p>
              </div>
            )}

            {/* Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: ShieldCheck, label: "Secure Payment",   sub: "256-bit SSL encryption" },
                { icon: Clock,       label: "Lifetime Access",  sub: "Learn at your own pace" },
                { icon: CheckCircle, label: "Instant Access",   sub: "Start immediately" },
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

          {/* ── RIGHT: Order Summary + CTA ── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5 sticky top-6">
              <h3 className="font-black text-slate-800">Order Summary</h3>

              <OrderSummary course={course} coupon={coupon} referral={refParam} />

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
                  <Link to={`/course/${courseId}`}
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
                  <Lock size={9} /> Payments are processed securely via Paystack
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
