// src/pages/PaymentCallbackPage.jsx
// Paystack redirects here after payment.
// URL: /payment/callback?reference=XXX&courseId=XXX
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, BookOpen, ArrowRight, Home, TrendingUp } from "lucide-react";
import Layout from "../shared/Layout/Layout";
import API from "../services/api";

const fmt = (n) => `₦${(n || 0).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

const PaymentCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();

  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const courseId  = searchParams.get("courseId");

  const [status,   setStatus]   = useState("loading");
  const [course,   setCourse]   = useState(null);
  const [payment,  setPayment]  = useState(null);
  const [seconds,  setSeconds]  = useState(5);

  useEffect(() => {
    if (!reference) { setStatus("failed"); return; }
    (async () => {
      try {
        const res = await API.get(`/payments/verify/${reference}`);
        if (res.data.success) {
          setStatus("success");
          setPayment(res.data.payment || null);
          if (courseId) {
            try {
              const cr = await API.get(`/courses/${courseId}`);
              setCourse(cr.data?.course || cr.data);
            } catch {}
          }
        } else {
          setStatus("failed");
        }
      } catch {
        setStatus("failed");
      }
    })();
  }, [reference]);

  // Countdown redirect
  useEffect(() => {
    if (status !== "success") return;
    if (seconds <= 0) { navigate(`/courses/${courseId || ""}`); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [status, seconds]);

  if (status === "loading") return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
            <Loader2 size={28} className="animate-spin text-blue-600" />
          </div>
          <p className="font-black text-slate-700 text-lg">Verifying your payment...</p>
          <p className="text-slate-400 text-sm">Please don't close this page</p>
        </div>
      </div>
    </Layout>
  );

  if (status === "success") {
    const instructorAmt = payment?.instructorEarning;
    const platformAmt   = payment?.platformFee;
    const isInstructor  = payment?.saleSource === "INSTRUCTOR";

    return (
      <Layout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-8 text-center space-y-6">

            {/* Check icon */}
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={40} className="text-emerald-500" />
            </div>

            <div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">You're Enrolled! 🎉</h1>
              <p className="text-slate-500 text-sm">
                Payment confirmed. You now have lifetime access to this course.
              </p>
            </div>

            {/* Course info */}
            {course && (
              <div className="bg-slate-50 rounded-2xl p-4 flex gap-3 items-center text-left">
                <div className="w-14 h-10 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                  {course.thumbnail
                    ? <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><BookOpen size={14} className="text-slate-400" /></div>}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-800 text-sm truncate">{course.title}</p>
                  <p className="text-xs text-slate-400">{course._count?.lessons || 0} lessons · Lifetime access</p>
                </div>
              </div>
            )}

            {/* Revenue split summary */}
            {payment && instructorAmt != null && (
              <div className={`rounded-xl p-4 text-left text-sm space-y-2 ${isInstructor ? "bg-violet-50 border border-violet-200" : "bg-blue-50 border border-blue-200"}`}>
                <p className={`text-[10px] font-black uppercase tracking-widest ${isInstructor ? "text-violet-600" : "text-blue-600"}`}>
                  <TrendingUp size={10} className="inline mr-1" />
                  {isInstructor ? "Instructor Referral Sale" : "Revenue Split"}
                </p>
                <div className="flex justify-between">
                  <span className="text-slate-600">Instructor earned</span>
                  <span className="font-black text-emerald-700">{fmt(instructorAmt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Platform fee</span>
                  <span className="text-slate-500 font-bold">{fmt(platformAmt)}</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden mt-1">
                  <div className={`h-full rounded-full ${isInstructor ? "bg-violet-500" : "bg-blue-500"}`}
                    style={{ width: `${isInstructor ? 97 : 37}%` }} />
                </div>
              </div>
            )}

            <Link to={`/courses/${courseId || ""}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition">
              Start Learning <ArrowRight size={15} />
            </Link>

            <p className="text-xs text-slate-400">
              Redirecting in {seconds}s...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-md p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <XCircle size={40} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Failed</h1>
            <p className="text-slate-500 text-sm">Your payment was not completed. No charge was made.</p>
          </div>
          <div className="space-y-3">
            {courseId && (
              <Link to={`/checkout?courseId=${courseId}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition">
                Try Again
              </Link>
            )}
            <Link to="/"
              className="w-full flex items-center justify-center gap-2 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition">
              <Home size={14} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentCallbackPage;
